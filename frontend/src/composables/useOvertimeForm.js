import { ref, computed } from 'vue'
import { useStore } from 'vuex'

export function useOvertimeForm() {
  const store = useStore()
  const DEFAULT_SELECT = '--SELECT OPTIONS--'
  const DEFAULT_WORKID = 'MW-------'

  const form = ref(getDefaultForm())
  const submitSuccess = ref(false)
  const submitError = ref(null)
  const isLoading = ref(false)

  function getDefaultForm() {
    return {
      employee_name: DEFAULT_SELECT,
      work_id: DEFAULT_WORKID,
      project_name: DEFAULT_SELECT,
      overtime_date: new Date().toISOString().split('T')[0],
      time_start: '17:20',
      time_end: '',
      break_start: '12:00',
      break_end: '13:00',
      overtime_title: '',
      overtime_reason: '',
      take_break: false,
      total_hours: 0,
    }
  }

  const employeeOptions = computed(() => {
    const employees = store.state.employees.employees || []
    return [
      { label: DEFAULT_SELECT, value: DEFAULT_SELECT, workId: DEFAULT_WORKID },
      ...employees
        .filter((emp) => emp.is_enabled === true)
        .map((emp) => ({
          label: emp.name,
          value: emp.name,
          workId: emp.work_id,
        })),
    ]
  })

  const projectOptions = computed(() => {
    const projects = store.state.projects.projects || []
    return [
      {
        label: DEFAULT_SELECT,
        value: DEFAULT_SELECT,
      },
      ...projects
        .filter((proj) => proj.is_enabled === true)
        .map((proj) => ({
          label: proj.name,
          value: proj.name,
        })),
    ]
  })

  const updateWorkId = (employeeName) => {
    const selectedEmployee = employeeOptions.value.find((emp) => emp.value === employeeName)
    form.value.work_id = selectedEmployee?.workId || DEFAULT_WORKID
  }

  const loadHistoricalData = async (employeeName, date) => {
    if (!employeeName || !date || employeeName === DEFAULT_SELECT) return null

    isLoading.value = true
    try {
      const response = await store.dispatch('overtime/fetchEmployeeOvertimeData', {
        employeeName,
        date,
      })
      return response
    } catch (error) {
      console.error('Error loading historical data:', error)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const populateFormWithHistoricalData = (data) => {
    if (!data) return

    // Keep current employee and date
    const currentEmployee = form.value.employee_name
    const currentDate = form.value.overtime_date
    const currentWorkId = form.value.work_id

    form.value = {
      ...getDefaultForm(),
      ...data,
      employee_name: currentEmployee,
      work_id: currentWorkId,
      overtime_date: currentDate,
      take_break: !!(data.break_start && data.break_end),
    }
  }

  return {
    form,
    isLoading,
    submitSuccess,
    submitError,
    employeeOptions,
    projectOptions,
    DEFAULT_SELECT,
    DEFAULT_WORKID,
    getDefaultForm,
    updateWorkId,
    loadHistoricalData,
    populateFormWithHistoricalData,
  }
}
