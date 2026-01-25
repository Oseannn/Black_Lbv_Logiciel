import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@osean.local' },
    update: {},
    create: {
      email: 'admin@osean.local',
      password: adminPassword,
      name: 'Administrateur',
      role: Role.ADMIN,
      isActive: true,
    },
  });

  console.log(`✅ Admin user created: ${admin.email}`);

  // Create a sample vendeuse
  const vendeusePassword = await bcrypt.hash('Vendeuse123!', 10);

  const vendeuse = await prisma.user.upsert({
    where: { email: 'vendeuse@osean.local' },
    update: {},
    create: {
      email: 'vendeuse@osean.local',
      password: vendeusePassword,
      name: 'Marie Vendeuse',
      role: Role.VENDEUSE,
      isActive: true,
    },
  });

  console.log(`✅ Vendeuse user created: ${vendeuse.email}`);

  // Create default settings
  const settings = await prisma.settings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      companyName: 'Ma Boutique',
      currency: 'FCFA',
      slogan: 'Bienvenue chez nous !',
      invoiceFooter: 'Merci pour votre achat !',
    },
  });

  console.log(`✅ Default settings created: ${settings.companyName}`);

  console.log('');
  console.log('🎉 Seed completed!');
  console.log('');
  console.log('📋 Test accounts:');
  console.log('   Admin:    admin@osean.local / Admin123!');
  console.log('   Vendeuse: vendeuse@osean.local / Vendeuse123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
