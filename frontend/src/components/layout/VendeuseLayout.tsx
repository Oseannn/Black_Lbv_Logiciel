'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { useCaisseStore } from '@/stores/caisse.store';
import { Sidebar } from '@/components/layout/Sidebar';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface VendeuseLayoutProps {
  children: ReactNode;
}

export default function VendeuseLayout({ children }: VendeuseLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const { currentCaisse, fetchCurrentCaisse } = useCaisseStore();
  const [isReady, setIsReady] = useState(false);

  const isVentePage = pathname === '/vendeuse/vente';

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setIsReady(true);
    };
    initAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isReady) {
      if (!isAuthenticated) {
        router.push('/');
      } else if (user?.role === 'ADMIN') {
        router.push('/admin');
      } else {
        fetchCurrentCaisse();
      }
    }
  }, [isReady, isAuthenticated, user, router, fetchCurrentCaisse]);

  if (!isReady) return null;

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      <Sidebar role="VENDEUSE" />

      <main className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300 w-full",
        "lg:pl-72 bg-white"
      )}>
        {/* Status Bar / Header minimaliste */}
        <header className="h-16 border-b border-border flex items-center justify-end px-8 bg-background sticky top-0 z-30">
          {currentCaisse ? (
            <div className="flex items-center gap-3 px-4 py-2 bg-black text-white rounded-full shadow-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium tracking-wide">
                Caisse: {Math.round(Number(currentCaisse.currentBalance)).toLocaleString()} FCFA
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-2 bg-zinc-100 text-zinc-500 rounded-full border border-zinc-200">
              <div className="w-2 h-2 bg-zinc-400 rounded-full" />
              <span className="text-sm font-medium tracking-wide">Caisse fermée</span>
            </div>
          )}
        </header>

        <div className={cn(
          "flex-1 w-full mx-auto animate-fadeIn",
          isVentePage ? "p-0 h-[calc(100vh-64px)] overflow-hidden" : "p-6 md:p-8 max-w-7xl"
        )}>
          {children}
        </div>
      </main>
    </div>
  );
}
