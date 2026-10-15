// src/app/receipts/xml/page.tsx
'use client';

import React, { useState } from 'react';
import { UploadCloud, FileCode2, CheckCircle2, AlertCircle, ArrowRight, PackagePlus } from 'lucide-react';

// Tipagem para os itens extraídos do XML
interface ParsedNfeItem {
  codigoProdutoFornecedor: string;
  descricao: string;
  quantidade: number;
  lote: string;
  validade: string;
  valorUnitario: number;
  // Na vida real, o sistema faria o "De/Para" com o nosso ID interno
  internalProductId: string; 
}

export default function NfeReceiptPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedItems, setParsedItems] = useState<ParsedNfeItem[] | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ success?: boolean; message: string } | null>(null);

  // Simulação de leitura do XML da SEFAZ (Parse)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setIsParsing(true);
    setFeedback(null);

    // Simulando o tempo de processamento de um ficheiro XML
    setTimeout(() => {
      setParsedItems([
        {
          codigoProdutoFornecedor: '789123456',
          descricao: 'DIPIRONA SODICA 500MG/ML AMPOLA',
          quantidade: 500,
          lote: 'LOTE-NFE-001',
          validade: '2027-12-31',
          valorUnitario: 1.45,
          internalProductId: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed' // Mock ID
        },
        {
          codigoProdutoFornecedor: '789987654',
          descricao: 'SERINGA DESCARTAVEL 10ML C/ AGULHA',
          quantidade: 2000,
          lote: 'LOTE-NFE-002',
          validade: '2028-06-30',
          valorUnitario: 0.35,
          internalProductId: '2c9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bee' // Mock ID
        }
      ]);
      setIsParsing(false);
    }, 1500);
  };

  // Enviar os dados extraídos para o nosso Motor de Movimentação (StockMovementService)
  const handleConfirmEntry = async () => {
    if (!parsedItems) return;
    setIsSubmitting(true);
    setFeedback(null);

    try {
      // Montagem do payload compatível com a nossa API POST /api/movements
      const payload = {
        type: 'ENTRY_PURCHASE',
        destinationWarehouseId: '00000000-0000-0000-0000-000000000000', // Mock: Almoxarifado Central
        userId: 'b028c615-38c3-45f8-b391-728b9c4c1111', // Mock: ID do Admin
        reason: `Entrada automatizada via NFe: ${file?.name}`,
        items: parsedItems.map(item => ({
          productId: item.internalProductId,
          productLotId: '00000000-0000-0000-0000-000000000000', // Mock: Lote criado ou associado
          quantity: item.quantidade
        }))
      };

      console.log("Enviando para a API:", payload);

      // Simulando a chamada à API que construímos anteriormente
      await new Promise(resolve => setTimeout(resolve, 1000));

      setFeedback({ success: true, message: 'Entrada de stock registada com sucesso! Lotes e validades atualizados.' });
      setParsedItems(null);
      setFile(null);
    } catch (err: any) {
      setFeedback({ success: false, message: 'Erro ao processar a entrada no stock.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8 font-sans flex flex-col items-center">
      <div className="w-full max-w-4xl">
        
        {/* Cabeçalho */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileCode2 className="text-emerald-600" />
            Entrada de Stock via XML (NFe)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Faça o upload do ficheiro XML da Nota Fiscal para automatizar o registo de lotes, validades e quantidades.
          </p>
        </div>

        {feedback && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 text-sm font-semibold shadow-sm ${
            feedback.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            {feedback.success ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Zona de Upload */}
        {!parsedItems && !isParsing && (
          <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-12 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-emerald-400 transition-colors cursor-pointer relative">
            <input 
              type="file" 
              accept=".xml" 
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full mb-4">
              <UploadCloud size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Clique ou arraste o ficheiro XML da NFe</h3>
            <p className="text-sm text-slate-500 max-w-md">
              O sistema fará a leitura automática das tags de medicamentos e materiais hospitalares (padrão TISS/SEFAZ).
            </p>
          </div>
        )}

        {/* Estado de Loading (Parsing) */}
        {isParsing && (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">A extrair dados do XML...</h3>
            <p className="text-sm text-slate-500">A validar produtos, lotes e regras de conversão.</p>
          </div>
        )}

        {/* Tabela de Conferência dos Dados Extraídos */}
        {parsedItems && !isParsing && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Conferência de Recebimento</h2>
                <p className="text-xs text-slate-500">Ficheiro: {file?.name}</p>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                {parsedItems.length} itens encontrados
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-white text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3">Produto (NFe)</th>
                    <th className="px-6 py-3">Lote (Rastreabilidade)</th>
                    <th className="px-6 py-3">Validade</th>
                    <th className="px-6 py-3 text-right">Qtd. Recebida</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3.5">
                        <p className="font-bold text-slate-800 text-xs">{item.descricao}</p>
                        <p className="text-[10px] text-slate-400 font-mono">Cod: {item.codigoProdutoFornecedor}</p>
                      </td>
                      <td className="px-6 py-3.5 font-mono text-[11px] text-slate-600 font-bold bg-slate-50/50">
                        {item.lote}
                      </td>
                      <td className="px-6 py-3.5 font-semibold text-emerald-600 text-xs">
                        {new Date(item.validade).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-3.5 text-right font-bold text-blue-600 text-sm">
                        + {item.quantidade}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <button 
                onClick={() => { setParsedItems(null); setFile(null); }}
                className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmEntry}
                disabled={isSubmitting}
                className="px-6 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? 'A processar transação...' : (
                  <>
                    <PackagePlus size={16} /> Confirmar Entrada no Stock <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}