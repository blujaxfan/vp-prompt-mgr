import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Enhanced Prisma client with logging
const createPrismaClient = () => {
  console.log('=== Creating Prisma Client ===');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);
  console.log('DATABASE_URL (masked):', process.env.DATABASE_URL ? 
    process.env.DATABASE_URL.replace(/:[^:@]*@/, ':***@') : 'undefined');

  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  });

  // Test connection on creation
  client.$connect()
    .then(() => {
      console.log('✅ Prisma client connected successfully');
    })
    .catch((error) => {
      console.error('❌ Prisma client connection failed:', error);
    });

  return client;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Add graceful shutdown
process.on('beforeExit', async () => {
  console.log('Disconnecting Prisma client...');
  await prisma.$disconnect();
});
