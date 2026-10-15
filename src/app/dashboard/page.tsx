// src/app/dashboard/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { getDashboardAlerts } from '@/app/actions/dashboard';
import { AlertTriangle, TrendingDown, Clock, Activity, PackageOpen } from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const alerts = await getDashboardAlerts();
        setData(alerts);
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">A carregar indicadores do painel...</div>;
  }

  const isExpired = (dateString: string) => new Date(dateString) < new Date();

  return (
    <div className="p-8 font-sans max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Activity className="text-blue-600" />
          Dashboard Executivo SGH
        </h1>
        <p className="text-sm text-slate-500 mt-1">Visão geral do sistema e motor de alertas de risco.</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-amber-50 rounded-lg text-amber-600"><PackageOpen size={24} /></div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Pedidos Pendentes</p>
            <p className="text-2xl font-bold text-slate-800">{data.stats.pendingRequests}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-rose-50 rounded-lg text-rose-600"><Clock size={24} /></div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Lotes a Vencer / Vencidos</p>
            <p className="text-2xl font-bold text-slate-800">{data.stats.totalExpiring}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-orange-50 rounded-lg text-orange-600"><TrendingDown size={24} /></div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Estoque Crítico</p>
            <p className="text-2xl font-bold text-slate-800">{data.stats.totalLowStock}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Painel: Estoque Baixo */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-orange-50/50 p-4 border-b border-slate-200 flex items-center gap-2">
            <TrendingDown className="text-orange-600" size={20} />
            <h2 className="font-bold text-slate-800">Alertas de Reposição (Estoque Crítico)</h2>
          </div>
          <div className="p-0">
            {data.lowStockAlerts.length === 0 ? (
              <p className="p-6 text-sm text-slate-500 text-center">Nenhum produto abaixo do estoque mínimo.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {data.lowStockAlerts.map((prod: any) => (
                  <li key={prod.id} className="p-4 hover:bg-slate-50 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{prod.name}</p>
                      <p className="text-xs text-slate-500">Cód: {prod.internalCode} • Mínimo Exigido: {prod.minStock}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-orange-600">{prod.totalAvailable} <span className="text-xs font-normal text-orange-600/70">{prod.unitOfMeasure}</span></p>
                      <p className="text-[10px] font-bold uppercase text-orange-500 bg-orange-100 px-2 py-0.5 rounded-full mt-1">
                        {prod.totalAvailable === 0 ? 'Zerado' : 'Crítico'}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Painel: Validades */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-rose-50/50 p-4 border-b border-slate-200 flex items-center gap-2">
            <AlertTriangle className="text-rose-600" size={20} />
            <h2 className="font-bold text-slate-800">Alertas de Validade (Próx. 30 dias)</h2>
          </div>
          <div className="p-0">
            {data.expiringLots.length === 0 ? (
              <p className="p-6 text-sm text-slate-500 text-center">Nenhum lote próximo ao vencimento.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {data.expiringLots.map((lot: any) => {
                  const expired = isExpired(lot.expirationDate);
                  return (
                    <li key={lot.id} className={`p-4 hover:bg-slate-50 flex justify-between items-center ${expired ? 'bg-rose-50/30' : ''}`}>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{lot.product.name}</p>
                        <p className="text-xs text-slate-500">
                          Lote: <span className="font-mono font-semibold">{lot.lotNumber}</span> • Local: {lot.balances[0]?.warehouse?.name || 'Múltiplos'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${expired ? 'text-rose-600' : 'text-amber-600'}`}>
                          {new Date(lot.expirationDate).toLocaleDateString('pt-PT')}
                        </p>
                        <p className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mt-1 ${expired ? 'text-rose-500 bg-rose-100' : 'text-amber-600 bg-amber-100'}`}>
                          {expired ? 'Vencido' : 'Próximo'}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}