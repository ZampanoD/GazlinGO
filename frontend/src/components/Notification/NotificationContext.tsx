//Контекст React для централизованного управления уведомлениями в приложении.
//Предоставляет провайдер и хук useNotification для удобного доступа к функционалу показа уведомлений из любого компонента.
// Использует систему уникальных идентификаторов для корректного отображения множественных уведомлений.

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast } from './Toast';

interface NotificationContextType {
    showNotification: (message: string, type: 'success' | 'error') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notification, setNotification] = useState<{
        message: string;
        type: 'success' | 'error';
        id: number;
    } | null>(null);

    const handleClose = useCallback(() => {
        setNotification(null);
    }, []);

    const showNotification = useCallback((message: string, type: 'success' | 'error') => {
        setNotification({ message, type, id: Date.now() });
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            {notification && (
                <Toast
                    key={notification.id}
                    message={notification.message}
                    type={notification.type}
                    onClose={handleClose}
                    duration={1750}
                />
            )}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};