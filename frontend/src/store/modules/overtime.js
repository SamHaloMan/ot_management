import api from '@/api'

export default {
  namespaced: true,

  state: {
    loading: false,
    error: null,
    requests: [],
    weeklyHours: 0,
    monthlyHours: 0,
  },

  mutations: {
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    SET_REQUESTS(state, requests) {
      state.requests = requests
    },
    SET_WEEKLY_HOURS(state, hours) {
      state.weeklyHours = hours
    },
    SET_MONTHLY_HOURS(state, hours) {
      state.monthlyHours = hours
    },
    ADD_REQUEST(state, request) {
      state.requests.unshift(request)
    },
  },

  actions: {
    async fetchRequests({ commit }) {
      try {
        commit('SET_LOADING', true)
        const data = await api.getOvertimeRequests()
        commit('SET_REQUESTS', data)

        // Calculate weekly and monthly hours
        const now = new Date()
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

        const weeklyHours = data
          .filter((req) => new Date(req.overtime_date) >= weekStart)
          .reduce((sum, req) => sum + req.total_hours, 0)

        const monthlyHours = data
          .filter((req) => new Date(req.overtime_date) >= monthStart)
          .reduce((sum, req) => sum + req.total_hours, 0)

        commit('SET_WEEKLY_HOURS', weeklyHours)
        commit('SET_MONTHLY_HOURS', monthlyHours)
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async submitRequest({ commit }, requestData) {
      try {
        commit('SET_LOADING', true)
        const response = await api.createOvertimeRequest(requestData)
        commit('ADD_REQUEST', response)
        return response
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
  },

  getters: {
    remainingWeeklyHours: (state) => Math.max(0, 18 - state.weeklyHours),
    remainingMonthlyHours: (state) => Math.max(0, 72 - state.monthlyHours),
    sortedRequests: (state) =>
      [...state.requests].sort((a, b) => new Date(b.overtime_date) - new Date(a.overtime_date)),
  },
}
