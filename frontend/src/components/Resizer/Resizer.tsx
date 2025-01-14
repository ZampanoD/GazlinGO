// A component for resizing the sidebar width by dragging.
// Implements minimum (200px) and maximum (350px) width constraints,
// visual indication of the active state, and smooth animations on hover.

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