import { ref } from 'vue'

export function useTimeCalculation() {
  const totalHours = ref(0)
  const totalBreakHours = ref(0)

  const calculateTotalHours = (formData) => {
    if (!formData || !formData.time_start || !formData.time_end) {
      totalHours.value = 0
      return
    }

    const start = new Date(`2000-01-01T${formData.time_start}`)
    const end = new Date(`2000-01-01T${formData.time_end}`)
    let diff = (end - start) / (1000 * 60 * 60)

    if (formData.take_break && formData.break_start && formData.break_end) {
      const breakDiff = calculateTotalBreakTime(formData)
      diff -= breakDiff
    }

    totalHours.value = Math.max(0, diff)
    return totalHours.value
  }

  const calculateTotalBreakTime = (formData) => {
    if (!formData || !formData.break_start || !formData.break_end) {
      totalBreakHours.value = 0
      return 0
    }

    const breakStart = new Date(`2000-01-01T${formData.break_start}`)
    const breakEnd = new Date(`2000-01-01T${formData.break_end}`)
    const diff = (breakEnd - breakStart) / (1000 * 60 * 60)

    totalBreakHours.value = Math.max(0, diff)
    return totalBreakHours.value
  }

  return {
    totalHours,
    totalBreakHours,
    calculateTotalHours,
    calculateTotalBreakTime,
  }
}
