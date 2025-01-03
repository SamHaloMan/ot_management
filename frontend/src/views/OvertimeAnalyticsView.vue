<template>
    <div>
        <h1>Overtime Analytics</h1>
        <div v-if="loading">Loading...</div>
        <div v-else>
            <h2>Employee Overtime Analytics</h2>
            <pre>{{ employeeAnalytics }}</pre>

            <h2>Project Overtime Analytics</h2>
            <pre>{{ projectAnalytics }}</pre>

            <h2>Timeline Overtime Data</h2>
            <pre>{{ timelineData }}</pre>
        </div>
    </div>
</template>

<script>
export default {
    name: "OvertimeAnalyticsView",
    computed: {
        // Access the analytics data from Vuex store
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
        // Dispatch the action to fetch overtime analytics when the component is created
        const params = { start_date: '2024-01-01', end_date: '2024-12-31' }; // Example params
        this.$store.dispatch('analytics/fetchAnalytics', params);
    }
};
</script>