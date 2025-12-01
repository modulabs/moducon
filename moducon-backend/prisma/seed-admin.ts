import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedAdmin() {
  const username = 'modulabs';
  const password = 'moduaiffel1!';

  console.log('🔐 Starting admin account seed...');

  // 비밀번호 해시 생성
  const passwordHash = await bcrypt.hash(password, 10);

  // 관리자 계정 생성 (이미 있으면 무시)
  const admin = await prisma.admin.upsert({
    where: { username },
    update: {},
    create: {
      username,
      passwordHash,
    },
  });

  console.log('✅ Admin account created/updated:');
  console.log(`   - Username: ${admin.username}`);
  console.log(`   - ID: ${admin.id}`);
  console.log(`   - Created At: ${admin.createdAt}`);
}

seedAdmin()
  .catch((e) => {
    console.error('❌ Error seeding admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
