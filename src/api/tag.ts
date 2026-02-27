import request from '@/request'

// ========== 类型定义 ==========

/**
 * 标签基础信息。
 * 用于文章关联标签的简略展示。
 */
export interface TagResponse {
    id: number                 // 标签 ID
    name: string               // 标签名称
}

/**
 * 标签信息（含文章数量统计）。
 * 用于标签列表页，展示每个标签关联的文章数量。
 */
export interface TagPostCountResponse {
    id: number                 // 标签 ID
    name: string               // 标签名称
    postCount: number          // 关联文章数量
    createTime: string         // 创建时间（ISO 格式）
}

// ========== API 接口 ==========

/**
 * 获取所有标签列表（含文章数量）。
 * 返回所有标签及其关联的文章数量，用于侧边栏标签云展示。
 *
 * @returns 标签列表（含文章数量统计）。
 */
export const getTagsApi = (): Promise<TagPostCountResponse[]> => {
    return request.get<TagPostCountResponse[]>('/api/tags')
}