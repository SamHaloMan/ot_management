<template>
    <CCard>
        <CCardBody>
            <CTable striped responsive>
                <CTableHead>
                    <CTableRow>
                        <CTableHeaderCell>Date</CTableHeaderCell>
                        <CTableHeaderCell>Employee</CTableHeaderCell>
                        <CTableHeaderCell>Project</CTableHeaderCell>
                        <CTableHeaderCell>Title</CTableHeaderCell>
                        <CTableHeaderCell>Time</CTableHeaderCell>
                        <CTableHeaderCell>Break</CTableHeaderCell>
                        <CTableHeaderCell>Total Hours</CTableHeaderCell>
                    </CTableRow>
                </CTableHead>
                <CTableBody>
                    <CTableRow v-for="request in sortedRequests" :key="request.id">
                        <CTableDataCell>{{ formatDate(request.overtime_date) }}</CTableDataCell>
                        <CTableDataCell>{{ request.employee_name }}</CTableDataCell>
                        <CTableDataCell>{{ request.project_name }}</CTableDataCell>
                        <CTableDataCell>{{ request.overtime_title }}</CTableDataCell>
                        <CTableDataCell>{{ request.time_start }} - {{ request.time_end }}</CTableDataCell>
                        <CTableDataCell>
                            {{ request.break_start && request.break_end
                                ? `${request.break_start} - ${request.break_end}`
                                : 'No Break' }}
                        </CTableDataCell>
                        <CTableDataCell>{{ request.total_hours }} hrs</CTableDataCell>
                    </CTableRow>
                </CTableBody>
            </CTable>
        </CCardBody>
    </CCard>
</template>

<script>
import {
    CCard, CCardBody, CTable, CTableHead, CTableBody,
    CTableRow, CTableHeaderCell, CTableDataCell
} from '@coreui/vue'

export default {
    name: 'OvertimeHistory',
    components: {
        CCard,
        CCardBody,
        CTable,
        CTableHead,
        CTableBody,
        CTableRow,
        CTableHeaderCell,
        CTableDataCell
    },
    computed: {
        sortedRequests() {
            return [...this.$store.state.overtimeRequests].sort(
                (a, b) => new Date(b.overtime_date) - new Date(a.overtime_date)
            )
        }
    },
    methods: {
        formatDate(dateString) {
            return new Date(dateString).toLocaleDateString()
        }
    },
    async created() {
        await this.$store.dispatch('fetchOvertimeRequests')
    }
}
</script>