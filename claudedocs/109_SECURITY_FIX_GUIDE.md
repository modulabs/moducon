# 109_SECURITY_FIX_GUIDE.md - 보안 취약점 해결 가이드

**긴급도**: 🔴 Critical
**대상**: hands-on worker
**작성일**: 2025-11-30

---

## 🚨 긴급: JWT Secret 노출 해결

### 현재 상황
- `.env` 파일이 Git에 커밋됨
- JWT_SECRET이 평문으로 공개 저장소에 노출
- 프로덕션 배포 시 심각한 보안 사고 가능

### 즉시 조치 사항

#### 1. Git 히스토리에서 완전 제거

```bash
# 1-1. 현재 디렉토리 확인
cd /Users/hchang/Myspace/Modulabs/moducon

# 1-2. .env 파일 백업 (로컬에만 보관)
cp moducon-backend/.env moducon-backend/.env.backup

# 1-3. Git 히스토리에서 완전 제거 (BFG Repo-Cleaner 사용 권장)
git filter-repo --path moducon-backend/.env --invert-paths

# 또는 git filter-branch 사용 (더 느림)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch moducon-backend/.env" \
  --prune-empty --tag-name-filter cat -- --all

# 1-4. 원격 저장소 강제 푸시 (주의!)
git push origin --force --all
git push origin --force --tags
```

⚠️ **주의**: 팀원이 있다면 공지 후 진행!

---

#### 2. .gitignore 업데이트

```bash
# .gitignore 파일에 추가
echo "" >> .gitignore
echo "# Environment Variables" >> .gitignore
echo "moducon-backend/.env" >> .gitignore
echo "moducon-frontend/.env" >> .gitignore
echo "moducon-frontend/.env.local" >> .gitignore
```

**또는 직접 편집**:
```gitignore
# Environment Variables
moducon-backend/.env
moducon-frontend/.env
moducon-frontend/.env.local
*.env
*.env.local
*.env.production
!.env.example
```

---

#### 3. .env.example 파일 생성

**파일**: `moducon-backend/.env.example`
```env
# Database Configuration
DATABASE_URL="postgresql://user@localhost:5432/moducon_dev?schema=public&connection_limit=20"

# JWT Configuration
# Generate with: openssl rand -base64 32
JWT_SECRET="CHANGE_THIS_TO_RANDOM_SECRET_MINIMUM_32_CHARACTERS"
JWT_EXPIRES_IN="1d"

# Google Sheets API Configuration
# Get your API key from: https://console.cloud.google.com/
GOOGLE_SHEETS_API_KEY="YOUR_API_KEY_HERE"
SPREADSHEET_ID="YOUR_SPREADSHEET_ID"
```

---

#### 4. 새로운 JWT Secret 생성

```bash
# 4-1. 안전한 랜덤 시크릿 생성
openssl rand -base64 32

# 출력 예시:
# A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r8S9t0U1v2W3x4Y5z6=

# 4-2. 새 .env 파일 생성
cat > moducon-backend/.env << 'EOF'
DATABASE_URL="postgresql://hchang@localhost:5432/moducon_dev?schema=public&connection_limit=20"
JWT_SECRET="<위에서 생성한 시크릿 붙여넣기>"
JWT_EXPIRES_IN="1d"

# Google Sheets API 설정
GOOGLE_SHEETS_API_KEY="YOUR_API_KEY_HERE"
SPREADSHEET_ID="1djkPQzg_1-_zgbWe8e5AYZlUjVoQYmJj2HlwRsCqu9g"
EOF

# 4-3. 권한 설정 (읽기만 가능)
chmod 400 moducon-backend/.env
```

---

#### 5. README.md에 보안 설정 가이드 추가

**파일**: `moducon-backend/README.md`

추가할 섹션:
```markdown
## 🔐 보안 설정

### 환경 변수 설정

1. `.env.example`을 복사하여 `.env` 파일 생성:
   ```bash
   cp .env.example .env
   ```

2. JWT Secret 생성:
   ```bash
   openssl rand -base64 32
   ```

3. `.env` 파일 편집:
   ```env
   JWT_SECRET="<위에서 생성한 시크릿>"
   GOOGLE_SHEETS_API_KEY="<Google Cloud Console에서 발급받은 키>"
   ```

4. **중요**: `.env` 파일을 절대 Git에 커밋하지 마세요!

### Google Sheets API 키 발급

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성 또는 선택
3. "API 및 서비스" > "사용자 인증 정보"로 이동
4. "사용자 인증 정보 만들기" > "API 키" 선택
5. API 키 제한 설정:
   - 애플리케이션 제한: HTTP 리퍼러 (웹사이트)
   - API 제한: Google Sheets API
6. 생성된 키를 `.env` 파일에 추가
```

---

## 🔒 추가 보안 강화 조치

### 1. GitHub Secret Scanning 활성화

```bash
# GitHub 저장소 설정에서 활성화
# Settings > Code security and analysis > Secret scanning
# - Secret scanning: Enable
# - Push protection: Enable
```

### 2. Pre-commit Hook 설정

**파일**: `.husky/pre-commit` (Husky 설치 필요)

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# .env 파일 커밋 방지
if git diff --cached --name-only | grep -q "\.env$"; then
  echo "🚨 Error: .env 파일을 커밋할 수 없습니다!"
  echo "🔐 Tip: .env.example 파일을 사용하세요."
  exit 1
fi

# Secret 패턴 검사
if git diff --cached | grep -iE "(password|secret|api_key|token).*=.*['\"][^'\"]{20,}"; then
  echo "⚠️  Warning: Secret 값으로 보이는 내용이 감지되었습니다."
  echo "계속하시겠습니까? (y/N)"
  read response
  if [ "$response" != "y" ]; then
    exit 1
  fi
fi
```

### 3. 환경 변수 검증 미들웨어

**파일**: `moducon-backend/src/middleware/validateEnv.ts`

```typescript
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
  }

  console.log('✅ 환경 변수 검증 완료');
}
```

**사용**: `moducon-backend/src/index.ts`

```typescript
import { validateEnv } from './middleware/validateEnv.js';

// 서버 시작 전 환경 변수 검증
validateEnv();

// ... 서버 시작 코드
```

---

## 📋 체크리스트

### 즉시 조치 (필수)
- [ ] Git 히스토리에서 `.env` 파일 완전 제거
- [ ] `.gitignore`에 `.env` 패턴 추가
- [ ] `.env.example` 파일 생성
- [ ] 새로운 JWT Secret 생성 및 설정
- [ ] `.env` 파일 권한 설정 (chmod 400)
- [ ] 원격 저장소 강제 푸시

### 문서화 (권장)
- [ ] README.md에 보안 설정 가이드 추가
- [ ] SECURITY.md 파일 생성 (보안 정책)
- [ ] 팀원에게 .env 파일 재설정 안내

### 추가 보안 (선택)
- [ ] GitHub Secret Scanning 활성화
- [ ] Pre-commit Hook 설정
- [ ] 환경 변수 검증 미들웨어 추가
- [ ] Google Sheets API 키 제한 설정

---

## 🎯 검증 방법

### 1. .env 파일이 Git에 없는지 확인

```bash
# 로컬 파일 존재 확인
ls -la moducon-backend/.env  # 있어야 함

# Git 추적 확인
git ls-files moducon-backend/.env  # 출력 없어야 함

# Git 히스토리 확인
git log --all --full-history -- moducon-backend/.env  # 출력 없어야 함
```

### 2. .gitignore 적용 확인

```bash
git check-ignore -v moducon-backend/.env
# 출력: .gitignore:XX:moducon-backend/.env  moducon-backend/.env
```

### 3. 서버 시작 테스트

```bash
cd moducon-backend
npm run dev

# 출력 확인:
# ✅ 환경 변수 검증 완료
# 🚀 Server is running on port 3001
```

---

## 🚨 긴급 연락처

만약 `.env` 파일이 이미 공개 저장소에 푸시되었다면:

1. **즉시 조치**: JWT Secret 재생성 및 교체
2. **GitHub 지원**: support@github.com에 Secret Scanning 요청
3. **팀 공지**: 모든 팀원에게 .env 재설정 안내

---

**작성자**: Code Reviewer
**최종 업데이트**: 2025-11-30
**다음 단계**: hands-on worker가 즉시 조치
