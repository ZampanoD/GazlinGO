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