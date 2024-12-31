<template>
    <div class="overtime-form">
        <!-- Summary Cards -->
        <CRow>
            <CCol :sm="4">
                <CCard class="mb-4">
                    <CCardBody>
                        <div class="fs-4 fw-semibold">Overtime Limit/week</div>
                        <div class="fs-2">{{ weeklyLimit.toFixed(2) }} Hours</div>
                    </CCardBody>
                </CCard>
            </CCol>
            <CCol :sm="4">
                <CCard class="mb-4">
                    <CCardBody>
                        <div class="fs-4 fw-semibold">Total Overtime Applied</div>
                        <div class="fs-2">{{ appliedOvertime.toFixed(2) }} Hours</div>
                    </CCardBody>
                </CCard>
            </CCol>
            <CCol :sm="4">
                <CCard class="mb-4">
                    <CCardBody>
                        <div class="fs-4 fw-semibold">Remaining Applicable Overtime</div>
                        <div class="fs-2">{{ remainingOvertime.toFixed(2) }} Hours</div>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>

        <!-- Tabs -->
        <CTabs>
            <CTabPane active>
                <template #title>
                    <CIcon name="cil-clipboard" /> Overtime Form
                </template>
                <CCard>
                    <CCardBody>
                        <CForm @submit.prevent="submitForm">
                            <CRow>
                                <CCol :md="6">
                                    <CFormSelect label="Employee Name" v-model="form.employee_name"
                                        :options="employeeOptions" @update:modelValue="updateWorkId" required />
                                </CCol>
                                <CCol :md="6">
                                    <CFormInput label="Work ID" v-model="form.work_id" readonly required />
                                </CCol>
                            </CRow>

                            <CRow class="mt-3">
                                <CCol :md="6">
                                    <CFormSelect label="Project Name" v-model="form.project_name"
                                        :options="projectOptions" required />
                                </CCol>
                                <CCol :md="6">
                                    <CFormInput label="Overtime Date" type="date" v-model="form.overtime_date"
                                        :max="today" required />
                                </CCol>
                            </CRow>

                            <CRow class="mt-3">
                                <CCol :md="5">
                                    <CFormInput label="Time Start" type="time" v-model="form.time_start" required />
                                </CCol>
                                <CCol :md="2" class="d-flex align-items-center justify-content-center">
                                    <div class="mt-4">
                                        {{ calculatedHours }} hours
                                    </div>
                                </CCol>
                                <CCol :md="5">
                                    <CFormInput label="Time End" type="time" v-model="form.time_end" required />
                                </CCol>
                            </CRow>

                            <CRow class="mt-3">
                                <CCol :md="5">
                                    <CFormInput label="Break Start" type="time" v-model="form.break_start" />
                                </CCol>
                                <CCol :md="2" class="d-flex align-items-center justify-content-center">
                                    <div class="mt-4">
                                        {{ breakHours }} hours
                                    </div>
                                </CCol>
                                <CCol :md="5">
                                    <CFormInput label="Break End" type="time" v-model="form.break_end" />
                                </CCol>
                            </CRow>

                            <CRow class="mt-3">
                                <CCol :md="12">
                                    <CFormInput label="Overtime Title" v-model="form.overtime_title" required />
                                </CCol>
                            </CRow>

                            <CRow class="mt-3">
                                <CCol :md="12">
                                    <CFormTextarea label="Overtime Reason" v-model="form.overtime_reason" rows="3"
                                        required />
                                </CCol>
                            </CRow>

                            <CRow class="mt-4">
                                <CCol>
                                    <CButton type="submit" color="primary">
                                        Submit Overtime Request
                                    </CButton>
                                </CCol>
                            </CRow>
                        </CForm>
                    </CCardBody>
                </CCard>
            </CTabPane>

            <CTabPane>
                <template #title>
                    <CIcon name="cil-history" /> History
                </template>
                <OvertimeHistory />
            </CTabPane>
        </CTabs>
    </div>
</template>
  
  <script>
import {
    CCard, CCardBody, CRow, CCol, CForm, CFormInput,
    CFormSelect, CFormTextarea, CButton, CTabs, CTabPane
} from '@coreui/vue'
import CIcon from '@coreui/icons-vue'
import OvertimeHistory from '@/components/OvertimeHistory.vue'

export default {
    name: 'OvertimeForm',
    components: {
        CCard,
        CCardBody,
        CRow,
        CCol,
        CForm,
        CFormInput,
        CFormSelect,
        CFormTextarea,
        CButton,
        CTabs,
        CTabPane,
        CIcon,
        OvertimeHistory
    },
    data() {
        return {
            form: {
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
            }
        }
    },
    computed: {
        today() {
            return new Date().toISOString().split('T')[0]
        },
        weeklyLimit() {
            return this.$store.state.weeklyLimit
        },
        appliedOvertime() {
            return this.$store.getters.employeeOvertimeHours(this.form.work_id) || 0
        },
        remainingOvertime() {
            return this.weeklyLimit - this.appliedOvertime
        },
        employeeOptions() {
            return this.$store.state.employees.map(emp => ({
                value: emp.name,
                text: emp.name
            }))
        },
        projectOptions() {
            return this.$store.state.projects.map(proj => ({
                value: proj.name,
                text: proj.name
            }))
        },
        calculatedHours() {
            if (!this.form.time_start || !this.form.time_end) return 0
            const start = new Date(`2000-01-01T${this.form.time_start}`)
            const end = new Date(`2000-01-01T${this.form.time_end}`)
            const diff = (end - start) / (1000 * 60 * 60)
            return (diff - this.breakHours).toFixed(2)
        },
        breakHours() {
            if (!this.form.break_start || !this.form.break_end) return 0
            const start = new Date(`2000-01-01T${this.form.break_start}`)
            const end = new Date(`2000-01-01T${this.form.break_end}`)
            return ((end - start) / (1000 * 60 * 60)).toFixed(2)
        }
    },
    methods: {
        updateWorkId(employeeName) {
            const employee = this.$store.state.employees.find(emp => emp.name === employeeName)
            this.form.work_id = employee ? employee.work_id : ''
        },
        async submitForm() {
            try {
                await this.$store.dispatch('submitOvertimeRequest', this.form)
                this.$toast.success('Overtime request submitted successfully')
                this.resetForm()
            } catch (error) {
                this.$toast.error('Error submitting overtime request')
            }
        },
        resetForm() {
            this.form = {
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
            }
        }
    },
    async created() {
        await Promise.all([
            this.$store.dispatch('fetchEmployees'),
            this.$store.dispatch('fetchProjects'),])}
}