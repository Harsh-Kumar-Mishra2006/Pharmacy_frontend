// src/api/Api.ts
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import { type ApiResponse } from '../types';

class Api {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL:
        import.meta.env.VITE_API_URL ||
        'https://pharmacy-backend-up5t.onrender.com/api',
      timeout: 30000,
      // ⚠️ DO NOT set a global Content-Type here.
      // Axios detects the correct one per request:
      //   - plain object / array → application/json
      //   - FormData            → multipart/form-data with boundary
      //   - URLSearchParams     → application/x-www-form-urlencoded
    });

    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Belt-and-suspenders: if the body is FormData, remove any
        // Content-Type that may have been inherited from defaults.
        // The browser will set multipart/form-data + boundary itself.
        if (config.data instanceof FormData) {
          delete config.headers['Content-Type'];
          delete config.headers['content-type'];
        }

        return config;
      },
      (error) => Promise.reject(error),
    );

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          if (
            window.location.pathname !== '/login' &&
            window.location.pathname !== '/register'
          ) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      },
    );
  }

  public async get<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.api.get(
        url,
        config,
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.api.post(
        url,
        data,
        config,
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.api.put(
        url,
        data,
        config,
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.api.delete(
        url,
        config,
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.api.patch(
        url,
        data,
        config,
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.response) {
      const message = error.response.data?.message || 'An error occurred';
      const errorObj = new Error(message);
      (errorObj as any).status = error.response.status;
      (errorObj as any).data = error.response.data;
      return errorObj;
    } else if (error.request) {
      return new Error(
        'No response from server. Please check your connection.',
      );
    }
    return new Error(error.message || 'An unexpected error occurred');
  }

  public setAuthToken(token: string | null): void {
    if (token) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.api.defaults.headers.common['Authorization'];
    }
  }

  public removeAuthToken(): void {
    delete this.api.defaults.headers.common['Authorization'];
  }
}

export default new Api();