<template>
    <div class="chart-container">
        <CChart type="bar" :data="chartData" :options="options" />
    </div>
</template>

<script>
import { CChart } from '@coreui/vue-chartjs'

export default {
    name: 'EmployeeOvertimeChart',
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
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Hours'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Employee Overtime Distribution'
                    }
                }
            }
        }
    }
}
</script>