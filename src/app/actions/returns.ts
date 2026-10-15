// src/app/actions/returns.ts
'use server';

import { PrismaClient, MovementType, AuditEventType, LossReason } from '@prisma/client';
import { createAuditLog } from '@/lib/audit';

const prisma = new PrismaClient();

interface ReturnPayload {
  productId: string;
  lotNumber: string;
  quantity: number;
  actionType: 'DEVOLUCAO_CLINICA' | 'DESCARTE_AVARIA';
  lossReason: LossReason;
  observations: string;
  userId: string;
  warehouseId: string; // Almoxarifado que está a receber ou a descartar
}

export async function processReturnOrLoss(data: ReturnPayload) {
  return await prisma.$transaction(async (tx) => {
    // 1. Validar se o produto e o lote existem
    const product = await tx.product.findUnique({ where: { internalCode: data.productId } });
    if (!product) throw new Error('Produto não encontrado pelo código interno.');

    const lot = await tx.productLot.findUnique({
      where: { productId_lotNumber: { productId: product.id, lotNumber: data.lotNumber } }
    });
    if (!lot) throw new Error('Lote não encontrado para este produto.');

    // 2. Buscar ou criar o Saldo de Estoque
    let balance = await tx.stockBalance.findFirst({
      where: { warehouseId: data.warehouseId, productId: product.id, productLotId: lot.id }
    });

    if (!balance && data.actionType === 'DESCARTE_AVARIA') {
      throw new Error('Não há saldo registado para este lote no almoxarifado para efetuar descarte.');
    }

    if (!balance && data.actionType === 'DEVOLUCAO_CLINICA') {
      // Se não houver saldo anterior (ex: primeira vez que este lote entra neste almoxarifado via devolução)
      balance = await tx.stockBalance.create({
        data: {
          warehouseId: data.warehouseId,
          productId: product.id,
          productLotId: lot.id,
          physicalQty: 0,
          availableQty: 0,
          averageCost: lot.unitCost
        }
      });
    }

    // 3. Processar a lógica consoante o Tipo (Devolução vs Descarte)
    const isReturn = data.actionType === 'DEVOLUCAO_CLINICA';
    const movementType = isReturn ? MovementType.DEVOLUCAO_CLINICA : MovementType.DESCARTE_AVARIA;
    
    // Devolução AUMENTA o saldo. Descarte DIMINUI o saldo.
    const qtyModifier = isReturn ? data.quantity : -data.quantity;

    if (!isReturn && balance!.availableQty < data.quantity) {
      throw new Error(`Saldo insuficiente para descarte. Disponível: ${balance!.availableQty}`);
    }

    // 4. Atualizar o Saldo Físico
    const updatedBalance = await tx.stockBalance.update({
      where: { id: balance!.id },
      data: {
        physicalQty: { increment: qtyModifier },
        availableQty: { increment: qtyModifier }
      }
    });

    // 5. Registar a Movimentação Imutável (Ledger)
    const movement = await tx.stockMovement.create({
      data: {
        type: movementType,
        reason: data.lossReason,
        productId: product.id,
        productLotId: lot.id,
        quantity: data.quantity,
        unitCost: lot.unitCost,
        totalCost: lot.unitCost * data.quantity,
        destWarehouseId: isReturn ? data.warehouseId : null, // Se for devolução, o destino é o armazém
        sourceWarehouseId: !isReturn ? data.warehouseId : null, // Se for descarte, a origem é o armazém
        userId: data.userId,
        observations: data.observations
      }
    });

    // 6. Auditoria (Audit Trail)
    await createAuditLog({
      eventType: AuditEventType.CRIACAO,
      tableName: 'StockMovement',
      recordId: movement.id,
      userId: data.userId,
      oldData: balance, // Estado do saldo antes
      newData: updatedBalance // Estado do saldo depois
    });

    return movement;
  });
}