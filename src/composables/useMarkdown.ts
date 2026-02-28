/**
 * useMarkdown.ts - Markdown 渲染核心组合式函数
 *
 * 功能：Markdown → HTML（XSS 防护）、代码高亮、LaTeX 数学公式、Mermaid 图表、可选 TOC 提取
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

/** TOC 目录项 */
export interface TocItem {
    id: string
    text: string
    level: number
}

/** HTML 转义：防止标签注入 */
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

/** Mermaid 是否已初始化（全局单例） */
let mermaidInitialized = false

/** 延迟初始化 Mermaid（dynamic import 按需加载） */
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
 * 查找 .mermaid-container:not(.mermaid-rendered)，解码 data-code 中的源码并渲染为 SVG。
 * 成功后添加 .mermaid-rendered 防止重复渲染。
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
 * Markdown 渲染组合式函数
 *
 * @param options.collectToc 是否收集 h2/h3 生成 TOC（默认 false）
 */
export function useMarkdown(options: { collectToc?: boolean } = {}) {
    const { collectToc = false } = options
    /** 响应式 TOC 目录列表 */
    const toc: Ref<TocItem[]> = ref([])

    /**
     * 将 Markdown 文本同步渲染为 HTML 字符串
     */
    const render = (content: string): string => {
        /* 收集目录时重置 toc，避免渲染循环中触发响应式更新 */
        if (collectToc) {
            toc.value = []
        }
        content = preprocessMarkdown(content)

        const marked = new Marked({
            gfm: true,
            breaks: false,
        })

        /* 自定义渲染器 */
        marked.use({
            renderer: {
                /**
                 * 标题渲染：生成带 id 锚点的标题。
                 * 纯文本转 kebab-case id（保留中文），collectToc 时收集 h2/h3 到 toc
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

                /** 段落 */
                paragraph(token) {
                    return `<p>${this.parser.parseInline(token.tokens)}</p>\n`
                },

                /** 加粗 */
                strong(token) {
                    return `<strong>${this.parser.parseInline(token.tokens)}</strong>`
                },

                /** 斜体 */
                em(token) {
                    return `<em>${this.parser.parseInline(token.tokens)}</em>`
                },

                /** 删除线 */
                del(token) {
                    return `<del>${this.parser.parseInline(token.tokens)}</del>`
                },

                /** 链接：外部链接自动 target=”_blank” */
                link(token) {
                    const href = token.href
                    const text = this.parser.parseInline(token.tokens)
                    const isExternal = href.startsWith('http')
                    const target = isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''
                    return `<a href="${href}"${target}>${text}</a>`
                },

                /** 引用块 */
                blockquote(token) {
                    const body = this.parser.parse(token.tokens)
                    return `<blockquote>${body}</blockquote>\n`
                },

                /** 列表：有序列表非 1 起始时设 start 属性 */
                list(token) {
                    const type = token.ordered ? 'ol' : 'ul'
                    const start = token.ordered && token.start !== 1 ? ` start="${token.start}"` : ''
                    const body = token.items.map((item) => this.listitem(item)).join('')
                    return `<${type}${start}>${body}</${type}>\n`
                },

                /**
                 * 列表项：支持 GFM task checkbox。
                 * 注意：marked v17 的 parse() 只接收 1 个参数
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

                /** checkbox 已在 listitem 中处理 */
                checkbox() {
                    return ''
                },

                /** 表格：外层 .table-wrapper 实现横向滚动，支持列对齐 */
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

                /** 水平分割线 */
                hr() {
                    return '<hr>\n'
                },

                /** 换行 */
                br() {
                    return '<br>'
                },

                /** 行内代码：必须转义，否则 `<script setup>` 等会被浏览器解析为真实标签 */
                codespan(token) {
                    return `<code>${escapeHtml(token.text)}</code>`
                },

                /**
                 * 代码块渲染（最复杂的渲染器）：
                 * 1. 语言检测：优先 token.lang，缺失时尝试首行识别
                 * 2. Mermaid：输出占位 div（data-code），由 renderMermaidCharts 异步渲染
                 * 3. 语言别名映射：vue→xml, jsx→javascript, sh→bash 等
                 * 4. highlight.js 高亮 + 复制按钮 + 语言标签
                 */
                code(token) {
                    let code = token.text
                    let lang = (token.lang || '').trim().toLowerCase()

                    /* 兜底：token.lang 丢失时，尝试把第一行识别为语言 */
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

                    /* Mermaid：输出占位容器，由 renderMermaidCharts() 异步渲染 */
                    if (lang === 'mermaid') {
                        return `<div class="mermaid-container" data-code="${escapeHtml(code)}"></div>\n`
                    }

                    /* 语言别名映射 */
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

                /** 图片：懒加载，有 alt 时输出图片说明 */
                image(token) {
                    const href = token.href
                    const text = token.text || ''
                    const caption = text ? `<em class="img-caption">${escapeHtml(text)}</em>` : ''
                    // alt 也要 escape，防止属性注入
                    return `<img src="${href}" alt="${escapeHtml(text)}" loading="lazy">${caption}`
                },

                /** 原生 HTML 标签：全部转义，防止 XSS */
                html(token) {
                    return escapeHtml(token.text)
                },
            },
        })

        /* LaTeX 数学公式扩展 */
        marked.use({
            extensions: [
                /** 块级 LaTeX：匹配 $$...$$ 语法，KaTeX displayMode 渲染 */
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
                /** 行内 LaTeX：匹配 $...$ 语法（不跨行），KaTeX inline 渲染 */
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