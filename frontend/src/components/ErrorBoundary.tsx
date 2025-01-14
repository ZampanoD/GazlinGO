// An error boundary component for catching and handling rendering errors in a React application.
// Implements the Error Boundary pattern, which allows handling errors during rendering, preventing the entire application from crashing.
// Includes logging errors to the console for debugging and displays a user-friendly error message instead of a broken interface.
// A critical component for ensuring application stability in a production environment.


import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
}

class ErrorBoundary extends Component<Props, State> {
    state: State = {
        hasError: false
    }

    static getDerivedStateFromError(): State {
        return { hasError: true }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return <div>Что-то пошло не так.</div>
        }

        return this.props.children
    }
}

export default ErrorBoundary
