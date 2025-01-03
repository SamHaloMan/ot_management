export const DEFAULTS = {
  SELECT_OPTION: '--SELECT OPTIONS--',
  FORM: {
    employee_name: '--SELECT OPTIONS--',
    work_id: '',
    project_name: '--SELECT OPTIONS--',
    overtime_date: new Date().toISOString().split('T')[0],
    time_start: '17:20',
    time_end: '',
    break_start: '12:00',
    break_end: '13:00',
    overtime_title: '',
    overtime_reason: '',
    take_break: false,
  },
  BREAK_START: '18:30',
  BREAK_END: '19:00'
};

export const TIME_LIMITS = {
  WEEKLY: 18,
  MONTHLY: 72
};

export const VALIDATION_RULES = {
  workId: (value) => value.length <= 50,
  title: (value) => value.trim().length > 0,
  reason: (value) => value.trim().length > 0
};