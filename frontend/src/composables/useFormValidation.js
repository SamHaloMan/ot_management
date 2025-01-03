import { computed } from 'vue';
import { DEFAULTS } from '@/constants/overtime';


export function useFormValidation(form, store) {
  const formFields = computed(() => [
    {
      name: 'employee_name',
      label: 'Employee Name*',
      type: 'select',
      options: [
        { value: DEFAULTS.SELECT_OPTION, text: DEFAULTS.SELECT_OPTION },
        ...store.getters['employees/employeeOptions']
      ],
      required: true,
      onChange: handleEmployeeChange,
    },
    {
      name: 'work_id',
      label: 'Work ID',
      type: 'text',
      readonly: true,
      disabled: true,
    },
    {
      name: 'project_name',
      label: 'Project Name*',
      type: 'select',
      options: store.getters['projects/projectOptions'],
      required: true,
    },
    {
      name: 'overtime_date',
      label: 'Overtime Date*',
      type: 'date',
      required: true,
    },
    {
      name: 'overtime_title',
      label: 'Overtime Title*',
      type: 'text',
      required: true,
    },
    {
      name: 'overtime_reason',
      label: 'Overtime Reason*',
      type: 'textarea',
      required: true,
    },
    {
      name: 'take_break',
      label: 'Take Break',
      type: 'checkbox',
    },
  ]);

  const handleEmployeeChange = () => {
    if (form.value.employee_name === DEFAULTS.SELECT_OPTION) {
      form.value.work_id = '';
      return;
    }

    const employee = store.state.employees.employees.find(
      emp => emp.name === form.value.employee_name
    );
    form.value.work_id = employee?.work_id || '';
  };

  const validateForm = () => {
    const validations = {
      employee_name: () => form.value.employee_name === DEFAULTS.SELECT_OPTION ? 'Please select an employee' : '',
      project_name: () => form.value.project_name === DEFAULTS.SELECT_OPTION ? 'Please select a project' : '',
      overtime_date: () => !form.value.overtime_date ? 'Overtime date is required' : '',
      time: () => !form.value.time_start || !form.value.time_end ? 'Time start and end are required' : '',
      overtime_title: () => !form.value.overtime_title.trim() ? 'Overtime title is required' : '',
      overtime_reason: () => !form.value.overtime_reason.trim() ? 'Overtime reason is required' : '',
      break_time: () => form.value.take_break && (!form.value.break_start || !form.value.break_end) ? 
        'Break start and end times are required when taking a break' : ''
    };

    for (const [field, validate] of Object.entries(validations)) {
      const error = validate();
      if (error) return error;
    }

    return '';
  };

  return {
    formFields,
    handleEmployeeChange,
    validateForm,
  };
}