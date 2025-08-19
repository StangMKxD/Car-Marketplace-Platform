const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash(process.env.EMAIL_PASSWORD, 10);

  await prisma.user.upsert({
    where: { email: process.env.EMAIL_USER },
    update: {},
    create: {
      name: 'Admin',
      surname: 'T',
      email: process.env.EMAIL_USER,
      password: hashedPassword,
      phone: '0000000000',
      role: 'ADMIN',
    },
  });

  console.log('แอดมินมาละ');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

module.exports = prisma;