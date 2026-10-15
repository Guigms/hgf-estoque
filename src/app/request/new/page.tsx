// src/app/requests/new/page.tsx (ou o caminho onde está a sua tela de solicitar material)
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ClipboardEdit, Send, Plus, Trash2, Search } from 'lucide-react';

export default function NewRequestPage() {
  const { data: session, status } = useSession();
  const user = session?.user as any;
  
  // 1. CORREÇÃO: Variável para controlar a visibilidade de valores
  const canViewCosts = user?.role !== 'SOLICITANTE';

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const [formData, setFormData] = useState({
    justification: '',
    bedNumber: '',
    patientName: '',
    targetWarehouseId: 'id-do-almoxarifado-central', // Idealmente vem de uma listagem
  });

  const [cart, setCart] = useState<any[]>([]);
  // Mock de produtos para o exemplo. No sistema real, faria um fetch() à base de dados.
  const [products] = useState([
    { id: 'PROD-001', name: 'Dipirona Sódica 500mg/ml', code: 'MED-001', unit: 'AMP', cost: 1.50 },
    { id: 'PROD-002', name: 'Seringa 5ml com Agulha', code: 'MAT-002', unit: 'UND', cost: 0.45 },
  ]);

  const addToCart = (product: any) => {
    if (cart.find(item => item.productId === product.id)) return;
    setCart([...cart, { productId: product.id, name: product.name, unit: product.unit, cost: product.cost, qty: 1 }]);
  };

  const updateQty = (productId: string, qty: number) => {
    setCart(cart.map(item => item.productId === productId ? { ...item, qty: Math.max(1, qty) } : item));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    if (cart.length === 0) {
      setFeedback({ type: 'error', msg: 'Adicione pelo menos um material à solicitação.' });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      // 2. CORREÇÃO: Enviamos o ID do utilizador logado dinamicamente
      const payload = {
        requesterId: user.id, // Pega dinamicamente quem está logado
        ...formData,
        items: cart
      };

      // Simulação da chamada à Server Action (Aqui você chamaria a sua função de salvar no banco)
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setFeedback({ type: 'success', msg: 'Solicitação enviada com sucesso!' });
      setCart([]);
      setFormData({ ...formData, justification: '', bedNumber: '', patientName: '' });
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Erro ao enviar solicitação.' });
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') return <div className="p-8">A carregar...</div>;

  return (
    <div className="p-8 font-sans max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ClipboardEdit className="text-blue-600" />
            Nova Solicitação de Material
          </h1>
          <p className="text-sm text-slate-500 mt-1">Selecione os itens e justifique o uso clínico.</p>
        </div>
        
        {/* CORREÇÃO: Mostramos exatamente quem está logado a fazer o pedido */}
        <div className="text-right bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
          <p className="text-xs text-slate-500">Solicitante Logado:</p>
          <p className="text-sm font-bold text-blue-700">{user?.name || 'A carregar...'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* CATÁLOGO DE PRODUTOS */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[500px]">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar material..." 
              className="bg-transparent outline-none text-sm w-full font-semibold text-slate-700"
            />
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {products.map(p => (
              <div key={p.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg hover:border-blue-200 hover:bg-blue-50/50 transition-colors">
                <div>
                  <p className="font-bold text-slate-800 text-sm">{p.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-500 font-mono">{p.code}</span>
                    {/* CORREÇÃO: Escondemos o custo se for SOLICITANTE */}
                    {canViewCosts && (
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">R$ {p.cost.toFixed(2)}</span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => addToCart(p)}
                  className="p-2 bg-slate-100 text-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CARRINHO E FORMULÁRIO */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[500px]">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h2 className="font-bold text-slate-800">Itens Selecionados ({cart.length})</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {cart.length === 0 ? (
              <p className="text-sm text-center text-slate-400 mt-10">Nenhum item adicionado.</p>
            ) : (
              cart.map(item => (
                <div key={item.productId} className="flex items-center justify-between p-2 border-b border-slate-50">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800 line-clamp-1">{item.name}</p>
                    <span className="text-xs text-slate-500">{item.unit}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number" min="1" value={item.qty}
                      onChange={(e) => updateQty(item.productId, Number(e.target.value))}
                      className="w-16 px-2 py-1 text-sm border border-slate-300 rounded text-center outline-none focus:border-blue-500"
                    />
                    <button type="button" onClick={() => removeFromCart(item.productId)} className="text-rose-500 hover:text-rose-700">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Leito (Opcional)</label>
                <input type="text" value={formData.bedNumber} onChange={e => setFormData({...formData, bedNumber: e.target.value})} className="w-full px-3 py-1.5 text-sm border rounded outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Paciente (Opcional)</label>
                <input type="text" value={formData.patientName} onChange={e => setFormData({...formData, patientName: e.target.value})} className="w-full px-3 py-1.5 text-sm border rounded outline-none focus:border-blue-500" />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Justificativa Clínica *</label>
              <input type="text" required value={formData.justification} onChange={e => setFormData({...formData, justification: e.target.value})} className="w-full px-3 py-1.5 text-sm border rounded outline-none focus:border-blue-500" placeholder="Ex: Procedimento cirúrgico X..." />
            </div>

            {feedback && (
              <p className={`text-xs font-bold text-center ${feedback.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {feedback.msg}
              </p>
            )}

            <button type="submit" disabled={loading} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg flex justify-center items-center gap-2 transition-colors disabled:opacity-50">
              {loading ? 'A Enviar...' : <><Send size={16} /> Enviar Solicitação ao Almoxarifado</>}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}