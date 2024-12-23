from django.db import models
from django.utils.timezone import now
import json
import os


class TimestampedModel(models.Model):
    created_at = models.DateTimeField(default=now, editable=False, db_index=True)
    updated_at = models.DateTimeField(default=now, editable=False)

    def save(self, *args, **kwargs):
        if not self.pk:     # On;y on creation
            self.created_at = now()
        self.updated_at = now()
        super().save(*args, **kwargs)

    class Meta:
        abstract = True


class Employee(TimestampedModel):
    employee_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    is_enabled = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        update_json_files()

    def delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)
        update_json_files()

    def __str__(self):
        return self.name


class Project(TimestampedModel):
    name = models.CharField(max_length=255, unique=True)
    is_enabled = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        update_json_files()

    def delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)
        update_json_files()

    def __str__(self):
        return self.name


class OvertimeRequest(TimestampedModel):
    employee_id = models.CharField(max_length=50)
    project_name = models.CharField(max_length=255)  
    request_date = models.DateField(default=now)
    time_start = models.TimeField()
    time_end = models.TimeField()
    total_hours = models.IntegerField()
    overtime_title = models.CharField(max_length=255)
    overtime_reason = models.TextField()
    has_break = models.BooleanField(default=False)
    break_start = models.TimeField(null=True, blank=True)
    break_end = models.TimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.overtime_title} - {self.employee_id}"


def update_json_files():
    base_path = os.path.join(os.path.dirname(__file__), "../json")

    # Update employee.json
    employee_path = os.path.join(base_path, "employee.json")
    employees = Employee.objects.values("id", "employee_id", "name", "is_enabled")
    with open(employee_path, "w") as f:
        json.dump({"employee": list(employees)}, f, indent=4)

    # Update project.json
    project_path = os.path.join(base_path, "project.json")
    projects = Project.objects.values("id", "name", "is_enabled")
    with open(project_path, "w") as f:
        json.dump({"project": list(projects)}, f, indent=4)

