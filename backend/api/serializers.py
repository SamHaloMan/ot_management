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

    class Meta:
        model = OvertimeRequest
        fields = ['id', 'work_id', 'employee_name', 'project_name', 
                  'overtime_date', 'overtime_title', 'overtime_reason',
                  'time_start', 'time_end',  'break_start', 'break_end',
                  'total_hours', 'created_at', 'updated_at']

    def validate(self, data):
        # work_id = data.get('work_id')
        employee_name = data.get('employee_name')
        project_name = data.get('project_name')

        # Employee `work_id` is required. If Employee `name` blank, it will automatically filled based on employee `work_id`
        # if work_id:
        #     try:
        #         employee = Employee.objects.get(name=work_id)
        #         data['name'] = employee.name
        #     except Employee.DoesNotExist:
        #         raise serializers.ValidationError({'work_id': 'Employee WorkID not found'})
        
        # Employee `name` is required. If Employee `work_id` blank, it will automatically filled based on employee `name`
        if employee_name:
            try:
                employee = Employee.objects.get(name=employee_name)
                data['work_id'] = employee.work_id
            except Employee.DoesNotExist:
                raise serializers.ValidationError({'employee_name': 'Employee name not found'})

        if project_name and not Project.objects.filter(name=project_name).exists():
            raise serializers.ValidationError({'project_name': 'Project not found'})

        return data
    
    # def get_employee_display_workId(self, obj):
    #     try:
    #         return Employee.objects.get(name=obj.project_name).name
    #     except Employee.DoesNotExist:
    #         return None

    def get_employee_display_name(self, obj):
        try:
            return Employee.objects.get(name=obj.work_id).name
        except Employee.DoesNotExist:
            return None

    def get_project_display_name(self, obj):
        try:
            return Project.objects.get(name=obj.project_name).name
        except Project.DoesNotExist:
            return None