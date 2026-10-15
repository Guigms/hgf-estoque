// src/app/audit/page.tsx
import React from 'react';
import { ShieldCheck, Search, Filter, Download, FileJson, Clock, User } from 'lucide-react';

export default function AuditPage() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      
      {/* HEADER DA PÁGINA */}
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-900 text-white rounded-lg shadow-sm">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">Auditoria e Compliance</h1>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Registo de Atividades Imutável</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Download size={14} />
            Exportar Relatório (PDF)
          </button>
        </div>
      </header>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 p-8 overflow-hidden flex flex-col">
        
        {/* BARRA DE FILTROS */}
        <div className="bg-white p-4 rounded-t-xl border border-slate-200 border-b-0 flex gap-4 items-center justify-between shrink-0">
          <div className="flex gap-4 flex-1">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Pesquisar utilizador, entidade ou ID..." 
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            
            <select className="px-4 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-600 font-medium">
              <option value="">Todas as Ações</option>
              <option value="CREATE_MOVEMENT">Criação de Movimentação</option>
              <option value="UPDATE_STOCK">Atualização de Saldo</option>
              <option value="DELETE_LOGICAL">Exclusão Lógica</option>
            </select>

            <select className="px-4 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-600 font-medium">
              <option value="">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="all">Todo o histórico</option>
            </select>
          </div>
          
          <button className="p-2 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50">
            <Filter size={16} />
          </button>
        </div>

        {/* TABELA DE AUDITORIA */}
        <div className="bg-white rounded-b-xl border border-slate-200 shadow-sm flex-1 overflow-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4">Data e Hora</th>
                <th className="px-6 py-4">Utilizador / Cargo</th>
                <th className="px-6 py-4">Ação / Evento</th>
                <th className="px-6 py-4">Entidade Afetada</th>
                <th className="px-6 py-4">Endereço IP</th>
                <th className="px-6 py-4 text-center">Detalhes (JSON)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              
              {/* LINHA DE EXEMPLO 1 */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-700 flex items-center gap-2">
                  <Clock size={14} className="text-slate-400" />
                  26 Set 2026, 08:32:14
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-slate-400" />
                    <div>
                      <p className="font-bold text-slate-800">Guilherme Marques</p>
                      <p className="text-[10px] text-slate-500">ADM-001</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-[10px] font-extrabold rounded-md uppercase tracking-wider">
                    CREATE_MOVEMENT
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="font-semibold text-slate-800">StockMovement</p>
                  <p className="text-[10px] text-slate-400 font-mono">ID: a8f4...b29c</p>
                </td>
                <td className="px-6 py-4 font-mono text-slate-500">192.168.10.45</td>
                <td className="px-6 py-4 text-center">
                  <button className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors inline-flex" title="Ver JSON completo">
                    <FileJson size={16} />
                  </button>
                </td>
              </tr>

              {/* LINHA DE EXEMPLO 2 */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-700 flex items-center gap-2">
                  <Clock size={14} className="text-slate-400" />
                  25 Set 2026, 14:15:00
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-slate-400" />
                    <div>
                      <p className="font-bold text-slate-800">Sistema (Auto)</p>
                      <p className="text-[10px] text-slate-500">CRON</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[10px] font-extrabold rounded-md uppercase tracking-wider">
                    EXPIRE_WARNING
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="font-semibold text-slate-800">ProductLot</p>
                  <p className="text-[10px] text-slate-400 font-mono">LOTE-A-URGENTE</p>
                </td>
                <td className="px-6 py-4 font-mono text-slate-500">localhost</td>
                <td className="px-6 py-4 text-center">
                  <button className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors inline-flex">
                    <FileJson size={16} />
                  </button>
                </td>
              </tr>

            </tbody>
          </table>
        </div>
        
      </main>
    </div>
  );
}