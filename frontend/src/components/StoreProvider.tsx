'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/auth.store';

export function StoreProvider({ children }: { children: React.ReactNode }) {
    const hydrated = useRef(false);

    useEffect(() => {
        if (!hydrated.current) {
            useAuthStore.persist.rehydrate();
            hydrated.current = true;
        }
    }, []);

    return <>{children}</>;
}
