<template>
    <div class="chart-container">
        <CChart type="pie" :data="chartData" :options="options" />
    </div>
</template>

<script>
import { CChart } from '@coreui/vue-chartjs'

export default {
    name: 'ProjectOvertimeChart',
    components: { CChart },
    props: {
        chartData: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Project Overtime Distribution'
                    }
                }
            }
        }
    }
}
</script>