<template>
    <div class="row">
        <div class="col-md-12 mb-3">
            <CFormLabel>Overtime Title*</CFormLabel>
            <CFormInput :modelValue="overtimeTitle" @update:modelValue="$emit('update:overtimeTitle', $event)"
                required />
        </div>
        <div class="col-md-12 mb-3">
            <CFormLabel>Overtime Details*</CFormLabel>
            <CFormTextarea :modelValue="overtimeReason" @update:modelValue="$emit('update:overtimeReason', $event)"
                rows="3" required />
        </div>
    </div>
</template>

<script setup>
defineProps({
    overtimeTitle: String,
    overtimeReason: String
})

defineEmits(['update:overtimeTitle', 'update:overtimeReason'])
</script>