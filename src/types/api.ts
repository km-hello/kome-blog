/**
 * 后端统一响应结构
 */
export interface Result<T = any> {
    code: number;
    message: string;
    data: T;
    timestamp: number;
}

/**
 * 分页数据结构
 */
export interface PageResult<T> {
    records: T[];
    total: number;
    size: number;
    current: number;
}

/**
 * 基础分页查询参数
 */
export interface BaseQuery {
    pageNum: number;
    pageSize: number;
}