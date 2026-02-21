import { ref } from 'vue'
import { useMediaQuery } from '@vueuse/core'

/** 移动端侧边栏抽屉的全局状态（单例模式） */
const isOpen = ref(false)

/** 是否为桌面端（>= lg 1024px） */
const isLg = useMediaQuery('(min-width: 1024px)')

export function useSidebarDrawer() {
  const open = () => { isOpen.value = true }
  const close = () => { isOpen.value = false }
  const toggle = () => { isOpen.value = !isOpen.value }

  return { isOpen, isLg, open, close, toggle }
}
