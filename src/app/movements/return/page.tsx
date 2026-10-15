// src/app/movements/return/page.tsx
'use client';
import { useSession } from 'next-auth/react';
import { processReturnOrLoss } from '@/app/actions/returns';
import { LossReason } from '@prisma/client';
import React, { useState } from 'react';
import { RotateCcw, AlertTriangle, CheckCircle2, ShieldAlert, FileText, Send } from 'lucide-react';

export default function ReturnAndLossPage() {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ success?: boolean; message: string } | null>(null);

  const [formData, setFormData] = useState({
    movementId: '',
    productId: 'PROD-001',
    lotNumber: 'LOTE-A-URGENTE',
    quantity: 1,
    actionType: 'DEVOLUCAO_CLINICA', // ou DESCARTE_AVARIA
    lossReason: 'MATERIAL_NAO_UTILIZADO', // VENCIMENTO, AVARIA, etc.
    observations: ''
  });

  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    
    setLoading(true);
    setFeedback(null);

    try {
      // Chamar a Server Action real
      await processReturnOrLoss({
        productId: formData.productId,
        lotNumber: formData.lotNumber,
        quantity: formData.quantity,
        actionType: formData.actionType as any,
        lossReason: formData.lossReason as LossReason,
        observations: formData.observations,
        userId: (session.user as any).id,
        // Em produção, buscaria o warehouseId dinamicamente. Para já, fixamos o Central do Seed.
        warehouseId: 'id-do-almoxarifado-central' // <- Nota: idealmente busca isto do utilizador logado
      });

      setFeedback({ 
        success: true, 
        message: 'Operação registada com sucesso! O Ledger imutável e a auditoria foram atualizados.' 
      });
      
      setFormData({
        movementId: '',
        productId: '',
        lotNumber: '',
        quantity: 1,
        actionType: 'DEVOLUCAO_CLINICA',
        lossReason: 'MATERIAL_NAO_UTILIZADO',
        observations: ''
      });
    } catch (err: any) {
      setFeedback({ success: false, message: err.message || 'Erro ao processar a operação.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 font-sans max-w-4xl mx-auto">
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <RotateCcw className="text-blue-600" />
          Registo de Devoluções e Tratamento de Avarias
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Gerencie o estorno de materiais clínicos não utilizados ou o descarte técnico por motivo de avaria/vencimento.
        </p>
      </div>

      {feedback && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 text-sm font-semibold shadow-sm ${
          feedback.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
        }`}>
          {feedback.success ? <CheckCircle2 size={20} /> : <ShieldAlert size={20} />}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-6 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tipo de Operação</label>
            <select 
              value={formData.actionType}
              onChange={e => setFormData({...formData, actionType: e.target.value})}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-slate-700"
            >
              <option value="DEVOLUCAO_CLINICA">Devolução Clínica (Material Não Utilizado)</option>
              <option value="DESCARTE_AVARIA">Descarte por Avaria / Vencimento</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Motivo Específico</label>
            <select 
              value={formData.lossReason}
              onChange={e => setFormData({...formData, lossReason: e.target.value})}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-slate-700"
            >
              <option value="MATERIAL_NAO_UTILIZADO">Material Não Utilizado em Cirurgia/Leito</option>
              <option value="EXCEDENTE">Quantidade Excedente</option>
              <option value="VENCIMENTO">Lote Vencido</option>
              <option value="AVARIA">Avaria Física / Embalagem Rompida</option>
              <option value="CONTAMINACAO">Contaminação Suspeita</option>
              <option value="INCORRETO">Item Incorreto Solicitado</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">ID do Produto / Código</label>
            <input 
              type="text" 
              value={formData.productId}
              onChange={e => setFormData({...formData, productId: e.target.value})}
              required 
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-mono" 
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Número do Lote</label>
            <input 
              type="text" 
              value={formData.lotNumber}
              onChange={e => setFormData({...formData, lotNumber: e.target.value})}
              required 
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-mono" 
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Quantidade</label>
            <input 
              type="number" 
              min="1"
              value={formData.quantity}
              onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
              required 
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-center font-bold" 
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Justificativa e Observações de Auditoria *</label>
          <textarea 
            rows={3}
            required
            placeholder="Descreva detalhadamente o contexto da devolução ou do dano verificado na inspeção física..."
            value={formData.observations}
            onChange={e => setFormData({...formData, observations: e.target.value})}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-slate-700"
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button 
            type="submit" 
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? 'A processar transação...' : (
              <>
                <Send size={16} /> Registar Movimento no Ledger
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}