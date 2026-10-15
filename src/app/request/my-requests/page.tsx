// src/app/requests/my-requests/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getMyRequests } from '@/app/actions/requests';
import { ClipboardList, Clock, CheckCircle2, AlertCircle, XCircle, Package } from 'lucide-react';
import { RequestStatus } from '@prisma/client';

export default function MyRequestsPage() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = (session?.user as any)?.id;
    if (userId) {
      fetchRequests(userId);
    }
  }, [session]);

  const fetchRequests = async (userId: string) => {
    setLoading(true);
    try {
      const data = await getMyRequests(userId);
      setRequests(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Função auxiliar para mapear o status para cores e ícones visuais
  const getStatusBadge = (status: RequestStatus) => {
    const badges: Record<string, { color: string, icon: any, label: string }> = {
      RASCUNHO: { color: 'bg-slate-100 text-slate-600 border-slate-200', icon: Clock, label: 'Rascunho' },
      SOLICITADA: { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: ClipboardList, label: 'Aguardando Análise' },
      EM_ANALISE: { color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: AlertCircle, label: 'Em Análise' },
      APROVADA: { color: 'bg-teal-50 text-teal-700 border-teal-200', icon: CheckCircle2, label: 'Aprovada' },
      SEPARACAO: { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Package, label: 'Em Separação (FEFO)' },
      ATENDIDA: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2, label: 'Atendida' },
      PARCIALMENTE_ATENDIDA: { color: 'bg-lime-50 text-lime-700 border-lime-200', icon: CheckCircle2, label: 'Parcialmente Atendida' },
      RECUSADA: { color: 'bg-rose-50 text-rose-700 border-rose-200', icon: XCircle, label: 'Recusada' },
      CANCELADA: { color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle, label: 'Cancelada' },
    };

    const BadgeConfig = badges[status] || badges.RASCUNHO;
    const Icon = BadgeConfig.icon;

    return (
      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${BadgeConfig.color}`}>
        <Icon size={14} />
        {BadgeConfig.label}
      </span>
    );
  };

  return (
    <div className="p-8 font-sans max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <ClipboardList className="text-blue-600" />
          Minhas Solicitações
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Acompanhe o estado de atendimento dos seus pedidos de material clínico.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm animate-pulse">
          A carregar histórico de solicitações...
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 shadow-sm">
          <Package className="mx-auto text-slate-300 mb-3" size={48} />
          <p className="font-semibold text-slate-700">Nenhuma solicitação encontrada</p>
          <p className="text-sm mt-1">Ainda não realizou nenhum pedido de material para o seu setor.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((req) => (
            <div key={req.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h3 className="font-bold text-slate-800">
                    Pedido #{req.requestNumber.slice(-6).toUpperCase()}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Criado em: {new Date(req.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(req.status)}
                  <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Destino: {req.targetWarehouse.name}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-100">
                      <th className="pb-2 font-semibold">Produto</th>
                      <th className="pb-2 font-semibold text-center">Qtd Solicitada</th>
                      <th className="pb-2 font-semibold text-center">Qtd Entregue</th>
                      <th className="pb-2 font-semibold text-right">Status do Item</th>
                    </tr>
                  </thead>
                  <tbody>
                    {req.items.map((item: any) => (
                      <tr key={item.id} className="border-b border-slate-50 last:border-0">
                        <td className="py-3 text-slate-800 font-medium">
                          {item.product.name}
                        </td>
                        <td className="py-3 text-center text-slate-600">
                          {item.requestedQty} <span className="text-xs">{item.product.unitOfMeasure}</span>
                        </td>
                        <td className="py-3 text-center font-bold text-blue-600">
                          {item.deliveredQty} <span className="text-xs">{item.product.unitOfMeasure}</span>
                        </td>
                        <td className="py-3 text-right">
                          {item.deliveredQty >= item.requestedQty ? (
                            <span className="text-xs font-bold text-emerald-600">Completo</span>
                          ) : item.deliveredQty > 0 ? (
                            <span className="text-xs font-bold text-amber-600">Parcial</span>
                          ) : (
                            <span className="text-xs font-bold text-slate-400">Pendente</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {req.justification && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600">
                    <span className="font-semibold text-slate-700 block mb-1">Justificativa Clínica:</span>
                    {req.justification}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}