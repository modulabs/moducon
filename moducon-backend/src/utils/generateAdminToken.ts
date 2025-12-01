import jwt from 'jsonwebtoken';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin-secret-key-change-in-production';

// 관리자 토큰 생성 (30일 유효)
const token = jwt.sign(
  { role: 'admin', timestamp: Date.now() },
  ADMIN_SECRET,
  { expiresIn: '30d' }
);

console.log('='.repeat(60));
console.log('🔑 관리자 토큰이 생성되었습니다.');
console.log('='.repeat(60));
console.log(token);
console.log('='.repeat(60));
console.log('');
console.log('📋 사용 방법:');
console.log('1. 위 토큰을 복사하세요.');
console.log('2. API 요청 헤더에 다음을 추가하세요:');
console.log('   x-admin-token: [복사한 토큰]');
console.log('');
console.log('⚠️  보안 주의사항:');
console.log('- 이 토큰은 30일간 유효합니다.');
console.log('- 토큰이 유출되지 않도록 주의하세요.');
console.log('- 프로덕션 환경에서는 ADMIN_SECRET을 반드시 변경하세요.');
console.log('='.repeat(60));
