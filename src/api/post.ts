import request from '@/request'
import type { BaseQuery, PageResult } from '@/types/api'
import type { TagResponse } from './tag'

/* ========== 类型定义 ========== */

/**
 * 文章简略信息（用于列表展示）。
 * 包含文章基本信息，用于首页文章列表和归档页的数据展示。
 */
export interface PostSimpleResponse {
    id: number                 // 文章 ID
    title: string              // 文章标题
    slug: string               // URL 友好的文章标识
    summary?: string           // 文章摘要
    coverImage?: string        // 封面图 URL
    views: number              // 浏览量
    readTime?: number          // 预计阅读时间（分钟）
    isPinned: boolean          // 是否置顶
    status: number             // 状态: 0=草稿(Draft), 1=已发布(Published)
    createTime: string         // 创建时间（ISO 格式）
    tags?: TagResponse[]       // 关联标签列表
}

/**
 * 文章导航信息（上一篇/下一篇）。
 * 用于文章详情页底部的前后文章导航。
 */
export interface PostNavigation {
    id: number                 // 文章 ID
    title: string              // 文章标题
    slug: string               // URL 友好的文章标识
}

/**
 * 文章详情信息。
 * 包含文章完整内容及上下篇导航，用于文章详情页展示。
 */
export interface PostDetailResponse {
    id: number                 // 文章 ID
    title: string              // 文章标题
    slug: string               // URL 友好的文章标识
    summary?: string           // 文章摘要
    content: string            // 文章正文（Markdown 格式）
    coverImage?: string        // 封面图 URL
    views: number              // 浏览量
    readTime?: number          // 预计阅读时间（分钟）
    isPinned: boolean          // 是否置顶
    status: number             // 状态: 0=草稿(Draft), 1=已发布(Published)
    createTime: string         // 创建时间（ISO 格式）
    updateTime: string         // 更新时间（ISO 格式）
    tags?: TagResponse[]       // 关联标签列表
    previous?: PostNavigation | null  // 上一篇文章导航
    next?: PostNavigation | null      // 下一篇文章导航
}

/**
 * 文章分页查询请求参数。
 * 继承基础分页参数，支持关键词搜索和标签筛选。
 */
export interface PostQueryRequest extends BaseQuery {
    keyword?: string           // 搜索关键词
    tagId?: number             // 标签 ID 筛选
    status?: number            // 状态筛选: 0=草稿(Draft), 1=已发布(Published)
    ignorePinned?: boolean     // 是否排除置顶文章
}

/**
 * 归档查询请求（非分页，返回全量数据）。
 * 用于归档页按年月分组展示所有已发布文章。
 */
export interface PostArchiveQueryRequest {
    keyword?: string           // 搜索关键词
    tagId?: number             // 标签 ID 筛选
}

/**
 * 归档文章简略信息。
 * 归档列表中每篇文章的基本信息。
 */
export interface ArchiveSimplePost {
    id: number                 // 文章 ID
    title: string              // 文章标题
    slug: string               // URL 友好的文章标识
    tags?: TagResponse[]       // 关联标签列表
    createTime: string         // 创建时间（ISO 格式）
}

/**
 * 归档月份分组。
 * 按月份聚合的文章列表，用于归档页的时间线展示。
 */
export interface MonthGroup {
    month: number              // 月份（1-12）
    total: number              // 该月文章数量
    posts: ArchiveSimplePost[] // 该月文章列表
}

/**
 * 归档年份分组。
 * 按年份聚合的月份分组，归档接口的顶层响应结构。
 */
export interface PostArchiveResponse {
    year: number               // 年份
    total: number              // 该年文章数量
    months: MonthGroup[]       // 月份分组列表
}

/* ========== API 接口 ========== */

/**
 * 获取文章分页列表。
 * 根据查询参数返回符合条件的文章分页数据。
 *
 * @param params 查询参数，包含分页信息、关键词及标签筛选。
 * @returns 文章分页数据。
 */
export const getPostsApi = (params: PostQueryRequest): Promise<PageResult<PostSimpleResponse>> => {
    return request.get<PageResult<PostSimpleResponse>>('/api/posts', { params })
}

/**
 * 获取文章归档列表。
 * 返回按年月分组的全量已发布文章数据，用于归档页展示。
 *
 * @param params 查询参数，支持关键词和标签筛选。
 * @returns 按年份分组的归档数据数组。
 */
export const getArchivePostsApi = (params: PostArchiveQueryRequest): Promise<PostArchiveResponse[]> => {
    return request.get<PostArchiveResponse[]>('/api/posts/archive', { params })
}

/**
 * 获取文章详情。
 * 根据文章 slug 获取完整文章内容及上下篇导航信息。
 *
 * @param slug 文章的 URL 友好标识。
 * @returns 文章详情数据。
 */
export const getPostDetailApi = (slug: string): Promise<PostDetailResponse> => {
    return request.get<PostDetailResponse>(`/api/posts/${slug}`)
}