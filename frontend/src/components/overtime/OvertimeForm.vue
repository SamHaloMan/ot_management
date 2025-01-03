<template>
    <div class="overtime-form">
        <SummaryCards :applied-monthly="storeGetters.appliedMonthly" :applied-weekly="storeGetters.appliedWeekly" />

        <CCard>
            <CCardBody>
                <CForm @submit.prevent="handleSubmit">
                    <div class="row">
                        <FormField v-for="field in formFields" :key="field.name" v-bind="field"
                            v-model="form[field.name]" @change="field.onChange?.()" />

                        <BreakTimeFields v-if="form.take_break" v-model:start="form.break_start"
                            v-model:end="form.break_end" :total-hours="totalBreakHours" @change="calculateTotalHours" />
                    </div>

                    <div class="mt-4 d-flex justify-content-between align-items-center">
                        <div class="text-muted" v-if="totalHours">
                            Total Hours: {{ totalHours.toFixed(2) }}
                        </div>
                        <CButton type="submit" color="primary" :disabled="isSubmitting || !isFormValid">
                            {{ isSubmitting ? 'Submitting...' : 'Submit Request' }}
                        </CButton>
                    </div>

                    <CAlert v-if="submitError" color="danger" class="mt-3">
                        {{ submitError }}
                    </CAlert>
                </CForm>
            </CCardBody>
        </CCard>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useFormValidation } from '@/composables/useFormValidation';
import { useTimeCalculation } from '@/composables/useTimeCalculation';
import { DEFAULTS } from '@/constants/overtime';
import { CForm, CButton, CAlert, CCard, CCardBody } from '@coreui/vue';

import SummaryCards from './overtime/SummaryCards.vue';
import FormField from './overtime/FormFields.vue';
import BreakTimeFields from './overtime/BreakTimeFields.vue';

const store = useStore();
const form = ref({ ...DEFAULTS.FORM });
const isSubmitting = ref(false);
const submitError = ref('');

const {
    totalHours,
    totalBreakHours,
    calculateTotalHours,
    calculateTotalBreakTime
} = useTimeCalculation(form);

const {
    validateForm,
    formFields,
    handleEmployeeChange,
    isFormValid
} = useFormValidation(form, store);

const storeGetters = {
    appliedMonthly: computed(() => store.state.overtime.monthlyHours || 0),
    appliedWeekly: computed(() => store.state.overtime.weeklyHours || 0),
};

watch(
    [() => form.value.employee_name, () => form.value.overtime_date],
    async ([newEmployee, newDate]) => {
        if (newEmployee === DEFAULTS.SELECT_OPTION) return;

        const lastData = store.getters['overtime/getLastSubmittedData'](newEmployee, newDate);
        if (lastData) {
            form.value = {
                ...form.value,
                ...lastData,
                break_start: lastData.break_start || DEFAULTS.BREAK_START,
                break_end: lastData.break_end || DEFAULTS.BREAK_END,
                take_break: !!lastData.break_start,
            };
            calculateTotalHours();
            calculateTotalBreakTime();
        }
    }
);

const handleSubmit = async () => {
    submitError.value = '';
    const error = validateForm();
    if (error) {
        submitError.value = error;
        return;
    }

    try {
        isSubmitting.value = true;
        const requestData = {
            ...form.value,
            break_start: form.value.take_break ? form.value.break_start : null,
            break_end: form.value.take_break ? form.value.break_end : null,
            total_hours: totalHours.value
        };

        await store.dispatch('overtime/submitRequest', requestData);
        await store.dispatch('overtime/fetchRequests');
    } catch (error) {
        submitError.value = error.message || 'Error submitting request';
    } finally {
        isSubmitting.value = false;
    }
};

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
        submitError.value = 'Failed to load initial data';
    }
});
</script>