from django.urls import path, include
from django.views.generic import TemplateView, RedirectView
from rest_framework.routers import DefaultRouter
from rest_framework.permissions import AllowAny
from drf_yasg import openapi
from drf_yasg.views import get_schema_view

from api.views import EmployeeViewSet, ProjectViewSet, OvertimeRequestViewSet, OvertimeReportAnalyticsViewSet


router = DefaultRouter()
router.register('employees', EmployeeViewSet)
router.register('projects', ProjectViewSet)
router.register('overtime-requests', OvertimeRequestViewSet)
router.register('analytics', OvertimeReportAnalyticsViewSet, basename='analytics')

# API Documentation Schema
schema_view = get_schema_view(
    openapi.Info(
        title="Overtime Management API",
        default_version='v1.0.0',
        description="""
            API for managing overtime requests.

            Features:
            - Employee management
            - Project management
            - Overtime request management
            - Analytics with time-range support
        """,
        # terms_of_service="https://www.google.com/policies/terms/",
        # contact=openapi.Contact(email="ptb@example.com"),
        # license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(AllowAny,),
)

urlpatterns = [
    path('', RedirectView.as_view(url='v1/api/docs/', permanent=False)),                        # Redirect root to /v1/api/docs
    path('v1/api/schema/', schema_view.without_ui(cache_timeout=0), name='openapi-schema'),     # OpenAPI schema
    path('v1/api/', include([
        path('', include(router.urls)),
        path('docs/', TemplateView.as_view(
            template_name="rapi_doc.html",
            extra_context={'schema_url':'openapi-schema'}
        ), name="rapi-doc"),
    ])),
]