'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  ShoppingCart,
  TrendingUp,
  Banknote,
  CreditCard,
  RefreshCw,
  Loader2,
  Package,
  Gem,
  Users,
} from 'lucide-react';

interface DashboardData {
  todaySales: number;
  todayAmount: number;
  monthSales: number;
  monthAmount: number;
  openCaisses: number;
  lowStockProducts: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    quantitySold: number;
    totalAmount: number;
  }>;
  topVendeuses: Array<{
    userId: string;
    userName: string;
    totalSales: number;
    totalAmount: number;
  }>;
  paymentMethods: Array<{
    method: string;
    count: number;
    total: number;
    percentage: number;
  }>;
  topClients: Array<{
    clientId: string;
    clientName: string;
    totalOrders: number;
    totalAmount: number;
  }>;
}

// Composant Donut Chart Minimaliste & Luxe
const DonutChart = ({ data }: { data: Array<{ label: string, value: number, color: string }> }) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  let currentAngle = 0;

  if (total === 0) return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-40 h-40 rounded-full border-4 border-dashed border-zinc-100 flex items-center justify-center">
        <p className="text-[10px] font-black text-zinc-300 uppercase">Aucune donnée</p>
      </div>
    </div>
  );

  return (
    <div className="relative flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-48 h-48 transform -rotate-90">
        {data.map((item, i) => {
          const percentage = (item.value / total) * 100;
          const angle = (percentage / 100) * 360;
          const x1 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
          const y1 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
          currentAngle += angle;
          const x2 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
          const y2 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);

          const largeArcFlag = angle > 180 ? 1 : 0;

          return (
            <path
              key={i}
              d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
              fill={item.color}
              className="transition-all duration-500 hover:opacity-80 cursor-pointer"
            />
          );
        })}
        {/* Trou central pour le donut */}
        <circle cx="50" cy="50" r="30" fill="white" />
      </svg>
      {/* Centre du Donut */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Total</p>
        <p className="text-xl font-black text-black tracking-tighter tabular-nums leading-none">
          {total.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadDashboard = useCallback(async () => {
    try {
      const [dashRes, vendRes, payRes] = await Promise.all([
        api.get('/reports/dashboard'),
        api.get('/reports/top-vendeuses'),
        api.get('/reports/payment-methods'),
      ]);

      setData({
        todaySales: dashRes.data.todaySales || 0,
        todayAmount: dashRes.data.todayAmount || 0,
        monthSales: dashRes.data.monthSales || 0,
        monthAmount: dashRes.data.monthAmount || 0,
        openCaisses: dashRes.data.openCaisses || 0,
        lowStockProducts: dashRes.data.lowStockProducts || 0,
        topProducts: dashRes.data.topProducts || [],
        topVendeuses: vendRes.data || [],
        paymentMethods: payRes.data || [],
        topClients: dashRes.data.topClients || [],
      });
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Chargement initial
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Polling toutes les 15 secondes pour rafraîchir les données
  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboard();
    }, 15000); // 15 secondes

    return () => clearInterval(interval);
  }, [loadDashboard]);

  // Fonction de rafraîchissement manuel
  const handleRefresh = () => {
    setIsLoading(true);
    loadDashboard();
  };

  // Récupérer les stats par méthode de paiement
  const getPaymentStat = (method: string) => {
    const stat = data?.paymentMethods?.find((p) => p.method === method);
    return { count: stat?.count || 0, total: stat?.total || 0 };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 animate-spin text-black" />
      </div>
    );
  }

  const cashStats = getPaymentStat('CASH');
  const cardStats = getPaymentStat('CARD');

  const stats = [
    {
      label: "Ventes aujourd'hui",
      value: data?.todaySales || 0,
      subValue: `${Math.round(Number(data?.todayAmount || 0)).toLocaleString()} FCFA`,
      icon: ShoppingCart,
      color: 'emerald',
    },
    {
      label: 'Ventes ce mois',
      value: data?.monthSales || 0,
      subValue: `${Math.round(Number(data?.monthAmount || 0)).toLocaleString()} FCFA`,
      icon: TrendingUp,
      color: 'blue',
    },
    {
      label: 'Espèces',
      value: cashStats.count,
      subValue: `${Math.round(Number(cashStats.total)).toLocaleString()} FCFA`,
      icon: Banknote,
      color: 'green',
    },
    {
      label: 'Carte',
      value: cardStats.count,
      subValue: `${Math.round(Number(cardStats.total)).toLocaleString()} FCFA`,
      icon: CreditCard,
      color: 'purple',
    },
  ];

  return (
    <div className="space-y-10 animate-fadeIn pb-20">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tighter">Tableau de Bord</h1>
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest mt-1">Vue d'ensemble de l'activité</p>
        </div>
        <div className="flex items-center gap-4 bg-card p-2 rounded-2xl border border-border shadow-sm">
          <div className="flex flex-col items-end px-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Dernier Refresh</span>
            <span className="text-sm font-black tabular-nums">{lastUpdate.toLocaleTimeString()}</span>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isLoading}
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-xl"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Stats Principales */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="group relative overflow-hidden border-border bg-card hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-zinc-100 px-2 py-1 rounded-md">LIVE</div>
                </div>
                <div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-tighter mb-1">{stat.label}</p>
                  <p className="text-4xl font-black text-foreground tracking-tighter tabular-nums mb-1">{stat.value}</p>
                  <p className="text-sm font-bold text-zinc-400 tabular-nums">{stat.subValue}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Top Vendeuses */}
        <Card className="border-border bg-card shadow-sm overflow-hidden">
          <CardHeader className="border-b border-zinc-100 bg-zinc-50/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                Classement Boutique
              </CardTitle>
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {data?.topVendeuses && data.topVendeuses.length > 0 ? (
              <div className="space-y-2">
                {data.topVendeuses.map((v, index) => (
                  <div
                    key={v.userId}
                    className="flex items-center justify-between p-4 hover:bg-zinc-50 rounded-2xl transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${index === 0 ? 'bg-black text-white' :
                        index === 1 ? 'bg-zinc-200 text-zinc-900' :
                          index === 2 ? 'bg-zinc-100 text-zinc-600' :
                            'bg-zinc-50 text-zinc-400'
                        }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-bold text-foreground group-hover:translate-x-1 transition-transform">{v.userName}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{v.totalSales} ventes réalisées</p>
                      </div>
                    </div>
                    <p className="font-black text-lg tracking-tight tabular-nums">
                      {Math.round(Number(v.totalAmount)).toLocaleString()} <span className="text-[10px] font-normal">FCFA</span>
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/30">
                <ShoppingCart className="w-12 h-12 mb-2" />
                <p className="text-sm font-bold uppercase tracking-widest">Aucune vente enregistrée</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Produits */}
        <Card className="border-border bg-card shadow-sm overflow-hidden">
          <CardHeader className="border-b border-zinc-100 bg-zinc-50/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-black tracking-tight">Performances Produits</CardTitle>
              <ShoppingCart className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {data?.topProducts && data.topProducts.length > 0 ? (
              <div className="space-y-2">
                {data.topProducts.slice(0, 5).map((p, index) => (
                  <div
                    key={p.productId}
                    className="flex items-center justify-between p-4 hover:bg-zinc-50 rounded-2xl transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 font-black text-sm border border-zinc-200">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{p.productName}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{p.quantitySold} exemplaires vendus</p>
                      </div>
                    </div>
                    <p className="font-black text-lg tracking-tight tabular-nums">
                      {Math.round(Number(p.totalAmount)).toLocaleString()} <span className="text-[10px] font-normal">FCFA</span>
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/30">
                <Package className="w-12 h-12 mb-2" />
                <p className="text-sm font-bold uppercase tracking-widest">Aucun produit vendu</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Méthodes de Paiement (Donut Chart) */}
        <Card className="border-border bg-card shadow-sm overflow-hidden">
          <CardHeader className="border-b border-zinc-100 bg-zinc-50/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-black tracking-tight uppercase">Répartition Paiements</CardTitle>
              <Banknote className="w-5 h-5 text-zinc-400" />
            </div>
          </CardHeader>
          <CardContent className="p-10 flex flex-col md:flex-row items-center justify-center gap-10">
            <DonutChart
              data={[
                { label: 'Espèces', value: getPaymentStat('CASH').total, color: '#000000' },
                { label: 'Carte', value: getPaymentStat('CARD').total, color: '#4B5563' },
                { label: 'Mobile', value: getPaymentStat('MOBILE_MONEY').total, color: '#9CA3AF' },
              ]}
            />
            <div className="space-y-6 flex-1 w-full scale-90">
              {['CASH', 'CARD', 'MOBILE_MONEY'].map((m) => {
                const stat = data?.paymentMethods.find(p => p.method === m);
                const colors: Record<string, string> = { CASH: 'bg-black', CARD: 'bg-zinc-600', MOBILE_MONEY: 'bg-zinc-400' };
                const labels: Record<string, string> = { CASH: 'Espèces', CARD: 'Carte Bancaire', MOBILE_MONEY: 'Mobile Money' };
                return (
                  <div key={m} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${colors[m]}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-black transition-colors">{labels[m]}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-sm tabular-nums">{Math.round(stat?.total || 0).toLocaleString()} <span className="text-[10px] font-normal text-zinc-400">FCFA</span></p>
                      <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">{(stat?.percentage || 0).toFixed(1)}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Clients */}
        <Card className="border-border bg-card shadow-sm overflow-hidden">
          <CardHeader className="border-b border-zinc-100 bg-zinc-50/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-black tracking-tight uppercase">Ambassadeurs Premium</CardTitle>
              <Gem className="w-5 h-5 text-zinc-400" />
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {data?.topClients && data.topClients.length > 0 ? (
              <div className="space-y-2">
                {data.topClients.map((c, index) => (
                  <div
                    key={c.clientId}
                    className="flex items-center justify-between p-4 hover:bg-zinc-50 rounded-2xl transition-all border border-transparent hover:border-zinc-100 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center text-white shadow-lg border border-white/10 shrink-0 group-hover:scale-110 transition-transform">
                          <Users className="w-5 h-5" />
                        </div>
                        {index === 0 && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                            <Gem className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-black text-sm uppercase tracking-tight text-foreground">{c.clientName}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{c.totalOrders} commandes exclusives</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-lg tracking-tighter tabular-nums leading-none mb-1">
                        {Math.round(Number(c.totalAmount)).toLocaleString()} <span className="text-[10px] font-normal text-zinc-400">FCFA</span>
                      </p>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Investissement</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground/20">
                <Users className="w-16 h-16 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Aucun client premium enregistré</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
