export function useOvertimeValidation(form, DEFAULT_SELECT) {
  const validateForm = () => {
    if (form.value.employee_name === DEFAULT_SELECT) return 'Please select an employee'
    if (form.value.project_name === DEFAULT_SELECT) return 'Please select a project'
    if (!form.value.overtime_date) return 'Overtime date is required'
    if (!form.value.time_start || !form.value.time_end) return 'Time start and end are required'
    if (!form.value.overtime_title.trim()) return 'Overtime title is required'
    if (!form.value.overtime_reason.trim()) return 'Overtime reason is required'

    // Break time validation
    if (form.value.take_break) {
      if (!form.value.break_start) return 'Break start time is required when taking a break'
      if (!form.value.break_end) return 'Break end time is required when taking a break'

      const breakStart = new Date(`2000-01-01T${form.value.break_start}`)
      const breakEnd = new Date(`2000-01-01T${form.value.break_end}`)
      if (breakEnd <= breakStart) return 'Break end time must be after break start time'
    }

    return ''
  }

  return { validateForm }
}
