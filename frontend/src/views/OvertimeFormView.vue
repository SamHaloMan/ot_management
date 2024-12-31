<template>
    <div class="overtime">
        <h1 class="mb-4">Overtime Management</h1>
        <CTabs>
            <CTab title="Request Form" active>
                <overtime-form />
            </CTab>
            <CTab title="History">
                <overtime-history />
            </CTab>
        </CTabs>
    </div>
</template>

<script>
import OvertimeForm from '@/components/OvertimeForm.vue'
import OvertimeHistory from '@/components/OvertimeHistory.vue'

export default {
    name: 'OvertimeFormView',
    components: {
        OvertimeForm,
        OvertimeHistory
    }
}
</script>