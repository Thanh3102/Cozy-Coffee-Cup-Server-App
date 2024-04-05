import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

enum Role {
  ADMIN = 'ADMIN',
}

// Reset identity counter sql: "TRUNCATE TABLE <tableName> RESTART IDENTITY;"

const prisma = new PrismaClient();
async function main() {
  await prisma.user.deleteMany();
  await prisma.user.create({
    data: {
      username: 'admin',
      password: await bcrypt.hash('123456', 10),
      name: 'admin',
      role: Role.ADMIN,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
