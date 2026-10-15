// src/services/FefoAllocatorService.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface FefoAllocation {
  productLotId: string;
  lotNumber: string;
  expirationDate: Date;
  quantityToPick: number;
  locationId: string | null;
}

export class FefoAllocatorService {
  /**
   * Aloca a quantidade solicitada de um produto baseando-se na política FEFO.
   * Lotes com vencimento mais próximo são consumidos primeiro.
   * Lotes vencidos são ignorados automaticamente.
   */
  public async allocate(
    warehouseId: string,
    productId: string,
    requiredQuantity: number
  ): Promise<FefoAllocation[]> {
    if (requiredQuantity <= 0) {
      throw new Error("A quantidade solicitada deve ser maior que zero.");
    }

    // 1. Buscar saldos disponíveis, ordenados pela validade mais próxima (FEFO)
    const availableBalances = await prisma.stockBalance.findMany({
      where: {
        warehouseId,
        productId,
        availableQty: { gt: 0 },
        lot: {
          expirationDate: { gt: new Date() }, // Trava de segurança: ignora lotes já vencidos
        },
      },
      include: {
        lot: true,
      },
      orderBy: {
        lot: {
          expirationDate: 'asc', // Ordem crescente: o que vence primeiro aparece no topo
        },
      },
    });

    let remainingToPick = requiredQuantity;
    const allocations: FefoAllocation[] = [];

    // 2. Iterar sobre os lotes disponíveis até suprir a quantidade solicitada
    for (const stock of availableBalances) {
      if (remainingToPick <= 0) break;

      const available = stock.availableQty.toNumber();
      
      // Define o quanto vamos pegar deste lote (o que for menor: o saldo ou o que falta pegar)
      const quantityToPick = Math.min(available, remainingToPick);

      allocations.push({
        productLotId: stock.productLotId,
        lotNumber: stock.lot.lotNumber,
        expirationDate: stock.lot.expirationDate,
        quantityToPick,
        locationId: stock.locationId,
      });

      remainingToPick -= quantityToPick;
    }

    // 3. Validação final: verificar se conseguimos suprir tudo
    if (remainingToPick > 0) {
      throw new Error(
        `Estoque insuficiente sob a política FEFO. Faltam ${remainingToPick} unidades válidas para separação.`
      );
    }

    return allocations;
  }
}