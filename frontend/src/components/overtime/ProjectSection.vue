<template>
    <div class="row">
        <div class="col-md-6 mb-3">
            <CFormLabel>Project Name*</CFormLabel>
            <CFormSelect :modelValue="projectName" @update:modelValue="$emit('update:projectName', $event)"
                :state="projectName !== DEFAULT_SELECT" :options="projectOptions.map(opt => ({
                    label: opt.label || opt.text,
                    value: opt.value
                }))" required />
        </div>
        <div class="col-md-6 mb-3">
            <CFormLabel>Overtime Date*</CFormLabel>
            <CFormInput type="date" :modelValue="overtimeDate" @update:modelValue="$emit('update:overtimeDate', $event)"
                required />
        </div>
    </div>
</template>

<script setup>
defineProps({
    projectName: String,
    overtimeDate: String,
    projectOptions: {
        type: Array,
        required: true
    },
    DEFAULT_SELECT: String
})

defineEmits(['update:projectName', 'update:overtimeDate'])
</script>