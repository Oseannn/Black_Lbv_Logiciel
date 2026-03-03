'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronsLeft,
  Menu,
  X,
  LogOut,
  User,
  Zap,
  LayoutDashboard,
  Package,
  Users,
  UserCheck,
  Receipt,
  Wallet,
  Settings,
  ShoppingCart,
  ClipboardList
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils';

// Définition des menus pour chaque rôle
const MENUS = {
  ADMIN: [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/produits', label: 'Produits', icon: Package },
    { href: '/admin/clients', label: 'Clients', icon: Users },
    { href: '/admin/vendeuses', label: 'Équipe', icon: UserCheck },
    { href: '/admin/ventes', label: 'Ventes', icon: Receipt },
    { href: '/admin/caisses', label: 'Trésorerie', icon: Wallet },
    { href: '/admin/settings', label: 'Paramètres', icon: Settings },
  ],
  MANAGER: [
    { href: '/manager', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/manager/produits', label: 'Produits', icon: Package },
    { href: '/manager/ventes', label: 'Ventes', icon: Receipt },
    { href: '/manager/caisses', label: 'Trésorerie', icon: Wallet },
  ],
  VENDEUSE: [
    { href: '/vendeuse', label: 'Caisse', icon: Wallet },
    { href: '/vendeuse/vente', label: 'Nouvelle Vente', icon: ShoppingCart },
    { href: '/vendeuse/clients', label: 'Clients', icon: Users },
    { href: '/vendeuse/historique', label: 'Historique', icon: ClipboardList },
  ]
};

interface SidebarProps {
  role: 'ADMIN' | 'MANAGER' | 'VENDEUSE';
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = MENUS[role] || [];

  if (!mounted) return null;

  return (
    <>
      {/* Mobile Trigger - Visible only on mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-sidebar text-sidebar-foreground border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <span className="font-bold tracking-tight">OSEAN</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => setIsMobileOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 lg:hidden animate-fadeIn"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container - FIXED WIDTH on Desktop */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col w-72 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-2xl lg:shadow-none",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header / Logo (Desktop) */}
        <div className="hidden lg:flex h-20 items-center px-6 border-b border-sidebar-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center shadow-lg shadow-white/5">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight">OSEAN</span>
              <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60 font-medium">
                {role === 'ADMIN' ? 'Administration' : role === 'MANAGER' ? 'Gestion' : 'Espace Vente'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-md shadow-black/20"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5 flex-shrink-0 transition-colors",
                    isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"
                  )} />
                  <span className="text-sm">{item.label}</span>

                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-sidebar-primary rounded-r-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / User Profile */}
        <div className="p-4 border-t border-sidebar-border/50 bg-sidebar-accent/10">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-sidebar-accent/40 border border-sidebar-border/50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-900 flex items-center justify-center shrink-0 border border-sidebar-border hidden sm:flex">
              <User className="w-5 h-5 text-zinc-300" />
            </div>

            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-sm font-medium truncate text-sidebar-foreground">{user?.name || 'Utilisateur'}</p>
              <p className="text-xs text-sidebar-foreground/70 truncate">{user?.email}</p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => logout()}
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
