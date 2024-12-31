<template>
  <div class="wrapper">
    <CSidebar position="fixed" :visible="sidebarVisible" @visible-change="handleSidebarVisibleChange">
      <CSidebarBrand>
        <h5 class="mb-0">Overtime Management</h5>
      </CSidebarBrand>

      <CSidebarNav>
        <CNavItem href="/dashboard" :active="currentRoute === '/dashboard'">
          <CIcon class="nav-icon" name="cil-speedometer" />
          Dashboard
        </CNavItem>
        <CNavItem href="/overtime-form" :active="currentRoute === '/overtime-form'">
          <CIcon class="nav-icon" name="cil-clock" />
          Overtime
        </CNavItem>
        <CNavItem href="/analytics" :active="currentRoute === '/analytics'">
          <CIcon class="nav-icon" name="cil-chart-pie" />
          Analytics
        </CNavItem>
      </CSidebarNav>

      <CSidebarToggler class="d-none d-lg-flex" @click="sidebarVisible = !sidebarVisible" />
    </CSidebar>

    <div class="wrapper d-flex flex-column min-vh-100 bg-light">
      <CHeader position="sticky" class="mb-4">
        <CContainer fluid>
          <CHeaderToggler class="ps-1" @click="sidebarVisible = !sidebarVisible">
            <CIcon name="cil-menu" size="lg" />
          </CHeaderToggler>
          <CHeaderBrand class="mx-auto d-lg-none" to="/">
            Overtime Management System
          </CHeaderBrand>
          <CHeaderNav class="d-none d-lg-flex me-auto">
            <CHeaderBrand class="mx-2">
              Overtime Management System
            </CHeaderBrand>
          </CHeaderNav>
        </CContainer>
      </CHeader>

      <div class="body flex-grow-1 px-3">
        <CContainer fluid>
          <router-view />
        </CContainer>
      </div>

      <CFooter>
        <div>
          <span class="ms-1">&copy; {{ new Date().getFullYear() }} Pegaunihan Technology Batam</span>
        </div>
      </CFooter>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { cilSpeedometer, cilClock, cilChartPie, cilMenu } from '@coreui/icons'

export default {
  name: 'App',
  setup() {
    const sidebarVisible = ref(true)

    const toggleSidebar = () => {
      sidebarVisible.value = !sidebarVisible.value
    }

    return {
      sidebarVisible,
      toggleSidebar,
      icons: {
        cilSpeedometer,
        cilClock,
        cilChartPie,
        cilMenu
      }
    }
  }
}
</script>

<style>
.wrapper {
  margin-left: var(--cui-sidebar-width);
}

@media (max-width: 768px) {
  .wrapper {
    margin-left: 0;
  }
}

.nav-icon {
  margin-right: 0.5rem;
}
</style>