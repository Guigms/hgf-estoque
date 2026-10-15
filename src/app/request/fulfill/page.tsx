// src/app/requests/fulfill/page.tsx
'use client';

import React, { useState } from 'react';
import { PackageCheck, Clock, CheckCircle2, Bed, User, AlertCircle, ArrowRight, ShieldAlert } from 'lucide-react';

export default function RequestFulfillPage() {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ success?: boolean; message: string } | null>(null);

  // Simulando requisições pendentes vindas do banco de dados (Status: SUBMITTED)
  const [pendingRequests, setPendingRequests] = useState([
    {
      id: 'req-101',
      code: 'REQ-2026-0089',
      department: 'UTI Adulto',
      requestedAt: 'Há 12 minutos',
      professionalName: 'Dra. Ana Silva',
      professionalId: 'CRM-CE 12345',
      bedNumber: 'UTI-A-04',
      patientName: null,
      patientCpf: null,
      priority: 'HIGH',
      items: [
        {
          productId: 'PROD-001',
          productName: 'Dipirona Sódica 500mg/ml (AMP)',
          requestedQty: 50,
          suggestedLot: 'LOTE-A-URGENTE', // Sugerido via FEFO
          availableQtyInLot: 1000
        },
        {
          productId: 'MAT-045',
          productName: 'Seringa Descartável 10ml (UN)',
          requestedQty: 50,
          suggestedLot: 'LOT-SER-2026',
          availableQtyInLot: 2500
        }
      ]
    }
  ]);

  // Função que executa a baixa no estoque
  const handleFulfillRequest = async (requestId: string) => {
    setLoading(true);
    setFeedback(null);

    try {
      // Simulando o envio para a API de movimentação (EXIT_DISPENSATION / TRANSFER)
      await new Promise(resolve => setTimeout(resolve, 1000));

      setFeedback({
        success: true,
        message: `Requisição ${requestId} atendida com sucesso! Baixa efetuada no estoque físico via política FEFO.`
      });

      // Remove a requisição atendida da fila
      setPendingRequests(pendingRequests.filter(r => r.id !== requestId));

    } catch (err: any) {
      setFeedback({ success: false, message: 'Erro ao dar baixa no estoque.' });
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
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <PackageCheck size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Fila de Atendimento de Requisições</h1>
              <p className="text-xs text-slate-500 mt-0.5">Almoxarifado Central — Separação e Baixa de Materiais Clínicos</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full flex items-center gap-1.5">
            <Clock size={14} /> {pendingRequests.length} Soluções Pendentes
          </span>
        </div>

        {feedback && (
          <div className={`p-4 rounded-lg flex items-center gap-3 text-sm font-semibold shadow-sm ${
            feedback.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            {feedback.success ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* LISTA DE REQUISIÇÕES PARA SEPARAÇÃO/BAIXA */}
        {pendingRequests.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-sm">
            <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-3" />
            <h3 className="text-base font-bold text-slate-700">Nenhuma requisição pendente!</h3>
            <p className="text-xs text-slate-400 mt-1">Todas as solicitações das alas clínicas foram separadas e baixadas.</p>
          </div>
        ) : (
          pendingRequests.map((req) => (
            <div key={req.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              
              {/* CABEÇALHO DO CARD DA REQUISIÇÃO */}
              <div className="p-5 bg-slate-50 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-800">{req.code}</span>
                  <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-extrabold rounded-md">
                    {req.department}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">• {req.requestedAt}</span>
                </div>

                {/* INFO DO PACIENTE OU LEITO */}
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                  <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-lg border border-slate-200">
                    <User size={14} className="text-blue-500" />
                    <span>{req.professionalName} ({req.professionalId})</span>
                  </div>

                  {req.bedNumber ? (
                    <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg border border-emerald-200">
                      <Bed size={14} />
                      <span>Leito: {req.bedNumber}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1 rounded-lg border border-amber-200">
                      <ShieldAlert size={14} />
                      <span>Paciente: {req.patientName} (CPF: {req.patientCpf})</span>
                    </div>
                  )}
                </div>
              </div>

              {/* TABELA DE MATERIAIS COM LOTE FEFO RECOMENDADO */}
              <div className="p-6">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Itens Solicitados & Lotes Recomendados (FEFO)
                </h4>
                
                <div className="border border-slate-200 rounded-lg overflow-hidden mb-6">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="px-4 py-3">Material</th>
                        <th className="px-4 py-3 text-center">Qtd. Solicitada</th>
                        <th className="px-4 py-3 text-center">Lote Sugerido (FEFO)</th>
                        <th className="px-4 py-3 text-center">Saldo em Lote</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {req.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-bold text-slate-800">{item.productName}</td>
                          <td className="px-4 py-3 text-center font-bold text-blue-600">{item.requestedQty}</td>
                          <td className="px-4 py-3 text-center font-mono font-bold text-emerald-600 bg-emerald-50/50">
                            {item.suggestedLot}
                          </td>
                          <td className="px-4 py-3 text-center text-slate-500">{item.availableQtyInLot} un</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* BOTÃO DE CONFIRMAÇÃO DE BAIXA */}
                <div className="flex justify-end gap-3">
                  <button 
                    type="button" 
                    className="px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    Rejeitar Solicitação
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleFulfillRequest(req.id)}
                    disabled={loading}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? 'A dar baixa no estoque...' : (
                      <>
                        Confirmar Separação & Dar Baixa no Estoque <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>

              </div>

            </div>
          ))
        )}

      </div>
    </div>
  );
}