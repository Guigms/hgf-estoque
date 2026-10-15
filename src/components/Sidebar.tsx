// src/components/Sidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Package, 
  ArrowRightLeft, 
  FileCode2, 
  FileText, 
  PackageCheck, 
  ClipboardList, 
  ShieldCheck, 
  Settings,
  ShoppingCart
} from 'lucide-react';

interface SidebarProps {
  userRole?: 'ADMINISTRADOR' | 'GESTOR_ESTOQUE' | 'ALMOXARIFE' | 'FARMACEUTICO' | 'ENFERMEIRO' | 'AUDITOR';
}

export function Sidebar({ userRole = 'ADMINISTRADOR' }: SidebarProps) {
  const pathname = usePathname();

  // Função auxiliar para marcar item ativo
  const isActive = (path: string) => pathname === path;

  // Verificações de permissão rápidas
  const isAdminOrGestor = ['ADMINISTRADOR', 'GESTOR_ESTOQUE'].includes(userRole);
  const canMoveStock = ['ADMINISTRADOR', 'GESTOR_ESTOQUE', 'ALMOXARIFE', 'FARMACEUTICO'].includes(userRole);
  const isAuditorOrAdmin = ['ADMINISTRADOR', 'AUDITOR', 'GESTOR_ESTOQUE'].includes(userRole);

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between hidden md:flex shrink-0 border-r border-slate-800 h-screen sticky top-0">
      <div className="flex flex-col overflow-y-auto">
        
        {/* LOGO DA EMPRESA / HOSPITAL */}
        <div className="h-16 flex items-center px-6 bg-slate-950/50 border-b border-slate-800 gap-3 shrink-0">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/20">
            H
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-white tracking-wide text-sm leading-tight">
              HGF <span className="text-blue-400 font-normal">ESTOQUE</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Hospital Geral de Fortaleza</span>
          </div>
        </div>

        {/* MENUS DE NAVEGAÇÃO */}
        <nav className="p-4 space-y-1 text-xs font-medium flex-1">
          
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Menu Principal
          </div>
          
          <Link 
            href="/" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              isActive('/') 
                ? 'bg-blue-600 text-white font-semibold shadow-sm' 
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            <Home size={18} />
            Dashboard
          </Link>

          {canMoveStock && (
            <Link 
              href="/movements" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive('/movements') 
                  ? 'bg-blue-600 text-white font-semibold shadow-sm' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <ArrowRightLeft size={18} />
              Movimentações
            </Link>
          )}

          {canMoveStock && (
            <Link 
              href="/receipts" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive('/receipts') 
                  ? 'bg-blue-600 text-white font-semibold shadow-sm' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <FileCode2 size={18} />
              Entrada via NFe (XML)
            </Link>
          )}

          {/* SEÇÃO: ATENDIMENTO & CLÍNICO */}
          <div className="px-3 py-2 mt-6 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Controle Clínico
          </div>

          <Link 
            href="/request/new" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              isActive('/request/new') 
                ? 'bg-blue-600 text-white font-semibold shadow-sm' 
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            <FileText size={18} />
            Solicitar Material
          </Link>

          {canMoveStock && (
            <Link 
              href="/request/fulfill" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive('/request/fulfill') 
                  ? 'bg-blue-600 text-white font-semibold shadow-sm' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <PackageCheck size={18} />
              Fila do Almoxarifado (Baixa)
            </Link>
          )}

          {/* SEÇÃO: GESTÃO & AUDITORIA */}
          <div className="px-3 py-2 mt-6 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Gestão & Auditoria
          </div>

          {isAdminOrGestor && (
            <Link 
              href="/inventory" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive('/inventory') 
                  ? 'bg-blue-600 text-white font-semibold shadow-sm' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <ClipboardList size={18} />
              Inventário Rotativo
            </Link>
          )}

          {isAuditorOrAdmin && (
            <Link 
              href="/audit" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive('/audit') 
                  ? 'bg-blue-600 text-white font-semibold shadow-sm' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck size={18} />
              Logs de Auditoria
            </Link>
          )}

        </nav>
      </div>

      {/* FOOTER DA SIDEBAR: Configurações */}
      <div className="p-4 border-t border-slate-800 shrink-0">
        <Link 
          href="/settings" 
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-xs ${
            isActive('/settings') 
              ? 'bg-slate-800 text-white font-semibold' 
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
          }`}
        >
          <Settings size={18} />
          Configurações
        </Link>
      </div>
    </aside>
  );
}