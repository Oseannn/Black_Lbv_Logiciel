'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Zap, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, logout, isAuthenticated, user, checkAuth, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/vendeuse');
      }
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      logout();
      await login(email.trim(), password.trim());
    } catch (err: any) {
      console.error('Login error:', err);
      let message = 'Erreur de connexion';

      if (err.response?.data?.message) {
        const msg = err.response.data.message;
        message = Array.isArray(msg) ? msg[0] : msg;
      } else if (err.message) {
        message = err.message;
      }

      setError(typeof message === 'object' ? JSON.stringify(message) : String(message));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-12 h-12 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-black relative overflow-hidden">
      {/* Premium Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-zinc-800/20 blur-[130px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-zinc-800/10 blur-[130px]" />
      </div>

      <div className="w-full max-w-md animate-fadeIn relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[32px] bg-white text-black mb-8 shadow-[0_20px_50px_rgba(255,255,255,0.1)] transform hover:rotate-6 transition-transform duration-500">
            <Zap className="w-12 h-12 fill-current" />
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-white mb-3 uppercase">OSEAN</h1>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] ml-2">Logiciel de gestion de boutique</p>
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-3xl border border-white/5 shadow-2xl rounded-[48px] p-2 overflow-hidden ring-1 ring-white/10">
          <form onSubmit={handleSubmit} className="p-10 space-y-8">
            <div className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">Accès Professionnel</label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-mail"
                    required
                    className="w-full pl-16 pr-6 h-16 bg-white/5 border-2 border-transparent rounded-[24px] text-white font-bold placeholder:text-zinc-700 focus:bg-white/10 focus:border-white/20 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">Clef de Sécurité</label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mot de passe"
                    required
                    className="w-full pl-16 pr-16 h-16 bg-white/5 border-2 border-transparent rounded-[24px] text-white font-bold placeholder:text-zinc-700 focus:bg-white/10 focus:border-white/20 transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors outline-none"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-slideUp flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-relaxed">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-18 bg-white text-black hover:bg-zinc-200 rounded-[24px] font-black uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:scale-[0.98] transition-all text-sm h-16"
              isLoading={isSubmitting}
            >
              Session Start
            </Button>
          </form>
        </div>

        <div className="mt-16 text-center space-y-6">
          <div className="flex justify-center gap-2">
            <div className="w-8 h-[1px] bg-zinc-800" />
            <div className="w-2 h-[1px] bg-zinc-600" />
            <div className="w-8 h-[1px] bg-zinc-800" />
          </div>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em]">
            OSEAN PREMIUM SYSTEM • 2026
          </p>
        </div>
      </div>
    </div>
  );
}
