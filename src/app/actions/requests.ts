// src/app/actions/requests.ts
'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Busca o histórico completo de pedidos de um utilizador específico
export async function getMyRequests(userId: string) {
  try {
    return await prisma.stockRequest.findMany({
      where: { requesterId: userId },
      include: {
        targetWarehouse: { select: { name: true } },
        items: {
          include: {
            product: { select: { name: true, unitOfMeasure: true } }
          }
        },
        approver: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' } // Mais recentes primeiro
    });
  } catch (error) {
    console.error('Erro ao buscar as solicitações:', error);
    throw new Error('Não foi possível carregar o histórico de solicitações.');
  }
}