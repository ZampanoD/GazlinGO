//Хук для управления аутентификацией, который проверяет наличие токена и роли пользователя в localStorage.
// Предоставляет информацию о статусе аутентификации пользователя и его административных правах.
// Используется для контроля доступа к различным частям приложения.

export const useAuth = () => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    console.log('Current auth state:', { token, role }) // Отладочный лог

    return {
        isAuthenticated: !!token,
        isAdmin: role === 'admin',
        role
    }
}