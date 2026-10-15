// src/app/api/audit/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Busca os últimos 100 registos de auditoria, ordenados dos mais recentes para os mais antigos
    const auditLogs = await prisma.auditLog.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 100,
      include: {
        user: {
          select: {
            name: true,
            registration: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, data: auditLogs }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}