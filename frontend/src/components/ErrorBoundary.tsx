//Компонент-предохранитель для отлова и обработки ошибок рендеринга в React-приложении.
//Реализует паттерн Error Boundary, который позволяет обрабатывать ошибки во время рендеринга, предотвращая полное падение приложения.
//Включает логирование ошибок в консоль для отладки и отображает пользовательское сообщение об ошибке вместо сломанного интерфейса.
// Является критически важным компонентом для обеспечения стабильности приложения в производственной среде.

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
