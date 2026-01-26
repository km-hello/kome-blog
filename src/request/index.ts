import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from 'axios';
import { toast } from 'vue-sonner';
import type { Result } from '@/types/api';

/**
 * Axios 实例配置
 */
const service: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * 响应拦截器
 * 统一处理响应数据和错误
 */
service.interceptors.response.use(
    (response: AxiosResponse) => {
        const res = response.data as Result;

        // 业务成功
        if (res.code === 200) {
            return res.data;
        }

        // 业务失败
        const errorMessage = res.message || '请求失败';
        toast.error(errorMessage);
        return Promise.reject(new Error(errorMessage));
    },
    (error: AxiosError) => {
        let message = '请求失败';

        if (error.response?.data) {
            const res = error.response.data as Result;
            message = res.message || message;
        } else if (error.message === 'Network Error') {
            message = '网络连接失败';
        } else if (error.code === 'ECONNABORTED') {
            message = '请求超时';
        }

        toast.error(message);
        return Promise.reject(error);
    }
);

/**
 * Request 类封装 HTTP 请求方法
 */
class Request {
    get<T = any>(url: string, config?: any): Promise<T> {
        return service.get(url, config);
    }

    post<T = any>(url: string, data?: any, config?: any): Promise<T> {
        return service.post(url, data, config);
    }
}

export default new Request();