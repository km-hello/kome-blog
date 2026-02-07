import request from '@/request'
import type { BaseQuery, PageResult } from '@/types/api'

// ==================== 类型定义 ====================

export interface MemoResponse {
    id: number
    content: string
    isPinned: boolean
    status: number
    createTime: string
}

export interface MemoQueryRequest extends BaseQuery {
    keyword?: string
    status?: number
    ignorePinned?: boolean
}

export interface MemoStatsResponse {
    totalCount: number
    totalWords: number
    thisMonthCount: number
    latestDate: string | null
}

// ==================== API 接口 ====================

export const getMemosApi = (params: MemoQueryRequest): Promise<PageResult<MemoResponse>> => {
    return request.get<PageResult<MemoResponse>>('/api/memos', { params })
}

export const getLatestMemosApi = (limit: number = 2): Promise<MemoResponse[]> => {
    return request.get<MemoResponse[]>('/api/memos/latest', { params: { limit } })
}

export const getMemoStatsApi = (): Promise<MemoStatsResponse> => {
    return request.get<MemoStatsResponse>('/api/memos/stats')
}