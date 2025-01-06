<template>
    <div class="col-md-12 mb-3">
        <CFormCheck :modelValue="takeBreak" @update:modelValue="$emit('update:takeBreak', $event)"
            label="Take Break?" />
    </div>
    <div v-if="takeBreak" class="col-md-12 mb-3">
        <div class="row align-items-center">
            <div class="col-md-5">
                <CFormLabel>Break Start*</CFormLabel>
                <CFormInput type="time" :modelValue="breakStart"
                    @update:modelValue="handleBreakChange('breakStart', $event)" required />
            </div>
            <div class="col-md-2 text-center">
                <div class="mt-4">
                    <strong>{{ totalBreakHours.toFixed(2) }} hour(s)</strong>
                </div>
            </div>
            <div class="col-md-5">
                <CFormLabel>Break End*</CFormLabel>
                <CFormInput type="time" :modelValue="breakEnd"
                    @update:modelValue="handleBreakChange('breakEnd', $event)" required />
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    takeBreak: Boolean,
    breakStart: String,
    breakEnd: String,
    totalBreakHours: Number
})

const emit = defineEmits(['update:takeBreak', 'update:breakStart', 'update:breakEnd', 'calculate'])

const handleBreakChange = (type, value) => {
    emit(`update:${type}`, value)
    emit('calculate')
}
</script>