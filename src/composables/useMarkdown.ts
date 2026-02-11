// src/composables/useMarkdown.ts
import { ref, type Ref } from 'vue'
import { Marked } from 'marked'
import hljs from 'highlight.js'
import katex from 'katex'

export interface TocItem {
    id: string
    text: string
    level: number
}

/** 基础 HTML 转义：防止 <script> / <style> / <div> 等直接插入破坏 DOM 或产生安全问题 */
function escapeHtml(s: string): string {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

/**
 * 预处理 Markdown 内容：
 * 1) 修复后端返回的 fenced code block 写法：``` \n lang \n -> ```lang\n
 * 2) 修复标题缺空格：##标题 -> ## 标题（但不处理 ### 这种连续#号的情况）
 * 3) 修复 "## Key Changes- ..." 这种标题后直接连列表符号的情况
 */
function preprocessMarkdown(content: string): string {
    // 1) ```\nlang\n -> ```lang\n
    content = content.replace(/```[ \t]*\n([A-Za-z0-9_-]+)[ \t]*\n/g, '```$1\n')

    // 2) 标题补空格：##标题 -> ## 标题
    // 只在 # 后面紧跟非 # 非空白字符时添加空格
    content = content.replace(/^(#{1,6})([^#\s])/gm, '$1 $2')

    // 3) 修复标题后直接连列表符号：## Key Changes- xxx -> ## Key Changes\n\n- xxx
    content = content.replace(/^(#{1,6}\s+[^-\n]+)(- )/gm, '$1\n\n$2')

    return content
}

// Mermaid 初始化（延迟加载）
let mermaidInitialized = false
const initMermaid = async () => {
    if (mermaidInitialized) return
    const mermaid = (await import('mermaid')).default
    mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables: {
            primaryColor: '#f1f5f9',
            primaryTextColor: '#1e293b',
            primaryBorderColor: '#cbd5e1',
            lineColor: '#64748b',
        },
    })
    mermaidInitialized = true
}

// 渲染 Mermaid 图表（在 v-html 插入 DOM 后调用）
export const renderMermaidCharts = async () => {
    await initMermaid()
    const mermaid = (await import('mermaid')).default
    const elements = document.querySelectorAll<HTMLElement>('.mermaid-container:not(.mermaid-rendered)')

    for (const el of elements) {
        const code = el.getAttribute('data-code')
        if (!code) continue

        try {
            const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`
            // data-code 存的是 escaped html，需要解码回原字符串
            const decodedCode = code
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")

            const { svg } = await mermaid.render(id, decodedCode)
            el.innerHTML = svg
            el.classList.add('mermaid-rendered')
        } catch (e) {
            console.error('Mermaid render error:', e)
            el.innerHTML = `<pre class="text-red-500 text-sm p-4">Mermaid 图表渲染失败</pre>`
        }
    }
}

export function useMarkdown(options: { collectToc?: boolean } = {}) {
    const { collectToc = false } = options
    const toc: Ref<TocItem[]> = ref([])

    const render = (content: string): string => {
        // 仅在需要收集目录时重置 toc，避免在渲染循环中触发响应式更新
        if (collectToc) {
            toc.value = []
        }
        content = preprocessMarkdown(content)

        const marked = new Marked({
            gfm: true,
            breaks: false,
        })

        // ========= 渲染器 =========
        marked.use({
            renderer: {
                heading(token) {
                    const depth = token.depth
                    const rawText = token.text
                    const inner = this.parser.parseInline(token.tokens)
                    const plainText = rawText.replace(/<[^>]+>/g, '').replace(/[*_`]/g, '')
                    const id = plainText
                        .toLowerCase()
                        .replace(/\s+/g, '-')
                        .replace(/[^\w\-\u4e00-\u9fa5]+/g, '')

                    if (collectToc && (depth === 2 || depth === 3)) {
                        toc.value.push({ id, text: plainText, level: depth })
                    }

                    return `<h${depth} id="${id}">${inner}</h${depth}>\n`
                },

                paragraph(token) {
                    return `<p>${this.parser.parseInline(token.tokens)}</p>\n`
                },

                strong(token) {
                    return `<strong>${this.parser.parseInline(token.tokens)}</strong>`
                },

                em(token) {
                    return `<em>${this.parser.parseInline(token.tokens)}</em>`
                },

                del(token) {
                    return `<del>${this.parser.parseInline(token.tokens)}</del>`
                },

                link(token) {
                    const href = token.href
                    const text = this.parser.parseInline(token.tokens)
                    const isExternal = href.startsWith('http')
                    const target = isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''
                    return `<a href="${href}"${target}>${text}</a>`
                },

                blockquote(token) {
                    const body = this.parser.parse(token.tokens)
                    return `<blockquote>${body}</blockquote>\n`
                },

                list(token) {
                    const type = token.ordered ? 'ol' : 'ul'
                    const start = token.ordered && token.start !== 1 ? ` start="${token.start}"` : ''
                    const body = token.items.map((item) => this.listitem(item)).join('')
                    return `<${type}${start}>${body}</${type}>\n`
                },

                listitem(token) {
                    let prefix = ''
                    if (token.task) {
                        const checked = token.checked ? ' checked' : ''
                        prefix = `<input type="checkbox"${checked} disabled> `
                    }

                    // marked v17: parse() 只接收 1 个参数，传多参会导致运行时异常，整篇渲染中断
                    const body = this.parser.parse(token.tokens)
                    return `<li>${prefix}${body}</li>\n`
                },

                checkbox() {
                    // checkbox 已在 listitem 中处理，这里返回空避免重复
                    return ''
                },

                table(token) {
                    const header = token.header
                        .map((cell, i) => {
                            const content = this.parser.parseInline(cell.tokens)
                            const align = token.align[i]
                            const style = align ? ` style="text-align: ${align}"` : ''
                            return `<th${style}>${content}</th>`
                        })
                        .join('')

                    const body = token.rows
                        .map((row) => {
                            const cells = row
                                .map((cell, i) => {
                                    const content = this.parser.parseInline(cell.tokens)
                                    const align = token.align[i]
                                    const style = align ? ` style="text-align: ${align}"` : ''
                                    return `<td${style}>${content}</td>`
                                })
                                .join('')
                            return `<tr>${cells}</tr>`
                        })
                        .join('\n')

                    return `<div class="table-wrapper"><table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table></div>\n`
                },

                hr() {
                    return '<hr>\n'
                },

                br() {
                    return '<br>'
                },

                // 关键修复：行内代码必须 escape，否则 `<script setup>` 会被当作真实 script 标签，后续内容全部“吞掉”
                codespan(token) {
                    return `<code>${escapeHtml(token.text)}</code>`
                },

                code(token) {
                    let code = token.text
                    let lang = (token.lang || '').trim().toLowerCase()

                    // 兜底：后端错误格式导致 token.lang 丢失时，尝试把第一行识别为语言
                    if (!lang && code) {
                        const firstLine = (code.split('\n')[0] ?? '').trim().toLowerCase()
                        const possibleLangs = new Set([
                            'javascript','typescript','vue','css','bash','sql','json','mermaid','html',
                            'python','java','go','rust','shell','sh','jsx','tsx','scss','less','yaml','yml','xml',
                        ])
                        if (possibleLangs.has(firstLine)) {
                            lang = firstLine
                            code = code.split('\n').slice(1).join('\n')
                        }
                    }

                    if (lang === 'mermaid') {
                        return `<div class="mermaid-container" data-code="${escapeHtml(code)}"></div>\n`
                    }

                    // 语言别名映射（highlight.js 不直接支持的语言）
                    const langAliases: Record<string, string> = {
                        vue: 'xml',
                        jsx: 'javascript',
                        tsx: 'typescript',
                        sh: 'bash',
                        shell: 'bash',
                        yml: 'yaml',
                    }
                    const hljsLang = langAliases[lang] || lang
                    const language = hljsLang && hljs.getLanguage(hljsLang) ? hljsLang : 'plaintext'
                    const displayLang = lang || (language !== 'plaintext' ? language : 'text')
                    const highlighted = hljs.highlight(code, { language }).value
                    const copyBtn = `<button class="code-copy-btn" data-code="${escapeHtml(code)}" title="复制代码"><span class="code-lang-text">${displayLang}</span><span class="code-copied-text">copied!</span></button>`
                    return `<div class="code-block"><div class="code-header">${copyBtn}</div><pre><code class="hljs language-${language}">${highlighted}</code></pre></div>\n`
                },

                image(token) {
                    const href = token.href
                    const text = token.text || ''
                    const caption = text ? `<em class="img-caption">${escapeHtml(text)}</em>` : ''
                    // alt 也要 escape，防止异常字符破坏属性
                    return `<img src="${href}" alt="${escapeHtml(text)}" loading="lazy">${caption}`
                },

                // 禁用 markdown 中的原生 HTML，防止 XSS 和布局破坏
                html(token) {
                    return escapeHtml(token.text)
                },
            },
        })

        // ========= LaTeX 扩展 =========
        marked.use({
            extensions: [
                {
                    name: 'latexBlock',
                    level: 'block',
                    start(src: string) {
                        return src.indexOf('$$')
                    },
                    tokenizer(src: string) {
                        const match = src.match(/^\$\$([\s\S]+?)\$\$/)
                        if (!match) return undefined
                        return { type: 'latexBlock', raw: match[0], text: (match[1] ?? '').trim() }
                    },
                    renderer(token) {
                        try {
                            return `<div class="katex-display">${katex.renderToString(token.text, {
                                displayMode: true,
                                throwOnError: false,
                            })}</div>\n`
                        } catch {
                            return `<pre class="text-red-500">${escapeHtml(token.text)}</pre>\n`
                        }
                    },
                },
                {
                    name: 'latexInline',
                    level: 'inline',
                    start(src: string) {
                        return src.indexOf('$')
                    },
                    tokenizer(src: string) {
                        const match = src.match(/^\$([^$\n]+?)\$/)
                        if (!match) return undefined
                        return { type: 'latexInline', raw: match[0], text: match[1] }
                    },
                    renderer(token) {
                        try {
                            return katex.renderToString(token.text, {
                                displayMode: false,
                                throwOnError: false,
                            })
                        } catch {
                            return `<code class="text-red-500">${escapeHtml(token.text)}</code>`
                        }
                    },
                },
            ],
        })

        return marked.parse(content) as string
    }

    return {
        render,
        toc,
        renderMermaidCharts,
    }
}