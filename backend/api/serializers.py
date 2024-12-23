from rest_framework import serializers

from .models import Employee, Project, OvertimeRequest


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'


class OvertimeRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(write_only=True)
    employee_display_name = serializers.SerializerMethodField()
    project_display_name = serializers.SerializerMethodField()

    class Meta:
        model = OvertimeRequest
        fields = ['id', 'employee_name', 'employee_id', 'employee_display_name', 
                 'project_name', 'project_display_name', 'request_date', 'time_start', 
                 'time_end', 'total_hours', 'overtime_title', 'overtime_reason', 
                 'has_break', 'break_start', 'break_end', 'created_at', 'updated_at']

    def validate(self, data):
        employee_name = data.pop('employee_name', None)
        project_name = data.get('project_name')

        if employee_name:
            try:
                employee = Employee.objects.get(name=employee_name)
                data['employee_id'] = employee.employee_id
            except Employee.DoesNotExist:
                raise serializers.ValidationError({'employee_name': 'Employee not found'})

        if project_name and not Project.objects.filter(name=project_name).exists():
            raise serializers.ValidationError({'project_name': 'Project not found'})

        return data

    def get_employee_display_name(self, obj):
        try:
            return Employee.objects.get(employee_id=obj.employee_id).name
        except Employee.DoesNotExist:
            return None

    def get_project_display_name(self, obj):
        try:
            return Project.objects.get(name=obj.project_name).name
        except Project.DoesNotExist:
            return None