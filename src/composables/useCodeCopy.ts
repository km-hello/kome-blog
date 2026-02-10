import { onMounted, onUnmounted } from 'vue'

/**
 * 代码块一键复制 composable
 *
 * 配合 useMarkdown 中生成的代码块 HTML 结构使用：
 *   .code-block > .code-header > button.code-copy-btn[data-code="..."]
 *                                   ├─ span.code-lang-text   （默认显示语言名）
 *                                   └─ span.code-copied-text （复制成功后显示 "copied!"）
 *
 * 原理：通过 document 级别的事件委托监听点击，
 *       无论代码块是初始渲染还是后续动态插入（如无限滚动加载），都能自动生效。
 *
 * 使用方式：在需要代码复制功能的页面组件 <script setup> 中调用 useCodeCopy() 即可。
 */
export function useCodeCopy() {
  const handleCopyClick = (e: MouseEvent) => {
    // 利用 closest 向上查找，兼容点击按钮内部的子元素（如 span）
    const btn = (e.target as HTMLElement).closest('.code-copy-btn') as HTMLElement | null
    if (!btn) return

    // data-code 中的内容经过 HTML 转义（由 useMarkdown 的 escapeHtml 处理），
    // 这里需要反转义还原为原始代码文本
    const code = btn.getAttribute('data-code')
      ?.replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
    if (!code) return

    // 写入剪贴板，成功后添加 .copied 类触发 CSS 状态切换（语言名 → "copied!"），
    // 2 秒后自动恢复
    navigator.clipboard.writeText(code).then(() => {
      btn.classList.add('copied')
      setTimeout(() => btn.classList.remove('copied'), 2000)
    })
  }

  // 组件挂载/卸载时注册/移除监听，避免内存泄漏
  onMounted(() => document.addEventListener('click', handleCopyClick))
  onUnmounted(() => document.removeEventListener('click', handleCopyClick))
}
