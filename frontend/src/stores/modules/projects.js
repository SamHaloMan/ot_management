import api from '@/api'

export default {
  namespaced: true,

  state: {
    projects: [],
    loading: false,
    error: null,
  },

  mutations: {
    SET_PROJECTS(state, projects) {
      state.projects = projects
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    },
  },

  actions: {
    async fetchProjects({ commit }) {
      try {
        commit('SET_LOADING', true)
        const data = await api.getAllProjects()
        console.log('Fetched projects:', data)
        commit('SET_PROJECTS', data)
      } catch (error) {
        commit('SET_ERROR', error.message)
        console.error('Error fetching projects:', error)
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async createProject({ commit, dispatch }, projectData) {
      try {
        commit('SET_LOADING', true)
        await api.createProject(projectData)
        dispatch('fetchProjects')
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
  },

  getters: {
    projectOptions: (state) => {
      return [
        { value: '--SELECT OPTIONS--', text: '--SELECT OPTIONS--' },
        ...state.projects.map((proj) => ({
          value: proj.name || '',
          text: proj.name || 'Unnamed Project',
        })),
      ].filter((option) => option.value && option.text)
    },
  },
}
