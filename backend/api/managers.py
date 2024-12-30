import os
import json
from datetime import datetime, date
from dateutil.relativedelta import relativedelta
from django.db.models import Sum
from collections import defaultdict


class JSONFileManager:
    def __init__(self):
        self.base_path = os.path.join(os.path.dirname(__file__), "json_files")
        os.makedirs(self.base_path, exist_ok=True)
        
    def _ensure_file_exists(self, filepath):
        if not os.path.exists(filepath):
            with open(filepath, 'w') as f:
                json.dump({}, f)

    def update_employees_json(self, Employee):
        filepath = os.path.join(self.base_path, "employees.json")
        employees = Employee.objects.values("work_id", "name", "is_enabled")
        data = {"employees": list(employees)}
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)

    def update_projects_json(self, Project):
        filepath = os.path.join(self.base_path, "projects.json")
        projects = Project.objects.values("id", "name", "is_enabled")
        data = {"projects": list(projects)}
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)

    def update_overtime_json(self, overtime_request):
        date_str = overtime_request.overtime_date.strftime("%Y%m%d")
        filename = f"{date_str}OT.json"
        filepath = os.path.join(self.base_path, filename)
        
        self._ensure_file_exists(filepath)
        
        with open(filepath, 'r') as f:
            data = json.load(f)
        
        overtime_data = {
            "id": overtime_request.id,
            "work_id": overtime_request.work_id,
            "project_name": overtime_request.project_name,
            "time_start": overtime_request.time_start.strftime("%H:%M"),
            "time_end": overtime_request.time_end.strftime("%H:%M"),
            "total_hours": float(overtime_request.total_hours),
            "overtime_title": overtime_request.overtime_title,
            "overtime_reason": overtime_request.overtime_reason,
            "break_start": overtime_request.break_start.strftime("%H:%M") if overtime_request.break_start else None,
            "break_end": overtime_request.break_end.strftime("%H:%M") if overtime_request.break_end else None,
            "created_at": overtime_request.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "updated_at": overtime_request.updated_at.strftime("%Y-%m-%d %H:%M:%S"),
        }
        
        if "overtime_requests" not in data:
            data["overtime_requests"] = []
        
        updated = False
        for i, request in enumerate(data["overtime_requests"]):
            if request.get("id") == overtime_request.id:
                data["overtime_requests"][i] = overtime_data
                updated = True
                break
        
        if not updated:
            data["overtime_requests"].append(overtime_data)
        
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)

    def _get_monthly_date_range(self, target_date=None):
        """Get date range for monthly analytics (26th previous month to 25th current month)"""
        if target_date is None:
            target_date = date.today()
            
        if target_date.day <= 25:
            end_date = target_date.replace(day=25)
            start_date = (target_date - relativedelta(months=1)).replace(day=26)
        else:
            start_date = target_date.replace(day=26)
            end_date = (target_date + relativedelta(months=1)).replace(day=25)
            
        return start_date, end_date

    def update_analytics_json(self, Employee, OvertimeRequest):
        today = date.today()
        start_date, end_date = self._get_monthly_date_range(today)
        
        # Generate analytics filename based on the end date's month and year
        filename = f"Analytics_{end_date.strftime('%B')}_{end_date.year}.json"
        filepath = os.path.join(self.base_path, filename)
        
        analytics_data = {"Employee_OT_Hours_Analytics": []}
        
        employees = Employee.objects.all()
        
        for employee in employees:
            overtime_hours = OvertimeRequest.objects.filter(
                work_id=employee.work_id,
                overtime_date__range=(start_date, end_date)
            ).values('project_name').annotate(
                total_hours=Sum('total_hours')
            )
            
            projects_dict = {
                ot['project_name']: float(ot['total_hours'])
                for ot in overtime_hours
            }
            
            if projects_dict:
                employee_data = {
                    "work_id": employee.work_id,
                    "name": employee.name,
                    "projects": projects_dict
                }
                analytics_data["Employee_OT_Hours_Analytics"].append(employee_data)
        
        with open(filepath, 'w') as f:
            json.dump(analytics_data, f, indent=2)

json_manager = JSONFileManager()