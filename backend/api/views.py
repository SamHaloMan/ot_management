from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum

from .serializers import EmployeeSerializer, ProjectSerializer, OvertimeRequestSerializer

from .models import Employee, Project, OvertimeRequest


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer


class OvertimeRequestViewSet(viewsets.ModelViewSet):
    queryset = OvertimeRequest.objects.all()
    serializer_class = OvertimeRequestSerializer


class OvertimeReportAnalyticsViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['get'])
    def total_hours_by_employee(self, request):
        data = OvertimeRequest.objects.values('employee__name').annotate(total_hours=Sum('total_hours'))
        return Response(data)

    @action(detail=False, methods=['get'])
    def total_hours_by_project(self, request):
        data = OvertimeRequest.objects.values('project__name').annotate(total_hours=Sum('total_hours'))
        return Response(data)
