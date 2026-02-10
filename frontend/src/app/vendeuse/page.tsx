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
    <div className="space-y-6 lg:space-y-8 animate-fadeIn pb-6 lg:pb-20 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black text-foreground tracking-tighter">Ma Caisse</h2>
          <p className="text-muted-foreground text-xs lg:text-sm font-medium uppercase tracking-widest mt-1">Gestion des flux et session</p>
        </div>
      </div>

      {currentCaisse ? (
        <>
          {/* Caisse ouverte */}
          <Card className="relative overflow-hidden border-border bg-card shadow-xl rounded-2xl lg:rounded-3xl">
            <CardContent className="p-4 lg:p-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 lg:mb-10 gap-4">
                <div className="flex items-center gap-3 lg:gap-5">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl bg-zinc-900 flex items-center justify-center shadow-lg shadow-black/20">
                    <Wallet className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 lg:w-2.5 lg:h-2.5 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-200" />
                      <p className="text-[10px] lg:text-xs font-black text-green-600 uppercase tracking-widest">Session Active</p>
                    </div>
                    <p className="text-xs lg:text-sm font-bold text-muted-foreground">
                      {new Date(currentCaisse.openedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <div className="text-left lg:text-right">
                  <p className="text-[9px] lg:text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">ID Session</p>
                  <p className="font-mono text-xs font-bold bg-zinc-100 px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg border border-zinc-200">
                    #{currentCaisse.id.slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:gap-6 mb-6 lg:mb-10">
                <div className="bg-zinc-50 border border-zinc-100 rounded-2xl lg:rounded-3xl p-4 lg:p-6 transition-all hover:shadow-inner">
                  <p className="text-[9px] lg:text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 lg:mb-2">Fond de caisse</p>
                  <p className="text-xl lg:text-3xl font-black text-foreground tabular-nums tracking-tighter">
                    {Math.round(Number(currentCaisse.openingAmount)).toLocaleString()} <span className="text-xs lg:text-sm font-normal text-muted-foreground">F</span>
                  </p>
                </div>
                <div className="bg-green-50/30 border border-green-100 rounded-2xl lg:rounded-3xl p-4 lg:p-6 transition-all hover:shadow-inner">
                  <p className="text-[9px] lg:text-[10px] font-black text-green-700 uppercase tracking-widest mb-1 lg:mb-2">Total Ventes</p>
                  <p className="text-xl lg:text-3xl font-black text-green-700 tabular-nums tracking-tighter">
                    +{Math.round(Number(currentCaisse.totalSales)).toLocaleString()} <span className="text-xs lg:text-sm font-normal">F</span>
                  </p>
                </div>
                <div className="bg-red-50/30 border border-red-100 rounded-2xl lg:rounded-3xl p-4 lg:p-6 transition-all hover:shadow-inner">
                  <p className="text-[9px] lg:text-[10px] font-black text-red-700 uppercase tracking-widest mb-1 lg:mb-2">Sorties</p>
                  <p className="text-xl lg:text-3xl font-black text-red-700 tabular-nums tracking-tighter">
                    -{Math.round(Number(currentCaisse.totalCashOut)).toLocaleString()} <span className="text-xs lg:text-sm font-normal">F</span>
                  </p>
                </div>
                <div className="bg-zinc-900 border border-black rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-2xl shadow-black/10">
                  <p className="text-[9px] lg:text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 lg:mb-2">Solde attendu</p>
                  <p className="text-xl lg:text-3xl font-black text-white tabular-nums tracking-tighter">
                    {Math.round(Number(currentCaisse.currentBalance)).toLocaleString()} <span className="text-xs lg:text-sm font-normal text-zinc-400">F</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 lg:gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full h-12 lg:h-14 rounded-xl lg:rounded-2xl border-2 font-bold hover:bg-zinc-50 text-sm lg:text-base"
                  onClick={() => setShowCashOutModal(true)}
                >
                  <ArrowUpFromLine className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3" />
                  Déclarer une sortie
                </Button>
                <Button
                  variant="destructive"
                  size="lg"
                  className="w-full h-12 lg:h-14 rounded-xl lg:rounded-2xl font-black uppercase tracking-widest border-2 border-black bg-black text-white hover:bg-zinc-800 shadow-2xl shadow-black/20 text-sm lg:text-base"
                  onClick={() => setShowCloseModal(true)}
                >
                  <Lock className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3" />
                  Clôturer la journée
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Caisse fermée */}
          <Card className="text-center py-12 lg:py-20 border-dashed border-2 bg-zinc-50/50 rounded-2xl lg:rounded-3xl border-zinc-200">
            <CardContent>
              <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl lg:rounded-3xl bg-white border border-zinc-100 shadow-2xl flex items-center justify-center mx-auto mb-6 lg:mb-8 animate-bounce transition-all duration-1000">
                <Lock className="w-8 h-8 lg:w-10 lg:h-10 text-zinc-900" />
              </div>
              <h3 className="text-xl lg:text-2xl font-black text-foreground mb-2 lg:mb-3 tracking-tight">Prête à commencer ?</h3>
              <p className="text-sm lg:text-base text-muted-foreground mb-6 lg:mb-10 max-w-sm mx-auto font-medium px-4">
                Votre caisse est fermée. Définissez votre fond de caisse pour activer le terminal.
              </p>
              <Button size="lg" className="h-12 lg:h-14 px-8 lg:px-10 rounded-xl lg:rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-black/20 text-sm lg:text-base" onClick={() => setShowOpenModal(true)}>
                <Unlock className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3" />
                Ouvrir ma caisse
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {/* Modal Ouverture */}
      <Dialog open={showOpenModal} onOpenChange={setShowOpenModal}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg lg:text-xl">Mise à disposition du fond</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleOpenCaisse} className="space-y-4 lg:space-y-6 pt-4">
            <div className="space-y-2">
              <label className="text-xs lg:text-sm font-semibold text-muted-foreground uppercase tracking-widest">Fond de caisse (FCFA)</label>
              <Input
                type="number"
                value={openingAmount}
                onChange={(e) => setOpeningAmount(e.target.value)}
                placeholder="Ex: 50000"
                required
                min="0"
                className="h-12 text-base lg:text-lg font-bold"
              />
            </div>
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-xs lg:text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}
            <div className="flex gap-3">
              <Button type="button" variant="ghost" className="flex-1 h-11 lg:h-12 text-sm lg:text-base" onClick={() => setShowOpenModal(false)}>
                Annuler
              </Button>
              <Button type="submit" className="flex-1 h-11 lg:h-12 shadow-lg shadow-black/10 text-sm lg:text-base" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Ouvrir
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Fermeture */}
      <Dialog open={showCloseModal} onOpenChange={setShowCloseModal}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg lg:text-xl">Clôture de session</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCloseCaisse} className="space-y-4 lg:space-y-6 pt-4">
            <div className="bg-zinc-900 rounded-xl lg:rounded-2xl p-4 lg:p-6 text-center shadow-xl">
              <p className="text-[9px] lg:text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Solde informatique attendu</p>
              <p className="text-2xl lg:text-3xl font-black text-white tabular-nums tracking-tighter">
                {currentCaisse ? Math.round(Number(currentCaisse.currentBalance)).toLocaleString() : 0} <span className="text-xs lg:text-sm font-normal">F</span>
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs lg:text-sm font-semibold text-muted-foreground uppercase tracking-widest">Montant compté réel (FCFA)</label>
              <Input
                type="number"
                value={closingAmount}
                onChange={(e) => setClosingAmount(e.target.value)}
                placeholder="Montant physique"
                required
                min="0"
                className="h-12 text-base lg:text-lg font-bold"
              />
            </div>
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-xs lg:text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}
            <div className="flex gap-3">
              <Button type="button" variant="ghost" className="flex-1 h-11 lg:h-12 text-sm lg:text-base" onClick={() => setShowCloseModal(false)}>
                Annuler
              </Button>
              <Button type="submit" className="flex-1 h-11 lg:h-12 font-black uppercase tracking-widest shadow-2xl shadow-black/20 text-xs lg:text-sm" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Clôturer
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Sortie de caisse */}
      <Dialog open={showCashOutModal} onOpenChange={setShowCashOutModal}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg lg:text-xl">Déclarer une sortie de fonds</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCashOut} className="space-y-4 lg:space-y-6 pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs lg:text-sm font-semibold text-muted-foreground uppercase tracking-widest">Montant à sortir (FCFA)</label>
                <Input
                  type="number"
                  value={cashOutAmount}
                  onChange={(e) => setCashOutAmount(e.target.value)}
                  placeholder="0"
                  required
                  min="1"
                  className="h-12 text-base lg:text-lg font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs lg:text-sm font-semibold text-muted-foreground uppercase tracking-widest">Motif de la dépense</label>
                <Input
                  type="text"
                  value={cashOutReason}
                  onChange={(e) => setCashOutReason(e.target.value)}
                  placeholder="Ex: Transport, fournitures..."
                  required
                  className="h-12 text-sm lg:text-base"
                />
              </div>
            </div>
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-xs lg:text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}
            <div className="flex gap-3">
              <Button type="button" variant="ghost" className="flex-1 h-11 lg:h-12 text-sm lg:text-base" onClick={() => setShowCashOutModal(false)}>
                Annuler
              </Button>
              <Button type="submit" className="flex-1 h-11 lg:h-12 font-bold shadow-lg shadow-black/10 text-sm lg:text-base" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Valider
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
