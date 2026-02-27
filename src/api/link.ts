import request from '@/request'

/* ========== 类型定义 ========== */

/**
 * 友链信息。
 * 用于友情链接页的站点卡片展示。
 */
export interface LinkResponse {
    id: number                 // 友链 ID
    name: string               // 站点名称
    url: string                // 站点 URL
    avatar?: string            // 站点头像 URL
    description?: string       // 站点描述
    status: number             // 状态: 0=草稿(Draft), 1=公开(Published)
    createTime: string         // 创建时间（ISO 格式）
}

/**
 * 公开友链查询请求（非分页，返回全量数据）。
 * 用于前台友链页按关键词搜索已审核的友链。
 */
export interface LinkPublicQueryRequest {
    keyword?: string           // 搜索关键词
}

/* ========== API 接口 ========== */

/**
 * 获取公开友链列表。
 * 返回所有已审核的友链数据，支持关键词搜索。
 *
 * @param params 查询参数，支持关键词筛选。
 * @returns 友链列表。
 */
export const getLinksApi = (params: LinkPublicQueryRequest): Promise<LinkResponse[]> => {
    return request.get<LinkResponse[]>('/api/links', { params })
}