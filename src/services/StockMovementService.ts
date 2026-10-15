// src/services/StockMovementService.ts
import { PrismaClient, MovementType, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface MovementItemInput {
  productId: string;
  productLotId: string;
  quantity: number;
  locationId?: string;
}

export interface ExecuteMovementDTO {
  type: MovementType;
  sourceWarehouseId?: string;
  destinationWarehouseId?: string;
  userId: string;
  reason: string;
  observations?: string;
  allowNegativeStock?: boolean;
  items: MovementItemInput[];
}

export class StockMovementService {
  public async executeMovement(dto: ExecuteMovementDTO) {
    if (dto.items.length === 0) {
      throw new Error("A movimentação deve possuir ao menos um item.");
    }

    if (dto.sourceWarehouseId && dto.destinationWarehouseId && dto.sourceWarehouseId === dto.destinationWarehouseId) {
      throw new Error("O almoxarifado de origem e destino não podem ser iguais.");
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Gerar Código Único
      const movementCode = `MOV-${Date.now()}`;

      // 2. Criar a Movimentação
      const movement = await tx.stockMovement.create({
        data: {
          code: movementCode,
          type: dto.type,
          sourceWarehouseId: dto.sourceWarehouseId,
          destinationWarehouseId: dto.destinationWarehouseId,
          userId: dto.userId,
          reason: dto.reason,
          observations: dto.observations,
        },
      });

      for (const item of dto.items) {
        const qtyDecimal = new Prisma.Decimal(item.quantity);

        if (qtyDecimal.lte(0)) throw new Error("A quantidade deve ser maior que zero.");

        const lot = await tx.productLot.findUnique({
          where: { id: item.productLotId },
          include: { product: true },
        });

        if (!lot) throw new Error(`Lote não encontrado.`);

        // --- SAÍDA (Origem) ---
        if (dto.sourceWarehouseId) {
          const sourceBalance = await tx.stockBalance.findFirst({
            where: {
              warehouseId: dto.sourceWarehouseId,
              productId: item.productId,
              productLotId: item.productLotId,
              locationId: item.locationId ?? null,
            },
          });

          const currentAvailable = sourceBalance?.availableQty || new Prisma.Decimal(0);

          if (!dto.allowNegativeStock && currentAvailable.lt(qtyDecimal)) {
            throw new Error(`Saldo insuficiente para o produto ${lot.product.name}.`);
          }

          if (sourceBalance) {
            await tx.stockBalance.update({
              where: { id: sourceBalance.id },
              data: {
                physicalQty: { decrement: qtyDecimal },
                availableQty: { decrement: qtyDecimal },
              },
            });
          }
        }

        // --- ENTRADA (Destino) ---
        if (dto.destinationWarehouseId) {
          const destBalance = await tx.stockBalance.findFirst({
            where: {
              warehouseId: dto.destinationWarehouseId,
              productId: item.productId,
              productLotId: item.productLotId,
              locationId: item.locationId ?? null,
            },
          });

          if (destBalance) {
            await tx.stockBalance.update({
              where: { id: destBalance.id },
              data: {
                physicalQty: { increment: qtyDecimal },
                availableQty: { increment: qtyDecimal },
              },
            });
          } else {
            await tx.stockBalance.create({
              data: {
                warehouseId: dto.destinationWarehouseId,
                productId: item.productId,
                productLotId: item.productLotId,
                locationId: item.locationId ?? null,
                physicalQty: qtyDecimal,
                availableQty: qtyDecimal,
                averageCost: lot.unitCost,
              },
            });
          }
        }

        // 3. Registrar o Item da Movimentação
        await tx.stockMovementItem.create({
          data: {
            movementId: movement.id,
            productId: item.productId,
            productLotId: item.productLotId,
            quantity: qtyDecimal,
            unitCost: lot.unitCost,
            totalCost: lot.unitCost.mul(qtyDecimal),
          },
        });
      }

      return movement;
    });
  }
}