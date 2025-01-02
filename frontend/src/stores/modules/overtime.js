import api from '@/api'

export default {
  namespaced: true,
  state: {
    requests: [],
    loading: false,
    error: null,
    weeklyHours: 0,
    monthlyHours: 0,
  },

  mutations: {
    SET_LOADING(state, value) {
      state.loading = value
    },
    SET_ERROR(state, value) {
      state.error = value
    },
    SET_REQUESTS(state, requests) {
      // Ensure requests is an array before setting
      state.requests = Array.isArray(requests) ? requests : []
    },
    SET_WEEKLY_HOURS(state, value) {
      state.weeklyHours = value
    },
    SET_MONTHLY_HOURS(state, value) {
      state.monthlyHours = value
    },
    ADD_REQUEST(state, request) {
      state.requests.unshift(request)
    },
  },

  actions: {
    async fetchRequests({ commit }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)

      try {
        const response = await api.getOvertimeRequests()
        const requests = Array.isArray(response) ? response : []
        commit('SET_REQUESTS', requests)

        // Calculate weekly and monthly hours
        const now = new Date()
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

        const weeklyHours = requests
          .filter((req) => new Date(req.overtime_date) >= weekStart)
          .reduce((sum, req) => sum + Number(req.total_hours), 0)

        const monthlyHours = requests
          .filter((req) => new Date(req.overtime_date) >= monthStart)
          .reduce((sum, req) => sum + Number(req.total_hours), 0)

        commit('SET_WEEKLY_HOURS', weeklyHours)
        commit('SET_MONTHLY_HOURS', monthlyHours)
      } catch (error) {
        commit('SET_ERROR', error.message)
        console.error('Error fetching overtime requests:', error)
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async submitRequest({ commit }, data) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)

      try {
        const response = await api.createOvertimeRequest(data)
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
    sortedRequests: (state) => {
      return [...state.requests].sort(
        (a, b) => new Date(b.overtime_date) - new Date(a.overtime_date),
      )
    },
  },
}
