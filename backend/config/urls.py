from django.urls import path, include
from rest_framework.routers import DefaultRouter

from api.views import EmployeeViewSet, ProjectViewSet, OvertimeRequestViewSet, OvertimeReportAnalyticsViewSet


router = DefaultRouter()
router.register('employees', EmployeeViewSet)
router.register('projects', ProjectViewSet)
router.register('overtime-requests', OvertimeRequestViewSet)
router.register('analytics', OvertimeReportAnalyticsViewSet, basename='analytics')

urlpatterns = [
    path('api/', include(router.urls)),
]