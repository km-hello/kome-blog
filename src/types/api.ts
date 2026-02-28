/**
 * types/api.ts - API 通用类型定义
 *
 * 定义后端统一响应信封（Result / PageResult）及基础查询参数，
 * 供各 API 模块复用。
 */

/**
 * 后端统一响应结构。
 * 所有 API 请求的响应都会被包装在此结构中，由响应拦截器统一解包。
 */
export interface Result<T = any> {
    code: number;              // 业务状态码: 200=成功
    message: string;           // 响应消息
    data: T;                   // 响应数据
    timestamp: number;         // 服务端时间戳
}

/**
 * 分页数据结构。
 * 后端返回的分页查询结果，包含当前页数据和分页元信息。
 */
export interface PageResult<T> {
    records: T[];              // 当前页数据列表
    total: number;             // 总记录数
    size: number;              // 每页条数
    current: number;           // 当前页码
}

/**
 * 基础分页查询参数。
 * 所有分页查询请求的公共参数，具体查询接口可扩展此接口。
 */
export interface BaseQuery {
    pageNum: number;           // 页码（从 1 开始）
    pageSize: number;          // 每页条数
}