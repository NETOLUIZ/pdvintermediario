const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // ─── USUÁRIOS ───────────────────────────────────────────────
  const senhaAdmin = await bcrypt.hash('admin123', 10);
  const senhaAtend = await bcrypt.hash('atend123', 10);
  const senhaCaixa = await bcrypt.hash('caixa123', 10);

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@pizzaria.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@pizzaria.com',
      senha_hash: senhaAdmin,
      perfil: 'ADMIN',
    },
  });

  await prisma.usuario.upsert({
    where: { email: 'atendente@pizzaria.com' },
    update: {},
    create: {
      nome: 'Atendente',
      email: 'atendente@pizzaria.com',
      senha_hash: senhaAtend,
      perfil: 'ATENDENTE',
    },
  });

  await prisma.usuario.upsert({
    where: { email: 'caixa@pizzaria.com' },
    update: {},
    create: {
      nome: 'Caixa',
      email: 'caixa@pizzaria.com',
      senha_hash: senhaCaixa,
      perfil: 'OPERADOR_CAIXA',
    },
  });

  console.log('✅ Usuários criados');

  // ─── CATEGORIAS ─────────────────────────────────────────────
  const catPizza = await prisma.categoria.upsert({
    where: { id: 'cat-pizza' },
    update: {},
    create: { id: 'cat-pizza', nome: 'Pizzas', tipo: 'PIZZA', ordem: 1 },
  });
  const catBebida = await prisma.categoria.upsert({
    where: { id: 'cat-bebida' },
    update: {},
    create: { id: 'cat-bebida', nome: 'Bebidas', tipo: 'BEBIDA', ordem: 2 },
  });
  const catSobremesa = await prisma.categoria.upsert({
    where: { id: 'cat-sobremesa' },
    update: {},
    create: { id: 'cat-sobremesa', nome: 'Sobremesas', tipo: 'SOBREMESA', ordem: 3 },
  });
  const catCombo = await prisma.categoria.upsert({
    where: { id: 'cat-combo' },
    update: {},
    create: { id: 'cat-combo', nome: 'Combos', tipo: 'COMBO', ordem: 4 },
  });
  const catAdicional = await prisma.categoria.upsert({
    where: { id: 'cat-adicional' },
    update: {},
    create: { id: 'cat-adicional', nome: 'Adicionais', tipo: 'ADICIONAL', ordem: 5 },
  });
  const catBorda = await prisma.categoria.upsert({
    where: { id: 'cat-borda' },
    update: {},
    create: { id: 'cat-borda', nome: 'Bordas Recheadas', tipo: 'BORDA', ordem: 6 },
  });

  console.log('✅ Categorias criadas');

  // ─── PRODUTOS (PIZZAS) ───────────────────────────────────────
  const pizzasMargherita = await prisma.produto.upsert({
    where: { id: 'prod-margherita' },
    update: {},
    create: {
      id: 'prod-margherita',
      nome: 'Margherita',
      descricao: 'Molho de tomate, mozzarella e manjericão',
      tipo: 'PIZZA',
      categoria_id: catPizza.id,
      tamanhos: {
        create: [
          { tamanho: 'Broto', preco: 29.90 },
          { tamanho: 'M', preco: 44.90 },
          { tamanho: 'G', preco: 54.90 },
          { tamanho: 'GG', preco: 64.90 },
        ],
      },
    },
  });

  await prisma.produto.upsert({
    where: { id: 'prod-calabresa' },
    update: {},
    create: {
      id: 'prod-calabresa',
      nome: 'Calabresa',
      descricao: 'Molho de tomate, mozzarella, calabresa e cebola',
      tipo: 'PIZZA',
      categoria_id: catPizza.id,
      tamanhos: {
        create: [
          { tamanho: 'Broto', preco: 31.90 },
          { tamanho: 'M', preco: 46.90 },
          { tamanho: 'G', preco: 56.90 },
          { tamanho: 'GG', preco: 66.90 },
        ],
      },
    },
  });

  await prisma.produto.upsert({
    where: { id: 'prod-frango-cheddar' },
    update: {},
    create: {
      id: 'prod-frango-cheddar',
      nome: 'Frango com Cheddar',
      descricao: 'Molho de tomate, mozzarella, frango desfiado e cheddar',
      tipo: 'PIZZA',
      categoria_id: catPizza.id,
      tamanhos: {
        create: [
          { tamanho: 'Broto', preco: 34.90 },
          { tamanho: 'M', preco: 49.90 },
          { tamanho: 'G', preco: 59.90 },
          { tamanho: 'GG', preco: 69.90 },
        ],
      },
    },
  });

  await prisma.produto.upsert({
    where: { id: 'prod-quatro-queijos' },
    update: {},
    create: {
      id: 'prod-quatro-queijos',
      nome: 'Quatro Queijos',
      descricao: 'Mozzarella, provolone, parmesão e catupiry',
      tipo: 'PIZZA',
      categoria_id: catPizza.id,
      tamanhos: {
        create: [
          { tamanho: 'Broto', preco: 36.90 },
          { tamanho: 'M', preco: 52.90 },
          { tamanho: 'G', preco: 62.90 },
          { tamanho: 'GG', preco: 72.90 },
        ],
      },
    },
  });

  await prisma.produto.upsert({
    where: { id: 'prod-portuguesa' },
    update: {},
    create: {
      id: 'prod-portuguesa',
      nome: 'Portuguesa',
      descricao: 'Molho, mozzarella, presunto, ovos, cebola, tomate e azeitona',
      tipo: 'PIZZA',
      categoria_id: catPizza.id,
      tamanhos: {
        create: [
          { tamanho: 'Broto', preco: 33.90 },
          { tamanho: 'M', preco: 48.90 },
          { tamanho: 'G', preco: 58.90 },
          { tamanho: 'GG', preco: 68.90 },
        ],
      },
    },
  });

  console.log('✅ Pizzas criadas');

  // ─── BEBIDAS ─────────────────────────────────────────────────
  await prisma.produto.createMany({
    data: [
      { id: 'prod-coca-lata', nome: 'Coca-Cola Lata 350ml', tipo: 'BEBIDA', categoria_id: catBebida.id },
      { id: 'prod-coca-2l', nome: 'Coca-Cola 2L', tipo: 'BEBIDA', categoria_id: catBebida.id },
      { id: 'prod-agua', nome: 'Água Mineral 500ml', tipo: 'BEBIDA', categoria_id: catBebida.id },
      { id: 'prod-suco-laranja', nome: 'Suco de Laranja 400ml', tipo: 'BEBIDA', categoria_id: catBebida.id },
      { id: 'prod-cerveja', nome: 'Cerveja Long Neck 355ml', tipo: 'BEBIDA', categoria_id: catBebida.id },
    ],
  });

  // Preços das bebidas via tamanhos (tamanho = "Único")
  const bebidas = [
    { id: 'prod-coca-lata', preco: 6.90 },
    { id: 'prod-coca-2l', preco: 12.90 },
    { id: 'prod-agua', preco: 4.00 },
    { id: 'prod-suco-laranja', preco: 9.90 },
    { id: 'prod-cerveja', preco: 8.90 },
  ];

  for (const b of bebidas) {
    const exists = await prisma.tamanhoProduto.findFirst({ where: { produto_id: b.id } });
    if (!exists) {
      await prisma.tamanhoProduto.create({
        data: { produto_id: b.id, tamanho: 'Único', preco: b.preco },
      });
    }
  }

  console.log('✅ Bebidas criadas');

  // ─── SOBREMESAS ──────────────────────────────────────────────
  await prisma.produto.createMany({
    data: [
      { id: 'prod-brownie', nome: 'Brownie de Chocolate', tipo: 'SOBREMESA', categoria_id: catSobremesa.id },
      { id: 'prod-petit-gateau', nome: 'Petit Gateau', tipo: 'SOBREMESA', categoria_id: catSobremesa.id },
    ],
  });

  const sobremesas = [
    { id: 'prod-brownie', preco: 12.90 },
    { id: 'prod-petit-gateau', preco: 18.90 },
  ];

  for (const s of sobremesas) {
    const exists = await prisma.tamanhoProduto.findFirst({ where: { produto_id: s.id } });
    if (!exists) {
      await prisma.tamanhoProduto.create({
        data: { produto_id: s.id, tamanho: 'Único', preco: s.preco },
      });
    }
  }

  // ─── ADICIONAIS ──────────────────────────────────────────────
  await prisma.produto.createMany({
    data: [
      { id: 'prod-add-catupiry', nome: 'Catupiry Extra', tipo: 'ADICIONAL', categoria_id: catAdicional.id },
      { id: 'prod-add-cheddar', nome: 'Cheddar Extra', tipo: 'ADICIONAL', categoria_id: catAdicional.id },
      { id: 'prod-add-bacon', nome: 'Bacon Extra', tipo: 'ADICIONAL', categoria_id: catAdicional.id },
      { id: 'prod-add-calabresa', nome: 'Calabresa Extra', tipo: 'ADICIONAL', categoria_id: catAdicional.id },
    ],
  });

  const adicionais = [
    { id: 'prod-add-catupiry', preco: 5.00 },
    { id: 'prod-add-cheddar', preco: 5.00 },
    { id: 'prod-add-bacon', preco: 6.00 },
    { id: 'prod-add-calabresa', preco: 5.00 },
  ];

  for (const a of adicionais) {
    const exists = await prisma.tamanhoProduto.findFirst({ where: { produto_id: a.id } });
    if (!exists) {
      await prisma.tamanhoProduto.create({
        data: { produto_id: a.id, tamanho: 'Único', preco: a.preco },
      });
    }
  }

  // ─── BORDAS ──────────────────────────────────────────────────
  await prisma.produto.createMany({
    data: [
      { id: 'prod-borda-catupiry', nome: 'Borda de Catupiry', tipo: 'BORDA', categoria_id: catBorda.id },
      { id: 'prod-borda-cheddar', nome: 'Borda de Cheddar', tipo: 'BORDA', categoria_id: catBorda.id },
      { id: 'prod-borda-chocolate', nome: 'Borda de Chocolate', tipo: 'BORDA', categoria_id: catBorda.id },
    ],
  });

  const bordas = [
    { id: 'prod-borda-catupiry', preco: 8.00 },
    { id: 'prod-borda-cheddar', preco: 8.00 },
    { id: 'prod-borda-chocolate', preco: 9.00 },
  ];

  for (const b of bordas) {
    const exists = await prisma.tamanhoProduto.findFirst({ where: { produto_id: b.id } });
    if (!exists) {
      await prisma.tamanhoProduto.create({
        data: { produto_id: b.id, tamanho: 'Único', preco: b.preco },
      });
    }
  }

  console.log('✅ Adicionais e bordas criados');

  // ─── MESAS ───────────────────────────────────────────────────
  for (let i = 1; i <= 15; i++) {
    await prisma.mesa.upsert({
      where: { numero: i },
      update: {},
      create: { numero: i, nome: `Mesa ${i}`, status: 'LIVRE', capacidade: 4 },
    });
  }

  console.log('✅ 15 Mesas criadas');
  console.log('\n🎉 Seed concluído com sucesso!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Credenciais padrão:');
  console.log('  Admin:     admin@pizzaria.com    / admin123');
  console.log('  Atendente: atendente@pizzaria.com / atend123');
  console.log('  Caixa:     caixa@pizzaria.com    / caixa123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
