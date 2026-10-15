// src/app/api/test-fefo/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { FefoAllocatorService } from '@/services/FefoAllocatorService';

const prisma = new PrismaClient();
const fefoService = new FefoAllocatorService();

export async function GET() {
  try {
    // 1. Localizar as IDs geradas dinamicamente pelo seed
    const warehouse = await prisma.warehouse.findUnique({ 
      where: { code: 'ALM-CENTRAL' } 
    });
    const product = await prisma.product.findUnique({ 
      where: { internalCode: 'PROD-001' } 
    });

    if (!warehouse || !product) {
      return NextResponse.json(
        { error: "Dados base não encontrados. Garanta que o seed foi executado." }, 
        { status: 404 }
      );
    }

    // 2. Simular uma necessidade de 1.500 unidades
    // (O seed criou o Lote A com 1.000 unidades a vencer em 30 dias e o Lote B com 5.000 a vencer em 1 ano)
    const requiredQuantity = 1500;
    
    // 3. Executar o motor FEFO
    const allocations = await fefoService.allocate(
      warehouse.id,
      product.id,
      requiredQuantity
    );

    return NextResponse.json({
      success: true,
      cenario: {
        produto: product.name,
        almoxarifado: warehouse.name,
        quantidadeSolicitada: requiredQuantity
      },
      resultadoFefo: allocations
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}