// src/lib/audit.ts
import { PrismaClient, AuditEventType } from '@prisma/client';

// Idealmente, deve exportar uma instância única do Prisma (singleton) noutro ficheiro,
// mas para o motor de auditoria, instanciamos aqui para garantir a gravação.
const prisma = new PrismaClient();

interface AuditParams {
  eventType: AuditEventType;
  tableName: string;
  recordId: string;
  userId: string;
  oldData?: any;
  newData?: any;
  ipAddress?: string;
}

export async function createAuditLog(params: AuditParams) {
  try {
    await prisma.auditLog.create({
      data: {
        eventType: params.eventType,
        tableName: params.tableName,
        recordId: params.recordId,
        userId: params.userId,
        // O Prisma suporta Json, passamos diretamente os objetos ou stringificamos
        oldData: params.oldData ? JSON.parse(JSON.stringify(params.oldData)) : null,
        newData: params.newData ? JSON.parse(JSON.stringify(params.newData)) : null,
        ipAddress: params.ipAddress,
      }
    });
    console.log(`[AUDITORIA] Registado: ${params.eventType} em ${params.tableName}`);
  } catch (error) {
    // Falhas na auditoria devem ser alertadas, mas não devem (geralmente) travar a operação clínica
    console.error('[AUDITORIA ERRO] Falha ao gravar log de auditoria:', error);
  }
}