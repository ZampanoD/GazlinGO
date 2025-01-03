//Компонент для изменения ширины боковой панели путем перетаскивания.
//Реализует ограничения минимальной (200px) и максимальной (350px) ширины,
//визуальную индикацию активного состояния и плавные анимации при наведении.

import React, { useState } from 'react';

interface ResizerProps {
    onResize: (width: number) => void;
}

export const Resizer: React.FC<ResizerProps> = ({ onResize }) => {
    const [isResizing, setIsResizing] = useState(false);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);

        const handleMouseMove = (e: MouseEvent) => {
            const minWidth = 200;
            const maxWidth = 350; // Устанавливаем максимальную ширину в 350px
            const newWidth = Math.min(Math.max(minWidth, e.clientX), maxWidth);
            onResize(newWidth);
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <div
            className={`absolute right-0 top-0 w-1 h-full cursor-col-resize bg-transparent hover:bg-blue-500/50 transition-colors
                ${isResizing ? 'bg-blue-500/50' : ''}`}
            onMouseDown={handleMouseDown}
        />
    );
};