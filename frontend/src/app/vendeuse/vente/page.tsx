'use client';
// Page de vente pour les vendeuses - Version avec bouton Rafraîchir

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getImageUrl } from '@/components/ui/ImageUpload';
import { useCartStore } from '@/stores/cart.store';
import { useCaisseStore } from '@/stores/caisse.store';
import { useAuthStore } from '@/stores/auth.store';
import type { Product, Client, PaymentMethod, SaleReceipt } from '@/types';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { printReceipt } from '@/lib/print';
import {
  AlertTriangle,
  Package,
  ShoppingCart,
  Banknote,
  CreditCard,
  Smartphone,
  CheckCircle,
  Printer,
  Plus,
  Minus,
  Trash2,
  Search,
  RefreshCw,
  User,
  Pencil,
  UserPlus,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';






export default function VentePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { currentCaisse, fetchCurrentCaisse } = useCaisseStore();
  const {
    items,
    client,
    paymentMethod,
    addItem,
    removeItem,
    updateQuantity,
    setClient,
    setPaymentMethod,
    clearCart,
    getTotal
  } = useCartStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string>('');
  const [clients, setClients] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredProducts = products.filter((p) => p.isActive) || [];

  const [searchProduct, setSearchProduct] = useState('');
  const [showClientModal, setShowClientModal] = useState(false);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [newClientData, setNewClientData] = useState({ name: '', phone: '' });
  const [clientError, setClientError] = useState('');
  const [lastReceipt, setLastReceipt] = useState<SaleReceipt | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Date du jour formatée
  const today = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  useEffect(() => {
    fetchCurrentCaisse();
    loadData();
  }, [fetchCurrentCaisse]);

  const loadData = async () => {
    try {
      const [productsRes, clientsRes] = await Promise.all([
        api.get<Product[]>('/products'),
        api.get<Client[]>('/clients'),
      ]);
      setProducts(productsRes.data);
      setClients(clientsRes.data);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Produits actifs
  const activeProducts = useMemo(() => {
    return products.filter((p) => p.isActive) || [];
  }, [products]);

  // Liste des catégories uniques
  const categories = useMemo(() => {
    const cats = activeProducts
      .map((p) => p.category)
      .filter((c): c is string => !!c); // filter out null/undefined
    return ['ALL', ...Array.from(new Set(cats))];
  }, [activeProducts]);

  // Filtrage par recherche et catégorie
  const filteredProductsMemo = useMemo(() => {
    let result = activeProducts;

    if (selectedCategory !== 'ALL') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (searchProduct.trim()) {
      const search = searchProduct.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.brand?.toLowerCase().includes(search) ||
          p.category?.toLowerCase().includes(search)
      );
    }

    return result;
  }, [activeProducts, searchProduct, selectedCategory]);

  const handleAddToCart = (product: Product) => {
    if (product.stock === 0) return;
    const cartItem = items.find((i) => i.product.id === product.id);
    if (cartItem && cartItem.quantity >= product.stock) {
      return;
    }
    addItem(product);
  };

  const handleSubmitSale = async () => {
    if (!currentCaisse) {
      setError('Vous devez ouvrir votre caisse d\'abord');
      return;
    }

    if (items.length === 0) {
      setError('Le panier est vide');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const saleData = {
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        paymentMethod,
        clientId: client?.id,
      };

      const response = await api.post<{ sale: unknown; receipt: SaleReceipt }>('/sales', saleData);
      setLastReceipt(response.data.receipt);
      clearCart();
      setShowReceiptModal(true);
      fetchCurrentCaisse();
      loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erreur lors de la vente';
      setError(Array.isArray(msg) ? msg[0] : (typeof msg === 'object' ? JSON.stringify(msg) : msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    if (lastReceipt) {
      printReceipt(lastReceipt);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientData.name.trim()) {
      setClientError('Le nom est requis');
      return;
    }

    setIsCreatingClient(true);
    setClientError('');

    try {
      const response = await api.post<Client>('/clients', {
        name: newClientData.name.trim(),
        phone: newClientData.phone.trim() || null,
      });

      setClients((prev) => [...prev, response.data]);
      setClient(response.data);
      setNewClientData({ name: '', phone: '' });
      setShowNewClientForm(false);
      setShowClientModal(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erreur lors de la création';
      setClientError(Array.isArray(msg) ? msg[0] : (typeof msg === 'object' ? JSON.stringify(msg) : msg));
    } finally {
      setIsCreatingClient(false);
    }
  };

  const handleCancelNewClient = () => {
    setNewClientData({ name: '', phone: '' });
    setClientError('');
    setShowNewClientForm(false);
  };

  // Calculs panier
  const subtotal = getTotal();
  const total = subtotal; // Pas de taxe dans l'app actuelle

  // Initiales utilisateur
  const userInitials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  if (!currentCaisse) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center animate-fadeIn">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-12 h-12 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Caisse fermée</h2>
          <p className="text-slate-400 mb-8">
            Vous devez ouvrir votre caisse avant de pouvoir effectuer des ventes
          </p>
          <Button size="lg" onClick={() => router.push('/vendeuse')}>
            Ouvrir la caisse
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-zinc-50 overflow-hidden animate-fadeIn">
      {/* 
          Le header global est déjà fourni par le layout (VendeuseLayout).
          Ici on se concentre sur l'interface de vente.
      */}

      <div className="flex flex-1 overflow-hidden">
        {/* Panneau gauche - Produits */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Barre de recherche & Filtres (Compact) */}
          <div className="p-4 bg-white border-b border-border flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher (Nom, Marque, SKU)..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="w-full pl-12 pr-20 py-2.5 bg-zinc-50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-zinc-200 rounded text-[10px] text-zinc-500 font-mono font-bold">
                CTRL+K
              </span>
            </div>
            <button 
              onClick={() => {
                fetchProducts();
                fetchClients();
              }}
              className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl flex items-center gap-2 font-medium hover:bg-black transition-colors shadow-lg shadow-black/10"
            >
              <RefreshCw className="w-5 h-5" />
              Rafraîchir
            </button>
          </div>

          {/* Sélecteur de Catégorie (Horizontal Scroll) */}
          {categories.length > 1 && (
            <div className="px-4 py-3 bg-white border-b border-border flex gap-2 overflow-x-auto no-scrollbar">
              {categories.map((cat: string) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedCategory === cat
                    ? 'bg-black text-white shadow-lg'
                    : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                    }`}
                >
                  {cat === 'ALL' ? 'TOUTES LES PIÈCES' : cat}
                </button>
              ))}
            </div>
          )}

          {/* Grille de produits */}
          <div className="flex-1 overflow-auto p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProductsMemo.map((product: Product) => {
                const cartItem = items.find((i) => i.product.id === product.id);
                const inCart = cartItem?.quantity || 0;
                const isOutOfStock = product.stock === 0;

                return (
                  <button
                    key={product.id}
                    onClick={() => handleAddToCart(product)}
                    disabled={isOutOfStock}
                    className={`group bg-white rounded-2xl border transition-all duration-300 flex flex-col text-left ${inCart > 0
                      ? 'border-black shadow-xl shadow-black/5 scale-[1.02]'
                      : 'border-zinc-200 hover:border-zinc-400 hover:shadow-lg'
                      } ${isOutOfStock ? 'opacity-40 cursor-not-allowed grayscale' : ''}`}
                  >
                    {/* Image */}
                    <div className="relative aspect-square bg-zinc-50 rounded-t-2xl overflow-hidden border-b border-zinc-100">
                      {product.photo ? (
                        <img
                          src={getImageUrl(product.photo) || '/placeholder.png'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-16 h-16 text-zinc-200" />
                        </div>
                      )}

                      {/* Badge dynamique */}
                      <div className="absolute top-3 right-3">
                        {isOutOfStock ? (
                          <span className="px-2.5 py-1 bg-black text-white text-[10px] font-bold rounded-lg uppercase tracking-wider">Épuisé</span>
                        ) : product.stock <= 5 ? (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-bold rounded-lg uppercase tracking-wider">Stock bas</span>
                        ) : (
                          <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm border border-zinc-200 text-zinc-600 text-[10px] font-bold rounded-lg uppercase tracking-wider">{product.stock} dispo</span>
                        )}
                      </div>

                      {inCart > 0 && (
                        <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                          <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center font-bold text-xl shadow-2xl animate-in zoom-in-50 duration-300">
                            {inCart}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Infos */}
                    <div className="p-4 flex-1 flex flex-col">
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{product.brand || 'Sans marque'}</p>
                      <h3 className="font-black text-foreground truncate text-sm mb-1">{product.name}</h3>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {product.size && (
                          <span className="px-1.5 py-0.5 bg-zinc-100 border border-zinc-200 rounded text-[9px] font-bold text-zinc-600 uppercase">
                            T: {product.size}
                          </span>
                        )}
                        {product.color && (
                          <span className="px-1.5 py-0.5 bg-zinc-100 border border-zinc-200 rounded text-[9px] font-bold text-zinc-600 uppercase">
                            C: {product.color}
                          </span>
                        )}
                      </div>
                      <div className="mt-auto pt-2 flex items-end justify-between">
                        <p className="text-xl font-black text-foreground">
                          {Math.round(Number(product.price)).toLocaleString()} <span className="text-[10px] font-bold text-zinc-400">FCFA</span>
                        </p>
                        <div className="p-2 rounded-lg bg-zinc-100 text-zinc-400 group-hover:bg-black group-hover:text-white transition-colors">
                          <Plus className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredProductsMemo.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-20">
                <Search className="w-16 h-16 mb-4 opacity-10" />
                <p className="font-medium">Aucun produit ne correspond à votre recherche</p>
              </div>
            )}
          </div>
        </div>

        {/* Panneau droit - Panier (Style Sidemenu) */}
        <div className="w-105 bg-white border-l border-border flex flex-col shrink-0 shadow-2xl relative z-10">
          {/* Header Panier / Client */}
          <div className="p-6 border-b border-zinc-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Panier Actuel</h2>
              <button
                onClick={() => setShowClientModal(true)}
                className="flex items-center gap-1 text-[10px] font-bold uppercase py-1.5 px-3 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-colors"
                title="Ajouter ou changer de client"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Client +
              </button>
            </div>

            <button
              onClick={() => setShowClientModal(true)}
              className="w-full group p-4 bg-zinc-50 border border-zinc-100 rounded-2xl hover:bg-white hover:border-black hover:shadow-xl transition-all duration-300 text-left flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-white border border-zinc-100 flex items-center justify-center shrink-0 shadow-sm group-hover:border-black/20">
                <User className="w-6 h-6 text-zinc-400 group-hover:text-black transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground truncate">{client?.name || 'Vente Directe'}</p>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{client?.phone || 'Aucun numéro enregistré'}</p>
              </div>
              <Pencil className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500" />
            </button>
          </div>

          {/* Liste des articles avec scrollbar fine */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-300 space-y-4">
                <div className="w-20 h-20 rounded-full bg-zinc-50 flex items-center justify-center">
                  <ShoppingCart className="w-10 h-10 opacity-20" />
                </div>
                <div className="text-center">
                  <p className="font-black text-zinc-500 uppercase tracking-widest text-[10px] mb-1">Panier vide</p>
                  <p className="text-xs font-medium text-zinc-400">Sélectionnez des articles à gauche</p>
                </div>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.product.id} className="group flex gap-4 p-3 bg-white border border-zinc-100 rounded-2xl hover:border-zinc-200 hover:shadow-sm transition-all animate-in slide-in-from-right-4 duration-300">
                  <div className="w-16 h-16 rounded-xl bg-zinc-50 border border-zinc-100 overflow-hidden shrink-0">
                    {item.product.photo ? (
                      <Image
                        src={getImageUrl(item.product.photo)!}
                        alt={item.product.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-zinc-200" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-2">
                      <p className="font-bold text-sm text-foreground truncate leading-tight">{item.product.name}</p>
                      <button onClick={() => removeItem(item.product.id)} className="p-1 text-zinc-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-zinc-100 rounded-lg p-1">
                        <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center hover:bg-white rounded transition-colors shadow-sm active:scale-90"><Minus className="w-3 h-3" /></button>
                        <span className="w-10 text-center text-xs font-black">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} disabled={item.quantity >= item.product.stock} className="w-6 h-6 flex items-center justify-center hover:bg-white rounded transition-colors shadow-sm disabled:opacity-30 active:scale-90"><Plus className="w-3 h-3" /></button>
                      </div>
                      <p className="font-black text-sm">{Math.round(Number(item.product.price) * item.quantity).toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground">FCFA</span></p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Paiement (Collé en bas) */}
          <div className="p-8 bg-zinc-50 border-t border-zinc-200 space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-zinc-600 font-bold">
                <span className="text-[10px] uppercase tracking-widest">Sous-total</span>
                <span className="tabular-nums">{Math.round(subtotal).toLocaleString()} <span className="text-[10px]">FCFA</span></span>
              </div>
              <div className="flex justify-between items-center text-zinc-600 font-bold">
                <span className="text-[10px] uppercase tracking-widest">Remises</span>
                <span className="text-emerald-600">-0 FCFA</span>
              </div>
              <div className="pt-4 flex justify-between items-end border-t border-zinc-200">
                <span className="text-sm font-black uppercase tracking-tighter">Total à Encaisser</span>
                <span className="text-4xl font-black tracking-tighter tabular-nums leading-none">
                  {Math.round(total).toLocaleString()} <span className="text-sm font-normal text-zinc-400">FCFA</span>
                </span>
              </div>
            </div>

            {/* Méthodes de paiement (Grid Monochrome) */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { method: 'CASH' as PaymentMethod, icon: Banknote, label: 'ESPÈCES' },
                { method: 'CARD' as PaymentMethod, icon: CreditCard, label: 'CARTE' },
                { method: 'MOBILE_MONEY' as PaymentMethod, icon: Smartphone, label: 'MOBILE' },
              ].map(({ method, icon: Icon, label }) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`py-3 rounded-2xl flex flex-col items-center gap-1 border-2 transition-all duration-300 ${paymentMethod === method
                    ? 'border-black bg-black text-white shadow-xl scale-[1.05] z-10'
                    : 'border-white bg-white text-zinc-400 hover:border-zinc-300'
                    }`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-[9px] font-black tracking-widest">{label}</span>
                </button>
              ))}
            </div>

            {/* Boutons d'action géants */}
            <div className="flex gap-4">
              <button
                onClick={clearCart}
                disabled={items.length === 0}
                className="w-16 h-16 rounded-2xl bg-white border border-zinc-200 text-zinc-400 flex items-center justify-center hover:bg-zinc-100 hover:text-red-500 hover:border-red-200 transition-all disabled:opacity-0 disabled:scale-90"
                title="Vider le panier"
              >
                <Trash2 className="w-6 h-6" />
              </button>
              <button
                onClick={handleSubmitSale}
                disabled={items.length === 0 || isSubmitting}
                className="flex-1 h-16 rounded-2xl bg-zinc-900 text-white font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-black hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-black/20 disabled:opacity-20 disabled:grayscale disabled:scale-100"
              >
                {isSubmitting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    Valider la vente
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-100 border border-red-200 rounded-xl animate-in slide-in-from-bottom-2 duration-300">
                <p className="text-[10px] font-bold text-red-700 text-center uppercase tracking-widest">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Client */}
      <Dialog
        open={showClientModal}
        onOpenChange={(open) => {
          setShowClientModal(open);
          if (!open) handleCancelNewClient();
        }}
      >
        <DialogContent className="bg-white border-slate-200 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900">
              {showNewClientForm ? 'Nouveau client' : 'Sélectionner un client'}
            </DialogTitle>
          </DialogHeader>

          {showNewClientForm ? (
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nom du client</label>
                <input
                  type="text"
                  value={newClientData.name}
                  onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
                  placeholder="Nom complet"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-black/5 focus:border-black transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Téléphone (optionnel)</label>
                <input
                  type="text"
                  value={newClientData.phone}
                  onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
                  placeholder="+221 77 123 45 67"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-black/5 focus:border-black transition-all"
                />
              </div>

              {clientError && <p className="text-sm text-rose-500">{clientError}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancelNewClient}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isCreatingClient}
                  className="flex-1 py-2.5 bg-black text-white rounded-xl font-black uppercase tracking-widest hover:bg-zinc-800 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-black/10"
                >
                  {isCreatingClient && <Loader2 className="w-4 h-4 animate-spin" />}
                  Créer le Compte
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Bouton nouveau client */}
              <button
                onClick={() => setShowNewClientForm(true)}
                className="w-full p-6 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-zinc-200 text-zinc-400 hover:border-black hover:text-black hover:bg-zinc-50 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                  <UserPlus className="w-6 h-6" />
                </div>
                <span className="font-black uppercase tracking-widest text-[10px]">Créer un nouveau client</span>
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-slate-400">ou sélectionner</span>
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-auto">
                <button
                  onClick={() => {
                    setClient(null);
                    setShowClientModal(false);
                  }}
                  className={`w-full p-3 text-left rounded-xl transition-colors ${!client ? 'bg-zinc-900 border-2 border-black text-white' : 'bg-slate-50 hover:bg-slate-100 border-2 border-transparent'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Client anonyme</p>
                      <p className="text-sm text-slate-500">Vente directe</p>
                    </div>
                  </div>
                </button>

                {clients?.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setClient(c);
                      setShowClientModal(false);
                    }}
                    className={`w-full p-3 text-left rounded-xl transition-colors ${client?.id === c.id ? 'bg-zinc-900 border-2 border-black text-white shadow-xl shadow-black/10' : 'bg-zinc-50 hover:bg-zinc-100 border-2 border-transparent'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border ${client?.id === c.id ? 'bg-white/20 border-white/20 text-white' : 'bg-zinc-100 border-zinc-200 text-zinc-600'}`}>
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{c.name}</p>
                        <p className="text-sm text-slate-500">{c.phone || 'Pas de téléphone'}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Ticket */}
      <Dialog open={showReceiptModal} onOpenChange={setShowReceiptModal}>
        <DialogContent className="bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-foreground text-center uppercase tracking-tighter">
              Vente réussie !
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-6 py-4">
            <div className="w-24 h-24 rounded-full bg-zinc-900 flex items-center justify-center mx-auto shadow-2xl shadow-black/20">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <div>
              <p className="text-4xl font-black text-black tabular-nums">
                {Math.round(lastReceipt?.total || 0).toLocaleString()} <span className="text-sm font-normal text-zinc-400">FCFA</span>
              </p>
              <p className="text-sm text-slate-500 mt-1">Ticket #{lastReceipt?.receiptNumber}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReceiptModal(false)}
                className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50"
              >
                Fermer
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 flex items-center justify-center gap-2"
              >
                <Printer className="w-5 h-5" />
                Imprimer
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
