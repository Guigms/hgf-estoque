// src/app/actions/dashboard.ts
'use server';

import { PrismaClient, RequestStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function getDashboardAlerts() {
  const hoje = new Date();
  const trintaDias = new Date();
  trintaDias.setDate(hoje.getDate() + 30);

  // 1. Alertas de Validade (Vencidos e a Vencer em 30 dias)
  const expiringLots = await prisma.productLot.findMany({
    where: {
      expirationDate: { lte: trintaDias },
      balances: { some: { availableQty: { gt: 0 } } } // Apenas lotes que ainda têm saldo
    },
    include: {
      product: { select: { name: true, internalCode: true, unitOfMeasure: true } },
      balances: { select: { availableQty: true, warehouse: { select: { name: true } } } }
    },
    orderBy: { expirationDate: 'asc' }
  });

  // 2. Alertas de Estoque Mínimo (Ponto de Reposição)
  // Busca produtos que têm controlo de stock mínimo
  const products = await prisma.product.findMany({
    where: { minStock: { gt: 0 } },
    include: { balances: { select: { availableQty: true } } }
  });

  const lowStockAlerts = products
    .map(prod => {
      const totalAvailable = prod.balances.reduce((sum, b) => sum + b.availableQty, 0);
      return { ...prod, totalAvailable };
    })
    .filter(prod => prod.totalAvailable <= prod.minStock)
    .sort((a, b) => a.totalAvailable - b.totalAvailable);

  // 3. Resumo Operacional
  const pendingRequests = await prisma.stockRequest.count({
    where: { status: { in: [RequestStatus.SOLICITADA, RequestStatus.EM_ANALISE, RequestStatus.SEPARACAO] } }
  });

  return {
    expiringLots,
    lowStockAlerts,
    stats: {
      pendingRequests,
      totalExpiring: expiringLots.length,
      totalLowStock: lowStockAlerts.length
    }
  };
}