// prisma/seed.ts
import { 
  PrismaClient, 
  RoleName, 
  ProductClassification, 
  LotStatus, 
  StockStatus,
  MovementType
} from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o povoamento do banco de dados (Seed)...');

  // 1. Roles e Permissões (Usando o novo Enum RoleName)
  const adminRole = await prisma.role.upsert({
    where: { name: RoleName.ADMINISTRADOR },
    update: {},
    create: { name: RoleName.ADMINISTRADOR, description: 'Acesso total e gestão', isSystem: true },
  });

  const gestorRole = await prisma.role.upsert({
    where: { name: RoleName.GESTOR_ESTOQUE },
    update: {},
    create: { name: RoleName.GESTOR_ESTOQUE, description: 'Gestão de estoques e lotes', isSystem: true },
  });

  const almoxarifeRole = await prisma.role.upsert({
    where: { name: RoleName.ALMOXARIFE },
    update: {},
    create: { name: RoleName.ALMOXARIFE, description: 'Atendimento e FEFO', isSystem: true },
  });

  const solicitanteRole = await prisma.role.upsert({
    where: { name: RoleName.SOLICITANTE },
    update: {},
    create: { name: RoleName.SOLICITANTE, description: 'Enfermagem e corpo clínico', isSystem: true },
  });

  const auditorRole = await prisma.role.upsert({
    where: { name: RoleName.AUDITOR },
    update: {},
    create: { name: RoleName.AUDITOR, description: 'Conferência de inventários', isSystem: true },
  });

  // Palavra-passe padrão para testes: "123456"
  const passwordHash = await bcrypt.hash('123456', 10);

  // 2. Criação de UM UTILIZADOR PARA CADA PERFIL
  
  // 2.1 Administrador
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@hgf.com.br' },
    update: {},
    create: {
      name: 'Guilherme Marques (Admin)',
      email: 'admin@hgf.com.br',
      passwordHash,
      cpf: '000.000.000-00',
      registration: 'ADM-001',
      roleId: adminRole.id,
      active: true,
    },
  });

  // 2.2 Gestor de Estoque
  await prisma.user.upsert({
    where: { email: 'gestor@hgf.com.br' },
    update: {},
    create: {
      name: 'Dr. Roberto (Gestor)',
      email: 'gestor@hgf.com.br',
      passwordHash,
      cpf: '111.111.111-11',
      registration: 'GEST-002',
      roleId: gestorRole.id,
      active: true,
    },
  });

  // 2.3 Almoxarife (Aquele que vai usar a fila de separação FEFO)
  await prisma.user.upsert({
    where: { email: 'almoxarife@hgf.com.br' },
    update: {},
    create: {
      name: 'Marcos (Almoxarife)',
      email: 'almoxarife@hgf.com.br',
      passwordHash,
      cpf: '222.222.222-22',
      registration: 'ALM-003',
      roleId: almoxarifeRole.id,
      active: true,
    },
  });

  // 2.4 Solicitante (Enfermagem - Faz os pedidos)
  await prisma.user.upsert({
    where: { email: 'enfermeira@hgf.com.br' },
    update: {},
    create: {
      name: 'Ana (Enfermagem)',
      email: 'enfermeira@hgf.com.br',
      passwordHash,
      cpf: '333.333.333-33',
      registration: 'COREN-CE 12345',
      roleId: solicitanteRole.id,
      active: true,
    },
  });

  // 2.5 Auditor (Fiscaliza a Imutabilidade)
  await prisma.user.upsert({
    where: { email: 'auditor@hgf.com.br' },
    update: {},
    create: {
      name: 'Juliana (Auditora)',
      email: 'auditor@hgf.com.br',
      passwordHash,
      cpf: '444.444.444-44',
      registration: 'AUD-005',
      roleId: auditorRole.id,
      active: true,
    },
  });

  // 3. Estrutura Física e Almoxarifado
  const hospital = await prisma.hospital.upsert({
    where: { cnpj: '12.345.678/0001-90' },
    update: {},
    create: { name: 'Hospital Geral de Fortaleza - SGH', code: 'HGF-01', cnpj: '12.345.678/0001-90' },
  });

  const unidade = await prisma.unit.upsert({
    where: { hospitalId_code: { hospitalId: hospital.id, code: 'UNI-FOR' } },
    update: {},
    create: { hospitalId: hospital.id, name: 'Unidade Matriz - Passaré', code: 'UNI-FOR' },
  });

  const almoxarifadoCentral = await prisma.warehouse.upsert({
    where: { code: 'ALM-CENTRAL' },
    update: {},
    create: { unitId: unidade.id, name: 'Almoxarifado Central', code: 'ALM-CENTRAL', isSatellite: false },
  });

  const locPrateleira = await prisma.storageLocation.upsert({
    where: { warehouseId_code: { warehouseId: almoxarifadoCentral.id, code: 'COR-A-PRAT-01' } },
    update: {},
    create: { warehouseId: almoxarifadoCentral.id, code: 'COR-A-PRAT-01', corridor: 'A', shelf: '01' }
  });

  // 4. Categorias e Produto
  const catMedicamento = await prisma.category.upsert({
    where: { code: 'CAT-MED' },
    update: {},
    create: { name: 'Medicamentos', code: 'CAT-MED' },
  });

  const subCatAnalgesico = await prisma.subcategory.upsert({
    where: { code: 'SUBCAT-ANALG' },
    update: {},
    create: { categoryId: catMedicamento.id, name: 'Analgésicos e Antipiréticos', code: 'SUBCAT-ANALG' },
  });

  const dipirona = await prisma.product.upsert({
    where: { internalCode: 'PROD-001' },
    update: {},
    create: {
      internalCode: 'PROD-001',
      name: 'Dipirona Sódica 500mg/ml',
      subcategoryId: subCatAnalgesico.id,
      unitOfMeasure: 'AMP',
      classification: ProductClassification.ALTO,
      minStock: 500,
      safetyStock: 200,
    },
  });

  // 5. Lote e Saldo de Estoque
  const dataVencimento = new Date();
  dataVencimento.setDate(dataVencimento.getDate() + 30);

  const loteA = await prisma.productLot.upsert({
    where: { productId_lotNumber: { productId: dipirona.id, lotNumber: 'LOTE-A-URGENTE' } },
    update: {},
    create: {
      productId: dipirona.id,
      lotNumber: 'LOTE-A-URGENTE',
      expirationDate: dataVencimento,
      status: LotStatus.ATIVO,
      unitCost: 1.50,
      initialQty: 1000,
    },
  });

  const saldo = await prisma.stockBalance.findFirst({
    where: { warehouseId: almoxarifadoCentral.id, productLotId: loteA.id }
  });
  
  if (!saldo) {
    await prisma.stockBalance.create({
      data: {
        warehouseId: almoxarifadoCentral.id,
        locationId: locPrateleira.id,
        productId: dipirona.id,
        productLotId: loteA.id,
        status: StockStatus.DISPONIVEL,
        physicalQty: 1000,
        availableQty: 1000,
        averageCost: 1.50
      }
    });

    await prisma.stockMovement.create({
      data: {
        type: MovementType.ENTRADA_COMPRA,
        productId: dipirona.id,
        productLotId: loteA.id,
        quantity: 1000,
        unitCost: 1.50,
        totalCost: 1500.00,
        destWarehouseId: almoxarifadoCentral.id,
        userId: adminUser.id,
        observations: 'Carga inicial do sistema'
      }
    });
  }

  console.log('✅ Seed executado com sucesso! Arquitetura atualizada e os 5 perfis de teste foram criados.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });