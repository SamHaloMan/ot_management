<template>
    <div class="col-12 mb-3">
        <div class="row">
            <div class="col-md-6">
                <CFormLabel for="break_start">Break Start Time</CFormLabel>
                <CFormInput id="break_start" type="time" v-model="breakStart" @change="handleChange" />
            </div>
            <div class="col-md-6">
                <CFormLabel for="break_end">Break End Time</CFormLabel>
                <CFormInput id="break_end" type="time" v-model="breakEnd" @change="handleChange" />
            </div>
        </div>
        <div class="text-muted mt-2" v-if="totalHours">
            Break Duration: {{ totalHours.toFixed(2) }} hours
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { CFormLabel, CFormInput } from '@coreui/vue';

const props = defineProps({
    start: { type: String, required: true },
    end: { type: String, required: true },
    totalHours: { type: Number, default: 0 }
});

const emit = defineEmits(['update:start', 'update:end', 'change']);

const breakStart = computed({
    get: () => props.start,
    set: (value) => emit('update:start', value)
});

const breakEnd = computed({
    get: () => props.end,
    set: (value) => emit('update:end', value)
});

const handleChange = () => {
    emit('change');
};
</script>