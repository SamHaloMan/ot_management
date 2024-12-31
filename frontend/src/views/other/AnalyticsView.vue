<template>
    <div class="analytics">
        <CCard class="mb-4">
            <CCardHeader>
                <strong>Overtime Analytics</strong>
            </CCardHeader>
            <CCardBody>
                <CRow>
                    <CCol :md="6" class="mb-3">
                        <CFormInput type="date" label="Start Date" v-model="startDate" />
                    </CCol>
                    <CCol :md="6" class="mb-3">
                        <CFormInput type="date" label="End Date" v-model="endDate" />
                    </CCol>
                </CRow>
                <CRow class="mb-3">
                    <CCol :md="6">
                        <CFormSelect label="Group By" v-model="grouping" :options="groupingOptions" />
                    </CCol>
                    <CCol :md="6" class="d-flex align-items-end">
                        <CButton color="primary" @click="fetchAnalyticsData">
                            Update Analytics
                        </CButton>
                    </CCol>
                </CRow>

                <CRow v-if="analytics">
                    <CCol :lg="6" class="mb-4">
                        <CCard>
                            <CCardHeader>Employee Overtime Distribution</CCardHeader>
                            <CCardBody>
                                <EmployeeDistributionChart :data="employeeChartData" />
                            </CCardBody>
                        </CCard>
                    </CCol>

                    <CCol :lg="6" class="mb-4">
                        <CCard>
                            <CCardHeader>Project Overtime Distribution</CCardHeader>
                            <CCardBody>
                                <ProjectDistributionChart :data="projectChartData" />
                            </CCardBody>
                        </CCard>
                    </CCol>

                    <CCol :lg="12">
                        <CCard>
                            <CCardHeader>Timeline Analysis</CCardHeader>
                            <CCardBody>
                                <TimelineChart :data="timelineChartData" />
                            </CCardBody>
                        </CCard>
                    </CCol>

                    <CCol :lg="12" class="mt-4">
                        <CCard>
                            <CCardHeader>Summary Statistics</CCardHeader>
                            <CCardBody>
                                <CRow>
                                    <CCol :sm="3">
                                        <div class="summary-stat">
                                            <div class="stat-label">Total Hours</div>
                                            <div class="stat-value">{{ analytics.summary.total_hours.toFixed(2) }}</div>
                                        </div>
                                    </CCol>
                                    <CCol :sm="3">
                                        <div class="summary-stat">
                                            <div class="stat-label">Total Employees</div>
                                            <div class="stat-value">{{ analytics.summary.total_employees }}</div>
                                        </div>
                                    </CCol>
                                    <CCol :sm="3">
                                        <div class="summary-stat">
                                            <div class="stat-label">Total Projects</div>
                                            <div class="stat-value">{{ analytics.summary.total_projects }}</div>
                                        </div>
                                    </CCol>
                                    <CCol :sm="3">
                                        <div class="summary-stat">
                                            <div class="stat-label">Avg Hours/Employee</div>
                                            <div class="stat-value">
                                                {{ (analytics.summary.total_hours /
                                                analytics.summary.total_employees).toFixed(2) }}
                                            </div>
                                        </div>
                                    </CCol>
                                </CRow>
                            </CCardBody>
                        </CCard>
                    </CCol>
                </CRow>
            </CCardBody>
        </CCard>
    </div>
</template>

<script>
import {
    CCard, CCardHeader, CCardBody, CRow, CCol,
    CFormInput, CFormSelect, CButton
} from '@coreui/vue'
import EmployeeDistributionChart from '@/components/charts/EmployeeDistributionChart.vue'
import ProjectDistributionChart from '@/components/charts/ProjectDistributionChart.vue'
import TimelineChart from '@/components/charts/TimelineChart.vue'

export default {
    name: 'Analytics',
    components: {
        CCard,
        CCardHeader,
        CCardBody,
        CRow,
        CCol,
        CFormInput,
        CFormSelect,
        CButton,
        EmployeeDistributionChart,
        ProjectDistributionChart,
        TimelineChart
    },
    data() {
        return {
            startDate: '',
            endDate: '',
            grouping: 'day',
            groupingOptions: [
                { value: 'day', text: 'Daily' },
                { value: 'week', text: 'Weekly' },
                { value: 'month', text: 'Monthly' },
                { value: 'year', text: 'Yearly' }
            ]
        }
    },
    computed: {
        analytics() {
            return this.$store.state.analytics
        },
        employeeChartData() {
            if (!this.analytics) return null
            // Transform analytics.by_employee data for chart
            return {
                // Chart data transformation logic
            }
        },
        projectChartData() {
            if (!this.analytics) return null
            // Transform analytics.by_project data for chart
            return {
                // Chart data transformation logic
            }
        },
        timelineChartData() {
            if (!this.analytics) return null
            // Transform analytics.timeline data for chart
            return {
                // Chart data transformation logic
            }
        }
    },
    methods: {
        async fetchAnalyticsData() {
            if (!this.startDate || !this.endDate) return

            await this.$store.dispatch('fetchAnalytics', {
                startDate: this.startDate,
                endDate: this.endDate,
                grouping: this.grouping
            })
        }
    },
    created() {
        // Set default date range to current month
        const today = new Date()
        this.endDate = today.toISOString().split('T')[0]
        this.startDate = new Date(today.getFullYear(), today.getMonth(), 1)
            .toISOString().split('T')[0]

        this.fetchAnalyticsData()
    }
}
</script>

<style scoped>
.summary-stat {
    text-align: center;
    padding: 1rem;
}

.stat-label {
    font-size: 0.875rem;
    color: #6c757d;
    margin-bottom: 0.5rem;
}

.stat-value {
    font-size: 1.5rem;
    font-weight: bold;
}
</style>