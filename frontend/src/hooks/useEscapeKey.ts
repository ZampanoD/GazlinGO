// A custom React hook for handling the Escape key press.
// Accepts a callback function that is executed when the key is pressed and automatically cleans up the event listener when the component unmounts.
// Commonly used for closing modal windows and other interactive elements.

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