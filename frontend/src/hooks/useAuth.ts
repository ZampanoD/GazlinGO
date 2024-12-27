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