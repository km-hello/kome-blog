import request from '@/request'
import type { BaseQuery, PageResult } from '@/types/api'
import type { TagResponse } from './tag'

// ==================== 类型定义 ====================

export interface PostSimpleResponse {
    id: number
    title: string
    slug: string
    summary?: string
    coverImage?: string
    views: number
    readTime?: number
    isPinned: boolean
    status: number
    createTime: string
    tags?: TagResponse[]
}

export interface PostQueryRequest extends BaseQuery {
    keyword?: string
    tagId?: number
    status?: number
    ignorePinned?: boolean
}

/** 归档 - 简略文章 */
export interface ArchiveSimplePost {
    id: number
    title: string
    slug: string
    tags?: TagResponse[]
    createTime: string
}

/** 归档 - 月份分组 */
export interface MonthGroup {
    month: number
    total: number
    posts: ArchiveSimplePost[]
}

/** 归档 - 年份分组 */
export interface PostArchiveResponse {
    year: number
    total: number
    months: MonthGroup[]
}

// ==================== API 接口 ====================

export const getPostsApi = (params: PostQueryRequest): Promise<PageResult<PostSimpleResponse>> => {
    return request.get<PageResult<PostSimpleResponse>>('/api/posts', { params })
}

export const getArchivePostsApi = (params: PostQueryRequest): Promise<PostArchiveResponse[]> => {
    return request.get<PostArchiveResponse[]>('/api/posts/archive', { params })
}