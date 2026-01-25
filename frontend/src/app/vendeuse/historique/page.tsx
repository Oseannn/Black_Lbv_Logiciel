'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import type { Sale, SaleReceipt } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { printReceipt } from '@/lib/print';
import {
  Banknote,
  CreditCard,
  Smartphone,
  Wallet,
  ClipboardList,
  Printer,
  Loader2,
} from 'lucide-react';

export default function HistoriquePage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      const response = await api.get<Sale[]>('/sales/my-history');
      setSales(response.data);
    } catch (err) {
      console.error('Error loading sales:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintReceipt = async (saleId: string) => {
    try {
      const response = await api.get<SaleReceipt>(`/sales/${saleId}/receipt`);
      printReceipt(response.data);
    } catch (err) {
      console.error('Error printing receipt:', err);
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'CASH':
        return <Banknote className="w-6 h-6" />;
      case 'CARD':
        return <CreditCard className="w-6 h-6" />;
      case 'MOBILE_MONEY':
        return <Smartphone className="w-6 h-6" />;
      default:
        return <Wallet className="w-6 h-6" />;
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
      <div>
        <h2 className="text-3xl font-black text-foreground tracking-tighter">Mon Historique</h2>
        <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest mt-1">Journal de vos ventes réalisées</p>
      </div>

      {sales.length === 0 ? (
        <Card className="text-center py-24 border-2 border-dashed border-zinc-100 bg-zinc-50/30 rounded-3xl">
          <CardContent>
            <div className="w-20 h-20 bg-white rounded-3xl shadow-lg border border-zinc-50 flex items-center justify-center mx-auto mb-6">
              <ClipboardList className="w-10 h-10 text-zinc-200" />
            </div>
            <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">Aucune vente enregistrée pour le moment</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sales.map((sale) => (
            <Card
              key={sale.id}
              className="cursor-pointer border-border hover:border-primary/40 hover:shadow-xl hover:translate-x-1 transition-all duration-300 bg-card rounded-2xl group overflow-hidden"
              onClick={() => {
                setSelectedSale(sale);
                setShowDetailModal(true);
              }}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white transition-colors duration-300">
                      {getPaymentIcon(sale.paymentMethod)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-xl font-black text-foreground tabular-nums tracking-tighter">
                          {Math.round(Number(sale.total)).toLocaleString()} <span className="text-xs font-normal">FCFA</span>
                        </p>
                        <span className="px-2 py-0.5 text-[8px] font-black border border-zinc-200 rounded-md uppercase tracking-widest text-zinc-400 group-hover:border-zinc-800 group-hover:text-zinc-800 transition-colors">
                          {sale.paymentMethod}
                        </span>
                      </div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        {sale.items.length} article{sale.items.length > 1 ? 's' : ''} • Client : {sale.clientName || 'Anonyme'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-foreground">
                      {new Date(sale.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {new Date(sale.createdAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Détail */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Détail de la Vente</DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-8 pt-4">
              <div className="grid grid-cols-2 gap-6 bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Date & Heure</p>
                  <p className="text-sm font-bold">{new Date(selectedSale.createdAt).toLocaleString('fr-FR')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Paiement</p>
                  <p className="text-sm font-bold">{selectedSale.paymentMethod}</p>
                </div>
                <div className="col-span-2 space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Client</p>
                  <p className="text-sm font-bold">{selectedSale.clientName || 'Anonyme'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-black rounded-full" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Articles achetés</p>
                </div>
                <div className="space-y-3 px-1">
                  {selectedSale.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center group">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground">
                          {item.productName}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground">Qté: {item.quantity}</span>
                      </div>
                      <span className="font-black tabular-nums tracking-tight">
                        {Math.round(Number(item.totalPrice)).toLocaleString()} <span className="text-[10px] font-normal">FCFA</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t-2 border-dashed border-zinc-100 pt-6">
                <div className="flex items-center justify-between bg-zinc-900 text-white p-6 rounded-2xl shadow-xl">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Total payé</span>
                  <span className="text-3xl font-black tabular-nums tracking-tighter">
                    {Math.round(Number(selectedSale.total)).toLocaleString()} <span className="text-sm font-normal">FCFA</span>
                  </span>
                </div>
              </div>

              <Button
                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-black/10"
                onClick={() => handlePrintReceipt(selectedSale.id)}
              >
                <Printer className="w-5 h-5 mr-3" />
                Réimprimer le ticket
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
