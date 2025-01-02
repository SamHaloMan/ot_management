export default [
  {
    component: 'CNavTitle',
    name: 'Home',
  },
  {
    component: 'CNavItem',
    name: 'Dashboard',
    to: '/dashboard',
    icon: 'cilHome',
    badge: {
      color: 'primary',
      text: 'HOME',
    },
  },
  {
    component: 'CNavTitle',
    name: 'Overtime Menu',
  },
  {
    component: 'CNavItem',
    name: 'Analytics',
    to: '/overtime/analytics',
    icon: 'cilBarChart',
  },
  {
    component: 'CNavItem',
    name: 'Form',
    to: '/overtime/form',
    icon: 'cilNotes',
  },
  {
    component: 'CNavItem',
    name: 'History',
    to: '/overtime/history',
    icon: 'cilHistory',
  },
  {
    component: 'CNavTitle',
    name: 'Extras',
  },
  {
    component: 'CNavGroup',
    name: 'Settings',
    to: '/settings',
    icon: 'cil-star',
    items: [
      {
        component: 'CNavItem',
        name: 'Data1',
        to: '/settings/Data',
      },
      {
        component: 'CNavItem',
        name: 'Data2',
        to: '/settings/Data2',
      },
    ],
  },
]
