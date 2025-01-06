<template>
    <div class="row mb-4">
        <div class="col-md-4" v-for="(card, index) in summaryCards" :key="index">
            <CCard>
                <CCardBody>
                    <h6>{{ card.title }}</h6>
                    <div>{{ card.subtitle }}</div>
                    <div class="h4">{{ card.value }}</div>
                </CCardBody>
            </CCard>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    appliedMonthly: Number,
    appliedWeekly: Number,
    employeeName: String
})

const summaryCards = computed(() => [
    {
        title: 'Overtime Weekly',
        subtitle: `Applied / Limit`,
        value: `${props.appliedWeekly.toFixed(2)} / 18.00 Hours`
    },
    {
        title: `Overtime Monthly`,
        subtitle: `Applied / Limit`,
        value: `${props.appliedMonthly.toFixed(2)} / 72.00 Hours`
    },
    {
        title: 'Remaining Applicable Overtime',
        subtitle: 'Weekly / Monthly',
        value: `${(18 - props.appliedWeekly).toFixed(2)} / ${(72 - props.appliedMonthly).toFixed(2)} Hours`
    }
])
</script>