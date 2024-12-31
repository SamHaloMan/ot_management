import os
import json
from django.db.models import Sum, F
from django.db.models.functions import TruncDate, TruncWeek, TruncMonth, TruncYear
from django.utils.timezone import now
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter
from datetime import datetime, timedelta, date
from dateutil.relativedelta import relativedelta

from .serializers import EmployeeSerializer, ProjectSerializer, OvertimeRequestSerializer

from .models import Employee, Project, OvertimeRequest


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    filter_backends = [SearchFilter]
    search_fields = ["work_id", "name"]


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    filter_backends = [SearchFilter]
    search_fields = ["name"]


class OvertimeRequestViewSet(viewsets.ModelViewSet):
    queryset = OvertimeRequest.objects.all()
    serializer_class = OvertimeRequestSerializer
    filter_backends = [SearchFilter]
    filterset_fields = ["work_id", "employee__name", "project__name", "overtime_date"]


class OvertimeReportAnalyticsViewSet(viewsets.ViewSet):
    def _get_date_range(self, start_date, end_date):
        """Convert string dates to datetime objects with validation"""
        if not start_date or not end_date:
            # Default to current month if no dates provided
            today = date.today()
            start_date = today.replace(day=1).strftime('%Y-%m-%d')
            end_date = today.strftime('%Y-%m-%d')

        try:
            start = datetime.strptime(start_date, '%Y-%m-%d').date()
            end = datetime.strptime(end_date, '%Y-%m-%d').date()
            
            if start > end:
                raise ValueError("Start date must be before end date")
                
            return start, end, None
        except (ValueError, TypeError) as e:
            return None, None, str(e)

    def _get_trunc_function(self, grouping):
        """Get the appropriate truncation function based on grouping"""
        trunc_functions = {
            'day': TruncDate,
            'week': TruncWeek,
            'month': TruncMonth,
            'year': TruncYear
        }
        return trunc_functions.get(grouping, TruncDate)

    def _validate_entities(self, work_ids, project_names):
        """Validate that all employees and projects exist"""
        invalid_work_ids = []
        invalid_projects = []

        for work_id in work_ids:
            if not Employee.objects.filter(work_id=work_id).exists():
                invalid_work_ids.append(work_id)

        for project in project_names:
            if not Project.objects.filter(name=project).exists():
                invalid_projects.append(project)

        return invalid_work_ids, invalid_projects
    

    @action(detail=False, methods=['get'])
    def get_monthly_analytics(self, request):
        """Get analytics for a specific month"""
        try:
            # Default to current month if no parameters provided
            year = int(request.query_params.get('year', date.today().year))
            month = int(request.query_params.get('month', date.today().month))
            
            # Calculate date range for the month (26th of previous month to 25th of current month)
            if date.today().day <= 25:
                end_date = date(year, month, 25)
                if month == 1:
                    start_date = date(year - 1, 12, 26)
                else:
                    start_date = date(year, month - 1, 26)
            else:
                start_date = date(year, month, 26)
                if month == 12:
                    end_date = date(year + 1, 1, 25)
                else:
                    end_date = date(year, month + 1, 25)

            # Query the database directly
            employees = Employee.objects.all()
            analytics_data = {"Employee_OT_Hours_Analytics": []}

            for employee in employees:
                overtime_hours = OvertimeRequest.objects.filter(
                    work_id=employee.work_id,
                    overtime_date__range=(start_date, end_date)
                ).values('project_name').annotate(
                    total_hours=Sum('total_hours')
                )

                if overtime_hours:
                    projects_dict = {
                        ot['project_name']: float(ot['total_hours'])
                        for ot in overtime_hours
                    }

                    employee_data = {
                        "work_id": employee.work_id,
                        "name": employee.name,
                        "projects": projects_dict
                    }
                    analytics_data["Employee_OT_Hours_Analytics"].append(employee_data)

            return Response(analytics_data)
            
        except ValueError:
            return Response(
                {"error": "Invalid year or month parameters"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


    @action(detail=False, methods=['get'])
    def overtime_by_date_range(self, request):
        """Get overtime analytics within a date range"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        grouping = request.query_params.get('grouping', 'day')
        
        if grouping not in ['day', 'week', 'month', 'year']:
            return Response(
                {"error": "Invalid grouping. Use 'day', 'week', 'month', or 'year'"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        start, end, error = self._get_date_range(start_date, end_date)
        if error:
            return Response({"error": error}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Get all overtime data for the date range
            employee_data = OvertimeRequest.objects.filter(
                overtime_date__range=(start, end)
            ).values(
                'work_id',
                'project_name'
            ).annotate(
                date=self._get_trunc_function(grouping)('overtime_date'),
                total_hours=Sum('total_hours')
            ).order_by('work_id', 'date')

            # Validate entities
            work_ids = set(entry['work_id'] for entry in employee_data)
            project_names = set(entry['project_name'] for entry in employee_data)
            invalid_work_ids, invalid_projects = self._validate_entities(work_ids, project_names)

            if invalid_work_ids or invalid_projects:
                return Response({
                    "error": "Invalid entities found",
                    "invalid_work_ids": invalid_work_ids,
                    "invalid_projects": invalid_projects
                }, status=status.HTTP_400_BAD_REQUEST)

            formatted_data = {
                'by_employee': {},
                'by_project': {},
                'timeline': {},
                'summary': {
                    'total_hours': 0,
                    'total_employees': 0,
                    'total_projects': 0,
                    'date_range': {
                        'start': start.strftime('%Y-%m-%d'),
                        'end': end.strftime('%Y-%m-%d'),
                        'grouping': grouping
                    }
                }
            }

            for entry in employee_data:
                work_id = entry['work_id']
                project = entry['project_name']
                date_str = entry['date'].strftime('%Y-%m-%d')
                hours = float(entry['total_hours'])

                # Get employee name
                employee = Employee.objects.get(work_id=work_id)
                employee_name = employee.name

                # By employee
                if work_id not in formatted_data['by_employee']:
                    formatted_data['by_employee'][work_id] = {
                        'name': employee_name,
                        'total_hours': 0,
                        'projects': {},
                        'timeline': {}
                    }
                
                if project not in formatted_data['by_employee'][work_id]['projects']:
                    formatted_data['by_employee'][work_id]['projects'][project] = 0
                
                if date_str not in formatted_data['by_employee'][work_id]['timeline']:
                    formatted_data['by_employee'][work_id]['timeline'][date_str] = 0

                formatted_data['by_employee'][work_id]['projects'][project] += hours
                formatted_data['by_employee'][work_id]['timeline'][date_str] += hours
                formatted_data['by_employee'][work_id]['total_hours'] += hours

                # By project
                if project not in formatted_data['by_project']:
                    formatted_data['by_project'][project] = {
                        'total_hours': 0,
                        'timeline': {},
                        'employees': {}
                    }
                
                if date_str not in formatted_data['by_project'][project]['timeline']:
                    formatted_data['by_project'][project]['timeline'][date_str] = 0
                
                if work_id not in formatted_data['by_project'][project]['employees']:
                    formatted_data['by_project'][project]['employees'][work_id] = {
                        'name': employee_name,
                        'hours': 0
                    }

                formatted_data['by_project'][project]['timeline'][date_str] += hours
                formatted_data['by_project'][project]['employees'][work_id]['hours'] += hours
                formatted_data['by_project'][project]['total_hours'] += hours

                # Timeline
                if date_str not in formatted_data['timeline']:
                    formatted_data['timeline'][date_str] = {
                        'total_hours': 0,
                        'by_project': {},
                        'by_employee': {}
                    }
                
                if project not in formatted_data['timeline'][date_str]['by_project']:
                    formatted_data['timeline'][date_str]['by_project'][project] = 0
                
                if work_id not in formatted_data['timeline'][date_str]['by_employee']:
                    formatted_data['timeline'][date_str]['by_employee'][work_id] = {
                        'name': employee_name,
                        'hours': 0
                    }

                formatted_data['timeline'][date_str]['by_project'][project] += hours
                formatted_data['timeline'][date_str]['by_employee'][work_id]['hours'] += hours
                formatted_data['timeline'][date_str]['total_hours'] += hours

            # Sort timeline data
            formatted_data['timeline'] = dict(sorted(formatted_data['timeline'].items()))
            for project in formatted_data['by_project'].values():
                project['timeline'] = dict(sorted(project['timeline'].items()))
            for employee in formatted_data['by_employee'].values():
                employee['timeline'] = dict(sorted(employee['timeline'].items()))

            # Update summary
            formatted_data['summary'].update({
                'total_hours': sum(emp['total_hours'] for emp in formatted_data['by_employee'].values()),
                'total_employees': len(formatted_data['by_employee']),
                'total_projects': len(formatted_data['by_project'])
            })

            return Response(formatted_data)
            
        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )