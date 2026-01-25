'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-6">
                <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Une erreur est survenue !</h2>
            <p className="text-slate-500 mb-8 max-w-sm">
                Nous n'avons pas pu charger l'interface de vente. Cela peut être dû à un problème de connexion.
            </p>
            <Button
                onClick={() => reset()}
                className="flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800"
            >
                <RefreshCcw className="w-4 h-4" />
                Réessayer
            </Button>
        </div>
    );
}
