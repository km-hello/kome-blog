import request from '@/request'

// ==================== 类型定义 ====================

export interface TagResponse {
    id: number
    name: string
}

export interface TagPostCountResponse {
    id: number
    name: string
    postCount: number
    createTime: string
}

// ==================== API 接口 ====================

export const getTagsApi = (): Promise<TagPostCountResponse[]> => {
    return request.get<TagPostCountResponse[]>('/api/tags')
}