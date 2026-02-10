'use client';

import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import type { Client } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  User,
  Plus,
  Search,
  Phone,
  Mail,
  Save,
  X,
  CheckCircle,
  Loader2,
  TrendingUp,
  ShoppingBag,
  Award,
  Gem,
  Sparkles,
} from 'lucide-react';

type FilterType = 'ALL' | 'VIP' | 'REGULAR' | 'OCCASIONAL';

// Fonction pour obtenir les initiales
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const avatarColors = [
  'bg-zinc-900',
  'bg-zinc-800',
  'bg-zinc-700',
  'bg-zinc-600',
  'bg-zinc-500',
  'bg-black',
];

const getAvatarColor = (name: string) => {
  const index = name.length % avatarColors.length;
  return avatarColors[index];
};

// Badge de type client
const ClientTypeBadge = ({ type }: { type: string }) => {
  const styles: Record<string, string> = {
    VIP: 'bg-black text-white border-black',
    REGULAR: 'bg-white text-black border-black',
    OCCASIONAL: 'bg-zinc-100 text-zinc-500 border-zinc-200',
  };

  return (
    <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-lg border flex items-center gap-1.5 ${styles[type] || styles.OCCASIONAL}`}>
      {type === 'VIP' ? <Gem className="w-2.5 h-2.5" /> : type === 'REGULAR' ? <Sparkles className="w-2.5 h-2.5" /> : <User className="w-2.5 h-2.5" />}
      {type === 'VIP' ? 'VIP' : type === 'REGULAR' ? 'Régulier' : 'Occasionnel'}
    </span>
  );
};

export default function VendeuseClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('ALL');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const response = await api.get<Client[]>('/clients');
      setClients(response.data);
    } catch (err) {
      console.error('Error loading clients:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (client?: Client) => {
    if (client) {
      setIsCreating(false);
      setSelectedClient(client);
      setFormData({
        name: client.name,
        phone: client.phone || '',
        email: client.email || '',
      });
    } else {
      setIsCreating(true);
      setSelectedClient(null);
      setFormData({ name: '', phone: '', email: '' });
    }
    setError('');
    setSuccessMessage('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Le nom est requis');
      return;
    }

    setError('');
    setIsSaving(true);

    try {
      const data = {
        name: formData.name,
        phone: formData.phone || null,
        email: formData.email || null,
      };

      if (isCreating) {
        const response = await api.post<Client>('/clients', data);
        setClients((prev) => [response.data, ...prev]);
        setSuccessMessage('Client créé avec succès');
      } else if (selectedClient) {
        await api.patch(`/clients/${selectedClient.id}`, data);
        setClients((prev) =>
          prev.map((c) => (c.id === selectedClient.id ? { ...c, ...data } : c))
        );
        setSuccessMessage('Modifications enregistrées');
      }

      setTimeout(() => {
        setShowModal(false);
        setSuccessMessage('');
      }, 1000);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erreur lors de la sauvegarde';
      setError(Array.isArray(msg) ? msg[0] : (typeof msg === 'object' ? JSON.stringify(msg) : msg));
    } finally {
      setIsSaving(false);
    }
  };

  // Déterminer le type de client basé sur les achats
  const determineClientType = (totalSpent: number): string => {
    if (totalSpent >= 100000) return 'VIP';
    if (totalSpent >= 20000) return 'REGULAR';
    return 'OCCASIONAL';
  };

  // Filtrage des clients
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch =
        client.name.toLowerCase().includes(search.toLowerCase()) ||
        client.phone?.includes(search);

      if (filterType === 'ALL') return matchesSearch;

      const clientType = client.type || determineClientType(client.totalSpent || 0);
      return matchesSearch && clientType === filterType;
    });
  }, [clients, search, filterType]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8 animate-fadeIn pb-6 lg:pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-card p-4 lg:p-8 rounded-2xl lg:rounded-[40px] border border-border shadow-xl lg:shadow-2xl shadow-black/5 gap-4">
        <div>
          <h1 className="text-2xl lg:text-4xl font-black text-foreground tracking-tighter uppercase">Clients</h1>
          <p className="text-[9px] lg:text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{clients.length} profiles actifs</p>
        </div>
        <Button onClick={() => openModal()} size="lg" className="w-full sm:w-auto h-12 lg:h-14 px-6 lg:px-8 rounded-xl lg:rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-black/10 text-sm lg:text-base">
          <Plus className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3" />
          Ajouter
        </Button>
      </div>

      {/* Barre de Recherche Premium */}
      <div className="relative group">
        <Search className="absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-zinc-400 group-focus-within:text-black transition-colors" />
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 lg:pl-16 pr-4 lg:pr-6 h-12 lg:h-16 bg-card border-2 border-border rounded-2xl lg:rounded-3xl text-foreground text-base lg:text-lg font-black placeholder:text-zinc-300 focus:outline-none focus:border-black focus:ring-0 transition-all shadow-sm group-hover:shadow-md"
        />
      </div>

      {/* Filtres Monochrome */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {(['ALL', 'VIP', 'REGULAR', 'OCCASIONAL'] as FilterType[]).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 lg:px-6 py-2 lg:py-3 text-[9px] lg:text-[10px] font-black uppercase tracking-widest rounded-xl lg:rounded-2xl whitespace-nowrap transition-all border-2 ${filterType === type
              ? 'bg-black text-white border-black shadow-lg shadow-black/10 scale-105'
              : 'bg-card text-zinc-400 border-border hover:border-black hover:text-black'
              }`}
          >
            <span className="flex items-center gap-1.5 lg:gap-2">
              {type === 'VIP' && <Gem className="w-2.5 h-2.5 lg:w-3 lg:h-3" />}
              {type === 'REGULAR' && <Sparkles className="w-2.5 h-2.5 lg:w-3 lg:h-3" />}
              {type === 'OCCASIONAL' && <User className="w-2.5 h-2.5 lg:w-3 lg:h-3" />}
              {type === 'ALL' ? 'Tous' : type === 'VIP' ? 'VIP' : type === 'REGULAR' ? 'Réguliers' : 'Occasionnels'}
            </span>
          </button>
        ))}
      </div>

      {/* Liste des clients - Cards Luxury */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {filteredClients.map((client) => {
          const clientType = client.type || determineClientType(client.totalSpent || 0);

          return (
            <Card
              key={client.id}
              className="bg-card border-border p-4 lg:p-6 cursor-pointer hover:border-black hover:shadow-2xl transition-all group rounded-2xl lg:rounded-[32px] overflow-hidden active:scale-95"
              onClick={() => openModal(client)}
            >
              <div className="flex items-center gap-3 lg:gap-5">
                <div
                  className={`w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl flex items-center justify-center text-white font-black text-base lg:text-lg flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform ${getAvatarColor(
                    client.name
                  )}`}
                >
                  {getInitials(client.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col mb-1">
                    <p className="font-black text-base lg:text-xl text-foreground tracking-tighter truncate leading-tight group-hover:translate-x-1 transition-transform">{client.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <ClientTypeBadge type={clientType} />
                    </div>
                  </div>
                  <p className="text-[10px] lg:text-[11px] font-bold text-zinc-400 font-mono tracking-tight">
                    {client.phone || 'Pas de mobile'}
                  </p>
                </div>
              </div>

              {client.totalSpent !== undefined && client.totalSpent > 0 && (
                <div className="mt-4 lg:mt-6 pt-4 lg:pt-5 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-[9px] lg:text-[10px] font-black text-zinc-300 uppercase tracking-widest">VOLUME</span>
                  <div className="text-right">
                    <p className="text-base lg:text-xl font-black text-black tabular-nums tracking-tighter">
                      {Math.round(client.totalSpent || 0).toLocaleString()} <span className="text-[9px] lg:text-[10px] font-normal text-zinc-400">F</span>
                    </p>
                  </div>
                </div>
              )}
            </Card>
          );
        })}

        {filteredClients.length === 0 && (
          <div className="col-span-full text-center py-20 lg:py-32 bg-zinc-50/50 rounded-3xl lg:rounded-[60px] border-2 border-dashed border-zinc-100">
            <User className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-6 lg:mb-8 text-zinc-200" />
            <p className="text-zinc-400 font-black uppercase tracking-widest text-xs mb-6 lg:mb-8">Aucun profil trouvé</p>
            <Button onClick={() => openModal()} size="lg" className="rounded-xl lg:rounded-2xl h-12 lg:h-14 px-6 lg:px-8 shadow-xl shadow-black/5 text-sm lg:text-base">
              <Plus className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3" />
              Créer un Client
            </Button>
          </div>
        )}
      </div>

      {/* Modal de Détails / Edition Premium */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-white border-border max-w-lg mx-4 p-0 rounded-3xl lg:rounded-[40px] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)]">
          <div className="bg-zinc-900 p-6 lg:p-10 flex items-center gap-4 lg:gap-8">
            {isCreating ? (
              <div className="w-14 h-14 lg:w-20 lg:h-20 rounded-2xl lg:rounded-3xl bg-white flex items-center justify-center text-black">
                <Plus className="w-7 h-7 lg:w-10 lg:h-10" />
              </div>
            ) : (
              <div
                className={`w-14 h-14 lg:w-20 lg:h-20 rounded-2xl lg:rounded-3xl flex items-center justify-center text-white text-2xl lg:text-3xl font-black shadow-2xl ${getAvatarColor(
                  selectedClient?.name || ''
                )}`}
              >
                {getInitials(selectedClient?.name || '')}
              </div>
            )}
            <div>
              <DialogTitle className="text-xl lg:text-3xl font-black text-white tracking-tighter uppercase mb-1">
                {isCreating ? 'Nouvelle Fiche' : 'Modifier'}
              </DialogTitle>
              {!isCreating && <p className="text-[9px] lg:text-[10px] font-black text-zinc-500 uppercase tracking-widest">ID: {selectedClient?.id.slice(-8).toUpperCase()}</p>}
            </div>
          </div>

          <div className="p-6 lg:p-10 space-y-6 lg:space-y-10">
            {/* Stats Rapides */}
            {!isCreating && selectedClient && (
              <div className="grid grid-cols-3 gap-3 lg:gap-6">
                <div className="bg-zinc-50 rounded-xl lg:rounded-2xl p-3 lg:p-4 text-center border border-zinc-100">
                  <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-zinc-400 mx-auto mb-1 lg:mb-2" />
                  <p className="text-[8px] lg:text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Valeur</p>
                  <p className="text-xs lg:text-sm font-black text-black tabular-nums">
                    {(selectedClient.totalSpent || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-zinc-50 rounded-xl lg:rounded-2xl p-3 lg:p-4 text-center border border-zinc-100">
                  <ShoppingBag className="w-4 h-4 lg:w-5 lg:h-5 text-zinc-400 mx-auto mb-1 lg:mb-2" />
                  <p className="text-[8px] lg:text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Points</p>
                  <p className="text-xs lg:text-sm font-black text-black">-</p>
                </div>
                <div className="bg-zinc-50 rounded-xl lg:rounded-2xl p-3 lg:p-4 text-center border border-zinc-100 space-y-1">
                  <p className="text-[8px] lg:text-[9px] font-black text-zinc-400 uppercase tracking-widest">Type</p>
                  <ClientTypeBadge type={selectedClient.type || 'OCCASIONAL'} />
                </div>
              </div>
            )}

            {/* Notifications Alert */}
            {error && (
              <div className="p-3 lg:p-4 bg-red-50 border border-red-100 rounded-xl lg:rounded-2xl flex items-center gap-3 text-red-600 animate-slideUp">
                <X className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                <p className="font-bold text-xs uppercase tracking-widest">{error}</p>
              </div>
            )}
            {successMessage && (
              <div className="p-3 lg:p-4 bg-black border border-black rounded-xl lg:rounded-2xl flex items-center gap-3 text-white animate-slideUp">
                <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                <p className="font-bold text-xs uppercase tracking-widest">{successMessage}</p>
              </div>
            )}

            {/* Formulaire Ultra-Clean */}
            <div className="space-y-6 lg:space-y-8">
              <div className="space-y-2">
                <label className="text-[9px] lg:text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Nom complet</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Amadou Diop"
                  className="bg-zinc-50 border-none h-12 lg:h-14 font-black focus:bg-white transition-all text-base lg:text-lg"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] lg:text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Téléphone Mobile</label>
                <div className="relative">
                  <Phone className="absolute left-4 lg:left-5 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-zinc-300" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+221 77 000 00 00"
                    className="w-full pl-12 lg:pl-14 pr-4 lg:pr-6 h-12 lg:h-14 bg-zinc-50 border-none rounded-xl lg:rounded-2xl text-foreground text-base lg:text-lg font-black focus:ring-2 focus:ring-black/5 focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] lg:text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Adresse E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-4 lg:left-5 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-zinc-300" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="client@mail.com"
                    className="w-full pl-12 lg:pl-14 pr-4 lg:pr-6 h-12 lg:h-14 bg-zinc-50 border-none rounded-xl lg:rounded-2xl text-foreground text-base lg:text-lg font-black focus:ring-2 focus:ring-black/5 focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Actions Géantes */}
            <div className="flex gap-3 lg:gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12 lg:h-16 rounded-xl lg:rounded-2xl border-2 font-black uppercase tracking-widest text-xs lg:text-sm"
                onClick={() => setShowModal(false)}
              >
                Annuler
              </Button>
              <Button onClick={handleSave} className="flex-2 h-12 lg:h-16 px-6 lg:px-10 rounded-xl lg:rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-black/10 text-xs lg:text-sm" disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="w-5 h-5 lg:w-6 lg:h-6 animate-spin" />
                ) : (
                  <Save className="w-5 h-5 lg:w-6 lg:h-6 mr-2 lg:mr-3" />
                )}
                {isCreating ? 'Enregistrer' : 'Sauvegarder'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
