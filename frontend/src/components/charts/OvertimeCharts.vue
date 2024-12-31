<template>
    <div class="row">
        <div class="col-md-6 mb-4">
            <CCard>
                <CCardHeader>
                    <h5>Overtime by Employee</h5>
                </CCardHeader>
                <CCardBody>
                    <canvas ref="employeeChart"></canvas>
                </CCardBody>
            </CCard>
        </div>
        <div class="col-md-6 mb-4">
            <CCard>
                <CCardHeader>
                    <h5>Overtime by Project</h5>
                </CCardHeader>
                <CCardBody>
                    <canvas ref="projectChart"></canvas>
                </CCardBody>
            </CCard>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import Chart from 'chart.js/auto'

export default {
    name: 'OvertimeCharts',
    setup() {
        const store = useStore()
        const employeeChart = ref(null)
        const projectChart = ref(null)
        let employeeChartInstance = null
        let projectChartInstance = null

        const updateCharts = () => {
            const requests = store.state.overtimeRequests

            // Process data for employee chart
            const employeeData = {}
            requests.forEach(req => {
                employeeData[req.employee_name] = (employeeData[req.employee_name] || 0) + req.total_hours
            })

            // Process data for project chart
            const projectData = {}
            requests.forEach(req => {
                projectData[req.project_name] = (projectData[req.project_name] || 0) + req.total_hours
            })

            // Update employee chart
            if (employeeChartInstance) {
                employeeChartInstance.destroy()
            }
            employeeChartInstance = new Chart(employeeChart.value, {
                type: 'bar',
                data: {
                    labels: Object.keys(employeeData),
                    datasets: [{
                        label: 'Total Hours',
                        data: Object.values(employeeData),
                        backgroundColor: 'rgba(54, 162, 235, 0.5)'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            })

            // Update project chart
            if (projectChartInstance) {
                projectChartInstance.destroy()
            }
            projectChartInstance = new Chart(projectChart.value, {
                type: 'pie',
                data: {
                    labels: Object.keys(projectData),
                    datasets: [{
                        data: Object.values(projectData),
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.5)',
                            'rgba(54, 162, 235, 0.5)',
                            'rgba(255, 206, 86, 0.5)',
                            'rgba(75, 192, 192, 0.5)',
                            'rgba(153, 102, 255, 0.5)'
                        ]
                    }]
                }
            })
        }

        watch(() => store.state.overtimeRequests, updateCharts)

        onMounted(() => {
            store.dispatch('fetchOvertimeRequests').then(updateCharts)
        })

        return {
            employeeChart,
            projectChart
        }
    }
}
</script>