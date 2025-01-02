import api from '@/api/index'

export default {
  namespaced: true,

  state: {
    analyticsData: null,
    monthlyData: null,
    loading: false,
    error: null,
  },

  mutations: {
    SET_ANALYTICS(state, data) { state.analyticsData = data },
    SET_MONTHLY_DATA(state, data) { state.monthlyData = data },
    SET_LOADING(state, loading) { state.loading = loading },
    SET_ERROR(state, error) { state.error = error },
  },

  actions: {
    async fetchAnalytics({ commit }, params) {
      try {
        commit('SET_LOADING', true)
        const data = await api.getAnalytics(params)
        commit('SET_ANALYTICS', data)
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async fetchMonthlyAnalytics({ commit }, params) {
      try {
        commit('SET_LOADING', true)
        const data = await api.getMonthlyAnalytics(params)
        commit('SET_MONTHLY_DATA', data)
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },
  },

  getters: {
    employeeAnalytics: (state) => state.analyticsData?.byEmployee || [],
    projectAnalytics: (state) => state.analyticsData?.byProject || [],
    timelineData: (state) => state.analyticsData?.timeline || [],
  },
}
