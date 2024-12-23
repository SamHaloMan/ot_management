from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.timezone import now


class Employee(models.Model):
    employee_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    is_enabled = models.BooleanField(default=True)
    created_at = models.TimeField(default=now)
    updated_at = models.TimeField(default=now)

    def __str__(self):
        return self.name


class Project(models.Model):
    name = models.CharField(max_length=255, unique=True)
    is_enabled = models.BooleanField(default=True)
    created_at = models.TimeField(default=now)
    updated_at = models.TimeField(default=now)

    def __str__(self):
        return self.name


class OvertimeRequest(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    request_date = models.DateField(default=now)
    time_start = models.TimeField()
    time_end = models.TimeField()
    total_hours = models.IntegerField()
    overtime_title = models.CharField(max_length=255)
    overtime_reason = models.TextField()
    has_break = models.BooleanField(default=False)
    break_start = models.TimeField(null=True, blank=True)
    break_end = models.TimeField(null=True, blank=True)
    created_at = models.TimeField(default=now)
    updated_at = models.TimeField(default=now)

    def __str__(self):
        return f"{self.overtime_title} - {self.employee.name}"
