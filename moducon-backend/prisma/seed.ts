import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...\n');

  // 테스트 사용자 데이터 (조해창 4511 + 15명 1111)
  const testUsers = [
    { name: '조해창', phoneLast4: '4511', email: 'test@moducon.kr', organization: 'Modulabs' },
    { name: '이수경', phoneLast4: '1111' },
    { name: '송혜원', phoneLast4: '1111' },
    { name: '노민수', phoneLast4: '1111' },
    { name: '전현수', phoneLast4: '1111' },
    { name: '신현길', phoneLast4: '1111' },
    { name: '이연진', phoneLast4: '1111' },
    { name: '조성진', phoneLast4: '1111' },
    { name: '공지연', phoneLast4: '1111' },
    { name: '김현', phoneLast4: '1111' },
    { name: '차유진', phoneLast4: '1111' },
    { name: '박수빈', phoneLast4: '1111' },
    { name: '강신우', phoneLast4: '1111' },
    { name: '장은지', phoneLast4: '1111' },
    { name: '류상연', phoneLast4: '1111' },
    { name: '고유란', phoneLast4: '1111' },
  ];

  let createdCount = 0;
  let updatedCount = 0;

  for (const userData of testUsers) {
    const result = await prisma.user.upsert({
      where: {
        unique_user: {
          name: userData.name,
          phoneLast4: userData.phoneLast4,
        },
      },
      update: {},
      create: {
        name: userData.name,
        phoneLast4: userData.phoneLast4,
        email: userData.email || null,
        organization: userData.organization || null,
        registrationType: 'pre_registered',
        isActive: true,
      },
    });

    if (result.registeredAt.getTime() === result.lastLogin?.getTime()) {
      console.log(`✅ Created: ${userData.name} (*${userData.phoneLast4})`);
      createdCount++;
    } else {
      console.log(`⏭️  Exists: ${userData.name} (*${userData.phoneLast4})`);
      updatedCount++;
    }
  }

  console.log('\n📊 Seeding Summary:');
  console.log(`   ✅ Created: ${createdCount} users`);
  console.log(`   ⏭️  Existing: ${updatedCount} users`);
  console.log(`   📋 Total: ${testUsers.length} users`);

  // 전체 사용자 목록 출력
  const allUsers = await prisma.user.findMany({
    orderBy: [{ name: 'asc' }, { phoneLast4: 'asc' }],
    select: {
      name: true,
      phoneLast4: true,
      signatureUrl: true,
      lastLogin: true,
    },
  });

  console.log('\n👥 All Users in Database:');
  allUsers.forEach((user, index) => {
    const signature = user.signatureUrl ? '✍️' : '❌';
    const lastLogin = user.lastLogin ? '🔐' : '🔓';
    console.log(`${index + 1}. ${user.name} (*${user.phoneLast4}) - Signature: ${signature} Login: ${lastLogin}`);
  });

  console.log('\n🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
