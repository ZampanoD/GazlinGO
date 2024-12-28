//Модуль конфигурации Axios для взаимодействия с backend API приложения.
//Настраивает базовый URL для запросов, добавляет перехватчик для автоматического включения JWT-токена в заголовки авторизации и экспортирует методы для работы с избранными минералами.
//Реализует централизованное управление HTTP-запросами с поддержкой типизации TypeScript для улучшенной обработки ошибок.

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