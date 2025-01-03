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
        <CCard class="mb-4">
            <CCardBody>
                <CForm @submit.prevent="handleSubmit">
                    <CAlert v-if="submitSuccess" color="success" dismissible>
                        <center><strong>Overtime Data Submitted Successfully!</strong></center>
                    </CAlert>
                    <CAlert v-if="submitError" color="danger" dismissible>
                        {{ submitError }}
                    </CAlert>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <CFormLabel>Employee Name*</CFormLabel>
                            <CFormSelect v-if="employeeOptions.length" v-model="form.employee_name"
                                :state="form.employee_name !== '--SELECT OPTIONS--'" :options="employeeOptions"
                                @change="handleEmployeeChange" required />
                            <div v-if="form.employee_name === '--SELECT OPTIONS--'" class="invalid-feedback">
                                <center><strong>Please Select an Employee</strong></center>
                            </div>
                        </div>

                        <div class="col-md-6 mb-3">
                            <CFormLabel>Work ID</CFormLabel>
                            <CFormInput v-model="form.work_id" readonly disabled />
                        </div>

                        <div class="col-md-6 mb-3">
                            <CFormLabel>Project Name*</CFormLabel>
                            <CFormSelect v-if="projectOptions.length" v-model="form.project_name"
                                :state="form.project_name !== '--SELECT OPTIONS--'" :options="projectOptions"
                                required />
                            <div v-if="form.project_name === '--SELECT OPTIONS--'" class="invalid-feedback">
                                <center><strong>Please Select a Project</strong></center>
                            </div>
                        </div>

                        <div class="col-md-6 mb-3">
                            <CFormLabel>Overtime Date*</CFormLabel>
                            <CFormInput type="date" v-model="form.overtime_date" required />
                        </div>

                        <div class="col-md-12 mb-3">
                            <div class="row align-items-center">
                                <div class="col-md-5">
                                    <CFormLabel>Time Start*</CFormLabel>
                                    <CFormInput type="time" v-model="form.time_start" required
                                        @change="calculateTotalHours" />
                                </div>
                                <div class="col-md-2 text-center">
                                    <div>Total:</div>
                                    <strong>{{ totalHours.toFixed(2) }} hour(s)</strong>
                                </div>
                                <div class="col-md-5">
                                    <CFormLabel>Time End*</CFormLabel>
                                    <CFormInput type="time" v-model="form.time_end" required
                                        @change="calculateTotalHours" />
                                </div>
                            </div>
                        </div>

                        <div class="col-md-12 mb-3">
                            <CFormCheck id="takeBreak" v-model="form.take_break" label="Take Break?"
                                @change="handleBreakToggle" />
                        </div>

                        <div v-if="form.take_break" class="col-md-12 mb-3">
                            <div class="row align-items-center">
                                <div class="col-md-5">
                                    <CFormLabel>Break Start*</CFormLabel>
                                    <CFormInput type="time" v-model="form.break_start" required
                                        @change="calculateTotalBreakTime" />
                                </div>
                                <div class="col-md-2 text-center">
                                    <div class="mt-4">
                                        <strong>{{ totalBreakHours.toFixed(2) }} hour(s)</strong>
                                    </div>
                                </div>
                                <div class="col-md-5">
                                    <CFormLabel>Break End*</CFormLabel>
                                    <CFormInput type="time" v-model="form.break_end" required
                                        @change="calculateTotalBreakTime" />
                                </div>
                            </div>
                        </div>

                        <div class="col-md-12 mb-3">
                            <CFormLabel>Overtime Title*</CFormLabel>
                            <CFormInput v-model="form.overtime_title" required />
                        </div>

                        <div class="col-md-12 mb-3">
                            <CFormLabel>Overtime Reason*</CFormLabel>
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
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';

export default {
    name: 'OvertimeForm',
    setup() {
        const store = useStore();
        const DEFAULT_SELECT = '--SELECT OPTIONS--';
        const DEFAULT_WORKID = 'MW-------';
        const submitSuccess = ref(false);

        // Default form values
        const getDefaultForm = () => ({
            employee_name: DEFAULT_SELECT,
            work_id: DEFAULT_WORKID,
            project_name: DEFAULT_SELECT,
            overtime_date: new Date().toISOString().split('T')[0],
            time_start: '17:20',
            time_end: '',
            break_start: '12:00',
            break_end: '13:00',
            overtime_title: '',
            overtime_reason: '',
            take_break: false,
            total_hours: 0,
        });

        const form = ref(getDefaultForm());
        const totalHours = ref(0);
        const totalBreakHours = ref(0);
        const submitError = ref('');

        // Dropdown options
        const employeeOptions = computed(() => {
            const options = store.getters['employees/employeeOptions'].map(option => ({
                label: option.text,
                value: option.value
            }));
            console.log('Generated employee options:', options);
            return options;
        });

        const projectOptions = computed(() => {
            const options = store.getters['projects/projectOptions'].map(option => ({
                label: option.text,
                value: option.value
            }));
            console.log('Generated project options:', options);
            return options;
        });

        // Computed values
        const appliedMonthly = computed(() => store.state.overtime.monthlyHours);
        const appliedWeekly = computed(() => store.state.overtime.weeklyHours);
        const remainingWeekly = computed(() => Math.max(0, 18 - appliedWeekly.value));
        const remainingMonthly = computed(() => Math.max(0, 72 - appliedMonthly.value));

        // Auto-fill work ID when employee name changes
        const handleEmployeeChange = () => {
            console.log('Selected employee:', form.value.employee_name)
            if (form.value.employee_name === '--SELECT OPTIONS--') {
                form.value.work_id = ''
                return
            }

            const selectedEmployee = store.state.employees.employees.find(
                (emp) => emp.name === form.value.employee_name
            )
            console.log('Found employee:', selectedEmployee) // Debug log
            form.value.work_id = selectedEmployee ? selectedEmployee.work_id : ''
        }

        const handleBreakToggle = () => {
            if (!form.value.take_break) {
                form.value.break_start = ''
                form.value.break_end = ''
            } else {
                form.value.break_start = '18:30'
                form.value.break_end = '19:00'
            }
            calculateTotalHours()
            calculateTotalBreakTime()
        }

        const validateForm = () => {
            if (form.value.employee_name === DEFAULT_SELECT) return 'Please select an employee';
            if (form.value.project_name === DEFAULT_SELECT) return 'Please select a project';
            if (!form.value.overtime_date) return 'Overtime date is required';
            if (!form.value.time_start || !form.value.time_end) return 'Time start and end are required';
            if (totalHours.value <= 0) return 'Invalid time range';
            if (form.value.take_break && (!form.value.break_start || !form.value.break_end)) {
                return 'Both break start and end times are required when taking a break';
            }
            if (!form.value.overtime_title.trim()) return 'Overtime title is required';
            if (!form.value.overtime_reason.trim()) return 'Overtime reason is required';
            return '';
        };

        const calculateTotalBreakTime = () => {
            if (!form.value.break_start || !form.value.break_end) {
                totalBreakHours.value = 0
                return
            }

            const breakStart = new Date(`2000-01-01T${form.value.break_start}`)
            const breakEnd = new Date(`2000-01-01T${form.value.break_end}`)
            const diff = (breakEnd - breakStart) / (1000 * 60 * 60)

            totalBreakHours.value = Math.max(0, diff)
        }

        const calculateTotalHours = () => {
            if (!form.value.time_start || !form.value.time_end) return

            const start = new Date(`2000-01-01T${form.value.time_start}`)
            const end = new Date(`2000-01-01T${form.value.time_end}`)
            let diff = (end - start) / (1000 * 60 * 60)

            if (form.value.take_break && form.value.break_start && form.value.break_end) {
                const breakStart = new Date(`2000-01-01T${form.value.break_start}`)
                const breakEnd = new Date(`2000-01-01T${form.value.break_end}`)
                const breakTime = (breakEnd - breakStart) / (1000 * 60 * 60)
                diff -= breakTime
            }

            totalHours.value = Math.max(0, diff)
        }

        const resetForm = () => {
            const currentEmployee = form.value.employee_name;
            const currentDate = form.value.overtime_date;
            form.value = getDefaultForm();
            form.value.employee_name = currentEmployee;
            form.value.overtime_date = currentDate;

            // Re-fetch last submitted data
            const lastData = store.getters['overtime/getLastSubmittedData'](
                currentEmployee,
                currentDate
            );
            if (lastData) {
                updateFormWithLastData(lastData);
            }
        };

        const updateFormWithLastData = (lastData) => {
            form.value = {
                ...getDefaultForm(),
                ...lastData,
                employee_name: lastData.employee_name,
                project_name: lastData.project_name,
                time_start: lastData.time_start || '17:20',
                time_end: lastData.time_end || '20:20',
                break_start: lastData.break_start || '18:30',
                break_end: lastData.break_end || '19:00',
                take_break: !!lastData.break_start,
                overtime_date: lastData.overtime_date || new Date().toISOString().split('T')[0],
            };
            calculateTotalHours();
            calculateTotalBreakTime();
        };

        const handleSubmit = async () => {
            submitError.value = '';
            submitSuccess.value = false;
            const error = validateForm();
            if (error) {
                submitError.value = error;
                return;
            }

            try {
                const requestData = {
                    ...form.value,
                    break_start: form.value.take_break ? form.value.break_start : null,
                    break_end: form.value.take_break ? form.value.break_end : null,
                    total_hours: totalHours.value
                };

                await store.dispatch('overtime/submitRequest', requestData);
                await store.dispatch('overtime/fetchRequests');
                submitSuccess.value = true;

                // Don't reset form completely, just refresh the data
                const lastData = store.getters['overtime/getLastSubmittedData'](
                    form.value.employee_name,
                    form.value.overtime_date
                );
                if (lastData) {
                    updateFormWithLastData(lastData);
                }
            } catch (error) {
                submitError.value = error.message || 'Error submitting request';
            }
        };

        // onMounted(async () => {
        //     await store.dispatch('employees/fetchEmployees');
        //     await store.dispatch('projects/fetchProjects');
        //     await store.dispatch('overtime/fetchRequests');
        //     calculateTotalHours();
        //     calculateTotalBreakTime();
        // });

        onMounted(async () => {
            try {
                await Promise.all([
                    store.dispatch('employees/fetchEmployees'),
                    store.dispatch('projects/fetchProjects'),
                    store.dispatch('overtime/fetchRequests')
                ]);
                calculateTotalHours();
                calculateTotalBreakTime();
            } catch (error) {
                console.error('Error loading initial data:', error);
                submitError.value = 'Failed to load dropdown options';
            }
        });

        watch([
            () => form.value.employee_name,
            () => form.value.overtime_date
        ], async ([newEmployee, newDate]) => {
            if (newEmployee === DEFAULT_SELECT) {
                resetForm();
                return;
            }

            const lastData = store.getters['overtime/getLastSubmittedData'](
                newEmployee,
                newDate
            );

            if (lastData) {
                updateFormWithLastData(lastData);
            } else {
                // Reset to defaults while keeping employee and date
                const currentEmployee = form.value.employee_name;
                const currentDate = form.value.overtime_date;
                form.value = getDefaultForm();
                form.value.employee_name = currentEmployee;
                form.value.overtime_date = currentDate;
                handleEmployeeChange();
            }
        });

        return {
            form,
            appliedMonthly,
            appliedWeekly,
            employeeOptions,
            calculateTotalHours,
            calculateTotalBreakTime,
            handleBreakToggle,
            handleEmployeeChange,
            handleSubmit,
            projectOptions,
            remainingWeekly,
            remainingMonthly,
            resetForm,
            submitError,
            submitSuccess,
            totalHours,
            totalBreakHours,
        }
    }
}
</script>


<style scoped>
.form-group {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1rem;
}

.form-group>* {
    flex: 1 1 calc(50% - 1rem);
}

@media (max-width: 768px) {
    .form-group>* {
        flex: 1 1 100%;
    }
}
</style>