// src/app/actions/movements.ts
'use server';

import { PrismaClient, MovementType, AuditEventType } from '@prisma/client';
import { createAuditLog } from '@/lib/audit';

const prisma = new PrismaClient();

export async function estornarMovimentacao(movementId: string, userId: string, justificativa: string) {
  // 1. Iniciar uma Transação para garantir que tudo acontece em segurança
  return await prisma.$transaction(async (tx) => {
    
    // 2. Buscar a movimentação original
    const originalMovement = await tx.stockMovement.findUnique({
      where: { id: movementId }
    });

    if (!originalMovement) throw new Error('Movimentação não encontrada');

    // 3. Criar a Movimentação Corretiva (Estorno)
    const estorno = await tx.stockMovement.create({
      data: {
        type: MovementType.ESTORNO_CORRECAO,
        productId: originalMovement.productId,
        productLotId: originalMovement.productLotId,
        quantity: originalMovement.quantity, // Lançamento reverso
        unitCost: originalMovement.unitCost,
        totalCost: originalMovement.totalCost,
        sourceWarehouseId: originalMovement.destWarehouseId, // Inverte a origem e destino
        destWarehouseId: originalMovement.sourceWarehouseId,
        userId: userId,
        observations: `ESTORNO: Ref ao Doc ${originalMovement.id}. Motivo: ${justificativa}`
      }
    });

    // 4. Atualizar o saldo físico (devolvendo a quantidade ao estoque)
    await tx.stockBalance.updateMany({
      where: { 
        warehouseId: originalMovement.destWarehouseId!,
        productId: originalMovement.productId,
        productLotId: originalMovement.productLotId,
      },
      data: {
        physicalQty: { increment: originalMovement.quantity },
        availableQty: { increment: originalMovement.quantity }
      }
    });

    // 5. REGISTAR A AUDITORIA IMUTÁVEL
    await createAuditLog({
      eventType: AuditEventType.ESTORNO,
      tableName: 'StockMovement',
      recordId: estorno.id,
      userId: userId,
      oldData: originalMovement,
      newData: estorno
    });

    return estorno;
  });
}