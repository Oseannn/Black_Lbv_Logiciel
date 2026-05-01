'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Page error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-black">
            <div className="w-20 h-20 rounded-[24px] bg-red-500/10 border-2 border-red-500/20 flex items-center justify-center mb-8">
                <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight mb-2">
                Une erreur est survenue
            </h2>
            <p className="text-sm text-zinc-500 mb-8 max-w-sm leading-relaxed">
                Impossible de charger cette page. Cela peut être dû à un problème de connexion au serveur.
            </p>
            <button
                onClick={() => reset()}
                className="flex items-center gap-2 px-8 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200 active:scale-95 transition-all"
            >
                <RefreshCcw className="w-4 h-4" />
                Réessayer
            </button>
        </div>
    );
}
