'use client';

import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import type { Client, Sale } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  AlertTriangle,
  Loader2,
  Users,
  User,
  Plus,
  Trash2,
  Save,
  Search,
  Phone,
  Calendar,
  ShoppingBag,
  TrendingUp,
  Award,
  CheckCircle,
  X,
  Gem,
  Sparkles,
} from 'lucide-react';

type ClientType = 'ALL' | 'VIP' | 'REGULAR' | 'OCCASIONAL';

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
    <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-lg border flex items-center gap-1.5 ${styles[type] || styles.OCCASIONAL}`}>
      {type === 'VIP' ? <Gem className="w-2.5 h-2.5" /> : type === 'REGULAR' ? <Sparkles className="w-2.5 h-2.5" /> : <User className="w-2.5 h-2.5" />}
      {type === 'VIP' ? 'VIP' : type === 'REGULAR' ? 'Régulier' : 'Occasionnel'}
    </span>
  );
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientSales, setClientSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<ClientType>('ALL');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
    type: 'OCCASIONAL' as ClientType,
  });

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      setFormData({
        name: selectedClient.name || '',
        phone: selectedClient.phone || '',
        email: selectedClient.email || '',
        notes: selectedClient.notes || '',
        type: (selectedClient.type || 'OCCASIONAL') as ClientType,
      });
      loadClientSales(selectedClient.id);
    }
  }, [selectedClient]);

  const loadClients = async () => {
    try {
      const response = await api.get<Client[]>('/clients');
      setClients(response.data);
      if (response.data.length > 0 && !selectedClient) {
        setSelectedClient(response.data[0]);
      }
    } catch (err) {
      console.error('Error loading clients:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadClientSales = async (clientId: string) => {
    try {
      const response = await api.get<Sale[]>(`/sales/history?clientId=${clientId}`);
      setClientSales(response.data);
    } catch (err) {
      console.error('Error loading client sales:', err);
      setClientSales([]);
    }
  };

  const handleCreateNew = () => {
    setSelectedClient(null);
    setIsCreating(true);
    setFormData({
      name: '',
      phone: '',
      email: '',
      notes: '',
      type: 'OCCASIONAL',
    });
    setClientSales([]);
  };

  const handleSelectClient = (client: Client) => {
    setIsCreating(false);
    setSelectedClient(client);
    setError('');
    setSuccessMessage('');
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
        notes: formData.notes || null,
        type: formData.type,
      };

      if (isCreating) {
        const response = await api.post<Client>('/clients', data);
        setClients((prev) => [response.data, ...prev]);
        setSelectedClient(response.data);
        setIsCreating(false);
        setSuccessMessage('Client créé avec succès');
      } else if (selectedClient) {
        await api.patch(`/clients/${selectedClient.id}`, data);
        const updatedClient = { ...selectedClient, ...data } as Client;
        setClients((prev) =>
          prev.map((c) => (c.id === selectedClient.id ? updatedClient : c))
        );
        setSelectedClient(updatedClient);
        setSuccessMessage('Modifications enregistrées');
      }

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedClient) return;
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) return;

    setIsDeleting(true);
    try {
      await api.delete(`/clients/${selectedClient.id}`);
      const newClients = clients.filter((c) => c.id !== selectedClient.id);
      setClients(newClients);
      setSelectedClient(newClients[0] || null);
      setSuccessMessage('Client supprimé');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting client:', err);
      setError('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const clientStats = useMemo(() => {
    const totalSpent = clientSales.reduce((sum, sale) => sum + Number(sale.total), 0);
    const totalOrders = clientSales.length;
    return { totalSpent, totalOrders };
  }, [clientSales]);

  const determineClientType = (totalSpent: number): string => {
    if (totalSpent >= 100000) return 'VIP';
    if (totalSpent >= 20000) return 'REGULAR';
    return 'OCCASIONAL';
  };

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
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-12 h-12 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex gap-10 animate-fadeIn">
      {/* Panneau gauche - Liste des clients */}
      <div className="w-[400px] flex-shrink-0 flex flex-col bg-card rounded-[40px] border border-border overflow-hidden shadow-2xl shadow-black/5">
        {/* Header */}
        <div className="p-8 border-b border-border space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-foreground tracking-tighter uppercase">Clients</h2>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Répertoire Collaborateurs</p>
            </div>
            <Button size="icon" onClick={handleCreateNew} className="rounded-full h-12 w-12 shadow-2xl shadow-black/20 hover:scale-110 transition-transform">
              <Plus className="w-6 h-6" />
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Rechercher un profile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 h-12 bg-zinc-50 border-none rounded-2xl text-foreground text-sm font-bold placeholder:text-zinc-300 focus:ring-2 focus:ring-black/5 transition-all outline-none"
            />
          </div>
        </div>

        {/* Filtres Monochrome */}
        <div className="px-8 py-5 flex gap-2 flex-wrap bg-zinc-50/30 border-b border-border">
          {(['ALL', 'VIP', 'REGULAR', 'OCCASIONAL'] as ClientType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border-2 ${filterType === type
                ? 'bg-black text-white border-black shadow-lg'
                : 'bg-white text-zinc-400 border-zinc-100 hover:border-black hover:text-black hover:shadow-sm'
                }`}
            >
              {type === 'ALL' ? 'Tous' : type === 'VIP' ? 'VIP' : type === 'REGULAR' ? 'Régulier' : 'Occasionnel'}
            </button>
          ))}
        </div>

        {/* Liste des clients - Ultra Clean */}
        <div className="flex-1 overflow-auto py-2">
          {filteredClients.map((client) => {
            const isSelected = selectedClient?.id === client.id && !isCreating;
            const clientType = client.type || determineClientType(client.totalSpent || 0);

            return (
              <button
                key={client.id}
                onClick={() => handleSelectClient(client)}
                className={`w-full px-8 py-5 flex items-center gap-5 transition-all group relative ${isSelected
                  ? 'bg-zinc-100/50'
                  : 'hover:bg-zinc-50/50'
                  }`}
              >
                {isSelected && <div className="absolute left-0 top-6 bottom-6 w-2 bg-black rounded-r-full" />}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-xl transition-all group-hover:scale-105 ${getAvatarColor(
                    client.name
                  )}`}
                >
                  {getInitials(client.name)}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className={cn("font-black text-lg tracking-tight truncate", isSelected ? "text-black" : "text-zinc-700")}>{client.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-[11px] font-bold text-zinc-400 font-mono tracking-tight">{client.phone || '-'}</p>
                    <ClientTypeBadge type={clientType} />
                  </div>
                </div>
              </button>
            );
          })}

          {filteredClients.length === 0 && (
            <div className="p-16 text-center opacity-30">
              <Users className="w-16 h-16 mx-auto mb-4" />
              <p className="font-black uppercase tracking-widest text-xs">Aucun profile trouvé</p>
            </div>
          )}
        </div>
      </div>

      {/* Panneau droit - Interface de Gestion */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {(selectedClient || isCreating) ? (
          <div className="h-full flex flex-col overflow-auto pr-4 space-y-10 pb-20">
            {/* Header / Actions Géantes */}
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="flex items-center gap-8">
                <div
                  className={`w-24 h-24 rounded-[40px] flex items-center justify-center text-white text-4xl font-black shadow-2xl transition-all ${isCreating ? 'bg-zinc-200 animate-pulse' : getAvatarColor(selectedClient?.name || '')
                    }`}
                >
                  {isCreating ? <Plus className="w-10 h-10" /> : getInitials(selectedClient?.name || '')}
                </div>
                <div>
                  <h1 className="text-5xl font-black text-foreground tracking-tighter uppercase leading-none">
                    {isCreating ? 'Nouvelle Fiche' : selectedClient?.name}
                  </h1>
                  {!isCreating && selectedClient?.createdAt && (
                    <div className="flex items-center gap-4 mt-3">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Inscrit depuis le {new Date(selectedClient.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                      <div className="w-1.5 h-1.5 bg-zinc-200 rounded-full" />
                      <ClientTypeBadge type={formData.type} />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                {!isCreating && (
                  <Button
                    variant="ghost"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="h-14 w-14 rounded-2xl bg-zinc-50 border-2 border-zinc-100 text-zinc-400 hover:text-red-500 hover:bg-white hover:border-red-100 transition-all shadow-sm"
                  >
                    {isDeleting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Trash2 className="w-6 h-6" />}
                  </Button>
                )}
                <Button onClick={handleSave} disabled={isSaving} className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] hover:translate-y-[-2px] transition-all">
                  {isSaving && <Loader2 className="w-5 h-5 mr-3 animate-spin" />}
                  {!isSaving && <Save className="w-5 h-5 mr-3" />}
                  {isCreating ? 'Créer le Profile' : 'Enregistrer'}
                </Button>
              </div>
            </div>

            {/* Notifications */}
            {error && (
              <div className="p-6 bg-red-50 border-2 border-red-100 rounded-3xl flex items-center gap-4 text-red-600 animate-slideUp shadow-xl shadow-red-900/5">
                <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                <p className="font-black text-xs uppercase tracking-widest">{error}</p>
                <button onClick={() => setError('')} className="ml-auto"><X className="w-5 h-5 opacity-50" /></button>
              </div>
            )}
            {successMessage && (
              <div className="p-6 bg-black border-2 border-black rounded-3xl flex items-center gap-4 text-white animate-slideUp shadow-2xl shadow-black/20">
                <CheckCircle className="w-6 h-6 flex-shrink-0" />
                <p className="font-black text-xs uppercase tracking-widest">{successMessage}</p>
              </div>
            )}

            {/* Dashboard Stats Client */}
            {!isCreating && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="border-border bg-card shadow-2xl shadow-black/5 p-8 rounded-[40px] group transition-all hover:border-black">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[24px] bg-zinc-900 flex items-center justify-center text-white shadow-xl transition-transform group-hover:scale-110">
                      <TrendingUp className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Volume d'Affaire</p>
                      <p className="text-3xl font-black text-foreground tabular-nums tracking-tighter">
                        {Math.round(clientStats.totalSpent).toLocaleString()} <span className="text-sm font-normal text-zinc-400">FCFA</span>
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="border-border bg-zinc-50/50 shadow-2xl shadow-black/5 p-8 rounded-[40px] group transition-all hover:border-black hover:bg-white">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[24px] bg-white border border-zinc-200 flex items-center justify-center text-black shadow-lg transition-transform group-hover:scale-110">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Historique</p>
                      <p className="text-3xl font-black text-foreground tracking-tighter tabular-nums">{clientStats.totalOrders} <span className="text-sm font-normal text-zinc-400">Ventes</span></p>
                    </div>
                  </div>
                </Card>
                <Card className="border-black bg-zinc-900 shadow-2xl shadow-black/20 p-8 rounded-[40px] group transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[24px] bg-white flex items-center justify-center text-black shadow-xl transition-transform group-hover:scale-110">
                      <Award className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Grade Membre</p>
                      <ClientTypeBadge type={formData.type} />
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Content Sections */}
            <div className="grid xl:grid-cols-2 gap-10">
              {/* Profile Card */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-6 bg-black rounded-full" />
                  <h3 className="text-xl font-black tracking-tight uppercase">Détails Personnels</h3>
                </div>

                <Card className="border-border bg-card shadow-2xl shadow-black/5 p-10 rounded-[40px]">
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Nom complet & Prénom</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Jean Dupont"
                        className="bg-zinc-50 border-none h-14 font-black text-lg focus:bg-white transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Adresse E-mail</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="jean@boutique.com"
                        className="bg-zinc-50 border-none h-14 font-black text-lg focus:bg-white transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Numéro Mobile</label>
                      <div className="relative">
                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+221 77 123 45 67"
                          className="w-full pl-14 pr-4 h-14 bg-zinc-50 border-none rounded-2xl text-foreground text-lg font-black focus:ring-2 focus:ring-black/5 focus:bg-white transition-all outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Segmentation</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as ClientType })}
                        className="w-full px-5 h-14 bg-zinc-50 border-none rounded-2xl text-foreground text-lg font-black focus:ring-2 focus:ring-black/5 focus:bg-white transition-all outline-none appearance-none"
                      >
                        <option value="OCCASIONAL">OCCASIONNEL (Par Défaut)</option>
                        <option value="REGULAR">RÉGULIER</option>
                        <option value="VIP">CLIENT VIP</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Notes & Observations</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Mensurations, préférences de style, remarques importantes..."
                        rows={5}
                        className="w-full px-6 py-5 bg-zinc-50 border-none rounded-3xl text-foreground text-sm font-bold placeholder:text-zinc-300 focus:ring-2 focus:ring-black/5 focus:bg-white transition-all outline-none resize-none"
                      />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Transactions Card */}
              <div className="space-y-6">
                {!isCreating && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-1.5 h-6 bg-black rounded-full" />
                        <h3 className="text-xl font-black tracking-tight uppercase">Journal d'Achats</h3>
                      </div>
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest tabular-nums bg-zinc-100 px-3 py-1 rounded-lg">{clientSales.length} Sessions</p>
                    </div>

                    <Card className="border-border bg-card shadow-2xl shadow-black/5 rounded-[40px] overflow-hidden flex flex-col min-h-[600px]">
                      <div className="flex-1 overflow-auto">
                        {clientSales.length > 0 ? (
                          <table className="w-full text-left">
                            <thead className="bg-zinc-50 border-b border-zinc-100 sticky top-0 z-10">
                              <tr>
                                <th className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">ID VENTE</th>
                                <th className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">TOTAL NET</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                              {clientSales.slice(0, 50).map((sale) => (
                                <tr key={sale.id} className="hover:bg-zinc-50/50 transition-colors group">
                                  <td className="px-10 py-8">
                                    <div className="flex flex-col gap-1">
                                      <span className="font-mono text-sm font-black text-black">
                                        #{sale.id.slice(-8).toUpperCase()}
                                      </span>
                                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                        {new Date(sale.createdAt).toLocaleDateString('fr-FR')} • {sale.paymentMethod}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-10 py-8 text-right">
                                    <p className="text-xl font-black text-black tabular-nums tracking-tighter">
                                      {Math.round(Number(sale.total)).toLocaleString()} <span className="text-[10px] font-normal text-zinc-400">FCFA</span>
                                    </p>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center opacity-10 py-40">
                            <ShoppingBag className="w-24 h-24 mb-6" />
                            <p className="font-black uppercase tracking-widest text-sm">Zéro achat enregistré</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-zinc-50/30 rounded-[60px] border-2 border-dashed border-zinc-200 m-8">
            <div className="text-center max-w-sm">
              <div className="w-32 h-32 bg-white rounded-[50px] shadow-3xl flex items-center justify-center mx-auto mb-10 transition-transform hover:scale-110">
                <Users className="w-14 h-14 text-black" />
              </div>
              <h2 className="text-4xl font-black text-foreground mb-4 tracking-tighter uppercase">Gestion Clientèle</h2>
              <p className="text-zinc-400 font-medium mb-12 px-6">
                Consultez le dossier complet d'un client ou intégrez un nouveau profile à votre base de données OSEAN.
              </p>
              <Button size="lg" className="h-16 px-12 rounded-3xl font-black uppercase tracking-widest shadow-2xl shadow-black/20" onClick={handleCreateNew}>
                <Plus className="w-6 h-6 mr-4" />
                Ajouter un Profile
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
