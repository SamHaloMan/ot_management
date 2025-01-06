<template>
    <div class="row">
        <div class="col-md-6 mb-3">
            <CFormLabel>Employee Name*</CFormLabel>
            <CFormSelect :modelValue="employeeName" @update:modelValue="$emit('update:employeeName', $event)"
                :state="employeeName !== DEFAULT_SELECT" :options="employeeOptions" @change="handleEmployeeChange"
                required />
        </div>
        <div class="col-md-6 mb-3">
            <CFormLabel>Work ID</CFormLabel>
            <CFormInput :value="workId" readonly disabled />
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    employeeName: String,
    workId: String,
    employeeOptions: Array,
    DEFAULT_SELECT: String
})

const emit = defineEmits(['update:employeeName', 'employeeChanged'])

const handleEmployeeChange = () => {
    emit('employeeChanged')
}
</script>