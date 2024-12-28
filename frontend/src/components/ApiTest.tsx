//Тестовый компонент для проверки работоспособности API и основных функций аутентификации.
//Реализует функционал для тестирования подключения к серверу, регистрации пользователей и авторизации с полной обработкой ошибок и выводом результатов.
//Включает формы для ввода учетных данных и отображения ответов сервера в удобном формате. Используется во время разработки и отладки для проверки корректности работы backend-взаимодействия

import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { AxiosError } from 'axios'

interface MineralsResponse {
    data: unknown[]
    status: string
}

interface LoginResponse {
    token: string
    role: string
}

interface ApiError {
    error: string
    detail?: string
}

export const ApiTest = () => {
    const [message, setMessage] = useState<string>('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const testApi = async () => {
        try {
            const response = await api.get<MineralsResponse>('/minerals')
            setMessage(`Получены минералы: ${JSON.stringify(response.data, null, 2)}`)
        } catch (error) {
            if (error instanceof AxiosError && error.response?.data) {
                const apiError = error.response.data as ApiError
                setMessage(`Ошибка: ${error.message}\n${JSON.stringify(apiError, null, 2)}`)
            } else {
                setMessage(`Неизвестная ошибка: ${String(error)}`)
            }
        }
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            console.log('Попытка входа:', { username: username.trim(), password: password.trim() })

            const response = await api.post<LoginResponse>('/login', {
                username: username.trim(),
                password: password.trim()
            })
            console.log('Login response:', response.data)

            localStorage.setItem('token', response.data.token)
            localStorage.setItem('role', response.data.role)

            setMessage(`Успешная авторизация: ${JSON.stringify(response.data, null, 2)}`)

            window.location.reload()
        } catch (error) {
            if (error instanceof AxiosError && error.response?.data) {
                const apiError = error.response.data as ApiError
                setMessage(`Ошибка авторизации: ${error.message}\n${JSON.stringify(apiError, null, 2)}`)
            } else {
                setMessage(`Неизвестная ошибка: ${String(error)}`)
            }
        }
    }

    const handleUserRegister = async () => {
        try {
            const response = await api.post<LoginResponse>('/register', {
                username: username.trim(),
                password: password.trim(),
                role: "user"
            })
            setMessage(`Регистрация пользователя успешна: ${JSON.stringify(response.data, null, 2)}`)

            localStorage.setItem('token', response.data.token)
            localStorage.setItem('role', response.data.role)

            window.location.reload()
        } catch (error) {
            if (error instanceof AxiosError && error.response?.data) {
                const apiError = error.response.data as ApiError
                setMessage(`Ошибка регистрации: ${error.message}\n${JSON.stringify(apiError, null, 2)}`)
            } else {
                setMessage(`Неизвестная ошибка: ${String(error)}`)
            }
        }
    }

    useEffect(() => {
        testApi()
    }, [])

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Тест API подключения</h2>

            <form onSubmit={handleLogin} className="mb-4 space-y-2">
                <div>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        className="border p-2 rounded"
                    />
                </div>
                <div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="border p-2 rounded"
                    />
                </div>
                <div className="space-x-2">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-green-500 text-white rounded"
                    >
                        Войти
                    </button>
                    <button
                        type="button"
                        onClick={handleUserRegister}
                        className="px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        Регистрация пользователя
                    </button>
                </div>
            </form>

            <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap">
               {message}
           </pre>

            <button
                onClick={testApi}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
                Получить минералы
            </button>
        </div>
    )
}