<template>
    <div class="analytics">
        <h3 class="mb-4">Analytics</h3>

        <!-- Date Range Selector -->
        <CCard class="mb-4">
            <CCardBody>
                <div class="row align-items-center">
                    <div class="col-md-4">
                        <CFormLabel>Start Date</CFormLabel>
                        <CFormInput type="date" v-model="startDate" @change="fetchAnalyticsData" />
                    </div>
                    <div class="col-md-4">
                        <CFormLabel>End Date</CFormLabel>
                        <CFormInput type="date" v-model="endDate" @change="fetchAnalyticsData" />
                    </div>
                    <div class="col-md-4">
                        <CFormLabel>Group By</CFormLabel>
                        <CFormSelect v-model="grouping" :options="groupingOptions" @change="fetchAnalyticsData" />
                    </div>
                </div>
            </CCardBody>
        </CCard>

        <!-- Analytics Summary -->
        <div class="row mb-4">
            <div class="col-md-3">
                <CWidgetStatsA color="primary" :value="analyticsData?.summary?.total_hours.toFixed(2) || '0.00'"
                    title="Total Hours" />
            </div>
            <div class="col-md-3">
                <CWidgetStatsA color="info" :value="analyticsData?.summary?.total_employees || '0'"
                    title="Total Employees" />
            </div>
            <div class="col-md-3">
                <CWidgetStatsA color="warning" :value="analyticsData?.summary?.total_projects || '0'"
                    title="Total Projects" />
            </div>
            <div class="col-md-3">
                <CWidgetStatsA color="success" :value="averageHoursPerEmployee.toFixed(2)" title="Avg Hours/Employee" />
            </div>
        </div>

        <!-- Timeline Chart -->
        <CCard class="mb-4">
            <CCardHeader>
                <h5>Overtime Timeline</h5>
            </CCardHeader>
            <CCardBody>
                <canvas ref="timelineChart"></canvas>
            </CCardBody>
        </CCard>

        <!-- Employee and Project Distribution -->
        <div class="row">
            <div class="col-md-6">
                <CCard>
                    <CCardHeader>
                        <h5>Employee Distribution</h5>
                    </CCardHeader>
                    <CCardBody>
                        <CTable hover>
                            <CTableHead>
                                <CTableRow>
                                    <CTableHeaderCell>Employee</CTableHeaderCell>
                                    <CTableHeaderCell>Total Hours</CTableHeaderCell>
                                    <CTableHeaderCell>% of Total</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                <CTableRow v-for="(data, employeeId) in analyticsData?.by_employee" :key="employeeId">
                                    <CTableDataCell>{{ data.name }}</CTableDataCell>
                                    <CTableDataCell>{{ data.total_hours.toFixed(2) }}</CTableDataCell>
                                    <CTableDataCell>
                                        {{ ((data.total_hours / analyticsData?.summary?.total_hours) * 100).toFixed(1)
                                        }}%
                                    </CTableDataCell>
                                </CTableRow>
                            </CTableBody>
                        </CTable>
                    </CCardBody>
                </CCard>
            </div>
            <div class="col-md-6">
                <CCard>
                    <CCardHeader>
                        <h5>Project Distribution</h5>
                    </CCardHeader>
                    <CCardBody>
                        <CTable hover>
                            <CTableHead>
                                <CTableRow>
                                    <CTableHeaderCell>Project</CTableHeaderCell>
                                    <CTableHeaderCell>Total Hours</CTableHeaderCell>
                                    <CTableHeaderCell>% of Total</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                <CTableRow v-for="(data, project) in analyticsData?.by_project" :key="project">
                                    <CTableDataCell>{{ project }}</CTableDataCell>
                                    <CTableDataCell>{{ data.total_hours.toFixed(2) }}</CTableDataCell>
                                    <CTableDataCell>
                                        {{ ((data.total_hours / analyticsData?.summary?.total_hours) * 100).toFixed(1)
                                        }}%
                                    </CTableDataCell>
                                </CTableRow>
                            </CTableBody>
                        </CTable>
                    </CCardBody>
                </CCard>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import Chart from 'chart.js/auto'

export default {
    name: 'OvertimeAnalyticsView',
    setup() {
        const store = useStore()
        const startDate = ref('')
        const endDate = ref('')
        const grouping = ref('day')
        const timelineChart = ref(null)
        let chartInstance = null

        const groupingOptions = [
            { value: 'day', text: 'Daily' },
            { value: 'week', text: 'Weekly' },
            { value: 'month', text: 'Monthly' }
        ]

        const analyticsData = computed(() => store.state.analytics)

        const averageHoursPerEmployee = computed(() => {
            if (!analyticsData.value?.summary?.total_hours || !analyticsData.value?.summary?.total_employees) {
                return 0
            }
            return analyticsData.value.summary.total_hours / analyticsData.value.summary.total_employees
        })

        const updateTimelineChart = () => {
            if (!analyticsData.value?.timeline) return

            const timelineData = analyticsData.value.timeline
            const dates = Object.keys(timelineData)
            const hours = dates.map(date => timelineData[date].total_hours)

            if (chartInstance) {
                chartInstance.destroy()
            }

            chartInstance = new Chart(timelineChart.value, {
                type: 'line',
                data: {
                    labels: dates,
                    datasets: [{
                        label: 'Total Hours',
                        data: hours,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Overtime Hours Timeline'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Hours'
                            }
                        }
                    }
                }
            })
        }

        const fetchAnalyticsData = async () => {
            if (!startDate.value || !endDate.value) return

            await store.dispatch('fetchAnalytics', {
                startDate: startDate.value,
                endDate: endDate.value,
                grouping: grouping.value
            })
            updateTimelineChart()
        }

        onMounted(() => {
            // Set default date range to current month
            const today = new Date()
            endDate.value = today.toISOString().split('T')[0]
            today.setMonth(today.getMonth() - 1)
            startDate.value = today.toISOString().split('T')[0]

            fetchAnalyticsData()
        })

        return {
            startDate,
            endDate,
            grouping,
            groupingOptions,
            timelineChart,
            analyticsData,
            averageHoursPerEmployee,
            fetchAnalyticsData
        }
    }
}
</script>