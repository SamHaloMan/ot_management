from django.urls import path, include
from django.views.generic import TemplateView
from rest_framework.routers import DefaultRouter
from rest_framework.permissions import AllowAny
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from api.views import EmployeeViewSet, ProjectViewSet, OvertimeRequestViewSet, OvertimeReportAnalyticsViewSet

router = DefaultRouter()
router.register('employees', EmployeeViewSet)
router.register('projects', ProjectViewSet)
router.register('overtime-requests', OvertimeRequestViewSet)
router.register('analytics', OvertimeReportAnalyticsViewSet, basename='analytics')

schema_view = get_schema_view(
    openapi.Info(
        title="Overtime Management API",
        default_version='v1.0.0',
        description="API for managing overtime requests.",
        # terms_of_service="https://www.google.com/policies/terms/",
        # contact=openapi.Contact(email="ptb@example.com"),
        # license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(AllowAny,),
)

urlpatterns = [
    path('v1/api/', include(router.urls)),
    path('swagger.json', schema_view.without_ui(cache_timeout=0), name='swagger-schema'),
    path('v1/rapi-doc/', TemplateView.as_view(template_name="rapi_doc.html"), name="rapi-doc"),
]