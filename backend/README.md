# Overtime Management API

A RESTful API built with Django for managing employee overtime requests and analytics.

## Features

- Employee management
- Project management
- Overtime request handling
- Analytics for overtime hours by employee and project
- API documentation using RapiDoc
- Full CRUD operations for primary resources
- RESTful architecture

## Prerequisites

- Python 3.10+
- Pip 24.0+
- Virtualenv 20.0+
- Django 5.0+
- Django Rest Framework 3.15+
- PostgreSQL 14+

## Installation

1. Clone the repository:
```bash
git clone https://github.com/SamHaloMan/ot_management.git
cd ot_management/backend
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Make migration:

Before running this command, make sure you already set the database and the configuration (`./config/settings.py` > DATABASES )
```bash
python manage.py makemigrations api
```

5. Run migrations:
```bash
python manage.py migrate
```

6. Create a superuser:
```bash
python manage.py createsuperuser
```

7. Start the development server (port: 1234):
```bash
python manage.py runserver
```

## API Endpoints

### Employees (`v1/api/employees/`)

- `GET v1/api/employees/` - List all employees
- `GET v1/api/employees/{id}/` - Retrieve specific employee
- `POST v1/api/employees/` - Create new employee
- `PUT v1/api/employees/{id}/` - Update specific employee
- `DELETE v1/api/employees/{id}/` - Delete specific employee

### Projects (`v1/api/projects/`)

- `GET v1/api/projects/` - List all projects
- `GET v1/api/projects/{id}/` - Retrieve specific project
- `POST v1/api/projects/` - Create new project
- `PUT v1/api/projects/{id}/` - Update specific project
- `DELETE v1/api/projects/{id}/` - Delete specific project

### Overtime Requests (`v1/api/overtime-requests/`)

- `GET v1/api/overtime-requests/` - List all overtime requests
- `GET v1/api/overtime-requests/{id}/` - Retrieve specific overtime request
- `POST v1/api/overtime-requests/` - Create new overtime request
- `PUT v1/api/overtime-requests/{id}/` - Update specific overtime request
- `DELETE v1/api/overtime-requests/{id}/` - Delete specific overtime request

### Analytics (`v1/api/analytics/`)

- `GET v1/api/analytics/total_hours_by_employee/` - Get total overtime hours per employee
- `GET v1/api/analytics/total_hours_by_project/` - Get total overtime hours per project

## API Documentation

API documentation is available through RapiDoc at:
```
http://localhost:1234/v1/api/docs/
```

## Data Models

### Employee
```python
{
    "id": integer,
    "employee_id": string,
    "name": string,
    "is_enabled": boolean,
    "created_at": datetime,
    "updated_at": datetime
}
```

### Project
```python
{
    "id": integer,
    "name": string,
    "is_enabled": boolean,
    "created_at": datetime,
    "updated_at": datetime
}
```

### Overtime Request
```python
{
    "id": integer,
    "employee_id": string,
    "employee_name": string,
    "project_name": integer,
    "time_start": time,
    "time_end": time,
    "total_hours": time,
    "overtime_title": string,
    "overtime_reason": string,
    "has_break": boolean,
    "break_start": time,
    "break_end": time,
    "created_at": datetime,
    "updated_at": datetime
}
```

## Development

### Running Tests
```bash
python manage.py test
```
## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any inquiries, please open an issue in the GitHub repository.