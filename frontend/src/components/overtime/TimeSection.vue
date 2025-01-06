<template>
    <div class="col-md-12 mb-3">
        <div class="row align-items-center">
            <div class="col-md-5">
                <CFormLabel>Time Start*</CFormLabel>
                <CFormInput type="time" :modelValue="timeStart"
                    @update:modelValue="handleTimeChange('timeStart', $event)" required />
            </div>
            <div class="col-md-2 text-center">
                <div>Total:</div>
                <strong>{{ totalHours.toFixed(2) }} hour(s)</strong>
            </div>
            <div class="col-md-5">
                <CFormLabel>Time End*</CFormLabel>
                <CFormInput type="time" :modelValue="timeEnd" @update:modelValue="handleTimeChange('timeEnd', $event)"
                    required />
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    timeStart: String,
    timeEnd: String,
    totalHours: Number
})

const emit = defineEmits(['update:timeStart', 'update:timeEnd', 'calculate'])

const handleTimeChange = (type, value) => {
    emit(`update:${type}`, value)
    emit('calculate')
}
</script>