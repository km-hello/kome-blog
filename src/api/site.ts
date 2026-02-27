import request from '@/request'

/* ========== 类型定义 ========== */

/**
 * 社交链接信息。
 * 站长的社交媒体账号信息，用于个人资料卡片展示。
 */
export interface SocialLink {
    platform: string           // 平台标识（如 github, twitter, email 等）
    url: string                // 链接地址
}

/**
 * 技能项信息。
 * 站长的技术技能信息，用于关于页和侧边栏技能卡片展示。
 */
export interface SkillItem {
    name: string               // 技能名称
    level: number              // 熟练度: 1=了解(Basic), 2=熟悉(Familiar), 3=精通(Proficient)
    order?: number             // 排序权重
}

/**
 * 站长个人信息。
 * 包含站长资料、社交链接和技能列表等信息。
 */
export interface OwnerInfo {
    nickname: string           // 昵称
    avatar?: string            // 头像 URL
    description?: string       // 个人简介
    createdAt: string          // 站点创建时间（ISO 格式）
    socialLinks?: SocialLink[] // 社交链接列表
    skills?: SkillItem[]       // 技能列表
}

/**
 * 站点统计数据。
 * 包含文章、标签、动态、友链各维度的数量统计。
 */
export interface SiteStats {
    publishedPostCount: number   // 已发布文章数
    draftPostCount: number       // 草稿文章数
    usedTagCount: number         // 已使用标签数
    unusedTagCount: number       // 未使用标签数
    publishedMemoCount: number   // 已发布动态数
    draftMemoCount: number       // 草稿动态数
    publishedLinkCount: number   // 已审核友链数
    draftLinkCount: number       // 待审核友链数
}

/**
 * 站点公开信息。
 * 聚合站长个人信息和站点统计数据，作为站点信息接口的响应结构。
 */
export interface SiteInfoResponse {
    owner: OwnerInfo           // 站长个人信息
    stats: SiteStats           // 站点统计数据
}

/* ========== API 接口 ========== */

/**
 * 获取站点公开信息。
 * 返回站长个人资料和站点统计数据，用于侧边栏和关于页展示。
 *
 * @returns 站点公开信息。
 */
export const getSiteInfoApi = (): Promise<SiteInfoResponse> => {
    return request.get<SiteInfoResponse>('/api/site/info')
}

/**
 * 检查系统是否已初始化。
 * 判断系统是否完成首次配置，未初始化时将引导用户进入初始设置页。
 *
 * @returns 是否已初始化。
 */
export const checkInitializedApi = (): Promise<boolean> => {
    return request.get<boolean>('/api/site/initialized')
}