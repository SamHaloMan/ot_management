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
    employee_name = serializers.CharField()

    class Meta:
        model = OvertimeRequest
        fields = ['id', 'work_id', 'employee_name', 'project_name', 
                  'overtime_date', 'overtime_title', 'overtime_reason',
                  'time_start', 'time_end',  'break_start', 'break_end',
                  'total_hours', 'created_at', 'updated_at']
        
        # This allows these fields to be either omitted or set as null in the request body.
        extra_kwargs = {
            'break_start': {'required': False, 'allow_null': True},
            'break_end': {'required': False, 'allow_null': True},
        }

    def get_employee_name(self, obj):
        try:
            employee = Employee.objects.get(work_id=obj.work_id)
            return employee.name
        except Employee.DoesNotExist:
            return None
        
    def validate_break_fields(self, value):
        if value == "":
            return None
        return value

    def validate(self, data):
        employee_workId = data.get('work_id')
        employee_name = self.context['request'].data.get('employee_name')
        project_name = data.get('project_name')

        # Handle the break fields and convert empty strings to None
        data['break_start'] = self.validate_break_fields(data.get('break_start'))
        data['break_end'] = self.validate_break_fields(data.get('break_end'))

        if employee_name:
            try:
                employee = Employee.objects.get(name=employee_name)
                data['work_id'] = employee.work_id
                data['employee_name'] = employee.name
            except Employee.DoesNotExist:
                raise serializers.ValidationError({'employee_name': 'Employee name not found'})

        if employee_workId and not Employee.objects.filter(work_id=employee_workId).exists():
            raise serializers.ValidationError({'work_id': 'Work ID not found'})

        if project_name and not Project.objects.filter(name=project_name).exists():
            raise serializers.ValidationError({'project_name': 'Project not found'})

        return data