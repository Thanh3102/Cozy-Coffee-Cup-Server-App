import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

enum Role {
  ADMIN = 'ADMIN',
}

const prisma = new PrismaClient();
async function main() {
  await prisma.account.deleteMany();
  await prisma.account.create({
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
