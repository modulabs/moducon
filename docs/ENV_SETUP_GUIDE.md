# 환경변수 설정 가이드

이 문서는 Moducon 2025 프로젝트의 환경변수 설정 방법을 설명합니다.

## 📋 목차
1. [백엔드 환경변수](#백엔드-환경변수)
2. [프론트엔드 환경변수](#프론트엔드-환경변수)
3. [로컬 개발 환경 설정](#로컬-개발-환경-설정)
4. [프로덕션 배포 설정](#프로덕션-배포-설정)
5. [보안 주의사항](#보안-주의사항)

---

## 백엔드 환경변수

### 필수 환경변수

**파일 위치**: `moducon-backend/.env`

```bash
# 데이터베이스 연결 URL
DATABASE_URL="postgresql://user:password@localhost:5432/moducon_dev?schema=public"

# 서버 포트
PORT=3001

# JWT 시크릿 키 (사용자 인증)
JWT_SECRET=your-jwt-secret-key-change-in-production

# 관리자 토큰 시크릿 키
ADMIN_SECRET=admin-secret-key-change-in-production
```

### 환경변수 설명

| 변수명 | 설명 | 기본값 | 필수 |
|--------|------|--------|------|
| `DATABASE_URL` | PostgreSQL 데이터베이스 연결 URL | - | ✅ |
| `PORT` | 백엔드 서버 포트 | 3001 | ❌ |
| `JWT_SECRET` | 사용자 인증 토큰 생성 비밀키 | - | ✅ |
| `ADMIN_SECRET` | 관리자 토큰 생성 비밀키 | - | ✅ |

### DATABASE_URL 형식
```
postgresql://[사용자]:[비밀번호]@[호스트]:[포트]/[데이터베이스명]?schema=public
```

**예시**:
- 로컬: `postgresql://postgres:password@localhost:5432/moducon_dev?schema=public`
- Render: `postgresql://user:pass@dpg-xxxxx.render.com/dbname`
- Railway: `postgresql://postgres:pass@containers-us-west-xxx.railway.app:5432/railway`

---

## 프론트엔드 환경변수

### 필수 환경변수

**파일 위치**: `moducon-frontend/.env.local`

```bash
# 백엔드 API 서버 URL
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 환경변수 설명

| 변수명 | 설명 | 기본값 | 필수 |
|--------|------|--------|------|
| `NEXT_PUBLIC_API_URL` | 백엔드 API 서버 주소 | http://localhost:3001 | ✅ |

⚠️ **주의**: Next.js에서 브라우저에 노출되는 환경변수는 반드시 `NEXT_PUBLIC_` 접두사가 필요합니다.

---

## 로컬 개발 환경 설정

### 1. 백엔드 설정

```bash
# 1. 백엔드 디렉토리로 이동
cd moducon-backend

# 2. .env.example을 복사하여 .env 생성
cp .env.example .env

# 3. .env 파일 편집
nano .env  # 또는 vim, vscode 등
```

**`.env` 파일 내용 (로컬 개발용)**:
```bash
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/moducon_dev?schema=public"
PORT=3001
JWT_SECRET=local-jwt-secret-for-development-only
ADMIN_SECRET=local-admin-secret-for-development-only
```

```bash
# 4. 데이터베이스 마이그레이션
npm run db:migrate

# 5. 초기 데이터 시딩
npm run db:seed

# 6. 서버 실행
npm run dev
```

### 2. 프론트엔드 설정

```bash
# 1. 프론트엔드 디렉토리로 이동
cd moducon-frontend

# 2. .env.local 파일 생성
touch .env.local

# 3. .env.local 파일 편집
nano .env.local
```

**`.env.local` 파일 내용**:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

```bash
# 4. 개발 서버 실행
npm run dev
```

### 3. 환경변수 확인

```bash
# 백엔드 서버 로그 확인
# 출력: Server running on http://localhost:3001

# 프론트엔드에서 API 호출 테스트
# 브라우저 개발자 도구 → Network 탭 → API 요청 확인
```

---

## 프로덕션 배포 설정

### 백엔드 (Render/Railway 예시)

**Render 설정**:
```bash
DATABASE_URL=postgresql://user:pass@dpg-xxxxx.render.com/moducon_prod
PORT=3001
JWT_SECRET=강력한-무작위-문자열-64자-이상-권장
ADMIN_SECRET=강력한-무작위-문자열-64자-이상-권장
```

**Railway 설정**:
- Dashboard → Variables 탭에서 추가
- `DATABASE_URL`: 자동 생성 (PostgreSQL 플러그인)
- `JWT_SECRET`, `ADMIN_SECRET`: 직접 추가

### 프론트엔드 (Vercel/Netlify 예시)

**Vercel 설정**:
1. 프로젝트 설정 → Environment Variables
2. `NEXT_PUBLIC_API_URL` 추가
   - Development: `http://localhost:3001`
   - Production: `https://api.moducon2025.com`

**Netlify 설정**:
1. Site settings → Build & deploy → Environment
2. `NEXT_PUBLIC_API_URL` = `https://api.moducon2025.com`

---

## 보안 주의사항

### ⚠️ 절대 금지 사항

1. **`.env` 파일을 Git에 커밋하지 마세요**
   ```bash
   # .gitignore에 반드시 포함
   .env
   .env.local
   .env.*.local
   ```

2. **하드코딩 금지**
   ```typescript
   // ❌ 나쁜 예
   const API_URL = 'http://localhost:3001';

   // ✅ 좋은 예
   const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
   ```

3. **프로덕션 시크릿 공유 금지**
   - Slack, 이메일, 공개 문서에 프로덕션 시크릿 키를 절대 작성하지 마세요
   - 1Password, Vault 등 안전한 시크릿 관리 도구 사용 권장

### 🔐 강력한 시크릿 키 생성

```bash
# Node.js로 무작위 시크릿 생성
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 또는 OpenSSL 사용
openssl rand -hex 64
```

### 관리자 토큰 생성

```bash
cd moducon-backend
npm run admin:token

# 출력된 토큰을 안전하게 보관
# 프론트엔드에서 x-admin-token 헤더로 사용
```

---

## 트러블슈팅

### 데이터베이스 연결 실패
```bash
# 증상: Error: Can't reach database server at localhost:5432
# 해결:
1. PostgreSQL 서버 실행 확인: brew services list (macOS)
2. DATABASE_URL 확인: 호스트, 포트, 사용자명, 비밀번호
3. 데이터베이스 존재 확인: psql -l
```

### 환경변수 로드 안됨
```bash
# 증상: process.env.JWT_SECRET이 undefined
# 해결:
1. .env 파일 위치 확인 (프로젝트 루트)
2. 서버 재시작 (npm run dev)
3. dotenv 설치 확인: npm list dotenv
```

### CORS 에러
```bash
# 증상: Access to fetch blocked by CORS policy
# 해결:
1. 백엔드 CORS 설정 확인 (src/index.ts)
2. NEXT_PUBLIC_API_URL 확인 (http:// 포함)
3. 브라우저 캐시 삭제
```

---

## 체크리스트

### 로컬 개발 환경
- [ ] 백엔드 `.env` 파일 생성
- [ ] DATABASE_URL 설정 및 데이터베이스 연결 확인
- [ ] JWT_SECRET, ADMIN_SECRET 설정
- [ ] 프론트엔드 `.env.local` 파일 생성
- [ ] NEXT_PUBLIC_API_URL 설정
- [ ] 서버 실행 확인 (백엔드 3001, 프론트엔드 3000)

### 프로덕션 배포
- [ ] 프로덕션 데이터베이스 준비 (PostgreSQL)
- [ ] 강력한 시크릿 키 생성 (64자 이상)
- [ ] 환경변수 플랫폼에 설정 (Render/Vercel)
- [ ] 프로덕션 API URL 확인 (HTTPS)
- [ ] 관리자 토큰 생성 및 안전 보관
- [ ] .env 파일이 .gitignore에 포함되었는지 확인

---

**작성일**: 2025-11-21
**버전**: 1.0.0
**관련 문서**: [배포 가이드](DEPLOYMENT_GUIDE.md)
