// src/app/api/movements/route.ts
import { NextResponse } from 'next/server';
import { StockMovementService, ExecuteMovementDTO } from '@/services/StockMovementService';
import { z } from 'zod';

// Validação de entrada utilizando Zod para garantir a integridade dos dados
const movementSchema = z.object({
  type: z.enum([
    'ENTRY_PURCHASE', 'ENTRY_DONATION', 'ENTRY_RETURN', 'ENTRY_ADJUSTMENT',
    'EXIT_CONSUMPTION', 'EXIT_DISPENSATION', 'EXIT_LOSS', 'EXIT_RETURN_SUPPLIER',
    'EXIT_ADJUSTMENT', 'TRANSFER_OUT', 'TRANSFER_IN'
  ]),
  sourceWarehouseId: z.string().uuid().optional(),
  destinationWarehouseId: z.string().uuid().optional(),
  userId: z.string().uuid(),
  reason: z.string().min(3, "O motivo deve ter pelo menos 3 caracteres."),
  observations: z.string().optional(),
  allowNegativeStock: z.boolean().optional(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    productLotId: z.string().uuid(),
    quantity: z.number().positive("A quantidade deve ser maior que zero."),
    locationId: z.string().uuid().optional(),
  })).min(1, "Adicione pelo menos um item à movimentação."),
});

// Instância do serviço que criámos anteriormente
const movementService = new StockMovementService();

export async function POST(request: Request) {
  try {
    // 1. Extrair o corpo da requisição HTTP
    const body = await request.json();
    
    // 2. Validar o payload recebido contra o esquema do Zod
    const parsedData = movementSchema.parse(body);

    // 3. Executar a movimentação no banco de dados com transação segura (ACID)
    const result = await movementService.executeMovement(parsedData as ExecuteMovementDTO);

    // 4. Retornar resposta de sucesso
    return NextResponse.json({ success: true, data: result }, { status: 201 });

  }  catch (error: any) {
    // 5. Tratamento de erros de validação do Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        success: false, 
        errors: error.flatten().fieldErrors 
      }, { status: 400 });
    }
    
    // 6. Tratamento de erros das regras de negócio
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 400 });
  }
}
