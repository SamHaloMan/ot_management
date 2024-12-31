<template>
    <div class="dashboard">
        <CCard class="mb-4">
            <CCardBody>
                <CRow>
                    <CCol :md="6">
                        <h4>Overtime by Employee</h4>
                        <EmployeeOvertimeChart :chartData="employeeChartData" />
                    </CCol>
                    <CCol :md="6">
                        <h4>Overtime by Project</h4>
                        <ProjectOvertimeChart :chartData="projectChartData" />
                    </CCol>
                </CRow>
            </CCardBody>
        </CCard>
    </div>
</template>

<script>
import { CCard, CCardBody, CRow, CCol } from '@coreui/vue'
import EmployeeOvertimeChart from '@/components/charts/EmployeeOvertimeChart.vue'
import ProjectOvertimeChart from '@/components/charts/ProjectOvertimeChart.vue'

export default {
    name: 'Dashboard',
    components: {
        CCard,
        CCardBody,
        CRow,
        CCol,
        EmployeeOvertimeChart,
        ProjectOvertimeChart
    },
    computed: {
        employeeChartData() {
            // Transform analytics data for employee chart
            if (!this.$store.state.analytics) return null
            return {
                // Transform data for chart library
            }
        },
        projectChartData() {
            // Transform analytics data for project chart
            if (!this.$store.state.analytics) return null
            return {
                // Transform data for chart library
            }
        }
    },
    async created() {
        const today = new Date()
        const startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        await this.$store.dispatch('fetchAnalytics', {
            startDate: startDate.toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0]
        })
    }
}
</script>