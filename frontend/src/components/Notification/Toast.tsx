
import React, { useEffect } from 'react';

interface ToastProps {
    message: string;
    type: 'success' | 'error';
    duration?: number;
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
                                                message,
                                                type,
                                                duration = 2000,
                                                onClose
                                            }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const baseStyles = "fixed top-4 left-1/2 transform -translate-x-1/2 z-50 rounded-lg shadow-lg transition-all duration-300";
    const typeStyles = type === 'success' ? 'bg-green-500' : 'bg-red-500';

    return (
        <div className={`${baseStyles} ${typeStyles}`}>
            <div className="px-6 py-3">
                <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{message}</span>
                    <button
                        onClick={onClose}
                        className="ml-4 text-white/80 hover:text-white transition-colors"
                    >
                        ×
                    </button>
                </div>
            </div>
            <div className="relative h-1 bg-white/30 rounded-b-lg">
                <div
                    className="absolute bottom-0 left-0 h-full bg-white/50 rounded-b-lg"
                    style={{
                        animation: `shrinkWidth ${duration}ms linear forwards`
                    }}
                />
            </div>
            <style>
                {`
                @keyframes shrinkWidth {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                `}
            </style>
        </div>
    );
};