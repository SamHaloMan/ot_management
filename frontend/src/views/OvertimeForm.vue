<template>
    <div class="overtime-form">
        <SummaryCards :applied-monthly="overtimeStats.monthlyHours" :applied-weekly="overtimeStats.weeklyHours"
            :employee-name="form.employee_name" />

        <CCard class="mb-4">
            <CCardBody>
                <div v-if="isLoading" class="text-center my-3">
                    <CSpinner />
                    <div>Loading overtime data...</div>
                </div>
                <CForm @submit.prevent="handleSubmit">
                    <CAlert v-if="submitSuccess" color="success" dismissible>
                        <strong class="text-center my-3">Overtime Data Submitted Successfully!</strong>
                    </CAlert>
                    <CAlert v-if="submitError" color="danger" dismissible>
                        <div class="text-center my-3">{{ submitError }}</div>
                    </CAlert>

                    <EmployeeSection v-model:employeeName="form.employee_name" :workId="form.work_id"
                        :employeeOptions="employeeOptions" :DEFAULT_SELECT="DEFAULT_SELECT"
                        @employeeChanged="handleEmployeeChange" />

                    <ProjectSection v-model:projectName="form.project_name" v-model:overtimeDate="form.overtime_date"
                        :projectOptions="projectOptions" :DEFAULT_SELECT="DEFAULT_SELECT" />

                    <TimeSection v-model:timeStart="form.time_start" v-model:timeEnd="form.time_end"
                        :totalHours="totalHours" @calculate="calculateTotalHours" />

                    <BreakSection v-model:takeBreak="form.take_break" v-model:breakStart="form.break_start"
                        v-model:breakEnd="form.break_end" :totalBreakHours="totalBreakHours"
                        @calculate="calculateTotalBreakTime" />


                    <ReasonSection v-model:overtimeTitle="form.overtime_title"
                        v-model:overtimeReason="form.overtime_reason" />

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


<script setup>
import { watch, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { useOvertimeValidation } from '@/composables/useOvertimeValidation'
import { useOvertimeForm } from '@/composables/useOvertimeForm'
import { useTimeCalculation } from '@/composables/useTimeCalculation'
import BreakSection from '@/components/overtime/BreakSection.vue'
import EmployeeSection from '@/components/overtime/EmployeeSection.vue'
import TimeSection from '@/components/overtime/TimeSection.vue'
import ProjectSection from '@/components/overtime/ProjectSection.vue'
import ReasonSection from '@/components/overtime/ReasonSection.vue'
import SummaryCards from '@/components/overtime/SummaryCards.vue'

const store = useStore()

const {
    form,
    isLoading,
    submitSuccess,
    submitError,
    employeeOptions,
    projectOptions,
    DEFAULT_SELECT,
    getDefaultForm,
    updateWorkId,
    loadHistoricalData,
    populateFormWithHistoricalData
} = useOvertimeForm()

const { totalHours, totalBreakHours, calculateTotalHours, calculateTotalBreakTime } = useTimeCalculation()
const { validateForm } = useOvertimeValidation(form, DEFAULT_SELECT)

const overtimeStats = computed(() => {
    if (form.value.employee_name === DEFAULT_SELECT) {
        return { monthlyHours: 0, weeklyHours: 0 }
    }
    const selectedEmployee = employeeOptions.value.find(
        emp => emp.value === form.value.employee_name
    )
    return store.getters['overtime/getEmployeeOvertimeStats'](selectedEmployee?.workId)
})

const handleTimeCalculations = () => {
    if (form.value) {
        calculateTotalHours(form.value)
        if (form.value.take_break) {
            calculateTotalBreakTime(form.value)
        }
    }
}

const handleEmployeeChange = async () => {
    updateWorkId(form.value.employee_name)
    await handleDateOrEmployeeChange()
}

const handleDateOrEmployeeChange = async () => {
    if (form.value.employee_name === DEFAULT_SELECT || !form.value.overtime_date) return

    try {
        // Reset form while keeping employee and date
        const currentEmployee = form.value.employee_name
        const currentDate = form.value.overtime_date

        form.value = {
            ...getDefaultForm(),
            employee_name: currentEmployee,
            overtime_date: currentDate
        }

        updateWorkId(currentEmployee)

        const historicalData = await loadHistoricalData(currentEmployee, currentDate)
        if (historicalData) {
            populateFormWithHistoricalData(historicalData)
        }

        handleTimeCalculations()
    } catch (error) {
        console.error('Error loading historical data:', error)
        submitError.value = 'Failed to load historical data'
    }
}

const updateFormWithHistoricalData = (data) => {
    form.value = {
        ...form.value,
        project_name: data.project_name,
        time_start: data.time_start,
        time_end: data.time_end,
        break_start: data.break_start,
        break_end: data.break_end,
        overtime_title: data.overtime_title,
        overtime_reason: data.overtime_reason,
        take_break: !!(data.break_start && data.break_end)
    }
}

const handleSubmit = async () => {
    submitError.value = ''
    submitSuccess.value = false

    const error = validateForm()
    if (error) {
        submitError.value = error
        return
    }

    try {
        const requestData = {
            ...form.value,
            break_start: form.value.take_break ? form.value.break_start : null,
            break_end: form.value.take_break ? form.value.break_end : null,
            take_break: form.value.take_break || false,
            total_hours: totalHours.value,
            total_break_hours: form.value.take_break ? totalBreakHours.value : 0
        }

        // Clean up break times if not taking break
        if (!requestData.take_break) {
            delete requestData.break_start
            delete requestData.break_end
        }

        await store.dispatch('overtime/submitRequest', requestData)
        await store.dispatch('overtime/fetchRequests')
        submitSuccess.value = true

        const lastData = store.getters['overtime/getLastSubmittedData'](
            form.value.employee_name,
            form.value.overtime_date
        )
        if (lastData) {
            updateFormWithHistoricalData(lastData)
        }
    } catch (error) {
        console.error('Submit error:', error)
        submitError.value = error.message || 'Error submitting request'
    }
}

const persistFormData = () => {
    localStorage.setItem('overtimeFormData', JSON.stringify(form.value))
}

// Watchers
watch(
    [() => form.value.employee_name, () => form.value.overtime_date],
    async ([newEmployee, newDate], [oldEmployee, oldDate]) => {
        if (newEmployee !== oldEmployee || newDate !== oldDate) {
            await handleDateOrEmployeeChange()
        }
    },
    { immediate: true }
)

watch(
    () => ({
        time_start: form.value?.time_start,
        time_end: form.value?.time_end,
        break_start: form.value?.break_start,
        break_end: form.value?.break_end,
        take_break: form.value?.take_break
    }),
    () => handleTimeCalculations(),
    persistFormData,
    { deep: true }
)

// Lifecycle Hooks
onMounted(async () => {
    try {
        await Promise.all([
            store.dispatch('employees/fetchEmployees'),
            store.dispatch('projects/fetchProjects'),
            store.dispatch('overtime/fetchRequests')
        ])

        const params = new URLSearchParams(window.location.search)
        const employeeName = params.get('employee')
        const date = params.get('date')

        if (employeeName && employeeName !== DEFAULT_SELECT) {
            form.value.employee_name = employeeName
            form.value.overtime_date = date || form.value.overtime_date
            await handleDateOrEmployeeChange()
        } else {
            form.value = getDefaultForm()
        }
    } catch (error) {
        console.error('Error loading initial data:', error)
        submitError.value = 'Failed to load data'
    }
})
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