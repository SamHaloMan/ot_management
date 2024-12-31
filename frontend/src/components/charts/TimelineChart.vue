<template>
    <div class="chart-container">
        <CChart type="line" :data="chartData" :options="options" />
    </div>
</template>

<script>
import { CChart } from '@coreui/vue-chartjs'

export default {
    name: 'TimelineChart',
    components: { CChart },
    props: {
        data: {
            type: Object,
            required: true
        }
    },
    computed: {
        chartData() {
            return {
                labels: Object.keys(this.data),
                datasets: [
                    {
                        label: 'Total Hours',
                        data: Object.values(this.data).map(day => day.total_hours),
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }
                ]
            }
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
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Overtime Timeline'
                    }
                }
            }
        }
    }
}
</script>

<style scoped>
.chart-container {
    position: relative;
    height: 300px;
    width: 100%;
}
</style>