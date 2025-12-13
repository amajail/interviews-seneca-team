/**
 * HTTP Client
 * Configured Axios instance for API communication
 * Implements interceptors for request/response handling
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG } from '../../constants';
import type { ApiResponse, ApiError } from '../../models';

class HttpClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => {
        // Add authentication token if available
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request timestamp
        config.headers['X-Request-Time'] = new Date().toISOString();

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error: AxiosError) => {
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      const data = error.response.data as ApiResponse<unknown>;
      return (
        data.error || {
          code: `HTTP_${error.response.status}`,
          message: error.message,
        }
      );
    }

    if (error.request) {
      return {
        code: 'NETWORK_ERROR',
        message: 'No response received from server',
      };
    }

    return {
      code: 'REQUEST_ERROR',
      message: error.message,
    };
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return this.extractData(response);
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return this.extractData(response);
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return this.extractData(response);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return this.extractData(response);
  }

  private extractData<T>(response: AxiosResponse<ApiResponse<T>>): T {
    if (response.data.success && response.data.data !== null) {
      return response.data.data;
    }

    throw response.data.error || {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
    };
  }

  getAxiosInstance(): AxiosInstance {
    return this.client;
  }
}

export const httpClient = new HttpClient();
export default httpClient;
