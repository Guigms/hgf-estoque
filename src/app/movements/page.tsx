// src/app/movements/page.tsx
'use client';

import React, { useState } from 'react';
import { ArrowRightLeft, CheckCircle2, AlertCircle, PackagePlus, PackageMinus } from 'lucide-react';

export default function MovementsPage() {
  const [movementType, setMovementType] = useState<'ENTRY_PURCHASE' | 'EXIT_CONSUMPTION'>('ENTRY_PURCHASE');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ success?: boolean; message: string } | null>(null);

  // Estados do formulário (simulando IDs reais do banco criados no seed)
  const [formData, setFormData] = useState({
    userId: 'b028c615-38c3-45f8-b391-728b9c4c1111', // ID do Administrador no seed
    warehouseId: '...', // Almoxarifado
    productId: '...', // Produto
    productLotId: '...', // Lote
    quantity: 100,
    reason: 'Reposição de estoque hospitalar'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const payload = {
        type: movementType,
        destinationWarehouseId: movementType === 'ENTRY_PURCHASE' ? "ID_DO_ALMOXARIFADO" : undefined,
        sourceWarehouseId: movementType === 'EXIT_CONSUMPTION' ? "ID_DO_ALMOXARIFADO" : undefined,
        userId: formData.userId,
        reason: formData.reason,
        items: [
          {
            productId: formData.productId,
            productLotId: formData.productLotId,
            quantity: Number(formData.quantity)
          }
        ]
      };

      const response = await fetch('/api/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao processar movimentação.');
      }

      setFeedback({ success: true, message: 'Movimentação registrada e auditada com sucesso!' });
    } catch (err: any) {
      setFeedback({ success: false, message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Header da Página */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Nova Movimentação de Estoque</h1>
            <p className="text-xs text-slate-500 mt-0.5">Registo atômico com validação de lote e transação ACID</p>
          </div>
          <div className="flex gap-2 bg-slate-200/60 p-1 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMovementType('ENTRY_PURCHASE')}
              className={`px-4 py-2 rounded-md transition-all flex items-center gap-1.5 ${
                movementType === 'ENTRY_PURCHASE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PackagePlus size={14} /> Entrada
            </button>
            <button
              type="button"
              onClick={() => setMovementType('EXIT_CONSUMPTION')}
              className={`px-4 py-2 rounded-md transition-all flex items-center gap-1.5 ${
                movementType === 'EXIT_CONSUMPTION' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PackageMinus size={14} /> Saída / Consumo
            </button>
          </div>
        </div>

        {/* Feedback visual */}
        {feedback && (
          <div className={`mx-8 mt-6 p-4 rounded-lg flex items-center gap-3 text-xs font-semibold ${
            feedback.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            {feedback.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Tipo de Operação
              </label>
              <input
                type="text"
                disabled
                value={movementType === 'ENTRY_PURCHASE' ? 'Entrada por Compra (ENTRY_PURCHASE)' : 'Saída por Consumo (EXIT_CONSUMPTION)'}
                className="w-full px-4 py-2.5 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-medium cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Quantidade a Movimentar
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="w-full px-4 py-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Motivo / Justificativa da Operação
            </label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Ex: Abastecimento regular da ala pediátrica"
              className="w-full px-4 py-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              required
            />
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 leading-relaxed">
            <strong>Aviso de Auditoria:</strong> Toda e qualquer movimentação altera o saldo derivado do sistema de forma atômica e gera registo imutável na tabela de auditoria conforme as diretrizes de conformidade hospitalar.
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              className="px-5 py-2.5 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'A processar transação...' : 'Confirmar Movimentação'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}