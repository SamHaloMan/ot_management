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
      const DEFAULT_SELECT = '--SELECT OPTIONS--'
      return [
        { text: DEFAULT_SELECT, value: DEFAULT_SELECT },
        ...state.projects
          .filter((project) => project.is_enabled)
          .map((project) => ({
            text: project.name,
            value: project.name,
          })),
      ]
    },
  },
}
