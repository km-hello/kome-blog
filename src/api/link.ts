import request from '@/request'

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

/** 公开友链查询请求（非分页，返回全量数据） */
export interface LinkPublicQueryRequest {
    keyword?: string
}

// ==================== API 接口 ====================

export const getLinksApi = (params: LinkPublicQueryRequest): Promise<LinkResponse[]> => {
    return request.get<LinkResponse[]>('/api/links', { params })
}