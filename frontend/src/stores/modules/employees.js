import api from '@/api'

export default {
  namespaced: true,
  state: {
    employees: [],
    loading: false,
    error: null,
  },

  mutations: {
    SET_EMPLOYEES(state, employees) {
      state.employees = employees
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    },
  },

  actions: {
    async fetchEmployees({ commit }) {
      try {
        commit('SET_LOADING', true)
        const employees = await api.getAllEmployees()
        commit('SET_EMPLOYEES', employees || [])
      } catch (error) {
        commit('SET_ERROR', error.message || 'Failed to fetch employees')
        console.error('Error fetching employees:', error)
      } finally {
        commit('SET_LOADING', false)
      }
    },
  },

  getters: {
    employeeOptions: (state) => {
      return [
        {
          label: '--SELECT OPTIONS--',
          value: '--SELECT OPTIONS--',
          workId: 'MW-------',
        },
        ...state.employees
          .filter((emp) => emp.is_enabled)
          .map((emp) => ({
            label: emp.name,
            value: emp.name,
            workId: emp.work_id,
          })),
      ]
    },
  },
}
