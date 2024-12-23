from django.urls import path, include
from rest_framework.routers import DefaultRouter
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework.permissions import AllowAny


from api.views import EmployeeViewSet, ProjectViewSet, OvertimeRequestViewSet, OvertimeReportAnalyticsViewSet


router = DefaultRouter()
router.register('employees', EmployeeViewSet)
router.register('projects', ProjectViewSet)
router.register('overtime-requests', OvertimeRequestViewSet)
router.register('analytics', OvertimeReportAnalyticsViewSet, basename='analytics')

schema_view = get_schema_view(
    openapi.Info(
        title="Overtime Management API",
        default_version='v1',
        description="API for managing employees, projects, and overtime requests.",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@example.com"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(AllowAny,),
)

urlpatterns = [
    path('v1/api/', include(router.urls)),
    path('v1/swagger', schema_view.with_ui('swagger', cache_timeout=0)),
    path('v1/redoc/', schema_view.with_ui('redoc', cache_timeout=0)),
]