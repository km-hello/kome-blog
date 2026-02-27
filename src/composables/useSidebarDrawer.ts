import { ref } from 'vue'
import { useMediaQuery } from '@vueuse/core'

/** 移动端侧边栏抽屉的全局状态（单例模式） */
const isOpen = ref(false)

/** 是否为桌面端（>= lg 1024px） */
const isLg = useMediaQuery('(min-width: 1024px)')

/**
 * 侧边栏抽屉组合式函数。
 * 管理移动端侧边栏的开关状态，在 lg 断点以下使用抽屉式导航。
 *
 * @returns isOpen - 抽屉是否打开
 * @returns isLg - 是否为桌面端（>= 1024px）
 * @returns open - 打开抽屉
 * @returns close - 关闭抽屉
 * @returns toggle - 切换抽屉状态
 */
export function useSidebarDrawer() {
  const open = () => { isOpen.value = true }    // 打开侧边栏抽屉
  const close = () => { isOpen.value = false }  // 关闭侧边栏抽屉
  const toggle = () => { isOpen.value = !isOpen.value }  // 切换侧边栏抽屉状态

  return { isOpen, isLg, open, close, toggle }
}
