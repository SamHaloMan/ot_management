<template>
    <div>
        <h1>Dashboard</h1>
        <div v-if="loading">Loading...</div>
        <div v-else>
            <h2>Employee Analytics</h2>
            <pre>{{ employeeAnalytics }}</pre>

            <h2>Project Analytics</h2>
            <pre>{{ projectAnalytics }}</pre>

            <h2>Timeline Data</h2>
            <pre>{{ timelineData }}</pre>
        </div>
    </div>
</template>

<script>
export default {
    name: "DashboardView",
    computed: {
        employeeAnalytics() {
            return this.$store.getters['analytics/employeeAnalytics'];
        },
        projectAnalytics() {
            return this.$store.getters['analytics/projectAnalytics'];
        },
        timelineData() {
            return this.$store.getters['analytics/timelineData'];
        },
        loading() {
            return this.$store.state.analytics.loading;
        }
    },
    created() {
        const params = { start_date: '2024-01-01', end_date: '2024-12-31' }; 
        this.$store.dispatch('analytics/fetchAnalytics', params);
    }
};
</script>