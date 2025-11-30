/**
 * 환경 변수 검증 미들웨어
 */

const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'GOOGLE_SHEETS_API_KEY',
  'SPREADSHEET_ID'
] as const;

export function validateEnv(): void {
  const missing: string[] = [];

  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    console.error('🚨 누락된 환경 변수:');
    missing.forEach(key => console.error(`  - ${key}`));
    console.error('\n💡 .env.example 파일을 참고하여 설정하세요.');
    process.exit(1);
  }

  // JWT_SECRET 최소 길이 검증
  if (process.env.JWT_SECRET!.length < 32) {
    console.error('🚨 JWT_SECRET은 최소 32자 이상이어야 합니다.');
    console.error('💡 openssl rand -base64 32 명령으로 생성하세요.');
    process.exit(1);
  }

  // 기본값 사용 경고
  if (process.env.GOOGLE_SHEETS_API_KEY === 'YOUR_API_KEY_HERE') {
    console.warn('⚠️  GOOGLE_SHEETS_API_KEY가 기본값입니다.');
    console.warn('💡 Google Cloud Console에서 API 키를 발급받아 설정하세요.');
  }

  console.log('✅ 환경 변수 검증 완료');
}
