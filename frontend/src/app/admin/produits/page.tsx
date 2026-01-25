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
    <div className="space-y-10 animate-fadeIn pb-20">
      <div className="flex items-center justify-between flex-wrap gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase">Catalogue Produits</h1>
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest mt-1">Gestion de l'inventaire & Collections</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Input
              type="search"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-72 h-12 pl-10 bg-card border-border rounded-full shadow-sm focus:w-80 transition-all font-bold"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-black transition-colors">
              <Plus className="w-4 h-4 rotate-45" />
            </span>
          </div>
          <Button onClick={() => openModal()} className="h-12 px-8 rounded-full shadow-2xl shadow-black/20 font-black uppercase tracking-widest">
            <Plus className="w-5 h-5 mr-3" />
            Nouveau Produit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredProducts.map((product) => (
          <Card
            key={product.id}
            className="group relative border-border bg-card hover:border-black hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] transition-all duration-500 rounded-[32px] overflow-hidden"
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
                  <Package className="w-16 h-16 text-zinc-100 group-hover:text-zinc-200 transition-colors" />
                </div>
              )}

              {/* Stock Badge Overlay */}
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl backdrop-blur-md ${product.stock <= 5
                  ? 'bg-red-600 text-white'
                  : product.stock <= 20
                    ? 'bg-amber-400 text-black'
                    : 'bg-white/90 text-black'
                  }`}>
                  {product.stock} DISPONIBLES
                </span>
              </div>

              {/* Actions Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => openModal(product)}
                  className="w-12 h-12 rounded-full bg-white text-black hover:bg-black hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
                >
                  <Pencil className="w-5 h-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => handleDelete(product.id)}
                  className="w-12 h-12 rounded-full bg-white text-red-600 hover:bg-red-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content Section */}
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{product.brand || 'ESSENTIALS'}</p>
                  <h3 className="font-black text-lg tracking-tighter leading-tight group-hover:text-primary transition-colors">{product.name}</h3>
                </div>
              </div>
              <div className="flex items-center justify-between mt-6">
                <p className="text-2xl font-black tracking-tighter tabular-nums">
                  {Math.round(Number(product.price)).toLocaleString()} <span className="text-sm font-normal text-muted-foreground">FCFA</span>
                </p>
                <div className={`w-2 h-2 rounded-full ${product.isActive ? 'bg-black shadow-[0_0_8px_rgba(0,0,0,0.3)]' : 'bg-zinc-200'}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card className="text-center py-32 border-2 border-dashed border-zinc-100 bg-zinc-50/30 rounded-[40px]">
          <CardContent>
            <div className="w-24 h-24 bg-white rounded-[32px] shadow-2xl border border-zinc-50 flex items-center justify-center mx-auto mb-8">
              <Package className="w-12 h-12 text-zinc-100" />
            </div>
            <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">Aucun résultat pour cette collection</p>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'ÉDITION PRODUIT' : 'CRÉATION CATALOGUE'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-8 pt-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Nom de l'article</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Ex: SILK SHIRT BLACK"
                    className="h-12 bg-zinc-50 border-none font-bold placeholder:text-zinc-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Marque ou Collection</label>
                  <Input
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Ex: LIMITED EDITION 2024"
                    className="h-12 bg-zinc-50 border-none font-bold placeholder:text-zinc-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Catégorie</label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Ex: Robes, Chemises..."
                    className="h-12 bg-zinc-50 border-none font-bold placeholder:text-zinc-300"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Taille</label>
                    <Input
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      placeholder="Ex: XL, 42..."
                      className="h-12 bg-zinc-50 border-none font-bold placeholder:text-zinc-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Couleur</label>
                    <Input
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="Ex: Noir mat..."
                      className="h-12 bg-zinc-50 border-none font-bold placeholder:text-zinc-300"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Prix de vente</label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      className="h-12 bg-zinc-50 border-none font-bold tabular-nums"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Stock disponible</label>
                    <Input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      required
                      className="h-12 bg-zinc-50 border-none font-bold tabular-nums"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Visuel Produit</label>
                <ImageUpload
                  value={formData.photo}
                  onChange={(url) => setFormData({ ...formData, photo: url || '' })}
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                <p className="text-xs text-red-600 font-black uppercase tracking-widest">{error}</p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest" onClick={() => setShowModal(false)}>
                Abandonner
              </Button>
              <Button type="submit" className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-black/20" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-5 h-5 mr-3 animate-spin" />}
                {editingProduct ? 'Valider les Changements' : 'Inscrire au Catalogue'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
