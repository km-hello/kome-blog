import request from '@/request'
import type { BaseQuery, PageResult } from '@/types/api'

/* ========== 类型定义 ========== */

/**
 * 动态信息。
 * 类似微博/说说的短内容，用于动态列表展示。
 */
export interface MemoResponse {
    id: number                 // 动态 ID
    content: string            // 动态内容（Markdown 格式）
    isPinned: boolean          // 是否置顶
    status: number             // 状态: 0=草稿(Draft), 1=已发布(Published)
    createTime: string         // 创建时间（ISO 格式）
}

/**
 * 动态分页查询请求参数。
 * 继承基础分页参数，支持关键词搜索和状态筛选。
 */
export interface MemoQueryRequest extends BaseQuery {
    keyword?: string           // 搜索关键词
    status?: number            // 状态筛选: 0=草稿(Draft), 1=已发布(Published)
    ignorePinned?: boolean     // 是否排除置顶动态
}

/**
 * 动态统计信息。
 * 包含动态总数、总字数、本月发布数等聚合数据。
 */
export interface MemoStatsResponse {
    totalCount: number         // 动态总数
    totalWords: number         // 总字数
    thisMonthCount: number     // 本月发布数量
    latestDate: string | null  // 最近一条动态的发布时间
}

/* ========== API 接口 ========== */

/**
 * 获取动态分页列表。
 * 根据查询参数返回符合条件的动态分页数据。
 *
 * @param params 查询参数，包含分页信息、关键词及状态筛选。
 * @returns 动态分页数据。
 */
export const getMemosApi = (params: MemoQueryRequest): Promise<PageResult<MemoResponse>> => {
    return request.get<PageResult<MemoResponse>>('/api/memos', { params })
}

/**
 * 获取最新动态列表。
 * 返回指定数量的最新已发布动态，用于侧边栏展示。
 *
 * @param limit 返回数量，默认 2 条。
 * @returns 最新动态数组。
 */
export const getLatestMemosApi = (limit: number = 2): Promise<MemoResponse[]> => {
    return request.get<MemoResponse[]>('/api/memos/latest', { params: { limit } })
}

/**
 * 获取动态统计信息。
 * 返回动态相关的聚合统计数据（总数、字数、本月数量等）。
 *
 * @returns 动态统计数据。
 */
export const getMemoStatsApi = (): Promise<MemoStatsResponse> => {
    return request.get<MemoStatsResponse>('/api/memos/stats')
}