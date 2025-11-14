import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 테스트 사용자 생성
  const testUser = await prisma.user.upsert({
    where: {
      unique_user: {
        name: '조해창',
        phoneLast4: '4511',
      },
    },
    update: {},
    create: {
      name: '조해창',
      phoneLast4: '4511',
      email: 'test@moducon.kr',
      organization: 'Modulabs',
      registrationType: 'pre_registered',
    },
  });

  console.log('✅ Test user created:', testUser);
  console.log('   Name:', testUser.name);
  console.log('   Phone Last 4:', testUser.phoneLast4);
  console.log('   ID:', testUser.id);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
