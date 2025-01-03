import { computed } from 'vue';
import { calculateTimeDifference } from '@/utils/time';


export function useTimeCalculation(form) {
  const totalHours = computed(() => {
    if (!form.value.time_start || !form.value.time_end) return 0;

    let hours = calculateTimeDifference(form.value.time_start, form.value.time_end);

    if (form.value.take_break && form.value.break_start && form.value.break_end) {
      const breakHours = calculateTimeDifference(form.value.break_start, form.value.break_end);
      hours -= breakHours;
    }

    return Math.max(0, Number(hours.toFixed(2)));
  });

  const totalBreakHours = computed(() => {
    if (!form.value.take_break || !form.value.break_start || !form.value.break_end) {
      return 0;
    }
    return Number(calculateTimeDifference(form.value.break_start, form.value.break_end).toFixed(2));
  });

  return {
    totalHours,
    totalBreakHours,
    calculateTotalHours: () => totalHours.value,
    calculateTotalBreakTime: () => totalBreakHours.value,
  };
}