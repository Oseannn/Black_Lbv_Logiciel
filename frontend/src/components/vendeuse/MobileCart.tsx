'use client';

import { useState } from 'react';
import { ShoppingCart, Minus, Plus, Trash2, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import { getImageUrl } from '@/components/ui/ImageUpload';
import type { CartItem } from '@/types';

interface MobileCartProps {
  items: CartItem[];
  total: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  itemCount: number;
}

export function MobileCart({ items, total, onUpdateQuantity, onRemoveItem, itemCount }: MobileCartProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Bouton flottant panier */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-16 h-16 bg-black text-white rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-transform lg:hidden"
      >
        <ShoppingCart className="w-7 h-7" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-black">
            {itemCount}
          </span>
        )}
      </button>

      {/* Drawer panier mobile */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300 lg:hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-200">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-6 h-6" />
                <h3 className="text-lg font-black">Panier ({itemCount})</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center active:scale-95 transition-transform"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-12 text-zinc-400">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">Panier vide</p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-3 p-3 bg-zinc-50 rounded-2xl border border-zinc-100"
                  >
                    <div className="w-16 h-16 rounded-xl bg-white border border-zinc-200 overflow-hidden shrink-0">
                      {item.product.photo ? (
                        <Image
                          src={getImageUrl(item.product.photo)!}
                          alt={item.product.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="w-6 h-6 text-zinc-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <p className="font-bold text-sm truncate">{item.product.name}</p>
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="p-1 text-zinc-400 active:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center bg-white rounded-lg border border-zinc-200">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center active:bg-zinc-100 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-10 text-center text-sm font-black">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="w-8 h-8 flex items-center justify-center active:bg-zinc-100 transition-colors disabled:opacity-30"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="font-black text-sm">
                          {Math.round(Number(item.product.price) * item.quantity).toLocaleString()}{' '}
                          <span className="text-xs font-normal text-zinc-400">FCFA</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total */}
            {items.length > 0 && (
              <div className="p-4 border-t border-zinc-200 bg-zinc-50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-zinc-600">Total</span>
                  <span className="text-2xl font-black">
                    {Math.round(total).toLocaleString()}{' '}
                    <span className="text-sm font-normal text-zinc-400">FCFA</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
