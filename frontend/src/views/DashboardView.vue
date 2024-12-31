<template>
    <div class="dashboard">
        <h1 class="mb-4">Dashboard</h1>
        <overtime-charts />
    </div>
</template>

<script>
import OvertimeCharts from '@/components/charts/OvertimeCharts.vue'

export default {
    name: 'DashboardView',
    components: {
        OvertimeCharts
    }
}
</script>