import { createStore } from 'vuex'
import analytics from './modules/analytics'
import employees from './modules/employees'
import overtime from './modules/overtime'
import projects from './modules/projects'

export default createStore({
  modules: {
    analytics,
    employees,
    overtime,
    projects
  }
})