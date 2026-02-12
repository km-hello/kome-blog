import request from '@/request'

// ==================== 类型定义 ====================

export interface OwnerInfo {
    nickname: string
    avatar?: string
    description?: string
}

export interface SiteStats {
    publishedPostCount: number
    draftPostCount: number
    usedTagCount: number
    unusedTagCount: number
    publishedMemoCount: number
    draftMemoCount: number
    publishedLinkCount: number
    draftLinkCount: number
}

export interface SiteInfoResponse {
    owner: OwnerInfo
    stats: SiteStats
}

// ==================== API 接口 ====================

/**
 * 获取站点公开信息
 */
export const getSiteInfoApi = (): Promise<SiteInfoResponse> => {
    return request.get<SiteInfoResponse>('/api/site/info')
}

/**
 * 检查系统是否已初始化
 */
export const checkInitializedApi = (): Promise<boolean> => {
    return request.get<boolean>('/api/site/initialized')
}