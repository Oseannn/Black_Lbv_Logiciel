'use client';

import { useEffect } from 'react';

export function PWARegistration() {
    useEffect(() => {
        if (
            typeof window !== 'undefined' &&
            'serviceWorker' in navigator &&
            window.sericeWorkerRegistered === undefined
        ) {
            window.sericeWorkerRegistered = true;
            window.addEventListener('load', () => {
                navigator.serviceWorker
                    .register('/sw.js')
                    .then((registration) => {
                        console.log('SW registered: ', registration);
                    })
                    .catch((registrationError) => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }
    }, []);

    return null;
}

// Pour éviter les erreurs TS sur window
declare global {
    interface Window {
        sericeWorkerRegistered?: boolean;
    }
}
