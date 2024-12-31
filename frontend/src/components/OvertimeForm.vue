<template>
    <div class="overtime-form">
        <!-- Summary Cards -->
        <div class="row mb-4">
            <div class="col-md-4">
                <CCard>
                    <CCardBody>
                        <h6>Overtime Limit (Monthly)</h6>
                        <div>Applied / Limit</div>
                        <div class="h4">{{ appliedMonthly.toFixed(2) }} / 72.00 Hours</div>
                    </CCardBody>
                </CCard>
            </div>
            <div class="col-md-4">
                <CCard>
                    <CCardBody>
                        <h6>Applied Overtime (Weekly)</h6>
                        <div>Current / Limit</div>
                        <div class="h4">{{ appliedWeekly.toFixed(2) }} / 18.00 Hours</div>
                    </CCardBody>
                </CCard>
            </div>
            <div class="col-md-4">
                <CCard>
                    <CCardBody>
                        <h6>Remaining Applicable Overtime</h6>
                        <div>Weekly / Monthly</div>
                        <div class="h4">
                            {{ (18 - appliedWeekly).toFixed(2) }} / {{ (72 - appliedMonthly).toFixed(2) }} Hours
                        </div>
                    </CCardBody>
                </CCard>
            </div>
        </div>

        <!-- Form -->
        <CCard>
            <CCardBody>
                <CForm @submit.prevent="handleSubmit">
                    <div class="row">
                        <!-- Employee Selection -->
                        <div class="col-md-6 mb-3">
                            <CFormLabel>Employee Name *</CFormLabel>
                            <CFormSelect v-model="form.employee_name" :options="employeeOptions"
                                @change="handleEmployeeChange" required />
                        </div>

                        <!-- Work ID -->
                        <div class="col-md-6 mb-3">
                            <CFormLabel>Work ID</CFormLabel>
                            <CFormInput v-model="form.work_id" readonly disabled />
                        </div>

                        <!-- Project Selection -->
                        <div class="col-md-6 mb-3">
                            <CFormLabel>Project Name *</CFormLabel>
                            <CFormSelect v-model="form.project_name" :options="projectOptions" required />
                        </div>

                        <!-- Overtime Date -->
                        <div class="col-md-6 mb-3">
                            <CFormLabel>Overtime Date *</CFormLabel>
                            <CFormInput type="date" v-model="form.overtime_date" required />
                        </div>

                        <!-- Time Start and End -->
                        <div class="col-md-12 mb-3">
                            <div class="row align-items-center">
                                <div class="col-md-5">
                                    <CFormLabel>Time Start *</CFormLabel>
                                    <CFormInput type="time" v-model="form.time_start" required
                                        @change="calculateTotalHours" />
                                </div>
                                <div class="col-md-2 text-center">
                                    <div class="mt-4">
                                        Total: {{ totalHours.toFixed(2) }} hrs
                                    </div>
                                </div>
                                <div class="col-md-5">
                                    <CFormLabel>Time End *</CFormLabel>
                                    <CFormInput type="time" v-model="form.time_end" required
                                        @change="calculateTotalHours" />
                                </div>
                            </div>
                        </div>

                        <!-- Break Start and End -->
                        <div class="col-md-12 mb-3">
                            <div class="row align-items-center">
                                <div class="col-md-5">
                                    <CFormLabel>Break Start</CFormLabel>
                                    <CFormInput type="time" v-model="form.break_start" @change="calculateTotalHours" />
                                </div>
                                <div class="col-md-2"></div>
                                <div class="col-md-5">
                                    <CFormLabel>Break End</CFormLabel>
                                    <CFormInput type="time" v-model="form.break_end" @change="calculateTotalHours" />
                                </div>
                            </div>
                        </div>

                        <!-- Title and Reason -->
                        <div class="col-md-12 mb-3">
                            <CFormLabel>Overtime Title *</CFormLabel>
                            <CFormInput v-model="form.overtime_title" required />
                        </div>

                        <div class="col-md-12 mb-3">
                            <CFormLabel>Overtime Reason *</CFormLabel>
                            <CFormTextarea v-model="form.overtime_reason" rows="3" required />
                        </div>
                    </div>

                    <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                        <CButton type="submit" color="primary">
                            Submit Request
                        </CButton>
                    </div>
                </CForm>
            </CCardBody>
        </CCard>
    </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
    name: 'OvertimeForm',
    setup() {
        const store = useStore()
        const form = ref({
            employee_name: '',
            work_id: '',
            project_name: '',
            overtime_date: '',
            time_start: '',
            time_end: '',
            break_start: '',
            break_end: '',
            overtime_title: '',
            overtime_reason: ''
        })
        const totalHours = ref(0)

        const employeeOptions = computed(() => {
            return store.state.employees.map(emp => ({
                value: emp.name,
                text: emp.name
            }))
        })

        const projectOptions = computed(() => {
            return store.state.projects.map(proj => ({
                value: proj.name,
                text: proj.name
            }))
        })

        const appliedMonthly = computed(() => {
            const now = new Date()
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
            return store.state.overtimeRequests
                .filter(req => new Date(req.overtime_date) >= monthStart)
                .reduce((sum, req) => sum + req.total_hours, 0)
        })

        const appliedWeekly = computed(() => {
            const now = new Date()
            const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
            return store.state.overtimeRequests
                .filter(req => new Date(req.overtime_date) >= weekStart)
                .reduce((sum, req) => sum + req.total_hours, 0)
        })

        const handleEmployeeChange = () => {
            const employee = store.state.employees.find(emp => emp.name === form.value.employee_name)
            if (employee) {
                form.value.work_id = employee.work_id
            }
        }

        const calculateTotalHours = () => {
            if (!form.value.time_start || !form.value.time_end) return

            const start = new Date(`2000-01-01T${form.value.time_start}`)
            const end = new Date(`2000-01-01T${form.value.time_end}`)
            let diff = (end - start) / (1000 * 60 * 60)

            if (form.value.break_start && form.value.break_end) {
                const breakStart = new Date(`2000-01-01T${form.value.break_start}`)
                const breakEnd = new Date(`2000-01-01T${form.value.break_end}`)
                const breakTime = (breakEnd - breakStart) / (1000 * 60 * 60)
                diff -= breakTime
            }

            totalHours.value = Math.max(0, diff)
        }

        const handleSubmit = async () => {
            try {
                await store.dispatch('submitOvertimeRequest', {
                    ...form.value,
                    total_hours: totalHours.value
                })
                // Reset form after successful submission
                Object.keys(form.value).forEach(key => form.value[key] = '')
                totalHours.value = 0
            } catch (error) {
                console.error('Error submitting overtime request:', error)
            }
        }

        onMounted(async () => {
            await Promise.all([
                store.dispatch('fetchEmployees'),
                store.dispatch('fetchProjects'),
                store.dispatch('fetchOvertimeRequests')
            ])
        })

        return {
            form,
            totalHours,
            employeeOptions,
            projectOptions,
            appliedMonthly,
            appliedWeekly,
            handleEmployeeChange,
            calculateTotalHours,
            handleSubmit
        }
    }
}
</script>