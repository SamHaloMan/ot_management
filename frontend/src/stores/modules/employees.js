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
        console.log('Fetched employees:', employees)
        commit('SET_EMPLOYEES', employees || [])
      } catch (error) {
        commit('SET_ERROR', error.message || 'Failed to fetch employees')
        console.error('Error fetching employees:', error)
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async createEmployee({ commit, dispatch }, employeeData) {
      try {
        commit('SET_LOADING', true)
        await api.createEmployee(employeeData)
        dispatch('fetchEmployees')
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
  },

  getters: {
    employeeOptions: (state) => {
      return [
        { value: '--SELECT OPTIONS--', text: '--SELECT OPTIONS--' },
        ...state.employees.map((emp) => ({
          value: emp.name || '',
          text: emp.name || 'Unnamed Employee',
          workId: emp.work_id,
        })),
      ].filter((option) => option.value && option.text)
    },
  },
}
