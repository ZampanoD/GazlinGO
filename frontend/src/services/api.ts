// An Axios configuration module for interacting with the application's backend API.
// Sets the base URL for requests, adds an interceptor to automatically include the JWT token in authorization headers, and exports methods for working with favorite minerals.
// Implements centralized management of HTTP requests with TypeScript typing support for improved error handling.


import axios, { AxiosRequestConfig, AxiosError } from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:8080/api/v1'
})

api.interceptors.request.use((config: AxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export { api }
export { AxiosError }
export const addToFavorites = (mineralId: number) =>
    api.post(`/favorites/${mineralId}`);

export const removeFromFavorites = (mineralId: number) =>
    api.delete(`/favorites/${mineralId}`);

export const getAvailableLanguages = () => api.get('/languages');
export const getTranslatedMinerals = (lang: string) => api.get(`/minerals-translated?lang=${lang}`);
export const getTranslatedMineral = (id: number, lang: string) =>
    api.get(`/minerals-translated/${id}?lang=${lang}`);