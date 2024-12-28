//Пользовательский хук React для обработки нажатия клавиши Escape.
// Принимает функцию обратного вызова, которая выполняется при нажатии клавиши, и автоматически очищает слушатель события при размонтировании компонента.
// Часто используется для закрытия модальных окон и других интерактивных элементов.

import { useEffect } from 'react';

export const useEscapeKey = (onEscape: () => void) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onEscape();
            }
        };

        document.addEventListener('keydown', handleEsc);

        return () => {
            document.removeEventListener('keydown', handleEsc);
        };
    }, [onEscape]);
};