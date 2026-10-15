// src/app/api/requests/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validação rigorosa com regras de negócio interligadas
const requestSchema = z.object({
  departmentId: z.string().uuid(),
  sourceWarehouseId: z.string().uuid(),
  userId: z.string().uuid(),
  professionalName: z.string().min(3, "Nome do profissional obrigatório"),
  professionalId: z.string().min(3, "Identificação (CRM/COREN) obrigatória"),
  bedNumber: z.string().optional(),
  patientName: z.string().optional(),
  patientCpf: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    requestedQty: z.number().positive(),
  })).min(1, "A requisição deve ter pelo menos um item"),
}).refine(data => {
  // A SUA REGRA DE NEGÓCIO: Se não houver leito, o nome e CPF são obrigatórios
  if (!data.bedNumber || data.bedNumber.trim() === '') {
    return !!data.patientName && !!data.patientCpf;
  }
  return true;
}, {
  message: "Como não foi informado o Leito, é obrigatório informar o Nome e o CPF do Paciente para rastreabilidade.",
  path: ["bedNumber"] // O erro será ancorado aqui no frontend
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = requestSchema.parse(body);

    const requestCode = `REQ-${Date.now()}`;

    // Criação do pedido de forma transacional
    const stockRequest = await prisma.stockRequest.create({
      data: {
        code: requestCode,
        departmentId: data.departmentId,
        sourceWarehouseId: data.sourceWarehouseId,
        requestedByUserId: data.userId,
        professionalName: data.professionalName,
        professionalId: data.professionalId,
        bedNumber: data.bedNumber || null,
        patientName: data.patientName || null,
        patientCpf: data.patientCpf || null,
        status: 'SUBMITTED',
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            requestedQty: item.requestedQty
          }))
        }
      }
    });

    return NextResponse.json({ success: true, data: stockRequest }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.flatten().fieldErrors }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}