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
        commit('SET_LOADING', true);
        const employees = await api.getEmployees(); 
        commit('SET_EMPLOYEES', employees || []);
      } catch (error) {
        commit('SET_ERROR', error.message || 'Failed to fetch employees');
      } finally {
        commit('SET_LOADING', false);
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
    employeeOptions: (state) =>
      state.employees.map((emp) => ({
        value: emp.id,
        text: emp.name,
        workId: emp.work_id,
      })),
  },
}
