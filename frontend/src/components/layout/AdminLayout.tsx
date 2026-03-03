'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { Sidebar } from '@/components/layout/Sidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setIsReady(true);
    };
    initAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.push('/');
    } else if (isReady && user?.role === 'MANAGER') {
      router.push('/manager');
    } else if (isReady && user?.role !== 'ADMIN') {
      router.push('/vendeuse');
    }
  }, [isReady, isAuthenticated, user, router]);

  if (!isReady) return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row">
      {/* Sidebar is Fixed on Desktop */}
      <Sidebar role="ADMIN" />

      {/* Main Content - Pushed by Sidebar width on Desktop */}
      <main className="flex-1 w-full lg:pl-72 min-h-screen flex flex-col transition-all duration-300 pt-16 lg:pt-0">
        <div className="flex-1 p-4 md:p-6 lg:p-8 xl:p-10 max-w-[1600px] w-full mx-auto animate-fadeIn">
          {children}
        </div>
      </main>
    </div>
  );
}
