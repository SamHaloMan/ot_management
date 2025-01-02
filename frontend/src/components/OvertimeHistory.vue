<template>
    <div class="overtime-history">
        <h3 class="mb-4">History</h3>
        <CCard>
            <CCardHeader>
                <h5>Overtime History</h5>
            </CCardHeader>
            <CCardBody>
                <div v-if="error" class="alert alert-danger" role="alert">
                    {{ error }}
                </div>
                <CSmartTable :loading="loading" :columns="columns" :items="tableItems" :items-per-page="5"
                    :items-per-page-select="true" cleaner column-filter column-sorter footer pagination table-filter
                    :table-props="{
                        striped: true,
                        hover: true,
                        responsive: true,
                    }">
                    <template #overtime_date="{ item }">
                        <td>{{ formatDate(item.overtime_date) }}</td>
                    </template>

                    <template #time="{ item }">
                        <td>
                            {{ formatTime(item.time_start) }} - {{ formatTime(item.time_end) }}
                            <small v-if="item.break_start && item.break_end" class="d-block text-muted">
                                Break: {{ formatTime(item.break_start) }} - {{ formatTime(item.break_end) }}
                            </small>
                        </td>
                    </template>

                    <template #total_hours="{ item }">
                        <td>{{ Number(item.total_hours).toFixed(2) }}</td>
                    </template>

                    <template #details="{ item }">
                        <CCollapse :visible="details.includes(item.id)">
                            <div class="p-3">
                                <h6>Overtime Details</h6>
                                <p class="mb-1"><strong>Reason:</strong> {{ item.overtime_reason }}</p>
                                <p class="mb-1"><strong>Employee ID:</strong> {{ item.work_id }}</p>
                                <p class="mb-1"><strong>Created:</strong> {{ formatDateTime(item.created_at) }}</p>
                                <p class="mb-0"><strong>Updated:</strong> {{ formatDateTime(item.updated_at) }}</p>
                            </div>
                        </CCollapse>
                    </template>

                    <template #show_details="{ item }">
                        <td class="py-2">
                            <CButton color="primary" variant="outline" square size="sm" @click="toggleDetails(item)">
                                {{ details.includes(item.id) ? 'Hide' : 'Show' }}
                            </CButton>
                        </td>
                    </template>

                    <template #loading>
                        <div class="text-center my-3">
                            <CSpinner />
                        </div>
                    </template>
                </CSmartTable>
            </CCardBody>
        </CCard>
    </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import {
    CSpinner,
    CButton,
    CCollapse,
    CCard,
    CCardHeader,
    CCardBody,
} from '@coreui/vue'

export default {
    name: 'OvertimeHistory',
    components: {
        CSpinner,
        CButton,
        CCollapse,
        CCard,
        CCardHeader,
        CCardBody,
    },
    setup() {
        const store = useStore()
        const details = ref([])

        const columns = [
            {
                key: 'overtime_date',
                label: 'Date',
                _style: { width: '15%' },
                sorter: true,
            },
            {
                key: 'work_id',
                label: 'Employee ID',
                _style: { width: '15%' },
            },
            {
                key: 'project_name',
                label: 'Project',
                _style: { width: '15%' },
            },
            {
                key: 'overtime_title',
                label: 'Title',
                _style: { width: '15%' },
            },
            {
                key: 'time',
                label: 'Time',
                _style: { width: '20%' },
                sorter: false,
            },
            {
                key: 'total_hours',
                label: 'Total Hours',
                _style: { width: '10%' },
                sorter: true,
            },
            {
                key: 'show_details',
                label: '',
                _style: { width: '10%' },
                filter: false,
                sorter: false,
            },
        ]

        // Make sure we always have an array
        const tableItems = computed(() => {
            const requests = store.state.overtime.requests
            if (!Array.isArray(requests)) {
                console.warn('Requests is not an array:', requests)
                return []
            }

            return requests.map(request => ({
                ...request,
                time: `${request.time_start} - ${request.time_end}`,
            }))
        })

        const loading = computed(() => store.state.overtime.loading)
        const error = computed(() => store.state.overtime.error)

        const formatDate = (dateString) => {
            if (!dateString) return ''
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })
        }

        const formatTime = (timeString) => {
            if (!timeString) return ''
            try {
                return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                })
            } catch {
                return timeString
            }
        }

        const formatDateTime = (dateTimeString) => {
            if (!dateTimeString) return ''
            return new Date(dateTimeString).toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            })
        }

        const toggleDetails = (item) => {
            const position = details.value.indexOf(item.id)
            if (position !== -1) {
                details.value.splice(position, 1)
            } else {
                details.value.push(item.id)
            }
        }

        onMounted(async () => {
            try {
                await store.dispatch('overtime/fetchRequests')
            } catch (error) {
                console.error('Failed to fetch overtime requests:', error)
            }
        })

        return {
            columns,
            tableItems,
            loading,
            error,
            details,
            formatDate,
            formatTime,
            formatDateTime,
            toggleDetails,
        }
    },
}
</script>

<style scoped>
.overtime-history :deep(.table) td {
    vertical-align: middle;
}
</style>