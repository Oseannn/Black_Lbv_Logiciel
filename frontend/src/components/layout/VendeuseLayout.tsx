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
      } else if (user?.role === 'MANAGER') {
        router.push('/manager');
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
        "lg:pl-72 bg-white pt-16 lg:pt-0"
      )}>
        {/* Status Bar / Header minimaliste */}
        <header className="h-16 border-b border-border flex items-center justify-end px-4 lg:px-8 bg-background fixed top-0 left-0 right-0 z-30 lg:sticky lg:left-auto">
          {currentCaisse ? (
            <div className="flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-1.5 lg:py-2 bg-black text-white rounded-full shadow-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs lg:text-sm font-medium tracking-wide">
                {Math.round(Number(currentCaisse.currentBalance)).toLocaleString()} F
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-1.5 lg:py-2 bg-zinc-100 text-zinc-500 rounded-full border border-zinc-200">
              <div className="w-2 h-2 bg-zinc-400 rounded-full" />
              <span className="text-xs lg:text-sm font-medium tracking-wide">Fermée</span>
            </div>
          )}
        </header>

        <div className={cn(
          "flex-1 w-full mx-auto animate-fadeIn",
          isVentePage ? "p-0 h-[calc(100dvh-64px)] overflow-hidden" : "p-4 md:p-6 lg:p-8 max-w-7xl"
        )}>
          {children}
        </div>
      </main>
    </div>
  );
}
