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
        try:
            start = datetime.strptime(start_date, '%Y-%m-%d').date()
            end = datetime.strptime(end_date, '%Y-%m-%d').date()
            
            if start > end:
                raise ValueError("Start date must be before end date")
                
            if end > date.today():
                raise ValueError("End date cannot be in the future")
                
            return start, end
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

        trunc_function = self._get_trunc_function(grouping)
        
        try:
            employee_data = OvertimeRequest.objects.filter(
                overtime_date__range=(start, end)
            ).values(
                'work_id',
                'project_name'
            ).annotate(
                date=trunc_function('overtime_date'),
                total_hours=Sum('total_hours')
            ).order_by('work_id', 'date')

            formatted_data = {
                'by_employee': {},
                'by_project': {},
                'timeline': {},
                'summary': {
                    'total_hours': 0,
                    'total_employees': 0,
                    'total_projects': 0,
                    'average_hours_per_day': 0
                }
            }

            for entry in employee_data:
                work_id = entry['employee_id']
                project = entry['project_name']
                date_str = entry['date'].strftime('%Y-%m-%d')
                hours = float(entry['total_hours'])

                # By employee
                if work_id not in formatted_data['by_employee']:
                    try:
                        employee = Employee.objects.get(employee_id=work_id)
                        formatted_data['by_employee'][work_id] = {
                            'name': employee.name,
                            'total_hours': 0,
                            'projects': {}
                        }
                    except Employee.DoesNotExist:
                        continue
                
                if project not in formatted_data['by_employee'][work_id]['projects']:
                    formatted_data['by_employee'][work_id]['projects'][project] = 0
                
                formatted_data['by_employee'][work_id]['projects'][project] += hours
                formatted_data['by_employee'][work_id]['total_hours'] += hours

                # By project
                if project not in formatted_data['by_project']:
                    formatted_data['by_project'][project] = {
                        'total_hours': 0,
                        'timeline': {}
                    }
                
                if date_str not in formatted_data['by_project'][project]['timeline']:
                    formatted_data['by_project'][project]['timeline'][date_str] = 0
                
                formatted_data['by_project'][project]['timeline'][date_str] += hours
                formatted_data['by_project'][project]['total_hours'] += hours

                # Timeline
                if date_str not in formatted_data['timeline']:
                    formatted_data['timeline'][date_str] = {
                        'total_hours': 0,
                        'by_project': {}
                    }
                
                if project not in formatted_data['timeline'][date_str]['by_project']:
                    formatted_data['timeline'][date_str]['by_project'][project] = 0
                
                formatted_data['timeline'][date_str]['by_project'][project] += hours
                formatted_data['timeline'][date_str]['total_hours'] += hours

            # Calculate summary
            total_hours = sum(emp['total_hours'] for emp in formatted_data['by_employee'].values())
            days_difference = (end - start).days + 1
            
            formatted_data['summary'].update({
                'total_hours': total_hours,
                'total_employees': len(formatted_data['by_employee']),
                'total_projects': len(formatted_data['by_project']),
                'average_hours_per_day': round(total_hours / days_difference, 2) if days_difference > 0 else 0
            })

            return Response(formatted_data)
            
        except Exception as e:
            return Response(
                {"error": f"An error occurred while processing the data: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


    @action(detail=False, methods=['get'])
    def get_monthly_analytics(self, request):
        """Get analytics for a specific month"""
        try:
            year = int(request.query_params.get('year', date.today().year))
            month = int(request.query_params.get('month', date.today().month))
            
            filename = f"Analytics_{date(year, month, 1).strftime('%B')}_{year}.json"
            json_path = os.path.join(os.path.dirname(__file__), "json_files", filename)
            
            if os.path.exists(json_path):
                with open(json_path, 'r') as f:
                    data = json.load(f)
                return Response(data)
            return Response({"Employee_OT_Hours_Analytics": []})
            
        except (ValueError, TypeError):
            return Response(
                {"error": "Invalid year or month parameters"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )