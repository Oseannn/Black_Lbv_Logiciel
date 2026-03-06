'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import type { User } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Crown, UserCheck, Plus, Pencil, Play, Pause, Loader2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function VendeusesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'VENDEUSE' as 'ADMIN' | 'VENDEUSE',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await api.get<User[]>('/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', role: 'VENDEUSE' });
    }
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (editingUser) {
        const data: { name: string; email: string; role: string; password?: string } = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        };
        if (formData.password) {
          data.password = formData.password;
        }
        await api.patch(`/users/${editingUser.id}`, data);
      } else {
        await api.post('/users', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });
      }

      setShowModal(false);
      loadUsers();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string | string[] | { message?: string[] } } } };
      let errorMessage = 'Erreur';
      const msg = axiosError.response?.data?.message;

      if (typeof msg === 'string') {
        errorMessage = msg;
      } else if (Array.isArray(msg)) {
        errorMessage = msg.join(', ');
      } else if (typeof msg === 'object' && msg !== null && 'message' in msg) {
        // Handle NestJS validation error object
        const innerMsg = (msg as { message?: string[] | string }).message;
        errorMessage = Array.isArray(innerMsg) ? innerMsg.join(', ') : (innerMsg || 'Erreur de validation');
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActive = async (user: User) => {
    try {
      await api.patch(`/users/${user.id}`, { isActive: !user.isActive });
      loadUsers();
    } catch (err) {
      console.error('Error toggling user:', err);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement le compte de ${user.name} ? Cette action est irréversible.`)) {
      try {
        await api.delete(`/users/${user.id}`);
        loadUsers();
      } catch (err: any) {
        console.error('Error deleting user:', err);
        const msg = err.response?.data?.message || 'Erreur lors de la suppression';
        alert(Array.isArray(msg) ? msg[0] : (typeof msg === 'object' ? JSON.stringify(msg) : msg));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fadeIn pb-20">
      <div className="flex items-center justify-between flex-wrap gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase">Gestion d'Équipe</h1>
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest mt-1">Contrôle des accès & Collaborateurs</p>
        </div>
        <Button onClick={() => openModal()} className="h-12 px-8 rounded-full shadow-2xl shadow-black/20 font-black uppercase tracking-widest">
          <Plus className="w-5 h-5 mr-3" />
          Ajouter un membre
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {users.map((user) => (
          <Card key={user.id} className="group border-border bg-card hover:border-black hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-5">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-colors group-hover:bg-zinc-900 group-hover:text-white ${user.role === 'ADMIN' ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-900 border border-zinc-200'
                    }`}>
                    {user.role === 'ADMIN' ? (
                      <Crown className="w-8 h-8" />
                    ) : (
                      <UserCheck className="w-8 h-8" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-xl tracking-tighter text-foreground truncate">{user.name}</p>
                    <p className="text-xs font-bold text-muted-foreground truncate uppercase tracking-widest italic">{user.email}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-zinc-100">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${user.role === 'ADMIN' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                    }`}>
                    {user.role}
                  </span>
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${user.isActive ? 'bg-zinc-100 text-zinc-900 border border-zinc-200' : 'bg-red-50 text-red-600 border border-red-100'
                    }`}>
                    {user.isActive ? 'ACTIF' : 'INACTIF'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openModal(user)}
                    className="h-10 w-10 rounded-full text-muted-foreground hover:text-black hover:bg-zinc-50 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleActive(user)}
                    className={cn(
                      "h-10 w-10 rounded-full transition-all",
                      user.isActive ? "text-zinc-300 hover:text-zinc-600 hover:bg-zinc-50" : "text-black hover:bg-zinc-100"
                    )}
                    title={user.isActive ? "Désactiver" : "Activer"}
                  >
                    {user.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteUser(user)}
                    className="h-10 w-10 rounded-full text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-all"
                    title="Supprimer définitivement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "ÉDITION DU COMPTE" : 'NOUVEL ACCÈS'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-8 pt-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Nom du collaborateur</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Jean Dupont"
                  className="h-12 bg-zinc-50 border-none font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Identifiant Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="jean@osean.local"
                  className="h-12 bg-zinc-50 border-none font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                  {editingUser ? 'Mot de passe (facultatif)' : 'Mot de passe de sécurité'}
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                  placeholder="••••••••"
                  className="h-12 bg-zinc-50 border-none font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Privilèges système</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'ADMIN' | 'VENDEUSE' })}
                  className="w-full px-4 h-12 bg-zinc-100 border-none rounded-2xl text-foreground text-sm font-black focus:ring-2 focus:ring-black/5 transition-all outline-none appearance-none"
                >
                  <option value="VENDEUSE">VENDEUSE (Interface POS)</option>
                  <option value="ADMIN">ADMIN (Accès Intégral)</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                <p className="text-xs text-red-600 font-black uppercase tracking-widest">{error}</p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest" onClick={() => setShowModal(false)}>
                Fermer
              </Button>
              <Button type="submit" className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-black/20" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-5 h-5 mr-3 animate-spin" />}
                {editingUser ? 'Valider' : 'Confirmer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
