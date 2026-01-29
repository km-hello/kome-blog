import request from '@/request'
import type { BaseQuery } from '@/types/api'

// ==================== 类型定义 ====================

export interface LinkResponse {
    id: number
    name: string
    url: string
    avatar?: string
    description?: string
    status: number
    createTime: string
}

export interface LinkQueryRequest extends BaseQuery {
    keyword?: string
    status?: number
}

// ==================== API 接口 ====================

export const getLinksApi = (params: LinkQueryRequest): Promise<LinkResponse[]> => {
    return request.get<LinkResponse[]>('/api/links', { params })
}