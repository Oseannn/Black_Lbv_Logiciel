'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import type { Sale, SaleReceipt } from '@/types';
import { Input } from '@/components/ui/Input';
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

export default function VentesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    loadSales();
  }, [dateFrom, dateTo, selectedUserId]);

  const loadUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const loadSales = async () => {
    try {
      let url = '/sales/history';
      const params = new URLSearchParams();
      if (dateFrom) params.append('from', dateFrom);
      if (dateTo) params.append('to', dateTo);
      if (selectedUserId) params.append('userId', selectedUserId);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await api.get<Sale[]>(url);
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

  const totalAmount = sales.reduce((sum, s) => sum + Number(s.total), 0);

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
          <h1 className="text-3xl font-black text-foreground tracking-tighter">Historique des Ventes</h1>
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest mt-1">Journal complet des transactions</p>
        </div>
        <div className="flex items-center gap-3 bg-card p-2 rounded-2xl border border-border shadow-sm flex-wrap">
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="h-10 px-4 border-none bg-zinc-100 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
          >
            <option value="">Toutes les vendeuses</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.role})
              </option>
            ))}
          </select>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-40 h-10 border-none bg-zinc-100 font-bold"
          />
          <span className="text-muted-foreground font-black text-xs uppercase">au</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-40 h-10 border-none bg-zinc-100 font-bold"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="grid sm:grid-cols-2 gap-6">
        <Card className="border-border bg-card shadow-sm rounded-3xl overflow-hidden group hover:border-primary/20 transition-all">
          <CardContent className="p-8 flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-900 group-hover:bg-black group-hover:text-white transition-colors">
              <ClipboardList className="w-8 h-8" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Activité Période</p>
              <p className="text-3xl font-black text-foreground tracking-tighter tabular-nums">{sales.length} <span className="text-sm font-normal">Transactions</span></p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-zinc-900 shadow-xl rounded-3xl overflow-hidden">
          <CardContent className="p-8 flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-white">
              <Banknote className="w-8 h-8" />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Chiffre d'Affaires</p>
              <p className="text-3xl font-black text-white tracking-tighter tabular-nums">
                {Math.round(totalAmount).toLocaleString()} <span className="text-sm font-normal">FCFA</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats par vendeuse */}
      {!selectedUserId && sales.length > 0 && (
        <Card className="border-border bg-card shadow-sm rounded-3xl overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-6 bg-black rounded-full" />
              <h2 className="text-lg font-black uppercase tracking-widest">Performance par Vendeuse</h2>
            </div>
            <div className="space-y-4">
              {(() => {
                const salesByUser = sales.reduce((acc, sale) => {
                  const userId = sale.userId;
                  if (!acc[userId]) {
                    acc[userId] = {
                      name: sale.userName,
                      count: 0,
                      total: 0,
                    };
                  }
                  acc[userId].count++;
                  acc[userId].total += Number(sale.total);
                  return acc;
                }, {} as Record<string, { name: string; count: number; total: number }>);

                return Object.entries(salesByUser)
                  .sort((a, b) => b[1].total - a[1].total)
                  .map(([userId, stats]) => (
                    <div
                      key={userId}
                      className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-zinc-300 transition-all group cursor-pointer"
                      onClick={() => setSelectedUserId(userId)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white border-2 border-zinc-200 flex items-center justify-center font-black text-lg group-hover:border-black group-hover:bg-black group-hover:text-white transition-all">
                          {stats.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-foreground">{stats.name}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            {stats.count} vente{stats.count > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-foreground tabular-nums tracking-tighter">
                          {Math.round(stats.total).toLocaleString()}
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">FCFA</p>
                      </div>
                    </div>
                  ));
              })()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sales list */}
      <div className="space-y-4">
        {selectedUserId && (
          <div className="flex items-center gap-3 p-4 bg-zinc-900 text-white rounded-2xl">
            <p className="text-sm font-bold">
              Filtré par : {users.find(u => u.id === selectedUserId)?.name}
            </p>
            <button
              onClick={() => setSelectedUserId('')}
              className="ml-auto px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
            >
              Voir tout
            </button>
          </div>
        )}
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
                      {sale.items.length} article{sale.items.length > 1 ? 's' : ''} • Par {sale.userName}
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

      {sales.length === 0 && (
        <Card className="text-center py-24 border-2 border-dashed border-zinc-100 bg-zinc-50/30 rounded-3xl">
          <CardContent>
            <div className="w-20 h-20 bg-white rounded-3xl shadow-lg border border-zinc-50 flex items-center justify-center mx-auto mb-6">
              <ClipboardList className="w-10 h-10 text-zinc-200" />
            </div>
            <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">Aucune vente enregistrée sur cette période</p>
          </CardContent>
        </Card>
      )}

      {/* Modal Détail */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Récapitulatif Transaction</DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-8 pt-4">
              <div className="grid grid-cols-2 gap-6 bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Date & Heure</p>
                  <p className="text-sm font-bold">{new Date(selectedSale.createdAt).toLocaleString('fr-FR')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Collaborateur</p>
                  <p className="text-sm font-bold">{selectedSale.userName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Client</p>
                  <p className="text-sm font-bold">{selectedSale.clientName || 'Anonyme'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Paiement</p>
                  <p className="text-sm font-bold flex items-center gap-2">
                    {selectedSale.paymentMethod}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-black rounded-full" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Détail du panier</p>
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
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Vente</span>
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
