import api from '@/api'

export default {
  namespaced: true,
  state: {
    requests: [],
    loading: false,
    error: null,
    weeklyHours: 0,
    monthlyHours: 0,
    lastSubmittedData: {},
    employeeOvertime: {},
    historicalData: {},
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
    SET_EMPLOYEE_OVERTIME(state, { employeeId, weekly, monthly }) {
      state.employeeOvertime[employeeId] = { weekly, monthly }
    },
    SET_HISTORICAL_DATA(state, { employeeName, date, data }) {
      const key = `${employeeName}-${date}`
      state.historicalData[key] = data
    },
    ADD_REQUEST(state, request) {
      state.requests.unshift(request)
    },
    UPDATE_LAST_SUBMITTED(state, { employeeName, data }) {
      state.lastSubmittedData[employeeName] = data
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
        const employeeOvertime = {}
        const now = new Date()
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

        requests.forEach((request) => {
          const requestDate = new Date(request.overtime_date)
          if (!employeeOvertime[request.work_id]) {
            employeeOvertime[request.work_id] = { weekly: 0, monthly: 0 }
          }
          if (requestDate >= weekStart) {
            employeeOvertime[request.work_id].weekly += Number(request.total_hours)
          }
          if (requestDate >= monthStart) {
            employeeOvertime[request.work_id].monthly += Number(request.total_hours)
          }
        })

        // Update overtime for each employee
        Object.entries(employeeOvertime).forEach(([employeeId, hours]) => {
          commit('SET_EMPLOYEE_OVERTIME', {
            employeeId,
            weekly: hours.weekly,
            monthly: hours.monthly,
          })
        })
      } catch (error) {
        commit('SET_ERROR', error.message)
        console.error('Error fetching overtime requests:', error)
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async submitRequest({ commit, state }, data) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)

      try {
        const response = await api.createOvertimeRequest(data)
        commit('ADD_REQUEST', response)
        // Store last submitted data
        commit('UPDATE_LAST_SUBMITTED', {
          employeeName: data.employee_name,
          data: {
            ...data,
            overtime_date: data.overtime_date,
          },
        })
        return response
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async fetchEmployeeOvertimeData({ commit }, { employeeName, date }) {
      try {
        const response = await api.getOvertimeRequests({
          employee_name: employeeName,
          overtime_date: date,
        })

        if (response && response.length > 0) {
          const data = response[0]
          commit('SET_HISTORICAL_DATA', {
            employeeName,
            date,
            data,
          })
          return data
        }
        return null
      } catch (error) {
        console.error('Error fetching overtime data:', error)
        throw error
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
    getLastSubmittedData: (state) => (employeeName, overtimeDate) => {
      const allRequests = [...state.requests]
      const lastSubmitted = state.lastSubmittedData[employeeName]

      // Find historical data for specific date
      const historicalRequest = allRequests.find(
        (req) => req.employee_name === employeeName && req.overtime_date === overtimeDate,
      )

      return historicalRequest || lastSubmitted || null
    },
    getEmployeeOvertimeHours: (state) => (employeeId) => {
      return state.employeeOvertime[employeeId] || { weekly: 0, monthly: 0 }
    },
    getHistoricalRequest: (state) => (employeeName, date) => {
      const key = `${employeeName}-${date}`
      return (
        state.historicalData[key] ||
        state.requests.find(
          (req) => req.employee_name === employeeName && req.overtime_date === date,
        )
      )
    },
    getEmployeeOvertimeStats: (state) => (workId) => {
      const stats = state.employeeOvertime[workId] || { weekly: 0, monthly: 0 }
      return {
        weeklyHours: stats.weekly,
        monthlyHours: stats.monthly,
        remainingWeekly: Math.max(0, 18 - stats.weekly),
        remainingMonthly: Math.max(0, 72 - stats.monthly),
      }
    },
  },
}
