'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import type { Product } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ImageUpload, { getImageUrl } from '@/components/ui/ImageUpload';
import { Plus, Package, Pencil, Trash2, Loader2 } from 'lucide-react';

export default function ProduitsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    size: '',
    color: '',
    price: '',
    stock: '',
    photo: '',
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await api.get<Product[]>('/products');
      setProducts(response.data);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        brand: product.brand || '',
        category: product.category || '',
        size: product.size || '',
        color: product.color || '',
        price: String(product.price),
        stock: String(product.stock),
        photo: product.photo || '',
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        brand: '',
        category: '',
        size: '',
        color: '',
        price: '',
        stock: '',
        photo: '',
      });
    }
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const data = {
        name: formData.name,
        brand: formData.brand || null,
        category: formData.category || null,
        size: formData.size || null,
        color: formData.color || null,
        price: Math.round(Number(formData.price)),
        stock: Math.round(Number(formData.stock)),
        photo: formData.photo || null,
      };

      if (editingProduct) {
        await api.patch(`/products/${editingProduct.id}`, data);
      } else {
        await api.post('/products', data);
      }

      setShowModal(false);
      loadProducts();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Erreur');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return;

    try {
      await api.delete(`/products/${id}`);
      loadProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-10 animate-fadeIn pb-6 lg:pb-20">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-foreground tracking-tighter uppercase">Catalogue Produits</h1>
          <p className="text-muted-foreground text-xs lg:text-sm font-medium uppercase tracking-widest mt-1">Gestion de l'inventaire</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-4 w-full lg:w-auto">
          <div className="relative group flex-1 sm:flex-initial">
            <Input
              type="search"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 lg:w-72 h-11 lg:h-12 pl-10 bg-card border-border rounded-full shadow-sm focus:w-full sm:focus:w-72 lg:focus:w-80 transition-all font-bold text-sm lg:text-base"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-black transition-colors">
              <Plus className="w-4 h-4 rotate-45" />
            </span>
          </div>
          <Button onClick={() => openModal()} className="h-11 lg:h-12 px-6 lg:px-8 rounded-full shadow-2xl shadow-black/20 font-black uppercase tracking-widest text-xs lg:text-sm">
            <Plus className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3" />
            Nouveau
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 lg:gap-8">
        {filteredProducts.map((product) => (
          <Card
            key={product.id}
            className="group relative border-border bg-card hover:border-black hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] transition-all duration-500 rounded-2xl lg:rounded-[32px] overflow-hidden"
          >
            {/* Image Section */}
            <div className="aspect-[4/5] bg-zinc-50 relative overflow-hidden">
              {product.photo ? (
                <img
                  src={getImageUrl(product.photo) || ''}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-12 h-12 lg:w-16 lg:h-16 text-zinc-100 group-hover:text-zinc-200 transition-colors" />
                </div>
              )}

              {/* Stock Badge Overlay */}
              <div className="absolute top-2 lg:top-4 left-2 lg:left-4">
                <span className={`px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg lg:rounded-xl text-[8px] lg:text-[10px] font-black uppercase tracking-widest shadow-xl backdrop-blur-md ${product.stock <= 5
                  ? 'bg-red-600 text-white'
                  : product.stock <= 20
                    ? 'bg-amber-400 text-black'
                    : 'bg-white/90 text-black'
                  }`}>
                  {product.stock} DISPO
                </span>
              </div>

              {/* Actions Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 lg:gap-3">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => openModal(product)}
                  className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white text-black hover:bg-black hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
                >
                  <Pencil className="w-4 h-4 lg:w-5 lg:h-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => handleDelete(product.id)}
                  className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white text-red-600 hover:bg-red-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75"
                >
                  <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
                </Button>
              </div>
            </div>

            {/* Content Section */}
            <CardContent className="p-3 lg:p-6">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[8px] lg:text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5 lg:mb-1 truncate">{product.brand || 'ESSENTIALS'}</p>
                  <h3 className="font-black text-sm lg:text-lg tracking-tighter leading-tight group-hover:text-primary transition-colors truncate">{product.name}</h3>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 lg:mt-6">
                <p className="text-lg lg:text-2xl font-black tracking-tighter tabular-nums">
                  {Math.round(Number(product.price)).toLocaleString()} <span className="text-xs lg:text-sm font-normal text-muted-foreground">F</span>
                </p>
                <div className={`w-2 h-2 rounded-full ${product.isActive ? 'bg-black shadow-[0_0_8px_rgba(0,0,0,0.3)]' : 'bg-zinc-200'}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card className="text-center py-20 lg:py-32 border-2 border-dashed border-zinc-100 bg-zinc-50/30 rounded-3xl lg:rounded-[40px]">
          <CardContent>
            <div className="w-20 h-20 lg:w-24 lg:h-24 bg-white rounded-2xl lg:rounded-[32px] shadow-2xl border border-zinc-50 flex items-center justify-center mx-auto mb-6 lg:mb-8">
              <Package className="w-10 h-10 lg:w-12 lg:h-12 text-zinc-100" />
            </div>
            <p className="text-xs lg:text-sm font-black text-muted-foreground uppercase tracking-widest">Aucun résultat</p>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg lg:text-xl">
              {editingProduct ? 'ÉDITION PRODUIT' : 'CRÉATION CATALOGUE'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8 pt-4 lg:pt-6">
            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              <div className="space-y-4 lg:space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] lg:text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Nom de l'article</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Ex: SILK SHIRT BLACK"
                    className="h-11 lg:h-12 bg-zinc-50 border-none font-bold placeholder:text-zinc-300 text-sm lg:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] lg:text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Marque ou Collection</label>
                  <Input
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Ex: LIMITED EDITION 2024"
                    className="h-11 lg:h-12 bg-zinc-50 border-none font-bold placeholder:text-zinc-300 text-sm lg:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] lg:text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Catégorie</label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Ex: Robes, Chemises..."
                    className="h-11 lg:h-12 bg-zinc-50 border-none font-bold placeholder:text-zinc-300 text-sm lg:text-base"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 lg:gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] lg:text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Taille</label>
                    <Input
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      placeholder="Ex: XL, 42..."
                      className="h-11 lg:h-12 bg-zinc-50 border-none font-bold placeholder:text-zinc-300 text-sm lg:text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] lg:text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Couleur</label>
                    <Input
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="Ex: Noir mat..."
                      className="h-11 lg:h-12 bg-zinc-50 border-none font-bold placeholder:text-zinc-300 text-sm lg:text-base"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 lg:gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] lg:text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Prix de vente</label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      className="h-11 lg:h-12 bg-zinc-50 border-none font-bold tabular-nums text-sm lg:text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] lg:text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Stock disponible</label>
                    <Input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      required
                      className="h-11 lg:h-12 bg-zinc-50 border-none font-bold tabular-nums text-sm lg:text-base"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] lg:text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Visuel Produit</label>
                <ImageUpload
                  value={formData.photo}
                  onChange={(url) => setFormData({ ...formData, photo: url || '' })}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 lg:p-4 bg-red-50 border border-red-100 rounded-xl lg:rounded-2xl">
                <p className="text-xs text-red-600 font-black uppercase tracking-widest">{error}</p>
              </div>
            )}

            <div className="flex gap-3 lg:gap-4 pt-4">
              <Button type="button" variant="outline" className="flex-1 h-12 lg:h-14 rounded-xl lg:rounded-2xl font-black uppercase tracking-widest text-xs lg:text-sm" onClick={() => setShowModal(false)}>
                Abandonner
              </Button>
              <Button type="submit" className="flex-1 h-12 lg:h-14 rounded-xl lg:rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-black/20 text-xs lg:text-sm" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 animate-spin" />}
                {editingProduct ? 'Valider' : 'Inscrire'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
