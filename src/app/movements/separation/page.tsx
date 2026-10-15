// src/app/movements/separation/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { getPendingRequests, processSeparationFEFO } from '@/app/actions/separation';
import { PackageOpen, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function SeparationQueuePage() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string, type: 'success'|'error', msg: string } | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await getPendingRequests();
      setRequests(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeparate = async (requestId: string) => {
    if (!session?.user?.id) return;
    setProcessingId(requestId);
    setFeedback(null);

    try {
      await processSeparationFEFO(requestId, (session.user as any).id);
      setFeedback({ id: requestId, type: 'success', msg: 'Pedido atendido com sucesso (FEFO aplicado)!' });
      // Remover da lista após 2 segundos
      setTimeout(() => {
        setRequests(prev => prev.filter(r => r.id !== requestId));
        setFeedback(null);
      }, 2000);
    } catch (err: any) {
      setFeedback({ id: requestId, type: 'error', msg: err.message || 'Erro ao separar material.' });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-8 font-sans max-w-6xl mx-auto">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <PackageOpen className="text-amber-500" />
            Fila de Separação e Atendimento
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pedidos pendentes. O sistema aplicará a regra FEFO automaticamente na baixa.
          </p>
        </div>
        <button onClick={fetchRequests} className="text-sm text-blue-600 hover:underline">Atualizar Fila</button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm animate-pulse">A carregar fila de pedidos...</div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 shadow-sm">
          <CheckCircle2 className="mx-auto text-emerald-400 mb-3" size={48} />
          <p className="font-semibold text-slate-700">Fila Limpa!</p>
          <p className="text-sm mt-1">Não há pedidos pendentes no momento.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map(req => {
            const currentFeedback = feedback?.id === req.id ? feedback : null;

            return (
              <div key={req.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-800">Pedido #{req.requestNumber.slice(-6).toUpperCase()}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Solicitante: <span className="font-semibold">{req.requester.name}</span> ({req.requester.registration})
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1 bg-amber-100 text-amber-700 rounded-full">
                    <Clock size={14} /> {req.status}
                  </div>
                </div>

                <div className="p-6">
                  <table className="w-full text-left text-sm mb-6">
                    <thead>
                      <tr className="text-slate-500 border-b border-slate-100">
                        <th className="pb-2 font-semibold">Código</th>
                        <th className="pb-2 font-semibold">Produto</th>
                        <th className="pb-2 font-semibold text-right">Qtd Solicitada</th>
                      </tr>
                    </thead>
                    <tbody>
                      {req.items.map((item: any) => (
                        <tr key={item.id} className="border-b border-slate-50 last:border-0">
                          <td className="py-3 font-mono text-xs text-slate-600">{item.product.internalCode}</td>
                          <td className="py-3 text-slate-800">{item.product.name}</td>
                          <td className="py-3 text-right font-bold text-blue-600">
                            {item.requestedQty} {item.product.unitOfMeasure}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {currentFeedback && (
                    <div className={`mb-4 p-3 rounded-lg text-xs font-bold flex items-center gap-2 ${
                      currentFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {currentFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}
                      {currentFeedback.msg}
                    </div>
                  )}

                  <div className="flex justify-end border-t border-slate-100 pt-4">
                    <button
                      onClick={() => handleSeparate(req.id)}
                      disabled={processingId === req.id}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {processingId === req.id ? 'A processar lotes...' : 'Atender Pedido (Aplicar FEFO)'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}