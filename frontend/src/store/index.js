import { createStore } from 'vuex'
import overtime from './modules/overtime'
// import employees from './modules/employees'
// import projects from './modules/projects'
// import analytics from './modules/analytics'

export default createStore({
  modules: {
    overtime,
    employees,
    projects,
    analytics
  }
})