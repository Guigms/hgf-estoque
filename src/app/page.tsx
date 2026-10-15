// src/app/page.tsx
import React from 'react';
import Link from 'next/link';
import { 
  Activity, 
  AlertTriangle, 
  ArrowRightLeft, 
  Building2, 
  ChevronDown, 
  DollarSign, 
  LogOut, 
  Package, 
  PackageMinus, 
  Search 
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-full bg-slate-100">
      
      {/* 1. HEADER SUPERIOR (Usuário) */}
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Pesquisar produto, código de barras, lote..." 
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600">
            <Building2 size={14} className="text-slate-400" />
            <span>Almoxarifado Central</span>
          </div>
          <div className="h-6 w-[1px] bg-slate-200 hidden lg:block" />
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="h-9 w-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs ring-2 ring-blue-100">
              GM
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                Guilherme Marques
              </span>
              <span className="text-[10px] font-medium text-slate-500">
                Administrador • MAT: ADM-001
              </span>
            </div>
            <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
          </div>
          <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2" title="Sair do Sistema">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* 2. CORPO DO DASHBOARD */}
      <main className="p-8 flex-1">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Visão Geral do Estoque</h1>
            <p className="text-xs text-slate-500 mt-0.5">Métricas operacionais e indicadores em tempo real</p>
          </div>
          <div className="flex gap-3">
            <Link href="/movements" className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
              <ArrowRightLeft size={15} />
              Transferência
            </Link>
            <Link href="/requests/new" className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2">
              <PackageMinus size={15} />
              Nova Solicitação
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor Em Estoque</p>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <DollarSign size={18} />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-extrabold text-slate-800">R$ 1.245.900,00</h3>
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                <Activity size={12} /> +2.4% este mês
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Itens Físicos</p>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Package size={18} />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-extrabold text-slate-800">14.280 un</h3>
              <p className="text-[11px] text-slate-400 mt-1">840 apresentações ativas</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-red-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">Vencendo em 30d</p>
              <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                <AlertTriangle size={18} />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-extrabold text-red-700">4 Lotes</h3>
              <p className="text-[11px] text-red-500 font-semibold mt-1">Risco: R$ 8.420,00</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Estoque Mínimo</p>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <AlertTriangle size={18} />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-extrabold text-amber-700">12 Produtos</h3>
              <p className="text-[11px] text-amber-600 font-semibold mt-1">Necessitam reposição</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-sm font-bold text-slate-800">Painel de Ação FEFO: Prioridade de Consumo</h2>
            <Link href="/audit" className="text-xs text-blue-600 font-bold hover:underline">Ver Relatório Completo</Link>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Produto</th>
                  <th className="px-6 py-3">Lote</th>
                  <th className="px-6 py-3">Validade</th>
                  <th className="px-6 py-3">Qtd. Disponível</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-3.5 font-bold text-slate-800">Dipirona Sódica 500mg/ml</td>
                  <td className="px-6 py-3.5 font-mono text-[11px] text-slate-600">LOTE-A-URGENTE</td>
                  <td className="px-6 py-3.5 font-bold text-red-600">25/10/2026 (30 dias)</td>
                  <td className="px-6 py-3.5 font-semibold text-slate-700">1.000 AMP</td>
                  <td className="px-6 py-3.5">
                    <span className="px-2.5 py-1 bg-red-100 text-red-700 text-[10px] font-extrabold rounded-md uppercase tracking-wider">
                      Ação Imediata
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}