// A hook for managing authentication, which checks for the presence of a token and user role in localStorage.
// Provides information about the user's authentication status and administrative privileges.
// Used to control access to various parts of the application.

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