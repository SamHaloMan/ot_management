<template>
    <div class="col-md-6 mb-3">
        <CFormLabel :for="name">{{ label }}</CFormLabel>

        <template v-if="type === 'select'">
            <CFormSelect :id="name" v-model="modelValue" :options="options" :disabled="disabled" :required="required"
                @change="$emit('change')" />
        </template>

        <template v-else-if="type === 'textarea'">
            <CFormTextarea :id="name" v-model="modelValue" :disabled="disabled" :required="required" rows="3" />
        </template>

        <template v-else-if="type === 'checkbox'">
            <CFormCheck :id="name" v-model="modelValue" :disabled="disabled" />
        </template>

        <template v-else>
            <CFormInput :id="name" v-model="modelValue" :type="type" :disabled="disabled" :readonly="readonly"
                :required="required" />
        </template>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { CFormLabel, CFormInput, CFormSelect, CFormTextarea, CFormCheck } from '@coreui/vue';

const props = defineProps({
    name: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, default: 'text' },
    modelValue: { type: [String, Boolean], default: '' },
    options: { type: Array, default: () => [] },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    required: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'change']);

const modelValue = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});
</script>