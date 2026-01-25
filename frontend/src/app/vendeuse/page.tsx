'use client';

import { useState } from 'react';
import { useCaisseStore } from '@/stores/caisse.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Wallet,
  Lock,
  Unlock,
  ArrowUpFromLine,
  Loader2,
} from 'lucide-react';

export default function CaissePage() {
  const { currentCaisse, isLoading, openCaisse, closeCaisse, cashOut } = useCaisseStore();

  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showCashOutModal, setShowCashOutModal] = useState(false);

  const [openingAmount, setOpeningAmount] = useState('');
  const [closingAmount, setClosingAmount] = useState('');
  const [cashOutAmount, setCashOutAmount] = useState('');
  const [cashOutReason, setCashOutReason] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenCaisse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await openCaisse(Number(openingAmount));
      setShowOpenModal(false);
      setOpeningAmount('');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erreur lors de l\'ouverture';
      setError(Array.isArray(msg) ? msg[0] : (typeof msg === 'object' ? JSON.stringify(msg) : msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseCaisse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await closeCaisse(Number(closingAmount));
      setShowCloseModal(false);
      setClosingAmount('');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erreur lors de la fermeture';
      setError(Array.isArray(msg) ? msg[0] : (typeof msg === 'object' ? JSON.stringify(msg) : msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCashOut = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await cashOut(Number(cashOutAmount), cashOutReason);
      setShowCashOutModal(false);
      setCashOutAmount('');
      setCashOutReason('');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erreur lors de la sortie';
      setError(Array.isArray(msg) ? msg[0] : (typeof msg === 'object' ? JSON.stringify(msg) : msg));
    } finally {
      setIsSubmitting(false);
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
    <div className="space-y-8 animate-fadeIn pb-20 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-foreground tracking-tighter">Ma Caisse</h2>
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest mt-1">Gestion des flux et session</p>
        </div>
      </div>

      {currentCaisse ? (
        <>
          {/* Caisse ouverte */}
          <Card className="relative overflow-hidden border-border bg-card shadow-xl rounded-3xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center shadow-lg shadow-black/20">
                    <Wallet className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-200" />
                      <p className="text-xs font-black text-green-600 uppercase tracking-widest">Session Active</p>
                    </div>
                    <p className="text-sm font-bold text-muted-foreground">
                      Ouverte le {new Date(currentCaisse.openedAt).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">ID Session</p>
                  <p className="font-mono text-xs font-bold bg-zinc-100 px-3 py-1.5 rounded-lg border border-zinc-200">
                    #{currentCaisse.id.slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 mb-10">
                <div className="bg-zinc-50 border border-zinc-100 rounded-3xl p-6 transition-all hover:shadow-inner">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Fond de caisse</p>
                  <p className="text-3xl font-black text-foreground tabular-nums tracking-tighter">
                    {Math.round(Number(currentCaisse.openingAmount)).toLocaleString()} <span className="text-sm font-normal text-muted-foreground">FCFA</span>
                  </p>
                </div>
                <div className="bg-green-50/30 border border-green-100 rounded-3xl p-6 transition-all hover:shadow-inner">
                  <p className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-2">Total Ventes</p>
                  <p className="text-3xl font-black text-green-700 tabular-nums tracking-tighter">
                    +{Math.round(Number(currentCaisse.totalSales)).toLocaleString()} <span className="text-sm font-normal">FCFA</span>
                  </p>
                </div>
                <div className="bg-red-50/30 border border-red-100 rounded-3xl p-6 transition-all hover:shadow-inner">
                  <p className="text-[10px] font-black text-red-700 uppercase tracking-widest mb-2">Sorties de caisse</p>
                  <p className="text-3xl font-black text-red-700 tabular-nums tracking-tighter">
                    -{Math.round(Number(currentCaisse.totalCashOut)).toLocaleString()} <span className="text-sm font-normal">FCFA</span>
                  </p>
                </div>
                <div className="bg-zinc-900 border border-black rounded-3xl p-6 shadow-2xl shadow-black/10">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Solde en main attendu</p>
                  <p className="text-3xl font-black text-white tabular-nums tracking-tighter">
                    {Math.round(Number(currentCaisse.currentBalance)).toLocaleString()} <span className="text-sm font-normal text-zinc-400">FCFA</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 h-14 rounded-2xl border-2 font-bold hover:bg-zinc-50"
                  onClick={() => setShowCashOutModal(true)}
                >
                  <ArrowUpFromLine className="w-5 h-5 mr-3" />
                  Déclarer une sortie
                </Button>
                <Button
                  variant="destructive"
                  size="lg"
                  className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest border-2 border-black bg-black text-white hover:bg-zinc-800 shadow-2xl shadow-black/20"
                  onClick={() => setShowCloseModal(true)}
                >
                  <Lock className="w-5 h-5 mr-3" />
                  Clôturer la journée
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Caisse fermée */}
          <Card className="text-center py-20 border-dashed border-2 bg-zinc-50/50 rounded-3xl border-zinc-200">
            <CardContent>
              <div className="w-24 h-24 rounded-3xl bg-white border border-zinc-100 shadow-2xl flex items-center justify-center mx-auto mb-8 animate-bounce transition-all duration-1000">
                <Lock className="w-10 h-10 text-zinc-900" />
              </div>
              <h3 className="text-2xl font-black text-foreground mb-3 tracking-tight">Prête à commencer ?</h3>
              <p className="text-muted-foreground mb-10 max-w-sm mx-auto font-medium">
                Votre caisse est actuellement fermée. Veuillez définir votre fond de caisse initial pour activer le terminal de vente.
              </p>
              <Button size="lg" className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-black/20" onClick={() => setShowOpenModal(true)}>
                <Unlock className="w-5 h-5 mr-3" />
                Ouvrir ma caisse
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {/* Modal Ouverture */}
      <Dialog open={showOpenModal} onOpenChange={setShowOpenModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mise à disposition du fond</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleOpenCaisse} className="space-y-6 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Fond de caisse (FCFA)</label>
              <Input
                type="number"
                value={openingAmount}
                onChange={(e) => setOpeningAmount(e.target.value)}
                placeholder="Ex: 50000"
                required
                min="0"
                className="h-12 text-lg font-bold"
              />
            </div>
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}
            <div className="flex gap-3">
              <Button type="button" variant="ghost" className="flex-1 h-12" onClick={() => setShowOpenModal(false)}>
                Annuler
              </Button>
              <Button type="submit" className="flex-1 h-12 shadow-lg shadow-black/10" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Ouvrir la session
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Fermeture */}
      <Dialog open={showCloseModal} onOpenChange={setShowCloseModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Clôture de session</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCloseCaisse} className="space-y-6 pt-4">
            <div className="bg-zinc-900 rounded-2xl p-6 text-center shadow-xl">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Solde informatique attendu</p>
              <p className="text-3xl font-black text-white tabular-nums tracking-tighter">
                {currentCaisse ? Math.round(Number(currentCaisse.currentBalance)).toLocaleString() : 0} <span className="text-sm font-normal">FCFA</span>
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Montant compté réel (FCFA)</label>
              <Input
                type="number"
                value={closingAmount}
                onChange={(e) => setClosingAmount(e.target.value)}
                placeholder="Montant physiquement présent"
                required
                min="0"
                className="h-12 text-lg font-bold"
              />
            </div>
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}
            <div className="flex gap-3">
              <Button type="button" variant="ghost" className="flex-1 h-12" onClick={() => setShowCloseModal(false)}>
                Annuler
              </Button>
              <Button type="submit" className="flex-1 h-12 font-black uppercase tracking-widest shadow-2xl shadow-black/20" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Valider la Clôture
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Sortie de caisse */}
      <Dialog open={showCashOutModal} onOpenChange={setShowCashOutModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Déclarer une sortie de fonds</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCashOut} className="space-y-6 pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Montant à sortir (FCFA)</label>
                <Input
                  type="number"
                  value={cashOutAmount}
                  onChange={(e) => setCashOutAmount(e.target.value)}
                  placeholder="0"
                  required
                  min="1"
                  className="h-12 text-lg font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Motif de la dépense</label>
                <Input
                  type="text"
                  value={cashOutReason}
                  onChange={(e) => setCashOutReason(e.target.value)}
                  placeholder="Ex: Frais de transport, fournitures..."
                  required
                  className="h-12"
                />
              </div>
            </div>
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}
            <div className="flex gap-3">
              <Button type="button" variant="ghost" className="flex-1 h-12" onClick={() => setShowCashOutModal(false)}>
                Annuler
              </Button>
              <Button type="submit" className="flex-1 h-12 font-bold shadow-lg shadow-black/10" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Valider la Retrait
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
