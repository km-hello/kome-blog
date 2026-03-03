import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from 'axios';
import { toast } from 'vue-sonner';
import type { Result } from '@/types/api';
import i18n, { getAcceptLanguage } from '@/i18n';

/**
 * Axios 实例配置。
 * - baseURL: 从环境变量 VITE_API_BASE_URL 读取，默认为空（同源）
 * - timeout: 15 秒超时
 */
const service: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * 请求拦截器。
 * 设置 Accept-Language header，告知服务端当前语言偏好。
 */
service.interceptors.request.use((config) => {
    config.headers['Accept-Language'] = getAcceptLanguage();
    return config;
});

/**
 * 响应拦截器。
 * 统一处理响应数据解包和错误提示。
 */
service.interceptors.response.use(
    (response: AxiosResponse) => {
        const res = response.data as Result;

        // 1. 业务成功：解包 data 字段直接返回
        if (res.code === 200) {
            return res.data;
        }

        // 2. 业务失败：提取错误消息并 toast 提示
        const errorMessage = res.message || i18n.global.t('error.requestFailed');
        toast.error(errorMessage);
        return Promise.reject(new Error(errorMessage));
    },
    (error: AxiosError) => {
        // 3. 网络/HTTP 错误：根据错误类型生成友好提示
        let message = i18n.global.t('error.requestFailed');

        if (error.response?.data) {
            // 服务端返回了错误响应体
            const res = error.response.data as Result;
            message = res.message || message;
        } else if (error.message === 'Network Error') {
            message = i18n.global.t('error.networkError');
        } else if (error.code === 'ECONNABORTED') {
            message = i18n.global.t('error.timeout');
        }

        toast.error(message);
        return Promise.reject(error);
    }
);

/**
 * HTTP 请求封装类。
 * 对 Axios 实例进行二次封装，提供类型安全的请求方法。
 */
class Request {
    /**
     * 发送 GET 请求。
     *
     * @param url 请求路径。
     * @param config Axios 请求配置（如 params、headers 等）。
     * @returns 响应数据（已由拦截器解包）。
     */
    get<T = any>(url: string, config?: any): Promise<T> {
        return service.get(url, config);
    }
}

export default new Request();
