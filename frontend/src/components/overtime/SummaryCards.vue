<template>
  <div class="row mb-4">
    <div class="col-md-4" v-for="card in summaryCards" :key="card.title">
      <CCard>
        <CCardBody>
          <h6>{{ card.title }}</h6>
          <div class="text-muted">{{ card.subtitle }}</div>
          <div class="h4" :class="card.valueClass">{{ card.value }}</div>
        </CCardBody>
      </CCard>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { CCard, CCardBody } from '@coreui/vue';
import { TIME_LIMITS } from '@/constants/overtime';

const props = defineProps({
  appliedMonthly: {
    type: Number,
    required: true,
    default: 0,
    validator: value => !isNaN(value) && value >= 0
  },
  appliedWeekly: {
    type: Number,
    required: true,
    default: 0,
    validator: value => !isNaN(value) && value >= 0
  }
});

const formatHours = (hours) => Number(hours).toFixed(2);

const getRemainingHours = (applied, limit) => {
  const remaining = limit - applied;
  return {
    value: formatHours(Math.max(0, remaining)),
    class: remaining < 0 ? 'text-danger' : 'text-success'
  };
};

const summaryCards = computed(() => {
  const weeklyRemaining = getRemainingHours(props.appliedWeekly, TIME_LIMITS.WEEKLY);
  const monthlyRemaining = getRemainingHours(props.appliedMonthly, TIME_LIMITS.MONTHLY);

  return [
    {
      title: 'Overtime Limit (Monthly)',
      subtitle: 'Applied / Limit',
      value: `${formatHours(props.appliedMonthly)} / ${formatHours(TIME_LIMITS.MONTHLY)} Hours`,
      valueClass: props.appliedMonthly > TIME_LIMITS.MONTHLY ? 'text-danger' : ''
    },
    {
      title: 'Applied Overtime (Weekly)',
      subtitle: 'Current / Limit',
      value: `${formatHours(props.appliedWeekly)} / ${formatHours(TIME_LIMITS.WEEKLY)} Hours`,
      valueClass: props.appliedWeekly > TIME_LIMITS.WEEKLY ? 'text-danger' : ''
    },
    {
      title: 'Remaining Applicable Overtime',
      subtitle: 'Weekly / Monthly',
      value: `${weeklyRemaining.value} / ${monthlyRemaining.value} Hours`,
      valueClass: weeklyRemaining.class
    }
  ];
});
</script>