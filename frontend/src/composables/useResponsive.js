import { ref, onMounted, onUnmounted } from 'vue'

export function useResponsive() {
  const windowWidth = ref(window.innerWidth)
  const isMobile = ref(windowWidth.value < 768)

  const handleResize = () => {
    windowWidth.value = window.innerWidth
    isMobile.value = windowWidth.value < 768
  }

  onMounted(() => {
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })

  return {
    windowWidth,
    isMobile,
  }
}