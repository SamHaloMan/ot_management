import axios from 'axios'

axios.defaults.baseURL = import.meta.env.VITE_APP_API_BASE_URL

const handleApiResponse = async (apiCall) => {
  try {
    const response = await apiCall()
    return response.data
  } catch (error) {
    console.error('API Error:', error)
    throw new Error(`API Error: ${error.response?.data?.message || error.message}`)
  }
}

const validateEmployee = (data) => {
  const required = ['work_id', 'name']
  for (const field of required) {
    if (!data[field]) {
      throw new Error(`Missing required field: ${field}`)
    }
  }
  if (data.work_id.length > 50) {
    throw new Error('work_id must be less than 50 characters')
  }
}

const validateProject = (data) => {
  const required = ['name']
  for (const field of required) {
    if (!data[field]) {
      throw new Error(`Missing required field: ${field}`)
    }
  }
  if (data.name.length > 255) {
    throw new Error('name must be less than 255 characters')
  }
}

const validateOvertimeRequest = (data) => {
  const required = [
    'work_id',
    'employee_name',
    'project_name',
    'overtime_title',
    'overtime_reason',
    'time_start',
    'time_end',
  ]
  for (const field of required) {
    if (!data[field]) {
      throw new Error(`Missing required field: ${field}`)
    }
  }
  if (data.work_id.length > 10) {
    throw new Error('work_id must be less than 10 characters')
  }
}

const api = {
  // Employee methods
  async getAllEmployees(search) {
    return handleApiResponse(() => axios.get('/employees/', { params: { search } }))
  },

  async getSpecificEmployee(id) {
    return handleApiResponse(() => axios.get(`/employees/${id}/`))
  },

  async createEmployee(data) {
    validateEmployee(data)
    return handleApiResponse(() => axios.post('/employees/', data))
  },

  async updateEmployee(id, data) {
    validateEmployee(data)
    return handleApiResponse(() => axios.put(`/employees/${id}/`, data))
  },

  async patchEmployee(id, data) {
    return handleApiResponse(() => axios.patch(`/employees/${id}/`, data))
  },

  async deleteEmployee(id) {
    return handleApiResponse(() => axios.delete(`/employees/${id}/`))
  },

  // Project methods
  async getAllProjects(search) {
    return handleApiResponse(() => axios.get('/projects/', { params: { search } }))
  },

  async getSpecificProject(id) {
    return handleApiResponse(() => axios.get(`/projects/${id}/`))
  },

  async createProject(data) {
    validateProject(data)
    return handleApiResponse(() => axios.post('/projects/', data))
  },

  async updateProject(id, data) {
    validateProject(data)
    return handleApiResponse(() => axios.put(`/projects/${id}/`, data))
  },

  async patchProject(id, data) {
    return handleApiResponse(() => axios.patch(`/projects/${id}/`, data))
  },

  async deleteProject(id) {
    return handleApiResponse(() => axios.delete(`/projects/${id}/`))
  },

  // Overtime methods
  async getOvertimeRequests(search) {
    return handleApiResponse(() => axios.get('/overtime-requests/', { params: { search } }))
  },

  async getSpecificOvertimeRequest(id) {
    return handleApiResponse(() => axios.get(`/overtime-requests/${id}/`))
  },

  async createOvertimeRequest(data) {
    validateOvertimeRequest(data)
    return handleApiResponse(() => axios.post('/overtime-requests/', data))
  },

  async updateOvertimeRequest(id, data) {
    validateOvertimeRequest(data)
    return handleApiResponse(() => axios.put(`/overtime-requests/${id}/`, data))
  },

  async patchOvertimeRequest(id, data) {
    return handleApiResponse(() => axios.patch(`/overtime-requests/${id}/`, data))
  },

  async deleteOvertimeRequest(id) {
    return handleApiResponse(() => axios.delete(`/overtime-requests/${id}/`))
  },

  // Analytics methods
  async getAnalytics(params) {
    return handleApiResponse(() => axios.get('/analytics/overtime-by-date-range/', { params }))
  },

  async getMonthlyAnalytics(params) {
    return handleApiResponse(() => axios.get('/analytics/get_monthly_analytics/', { params }))
  },
}

export default api