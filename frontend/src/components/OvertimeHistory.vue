<template>
    <div class="overtime-history">
        <CCard>
            <CCardHeader>
                <h5>Overtime History</h5>
            </CCardHeader>
            <CCardBody>
                <div class="table-responsive">
                    <CTable hover>
                        <CTableHead>
                            <CTableRow>
                                <CTableHeaderCell>Date</CTableHeaderCell>
                                <CTableHeaderCell>Employee</CTableHeaderCell>
                                <CTableHeaderCell>Project</CTableHeaderCell>
                                <CTableHeaderCell>Title</CTableHeaderCell>
                                <CTableHeaderCell>Time</CTableHeaderCell>
                                <CTableHeaderCell>Total Hours</CTableHeaderCell>
                            </CTableRow>
                        </CTableHead>
                        <CTableBody>
                            <CTableRow v-for="request in sortedRequests" :key="request.id">
                                <CTableDataCell>{{ formatDate(request.overtime_date) }}</CTableDataCell>
                                <CTableDataCell>{{ request.employee_name }}</CTableDataCell>
                                <CTableDataCell>{{ request.project_name }}</CTableDataCell>
                                <CTableDataCell>{{ request.overtime_title }}</CTableDataCell>
                                <CTableDataCell>
                                    {{ request.time_start }} - {{ request.time_end }}
                                    <small v-if="request.break_start && request.break_end">
                                        (Break: {{ request.break_start }} - {{ request.break_end }})
                                    </small>
                                </CTableDataCell>
                                <CTableDataCell>{{ request.total_hours.toFixed(2) }}</CTableDataCell>
                            </CTableRow>
                        </CTableBody>
                    </CTable>
                </div>
            </CCardBody>
        </CCard>
    </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'

export default {
    name: 'OvertimeHistory',
    setup() {
        const store = useStore()

        const sortedRequests = computed(() => {
            return [...store.state.overtimeRequests].sort((a, b) =>
                new Date(b.overtime_date) - new Date(a.overtime_date)
            )
        })

        const formatDate = (dateString) => {
            return new Date(dateString).toLocaleDateString()
        }

        return {
            sortedRequests,
            formatDate
        }
    }
}
</script>