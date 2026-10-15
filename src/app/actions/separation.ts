// src/app/actions/separation.ts
'use server';

import { PrismaClient, RequestStatus, MovementType, AuditEventType } from '@prisma/client';
import { createAuditLog } from '@/lib/audit';

const prisma = new PrismaClient();

// Buscar pedidos que aguardam separação
export async function getPendingRequests(warehouseId?: string) {
  return await prisma.stockRequest.findMany({
    where: {
      status: { in: [RequestStatus.SOLICITADA, RequestStatus.APROVADA, RequestStatus.SEPARACAO] },
      ...(warehouseId ? { targetWarehouseId: warehouseId } : {})
    },
    include: {
      requester: { select: { name: true, registration: true } },
      targetWarehouse: { select: { name: true } },
      items: {
        include: { product: { select: { name: true, internalCode: true, unitOfMeasure: true } } }
      }
    },
    orderBy: { createdAt: 'asc' } // Os mais antigos primeiro (FIFO de fila)
  });
}

// Processar a baixa aplicando a regra FEFO (First Expire, First Out)
export async function processSeparationFEFO(requestId: string, userId: string) {
  return await prisma.$transaction(async (tx) => {
    const request = await tx.stockRequest.findUnique({
      where: { id: requestId },
      include: { items: true }
    });

    if (!request) throw new Error('Pedido não encontrado.');
    if (request.status === RequestStatus.ATENDIDA) throw new Error('Pedido já foi atendido.');

    let allItemsFulfilled = true;

    // Iterar sobre cada item solicitado
    for (const item of request.items) {
      if (item.deliveredQty >= item.requestedQty) continue;

      let remainingToFulfill = item.requestedQty - item.deliveredQty;

      // ALGORITMO FEFO: Buscar saldos do produto no almoxarifado, ordenados pela validade do lote
      const balances = await tx.stockBalance.findMany({
        where: {
          productId: item.productId,
          warehouseId: request.targetWarehouseId,
          availableQty: { gt: 0 } // Apenas saldos positivos
        },
        include: { lot: true },
        orderBy: { lot: { expirationDate: 'asc' } } // O segredo do FEFO está aqui
      });

      let totalFulfillable = balances.reduce((sum, b) => sum + b.availableQty, 0);

      if (totalFulfillable < remainingToFulfill) {
        allItemsFulfilled = false; // Não há stock suficiente para atender tudo
        // Dependendo da regra de negócio, pode lançar erro ou atender parcialmente.
        // Aqui, optamos por atender o que for possível (Parcial).
      }

      for (const balance of balances) {
        if (remainingToFulfill <= 0) break;

        const qtyToTake = Math.min(balance.availableQty, remainingToFulfill);

        // 1. Atualizar o saldo físico
        await tx.stockBalance.update({
          where: { id: balance.id },
          data: {
            availableQty: { decrement: qtyToTake },
            physicalQty: { decrement: qtyToTake }
          }
        });

        // 2. Criar a Movimentação (Saída Ledger)
        const movement = await tx.stockMovement.create({
          data: {
            type: MovementType.SAIDA_ATENDIMENTO,
            productId: item.productId,
            productLotId: balance.productLotId,
            quantity: qtyToTake,
            unitCost: balance.averageCost,
            totalCost: qtyToTake * balance.averageCost,
            sourceWarehouseId: request.targetWarehouseId, // Saiu deste almoxarifado
            requestId: request.id,
            userId: userId,
            observations: `Atendimento FEFO Automático - Pedido ${request.requestNumber}`
          }
        });

        // Atualizar contadores
        remainingToFulfill -= qtyToTake;
        
        // Atualizar o item do pedido com o que foi entregue
        await tx.stockRequestItem.update({
          where: { id: item.id },
          data: { deliveredQty: { increment: qtyToTake } }
        });
      }
    }

    // Atualizar o Status do Pedido
    const newStatus = allItemsFulfilled ? RequestStatus.ATENDIDA : RequestStatus.PARCIALMENTE_ATENDIDA;
    
    const updatedRequest = await tx.stockRequest.update({
      where: { id: request.id },
      data: { status: newStatus }
    });

    // Registar na Auditoria Imutável
    await createAuditLog({
      eventType: AuditEventType.ALTERACAO,
      tableName: 'StockRequest',
      recordId: request.id,
      userId: userId,
      oldData: request,
      newData: updatedRequest
    });

    return updatedRequest;
  });
}