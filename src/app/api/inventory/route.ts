// src/app/api/inventory/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schema para registar a contagem do operador
const countSchema = z.object({
  inventoryId: z.string().uuid(),
  productId: z.string().uuid(),
  firstCount: z.number().nonnegative(),
  secondCount: z.number().nonnegative().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = countSchema.parse(body);

    return await prisma.$transaction(async (tx) => {
      // Busca o item no inventário
      const item = await tx.inventoryItem.findFirst({
        where: {
          inventoryId: data.inventoryId,
          productId: data.productId,
        },
      });

      if (!item) {
        return NextResponse.json({ success: false, message: "Item não encontrado neste inventário." }, { status: 404 });
      }

      // Calcula a divergência com base no saldo do sistema
      const finalCount = data.secondCount ?? data.firstCount;
      const divergence = finalCount - Number(item.systemQty);

      // Atualiza o item com as contagens físicas
      const updatedItem = await tx.inventoryItem.update({
        where: { id: item.id },
        data: {
          firstCount: data.firstCount,
          secondCount: data.secondCount ?? item.secondCount,
          finalCount: finalCount,
          divergence: divergence,
        },
      });

      return NextResponse.json({ success: true, data: updatedItem }, { status: 200 });
    });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.flatten().fieldErrors }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}