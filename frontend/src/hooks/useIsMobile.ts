// A hook for determining the user's device type based on screen width.
// Tracks changes in the browser window size and identifies a mobile device when the screen width is less than 768 pixels.
// Used for responsive design and conditional rendering of components.

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