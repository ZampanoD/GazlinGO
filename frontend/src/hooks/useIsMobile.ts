//Хук для определения типа устройства пользователя на основе ширины экрана.
// Отслеживает изменение размера окна браузера и определяет мобильное устройство при ширине экрана менее 768 пикселей.
// Используется для адаптивной верстки и conditional rendering компонентов.

import { useState, useEffect } from 'react';

export const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);

        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    return isMobile;
};
export default useIsMobile;