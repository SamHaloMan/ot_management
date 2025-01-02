import axios from 'axios'

// const axiosInstance = axios.create({
//   baseURL: import.meta.env.VUE_APP_API_BASE_URL || 'http://localhost:1234/v1/api',
//   headers: { 'Content-Type': 'application/json' },
// })

axios.defaults.baseURL = import.meta.env.VUE_APP_API_BASE_URL

const api = {
  async getEmployees() {
    const response = await axios.get('/employees/')
    return response.data
  },

  async createEmployee(data) {
    const response = await axios.post('/employees/', data)
    return response.data
  },

  async getProjects() {
    const response = await axios.get('/projects/')
    return response.data
  },

  async createProject(data) {
    const response = await axios.post('/projects/', data)
    return response.data
  },

  async getOvertimeRequests() {
    try {
      const response = await axios.get('/overtime-requests/')
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  },

  async createOvertimeRequest(data) {
    const response = await axios.post('/overtime-requests/', data)
    return response.data
  },

  async getAnalytics(params) {
    const response = await axios.get('/analytics/overtime-by-date-range/', { params })
    return response.data
  },

  async getMonthlyAnalytics(params) {
    const response = await axios.get('/analytics/get_monthly_analytics/', { params })
    return response.data
  },
}

export default api
