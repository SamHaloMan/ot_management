import axios from 'axios'

const api = {
  // Employee endpoints
  async getEmployees() {
    const response = await axios.get('/employees/')
    return response.data
  },

  async createEmployee(data) {
    const response = await axios.post('/employees/', data)
    return response.data
  },

  // Project endpoints
  async getProjects() {
    const response = await axios.get('/projects/')
    return response.data
  },

  async createProject(data) {
    const response = await axios.post('/projects/', data)
    return response.data
  },

  // Overtime request endpoints
  async getOvertimeRequests() {
    const response = await axios.get('/overtime-requests/')
    return response.data
  },

  async createOvertimeRequest(data) {
    const response = await axios.post('/overtime-requests/', data)
    return response.data
  },

  // Analytics endpoints
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
