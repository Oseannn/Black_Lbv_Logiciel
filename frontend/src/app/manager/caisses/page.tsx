'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import type { Caisse } from '@/types';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Wallet, Circle, Loader2 } from 'lucide-react';

export default function CaissesPage() {
  const [caisses, setCaisses] = useState<Caisse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCaisse, setSelectedCaisse] = useState<Caisse | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    loadCaisses();
  }, [dateFrom, dateTo]);

  const loadCaisses = async () => {
    try {
      let url = '/caisse/history';
      const params = new URLSearchParams();
      if (dateFrom) params.append('from', dateFrom);
      if (dateTo) params.append('to', dateTo);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await api.get<Caisse[]>(url);
      setCaisses(response.data);
    } catch (err) {
      console.error('Error loading caisses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCaisseDetail = async (id: string) => {
    try {
      const response = await api.get<Caisse>(`/caisse/${id}`);
      setSelectedCaisse(response.data);
      setShowDetailModal(true);
    } catch (err) {
      console.error('Error loading caisse detail:', err);
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
          <h1 className="text-3xl font-black text-foreground tracking-tighter">Historique des Sessions</h1>
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest mt-1">Contrôle des flux de caisse journaliers</p>
        </div>
        <div className="flex items-center gap-3 bg-card p-2 rounded-2xl border border-border shadow-sm">
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

      {/* Caisses list */}
      <div className="grid gap-4">
        {caisses.map((caisse) => {
          const difference = caisse.difference ? Number(caisse.difference) : null;

          return (
            <Card
              key={caisse.id}
              className="cursor-pointer border-border hover:border-black hover:shadow-xl transition-all duration-300 bg-card rounded-2xl group overflow-hidden"
              onClick={() => loadCaisseDetail(caisse.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shadow-sm ${caisse.status === 'OPEN'
                      ? 'bg-black text-white'
                      : 'bg-zinc-100 text-zinc-400'
                      }`}>
                      <Circle className={`w-6 h-6 ${caisse.status === 'OPEN' ? 'fill-white animate-pulse' : 'fill-current'}`} />
                    </div>
                    <div>
                      <p className="text-lg font-black text-foreground tracking-tight group-hover:translate-x-1 transition-transform">{caisse.userName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">OUVERTURE:</span>
                        <span className="text-xs font-black tabular-nums">{Math.round(Number(caisse.openingAmount)).toLocaleString()} FCFA</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">DATE DE SESSION</p>
                      <p className="text-sm font-bold">{new Date(caisse.openedAt).toLocaleDateString('fr-FR')}</p>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2 justify-end">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm border ${caisse.status === 'OPEN'
                          ? 'bg-black text-white border-black'
                          : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                          }`}>
                          {caisse.status === 'OPEN' ? 'SESSION OUVERTE' : 'SESSION FERMÉE'}
                        </span>
                        {difference !== null && (
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm border ${difference >= 0
                            ? 'bg-zinc-100 text-zinc-900 border-zinc-200'
                            : 'bg-red-50 text-red-600 border-red-100'
                            }`}>
                            {difference >= 0 ? '+' : ''}{Math.round(difference).toLocaleString()} FCFA
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic font-mono">
                        ID: {caisse.id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {caisses.length === 0 && (
        <Card className="text-center py-24 border-2 border-dashed border-zinc-100 bg-zinc-50/30 rounded-[40px]">
          <CardContent>
            <div className="w-20 h-20 bg-white rounded-3xl shadow-lg border border-zinc-50 flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-10 h-10 text-zinc-200" />
            </div>
            <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">Aucune session trouvée pour cette période</p>
          </CardContent>
        </Card>
      )}

      {/* Modal Détail */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Audit de Session</DialogTitle>
          </DialogHeader>
          {selectedCaisse && (
            <div className="space-y-8 pt-6">
              <div className="flex items-center justify-between bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Propriétaire Caissier</p>
                  <p className="text-lg font-black tracking-tight">{selectedCaisse.userName}</p>
                </div>
                <div className="text-right space-y-2">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Statut Final</p>
                  <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md ${selectedCaisse.status === 'OPEN'
                    ? 'bg-black text-white'
                    : 'bg-zinc-200 text-zinc-700'
                    }`}>
                    {selectedCaisse.status === 'OPEN' ? 'OUVERTE' : 'TERMINÉE'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 bg-zinc-50/50 p-4 rounded-xl border border-zinc-100">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Ouverte le</p>
                  <p className="text-sm font-bold">{new Date(selectedCaisse.openedAt).toLocaleString('fr-FR')}</p>
                </div>
                {selectedCaisse.closedAt ? (
                  <div className="space-y-1 bg-zinc-50/50 p-4 rounded-xl border border-zinc-100 text-right">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Fermée le</p>
                    <p className="text-sm font-bold">{new Date(selectedCaisse.closedAt).toLocaleString('fr-FR')}</p>
                  </div>
                ) : (
                  <div className="space-y-1 bg-zinc-900 border border-black p-4 rounded-xl text-right">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Session en cours</p>
                    <p className="text-sm font-bold text-white animate-pulse">ACTIVE</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 px-1">Flux d'entrée</p>
                  <div className="bg-zinc-100 p-5 rounded-3xl border border-zinc-200">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Fond Initial</p>
                    <p className="text-2xl font-black tabular-nums tracking-tighter">
                      {Math.round(Number(selectedCaisse.openingAmount)).toLocaleString()} <span className="text-xs font-normal">FCFA</span>
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 px-1">Chiffre d'Affaire</p>
                  <div className="bg-zinc-900 p-5 rounded-3xl border border-black shadow-xl">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Ventes Nettes</p>
                    <p className="text-2xl font-black text-white tabular-nums tracking-tighter">
                      {Math.round(Number(selectedCaisse.totalSales)).toLocaleString()} <span className="text-xs font-normal">FCFA</span>
                    </p>
                  </div>
                </div>
                {selectedCaisse.closingAmount !== null && (
                  <>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 px-1">Compte Théorique</p>
                      <div className="bg-zinc-50 p-5 rounded-3xl border border-zinc-100">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Attendu</p>
                        <p className="text-2xl font-black tabular-nums tracking-tighter text-zinc-600">
                          {Math.round(Number(selectedCaisse.expectedAmount)).toLocaleString()} <span className="text-xs font-normal">FCFA</span>
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 px-1">Compte Réel</p>
                      <div className="bg-white p-5 rounded-3xl border-2 border-black shadow-lg">
                        <p className="text-[10px] font-black text-black uppercase tracking-widest mb-1">Déclaré</p>
                        <p className="text-2xl font-black tabular-nums tracking-tighter text-black">
                          {Math.round(Number(selectedCaisse.closingAmount)).toLocaleString()} <span className="text-xs font-normal text-zinc-400">FCFA</span>
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {selectedCaisse.difference !== null && (
                <div className={`p-8 rounded-[40px] text-center border-2 transition-all shadow-2xl ${Number(selectedCaisse.difference) >= 0
                  ? 'bg-zinc-900 border-black text-white'
                  : 'bg-red-50 border-red-200 text-red-600'
                  }`}>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Verdict de Clôture</p>
                  <p className="text-4xl font-black tabular-nums tracking-tighter">
                    {Number(selectedCaisse.difference) >= 0 ? '+' : ''}
                    {Math.round(Number(selectedCaisse.difference)).toLocaleString()} <span className="text-sm font-normal">FCFA</span>
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest mt-2">{Number(selectedCaisse.difference) >= 0 ? 'Conforme ou Excédent' : 'DÉFICIT CONSTATÉ'}</p>
                </div>
              )}

              {selectedCaisse.cashMovements && selectedCaisse.cashMovements.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-black rounded-full" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Journal des mouvements (Sorties)</p>
                  </div>
                  <div className="space-y-2">
                    {selectedCaisse.cashMovements.map((movement) => (
                      <div key={movement.id} className="flex justify-between items-center p-4 bg-zinc-50 border border-zinc-100 rounded-2xl group hover:bg-white transition-colors">
                        <span className="text-sm font-bold text-foreground">{movement.reason}</span>
                        <span className="font-black tabular-nums text-red-600 bg-red-50 px-3 py-1 rounded-xl border border-red-100 text-xs">
                          -{Math.round(Number(movement.amount)).toLocaleString()} FCFA
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
