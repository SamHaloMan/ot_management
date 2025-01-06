from django.db import models
from django.forms import ValidationError
from django.utils.timezone import now
from datetime import datetime, date

from .managers import json_manager


def current_date():
    return date.today()


class TimestampedModel(models.Model):
    created_at = models.DateTimeField(default=now, editable=False, db_index=True)
    updated_at = models.DateTimeField(default=now, editable=False)

    def save(self, *args, **kwargs):
        if not self.pk:
            self.created_at = now()
        self.updated_at = now()
        super().save(*args, **kwargs)

    class Meta:
        abstract = True


class Employee(TimestampedModel):
    work_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    is_enabled = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        from .models import Employee, OvertimeRequest
        json_manager.update_employees_json(Employee)
        json_manager.update_analytics_json(Employee, OvertimeRequest)

    def delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)
        from .models import Employee, OvertimeRequest
        json_manager.update_employees_json(Employee)
        json_manager.update_analytics_json(Employee, OvertimeRequest)


class Project(TimestampedModel):
    name = models.CharField(max_length=255, unique=True)
    is_enabled = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        from .models import Project, Employee, OvertimeRequest
        json_manager.update_projects_json(Project)
        json_manager.update_analytics_json(Employee, OvertimeRequest)

    def delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)
        from .models import Project, Employee, OvertimeRequest
        json_manager.update_projects_json(Project)
        json_manager.update_analytics_json(Employee, OvertimeRequest)


class OvertimeRequest(TimestampedModel):
    work_id = models.CharField(max_length=10)
    employee_name = models.CharField(max_length=255)
    project_name = models.CharField(max_length=255)
    overtime_date = models.DateField(default=current_date)
    overtime_title = models.CharField(max_length=255)
    overtime_reason = models.TextField()
    time_start = models.TimeField()
    time_end = models.TimeField()
    break_start = models.TimeField(null=True, blank=True)
    break_end = models.TimeField(null=True, blank=True)
    total_hours = models.DecimalField(max_digits=5, decimal_places=2, editable=False)

    def clean(self):
        super().clean()

        # Ensure overtime_date is a date, not a datetime
        if isinstance(self.overtime_date, datetime):
            self.overtime_date = self.overtime_date.date()

        if self.break_start and not self.break_end:
            raise ValidationError("Break end time is required if break start is set")
        if self.break_end and not self.break_start:
            raise ValidationError("Break start time is required if break end is set")
        
        # Validate time ranges
        if self.time_start >= self.time_end:
            raise ValidationError("End time must be after start time")
        
        if self.break_start and self.break_end:
            if self.break_start >= self.break_end:
                raise ValidationError("Break end time must be after break start time")
            if self.break_start < self.time_start:
                raise ValidationError("Break cannot start before overtime start")
            if self.break_end > self.time_end:
                raise ValidationError("Break cannot end after overtime end")

    def calculate_total_hours(self):
        """Calculate total hours worked including break time deduction"""
        def time_to_minutes(time_obj):
            return time_obj.hour * 60 + time_obj.minute

        total_minutes = time_to_minutes(self.time_end) - time_to_minutes(self.time_start)

        # Deduct break time if present
        if self.break_start and self.break_end:
            break_minutes = time_to_minutes(self.break_end) - time_to_minutes(self.break_start)
            total_minutes -= break_minutes

        return round(total_minutes / 60, 2)

    def save(self, *args, **kwargs):
        self.clean()        
        self.total_hours = self.calculate_total_hours()
        super().save(*args, **kwargs)
        
        try:
            json_manager.update_overtime_json(self)
            from .models import Employee, OvertimeRequest
            json_manager.update_analytics_json(Employee, OvertimeRequest)
        except Exception as e:
            print(f"Error updating JSON files: {str(e)}")

    def delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)
        from .models import Employee, OvertimeRequest
        json_manager.update_analytics_json(Employee, OvertimeRequest)

    def __str__(self):
        return f"{self.overtime_title} - {self.work_id}"
    
    class Meta:
        # Add a unique constraint for work_id + overtime_date + project_name to prevent duplicate entries
        unique_together = ('work_id', 'overtime_date', 'project_name')