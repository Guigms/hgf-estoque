// src/app/inventory/page.tsx
'use client';

import React, { useState } from 'react';
import { ClipboardList, AlertTriangle, CheckCircle2, Lock, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';

export default function InventoryPage() {
  // Simulando dados de um inventário rotativo aberto no Almoxarifado Central
  const [items, setItems] = useState([
    {
      id: '1',
      code: 'PROD-001',
      productName: 'Dipirona Sódica 500mg/ml (AMP)',
      systemQty: 1000,
      firstCount: 1000,
      secondCount: 990,
      finalCount: 990,
      divergence: -10,
      unitCost: 1.50
    },
    {
      id: '2',
      code: 'MAT-045',
      productName: 'Seringa Descartável 10ml (UN)',
      systemQty: 2500,
      firstCount: 2500,
      secondCount: 2500,
      finalCount: 2500,
      divergence: 0,
      unitCost: 0.35
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ success?: boolean; message: string } | null>(null);

  // Executa o ajuste de saldo automático
  const handleApproveAdjustments = async () => {
    setLoading(true);
    setFeedback(null);

    try {
      // Simulando a execução da transação de ajuste
      await new Promise(resolve => setTimeout(resolve, 1200));

      setFeedback({ 
        success: true, 
        message: 'Inventário finalizado! Saldos ajustados e movimentações de estorno/perda registadas na auditoria.' 
      });
    } catch (err) {
      setFeedback({ success: false, message: 'Erro ao processar ajustes do inventário.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* CABEÇALHO */}
        <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <ClipboardList size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-800">Inventário Rotativo #INV-2026-09</h1>
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-extrabold rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Lock size={10} /> Em Contagem
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Almoxarifado Central — Corredor 01 (Analgésicos e Consumíveis)</p>
            </div>
          </div>

          <button 
            onClick={handleApproveAdjustments}
            disabled={loading}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
            Aprovar e Finalizar Inventário
          </button>
        </div>

        {feedback && (
          <div className={`p-4 rounded-lg flex items-center gap-3 text-sm font-semibold shadow-sm ${
            feedback.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            {feedback.success ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* TABELA DE AUDITORIA DE CONTAGEM */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-800">Conferência de Dupla Contagem x Saldo do Sistema</h2>
            <span className="text-xs text-slate-500 font-medium">Contagem cega ativa</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-white text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Código / Produto</th>
                  <th className="px-6 py-3.5 text-center">Saldo Sistema</th>
                  <th className="px-6 py-3.5 text-center">1ª Contagem</th>
                  <th className="px-6 py-3.5 text-center">2ª Contagem</th>
                  <th className="px-6 py-3.5 text-center">Divergência</th>
                  <th className="px-6 py-3.5 text-right">Impacto Financeiro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => {
                  const hasDivergence = item.divergence !== 0;
                  const financialImpact = item.divergence * item.unitCost;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800 text-xs">{item.productName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{item.code}</p>
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-slate-700">
                        {item.systemQty}
                      </td>
                      <td className="px-6 py-4 text-center font-mono">
                        <input 
                          type="number" 
                          defaultValue={item.firstCount}
                          className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-center text-xs focus:bg-white outline-none focus:border-indigo-500"
                        />
                      </td>
                      <td className="px-6 py-4 text-center font-mono">
                        <input 
                          type="number" 
                          defaultValue={item.secondCount}
                          className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-center text-xs focus:bg-white outline-none focus:border-indigo-500"
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        {hasDivergence ? (
                          <span className={`px-2 py-1 rounded text-[10px] font-extrabold inline-flex items-center gap-1 ${
                            item.divergence < 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {item.divergence < 0 ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                            {item.divergence} un
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">
                            OK (0)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold">
                        {hasDivergence ? (
                          <span className={financialImpact < 0 ? 'text-rose-600' : 'text-emerald-600'}>
                            {financialImpact.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        ) : (
                          <span className="text-slate-400">R$ 0,00</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
            <span>Ao finalizar, o sistema efetuará o lançamento automático da variação no livro razão do estoque.</span>
            <span className="font-semibold text-slate-700">Divergência Total do Inventário: <strong className="text-rose-600">- R$ 15,00</strong></span>
          </div>
        </div>

      </div>
    </div>
  );
}