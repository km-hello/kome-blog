/**
 * useMarkdown.ts - Markdown 渲染核心组合式函数
 *
 * 功能：
 *   - 将 Markdown 文本渲染为安全的 HTML（XSS 防护：原生 HTML 标签全转义）
 *   - 代码高亮（highlight.js）+ 语言别名映射 + 语言自动检测兜底
 *   - LaTeX 数学公式（KaTeX，支持行内 $...$ 和块级 $$...$$）
 *   - Mermaid 图表（延迟加载，渲染为可点击放大的 SVG）
 *   - 可选的 TOC 目录提取（收集 h2/h3 标题，生成 id 锚点）
 *   - Markdown 源码预处理：修复后端常见的格式问题
 *
 * 使用方式：
 *   const { render, toc, renderMermaidCharts } = useMarkdown({ collectToc: true })
 *   const html = render(markdownString)     // 同步渲染 HTML
 *   await renderMermaidCharts()             // DOM 插入后异步渲染 Mermaid 图表
 */
import { ref, type Ref } from 'vue'
import { Marked } from 'marked'
import hljs from 'highlight.js'
import katex from 'katex'

/**
 * TOC 目录项（标题锚点 id、文本、层级）
 */
export interface TocItem {
    id: string
    text: string
    level: number
}

/**
 * 基础 HTML 转义：防止 <script> / <style> / <div> 等直接插入破坏 DOM 或产生安全问题
 */
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

/**
 * Mermaid 是否已完成初始化（全局单例，首次调用后不再重复初始化）
 */
let mermaidInitialized = false

/**
 * 延迟初始化 Mermaid 库。
 * 使用 dynamic import 按需加载，配置 base 主题和 slate 配色变量。
 */
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

/**
 * 渲染页面中所有未处理的 Mermaid 图表。
 * 在 v-html 插入 DOM 之后调用，查找 .mermaid-container:not(.mermaid-rendered)
 * 元素，解码 data-code 属性中的 Mermaid 源码并渲染为 SVG。
 * 渲染成功后添加 .mermaid-rendered 标记，防止重复渲染。
 */
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

/**
 * Markdown 渲染组合式函数。
 *
 * @param options.collectToc 是否收集 h2/h3 标题生成 TOC 目录（默认 false）
 * @returns render — 同步渲染函数；toc — 响应式目录数组；renderMermaidCharts — Mermaid 异步渲染
 */
export function useMarkdown(options: { collectToc?: boolean } = {}) {
    const { collectToc = false } = options
    /**
     * 响应式 TOC 目录列表（仅 collectToc 为 true 时填充）
     */
    const toc: Ref<TocItem[]> = ref([])

    /**
     * 将 Markdown 文本同步渲染为 HTML 字符串。
     * 内部会进行预处理、marked 解析（含自定义渲染器和 LaTeX 扩展）。
     *
     * @param content 原始 Markdown 文本
     * @returns 渲染后的 HTML 字符串
     */
    const render = (content: string): string => {
        /**
         * 仅在需要收集目录时重置 toc，避免在渲染循环中触发响应式更新
         */
        if (collectToc) {
            toc.value = []
        }
        content = preprocessMarkdown(content)

        const marked = new Marked({
            gfm: true,
            breaks: false,
        })

        /* ========== 自定义渲染器 ========== */
        marked.use({
            renderer: {
                /**
                 * 标题渲染：生成带 id 锚点的 <h1>~<h6>。
                 * - 从原始文本中去除 HTML 标签和 Markdown 格式符号，生成纯文本
                 * - 纯文本转为 kebab-case id（保留中文字符，用于 TOC 锚点跳转）
                 * - 当 collectToc 开启时，收集 h2/h3 到 toc 数组
                 */
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

                /**
                 * 段落：递归解析行内 token 后包裹 <p>
                 */
                paragraph(token) {
                    return `<p>${this.parser.parseInline(token.tokens)}</p>\n`
                },

                /**
                 * 加粗
                 */
                strong(token) {
                    return `<strong>${this.parser.parseInline(token.tokens)}</strong>`
                },

                /**
                 * 斜体
                 */
                em(token) {
                    return `<em>${this.parser.parseInline(token.tokens)}</em>`
                },

                /**
                 * 删除线
                 */
                del(token) {
                    return `<del>${this.parser.parseInline(token.tokens)}</del>`
                },

                /**
                 * 链接：外部链接（http 开头）自动添加 target=”_blank” 和 noopener
                 */
                link(token) {
                    const href = token.href
                    const text = this.parser.parseInline(token.tokens)
                    const isExternal = href.startsWith('http')
                    const target = isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''
                    return `<a href="${href}"${target}>${text}</a>`
                },

                /**
                 * 引用块
                 */
                blockquote(token) {
                    const body = this.parser.parse(token.tokens)
                    return `<blockquote>${body}</blockquote>\n`
                },

                /**
                 * 列表：支持有序/无序，有序列表非 1 起始时设置 start 属性
                 */
                list(token) {
                    const type = token.ordered ? 'ol' : 'ul'
                    const start = token.ordered && token.start !== 1 ? ` start="${token.start}"` : ''
                    const body = token.items.map((item) => this.listitem(item)).join('')
                    return `<${type}${start}>${body}</${type}>\n`
                },

                /**
                 * 列表项：支持 GFM 任务列表（task checkbox）。
                 * 注意：marked v17 的 parse() 只接收 1 个参数，传多参会导致运行时异常。
                 */
                listitem(token) {
                    let prefix = ''
                    if (token.task) {
                        const checked = token.checked ? ' checked' : ''
                        prefix = `<input type="checkbox"${checked} disabled> `
                    }

                    const body = this.parser.parse(token.tokens)
                    return `<li>${prefix}${body}</li>\n`
                },

                /**
                 * checkbox 已在 listitem 中处理，返回空字符串避免重复渲染
                 */
                checkbox() {
                    return ''
                },

                /**
                 * 表格：外层包裹 .table-wrapper 实现横向滚动。
                 * 支持列对齐（left/center/right），通过 inline style 设置 text-align。
                 */
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

                /**
                 * 水平分割线
                 */
                hr() {
                    return '<hr>\n'
                },

                /**
                 * 换行
                 */
                br() {
                    return '<br>'
                },

                /**
                 * 行内代码：必须 HTML 转义，否则 `<script setup>` 等内容
                 * 会被浏览器当作真实标签解析，导致后续 DOM 内容被”吞掉”。
                 */
                codespan(token) {
                    return `<code>${escapeHtml(token.text)}</code>`
                },

                /**
                 * 代码块渲染（核心逻辑最复杂的渲染器）：
                 * 1. 语言检测：优先使用 token.lang，缺失时尝试将第一行识别为语言名
                 * 2. Mermaid 特殊处理：输出占位 div（data-code 存储转义后的源码），后续由 renderMermaidCharts 异步渲染
                 * 3. 语言别名映射：vue→xml, jsx→javascript, sh→bash 等（highlight.js 不直接支持的语言）
                 * 4. highlight.js 高亮 + 复制按钮（data-code 供前端 JS 复制）+ 语言标签显示
                 */
                code(token) {
                    let code = token.text
                    let lang = (token.lang || '').trim().toLowerCase()

                    /* 兜底：后端错误格式导致 token.lang 丢失时，尝试把第一行识别为语言 */
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

                    /* Mermaid 图表：输出占位容器，由 renderMermaidCharts() 异步渲染 SVG */
                    if (lang === 'mermaid') {
                        return `<div class="mermaid-container" data-code="${escapeHtml(code)}"></div>\n`
                    }

                    /* 语言别名映射（highlight.js 不直接支持的语言） */
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

                /**
                 * 图片：懒加载 + alt 转义防 XSS，有 alt 文本时额外输出 <em> 图片说明
                 */
                image(token) {
                    const href = token.href
                    const text = token.text || ''
                    const caption = text ? `<em class="img-caption">${escapeHtml(text)}</em>` : ''
                    // alt 也要 escape，防止异常字符破坏属性
                    return `<img src="${href}" alt="${escapeHtml(text)}" loading="lazy">${caption}`
                },

                /**
                 * 原生 HTML 标签：全部转义输出，禁止注入，防止 XSS 和布局破坏
                 */
                html(token) {
                    return escapeHtml(token.text)
                },
            },
        })

        /* ========== LaTeX 数学公式扩展 ========== */
        marked.use({
            extensions: [
                /**
                 * 块级 LaTeX：匹配 $$...$$ 语法。
                 * 使用 KaTeX displayMode 渲染为居中公式块，失败时降级显示原始文本。
                 */
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
                /**
                 * 行内 LaTeX：匹配 $...$ 语法（不跨行）。
                 * 使用 KaTeX inline 模式渲染，失败时降级显示原始文本。
                 */
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