import axios, { AxiosRequestConfig } from 'axios';
import { AxiosObservable } from './axios-observable.model';
import { axiosPromiseToObservable } from './axios-promise-to-observable';

class hbAxios {
    static request<T = any>(config: AxiosRequestConfig): AxiosObservable<T> {
        return axiosPromiseToObservable(axios.request(config));
    }

    static get<T = any>(url: string, config?: AxiosRequestConfig): AxiosObservable<T> {
        return axiosPromiseToObservable(axios.get(url, config));
    }

    static post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosObservable<T> {
        return axiosPromiseToObservable(axios.post(url, data, config));
    }

    static put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosObservable<T> {
        return axiosPromiseToObservable(axios.put(url, data, config));
    }

    static patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosObservable<T> {
        return axiosPromiseToObservable(axios.patch(url, data, config));
    }

    static delete<T = any>(url: string, config?: AxiosRequestConfig): AxiosObservable<T> {
        return axiosPromiseToObservable(axios.delete(url, config));
    }
}

export { hbAxios };