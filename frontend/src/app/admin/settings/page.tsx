'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import type { Settings } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import ImageUpload, { getImageUrl } from '@/components/ui/ImageUpload';
import { Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    logo: '',
    currency: '',
    slogan: '',
    invoiceFooter: '',
    address: '',
    phone: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.get<Settings>('/settings');
      setSettings(response.data);
      setFormData({
        companyName: response.data.companyName || '',
        logo: response.data.logo || '',
        currency: response.data.currency || 'FCFA',
        slogan: response.data.slogan || '',
        invoiceFooter: response.data.invoiceFooter || '',
        address: response.data.address || '',
        phone: response.data.phone || '',
      });
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      await api.patch('/settings', {
        companyName: formData.companyName,
        logo: formData.logo || null,
        currency: formData.currency,
        slogan: formData.slogan || null,
        invoiceFooter: formData.invoiceFooter || null,
        address: formData.address || null,
        phone: formData.phone || null,
      });
      setMessage('Paramètres enregistrés avec succès !');
      loadSettings();
    } catch (err) {
      console.error('Error saving settings:', err);
      setMessage('Erreur lors de l\'enregistrement');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetData = async () => {
    if (resetConfirmText !== 'REINITIALISER') {
      setMessage('Veuillez taper exactement "REINITIALISER" pour confirmer');
      return;
    }

    setIsResetting(true);
    setMessage('');

    try {
      await api.post('/settings/reset-data');
      setMessage('✅ Toutes les données ont été réinitialisées avec succès !');
      setShowResetConfirm(false);
      setResetConfirmText('');
      // Recharger après 2 secondes
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error('Error resetting data:', err);
      setMessage('❌ Erreur lors de la réinitialisation');
    } finally {
      setIsResetting(false);
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
    <div className="space-y-10 animate-fadeIn pb-20 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black text-foreground tracking-tighter">Paramètres Système</h1>
        <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest mt-1">Configuration de l'identité Boutique</p>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-10">
        <div className="space-y-10">
          {/* Informations entreprise */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-black rounded-full" />
              <h3 className="text-lg font-black tracking-tight uppercase">Identité Visuelle</h3>
            </div>

            <Card className="border-border bg-card shadow-md p-8 rounded-3xl space-y-6">
              <Input
                label="NOM DE L'ENSEIGNE"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="bg-zinc-50 border-none font-bold"
                required
              />
              <Input
                label="SLOGAN DE MARQUE"
                value={formData.slogan}
                onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                className="bg-zinc-50 border-none font-bold"
                placeholder="Ex: La qualité au meilleur prix"
              />
              <Input
                label="ADRESSE PHYSIQUE"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="bg-zinc-50 border-none font-bold"
                placeholder="Ex: 123 Rue du Commerce, Dakar"
              />
              <Input
                label="LIGNE TÉLÉPHONIQUE"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-zinc-50 border-none font-bold"
                placeholder="Ex: +221 77 123 45 67"
              />
              <ImageUpload
                label="LOGO OFFICIEL"
                value={formData.logo}
                onChange={(url) => setFormData({ ...formData, logo: url || '' })}
              />
            </Card>
          </div>

          {/* Paramètres facture */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-black rounded-full" />
              <h3 className="text-lg font-black tracking-tight uppercase">Configuration Facture</h3>
            </div>

            <Card className="border-border bg-card shadow-md p-8 rounded-3xl space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">DEVISE DE RÉFÉRENCE</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 h-12 bg-zinc-100 border-none rounded-2xl text-foreground text-sm font-black focus:ring-2 focus:ring-black/5 transition-all outline-none appearance-none"
                >
                  <option value="FCFA">FCFA (Franc CFA)</option>
                  <option value="EUR">EUR (Euro)</option>
                  <option value="USD">USD (Dollar)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">PIED DE PAGE (LÉGAL)</label>
                <textarea
                  value={formData.invoiceFooter}
                  onChange={(e) => setFormData({ ...formData, invoiceFooter: e.target.value })}
                  placeholder="Merci pour votre achat !"
                  rows={4}
                  className="w-full px-4 py-3 bg-zinc-100 border-none rounded-2xl text-foreground text-sm font-bold placeholder:text-muted-foreground focus:ring-2 focus:ring-black/5 transition-all outline-none resize-none"
                />
              </div>
            </Card>
          </div>
        </div>

        <div className="space-y-10">
          {/* Preview ticket */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-black rounded-full" />
              <h3 className="text-lg font-black tracking-tight uppercase">Aperçu Réel Ticket</h3>
            </div>

            <Card className="border-border bg-zinc-100 shadow-inner p-10 rounded-[40px] flex items-center justify-center">
              <div className="bg-white text-black p-8 rounded-sm font-mono text-sm w-full max-w-xs shadow-2xl relative overflow-hidden">
                {/* Simulated jagged edge top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-b from-zinc-200 to-transparent opacity-20" />

                <div className="text-center border-b-2 border-dashed border-zinc-200 pb-6 mb-6">
                  {formData.logo && (
                    <img
                      src={getImageUrl(formData.logo) || ''}
                      alt="Logo"
                      className="w-20 h-20 object-contain mx-auto mb-4 grayscale"
                    />
                  )}
                  <p className="font-black text-xl tracking-tighter uppercase">{formData.companyName || 'OSEAN SHOP'}</p>
                  {formData.slogan && <p className="text-[10px] italic mt-1 text-zinc-500">{formData.slogan}</p>}
                  {formData.address && <p className="text-[10px] mt-2 text-zinc-400">{formData.address}</p>}
                  {formData.phone && <p className="text-[10px] text-zinc-400">Tél: {formData.phone}</p>}
                </div>

                <div className="border-b-2 border-dashed border-zinc-200 pb-6 mb-6 space-y-2">
                  <div className="flex justify-between">
                    <span>Article Démo #1</span>
                    <span className="font-bold">15,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Article Démo #2</span>
                    <span className="font-bold">25,500</span>
                  </div>
                </div>

                <div className="flex justify-between text-lg font-black tracking-tighter border-b-2 border-double border-zinc-900 pb-2 mb-6">
                  <span>TOTAL</span>
                  <span>40,500 {formData.currency}</span>
                </div>

                <div className="text-center text-[10px] leading-relaxed text-zinc-500 font-bold uppercase tracking-widest">
                  {formData.invoiceFooter || 'Merci pour votre confiance !'}
                </div>

                {/* Simulated jagged edge bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-t from-zinc-200 to-transparent opacity-20" />
              </div>
            </Card>
          </div>

          {message && (
            <div className={`p-6 rounded-3xl animate-slideUp shadow-xl transition-all ${message.includes('succès')
              ? 'bg-zinc-900 border border-black text-white'
              : 'bg-red-50 border border-red-100 text-red-600'
              }`}>
              <p className="font-black uppercase tracking-widest text-xs">{message}</p>
            </div>
          )}

          <Button type="submit" size="lg" className="w-full h-16 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-black/20" isLoading={isSaving}>
            Enregistrer la Configuration
          </Button>
        </div>
      </form>

      {/* Zone dangereuse - Réinitialisation */}
      <div className="mt-20 pt-10 border-t-4 border-red-100">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-red-500 rounded-full" />
            <h3 className="text-lg font-black tracking-tight uppercase text-red-600">Zone Dangereuse</h3>
          </div>

          <Card className="border-2 border-red-200 bg-red-50/50 shadow-md p-8 rounded-3xl space-y-6">
            <div className="space-y-3">
              <h4 className="text-xl font-black text-red-900">Réinitialiser toutes les données</h4>
              <p className="text-sm text-red-700 font-medium leading-relaxed">
                ⚠️ <strong>ATTENTION :</strong> Cette action est <strong>IRRÉVERSIBLE</strong> et supprimera définitivement :
              </p>
              <ul className="text-sm text-red-700 font-medium space-y-2 ml-6 list-disc">
                <li>Toutes les ventes et historiques</li>
                <li>Tous les produits du catalogue</li>
                <li>Tous les clients enregistrés</li>
                <li>Toutes les caisses et mouvements</li>
                <li>Tous les utilisateurs (sauf l'admin principal)</li>
                <li>Les paramètres de la boutique</li>
              </ul>
              <p className="text-sm text-red-700 font-bold">
                Seul le compte admin principal sera conservé.
              </p>
            </div>

            {!showResetConfirm ? (
              <Button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="w-full h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest"
              >
                🗑️ Réinitialiser toutes les données
              </Button>
            ) : (
              <div className="space-y-4 p-6 bg-white rounded-2xl border-2 border-red-300">
                <p className="text-sm font-black text-red-900 uppercase tracking-widest">
                  Pour confirmer, tapez exactement : <span className="text-red-600">REINITIALISER</span>
                </p>
                <Input
                  value={resetConfirmText}
                  onChange={(e) => setResetConfirmText(e.target.value)}
                  placeholder="Tapez REINITIALISER"
                  className="bg-red-50 border-2 border-red-200 font-bold text-center"
                />
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => {
                      setShowResetConfirm(false);
                      setResetConfirmText('');
                    }}
                    className="flex-1 h-12 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 rounded-xl font-bold"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="button"
                    onClick={handleResetData}
                    disabled={resetConfirmText !== 'REINITIALISER'}
                    isLoading={isResetting}
                    className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase tracking-widest disabled:opacity-50"
                  >
                    Confirmer la réinitialisation
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
