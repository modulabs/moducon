# 43_BACKEND_HANDOFF.md - 백엔드 개발 인계서

## 📋 문서 정보
- **작성자**: planner (Technical Lead)
- **작성일**: 2025-01-14
- **다음 담당자**: hands-on worker
- **예상 소요 시간**: 2시간 20분

---

## 🎯 작업 개요

### 목표
로컬 PostgreSQL 기반 백엔드 API 서버를 구축하여 프론트엔드에서 **로그인 기능을 실제로 테스트**할 수 있도록 합니다.

### 핵심 요구사항
1. ✅ **테스트 사용자 로그인 가능**: 조해창, 4511
2. ✅ **디지털 서명 저장 기능 동작**
3. ✅ **로그인 리셋 기능 제공** (반복 테스트용)
4. ✅ **로컬 전용 개발** (GitHub 푸시 금지)

---

## 📚 필독 문서

### 주요 문서 (반드시 읽기)
1. **`41_BACKEND_DEV_PLAN.md`** (45KB)
   - 백엔드 기술 스택 선정 근거
   - 데이터베이스 설계
   - API 명세 및 개발 단계

2. **`42_BACKEND_IMPLEMENTATION_GUIDE.md`** (50KB)
   - **이 문서를 따라 구현하세요!**
   - Step 1-9까지 상세 구현 가이드
   - 모든 코드와 설정 파일 포함
   - 테스트 시나리오 및 예제

### 참고 문서
3. `01_PRD.md` - 제품 요구사항 (로그인 플로우 이해)
4. `05_API_SPEC.md` - 전체 API 명세서
5. `06_DB_DESIGN.md` - 데이터베이스 전체 설계
6. `07_PROGRESS.md` - 프로젝트 진행 상황

---

## 🏗️ 기술 스택 요약

### Backend
- **Framework**: Express.js 4.x
- **Language**: TypeScript 5.x
- **Runtime**: Node.js 20.x LTS

### Database
- **RDBMS**: PostgreSQL 14+ (로컬)
- **ORM**: Prisma 5.x

### 인증
- **JWT**: jsonwebtoken

---

## 📊 구현 단계 요약

### Step 1: Git 브랜치 생성 (5분)
```bash
git checkout -b backend-dev
mkdir moducon-backend
cd moducon-backend
npm init -y
```

### Step 2: 패키지 설치 (10분)
```bash
npm install express cors dotenv jsonwebtoken @prisma/client
npm install -D typescript tsx prisma @types/node @types/express
```

### Step 3: Prisma 설정 (15분)
- `prisma/schema.prisma` 작성
- PostgreSQL 데이터베이스 생성
- 마이그레이션 실행
- 테스트 사용자 시드

### Step 4-6: 서버 구현 (1시간)
- 유틸리티 (logger, response)
- JWT 설정 및 미들웨어
- 인증 서비스
- 컨트롤러 및 라우트

### Step 7: 서버 진입점 (10분)
- `src/index.ts` 작성
- Express 서버 설정

### Step 8: 테스트 (30분)
- API 테스트 (curl/Postman)
- 프론트엔드 연동 테스트

### Step 9: Git 커밋 (5분)
```bash
git add moducon-backend/
git commit -m "feat: 백엔드 초기 구현 완료"
```

---

## 🔑 핵심 API 엔드포인트

### 1. POST /api/auth/login
**목적**: 이름 + 전화번호 뒤 4자리로 로그인

**Request**:
```json
{
  "name": "조해창",
  "phone_last4": "4511"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-123",
      "name": "조해창",
      "phone_last4": "4511",
      "registration_type": "pre_registered",
      "has_signature": false
    }
  }
}
```

---

### 2. POST /api/auth/signature
**목적**: 디지털 서명 저장 (JWT 인증 필요)

**Headers**:
```
Authorization: Bearer <token>
```

**Request**:
```json
{
  "signature_data": "data:image/png;base64,iVBORw0KGgoAAAA..."
}
```

---

### 3. GET /api/auth/me
**목적**: 현재 로그인한 사용자 정보 조회 (JWT 인증 필요)

**Headers**:
```
Authorization: Bearer <token>
```

---

### 4. POST /api/auth/reset-login
**목적**: 로그인 세션 초기화 (테스트용)

**Request**:
```json
{
  "name": "조해창",
  "phone_last4": "4511"
}
```

**동작**:
- 모든 auth_sessions을 is_revoked = true로 변경
- signatures 테이블에서 서명 삭제
- users.last_login을 NULL로 변경

---

## 🗄️ 데이터베이스 스키마 요약

### users 테이블
```sql
id UUID PRIMARY KEY
name VARCHAR(100) NOT NULL
phone_last4 VARCHAR(4) NOT NULL
signature_url TEXT
registration_type VARCHAR(20) DEFAULT 'pre_registered'
registered_at TIMESTAMPTZ DEFAULT NOW()
last_login TIMESTAMPTZ

UNIQUE(name, phone_last4)
```

### auth_sessions 테이블
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id)
token TEXT UNIQUE NOT NULL
created_at TIMESTAMPTZ DEFAULT NOW()
expires_at TIMESTAMPTZ NOT NULL
is_revoked BOOLEAN DEFAULT FALSE
```

### signatures 테이블
```sql
id UUID PRIMARY KEY
user_id UUID UNIQUE REFERENCES users(id)
signature_data TEXT NOT NULL
created_at TIMESTAMPTZ DEFAULT NOW()
```

---

## 🧪 테스트 시나리오

### 시나리오 1: 초기 로그인
1. POST /api/auth/login (조해창, 4511)
2. 토큰 받기
3. GET /api/auth/me (토큰 포함)
4. has_signature: false 확인

### 시나리오 2: 서명 저장
1. POST /api/auth/signature (토큰 + signature_data)
2. GET /api/auth/me
3. has_signature: true 확인

### 시나리오 3: 로그인 리셋
1. POST /api/auth/reset-login (조해창, 4511)
2. 기존 토큰으로 GET /api/auth/me → 401 Unauthorized
3. 다시 로그인 (시나리오 1 반복)

---

## ⚠️ 중요 주의사항

### Git 관리
- ✅ `backend-dev` 브랜치에서만 작업
- ❌ **절대로 GitHub에 푸시하지 마세요**
- ✅ `.env` 파일은 `.gitignore`에 추가
- ✅ 로컬 커밋은 가능

### 환경 변수
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/moducon_dev"
JWT_SECRET="moducon-dev-secret-key-2025"
JWT_EXPIRES_IN="24h"
CORS_ORIGIN="http://localhost:3000"
PORT=3001
```

**⚠️ 중요**: PostgreSQL 비밀번호를 실제 로컬 설정에 맞게 변경하세요.

### PostgreSQL 사전 준비
```bash
# PostgreSQL이 실행 중인지 확인
psql -U postgres -c "SELECT version();"

# 실행되지 않으면 시작
# macOS (Homebrew)
brew services start postgresql

# Linux (systemd)
sudo systemctl start postgresql
```

---

## 📋 완료 체크리스트

구현 완료 후 다음을 확인하세요:

### 코드 구현
- [ ] Git 브랜치 `backend-dev` 생성
- [ ] Node.js 프로젝트 초기화
- [ ] 필수 패키지 설치 (express, prisma, jwt 등)
- [ ] TypeScript 설정
- [ ] Prisma 스키마 작성
- [ ] PostgreSQL 데이터베이스 생성
- [ ] 마이그레이션 실행
- [ ] 시드 데이터 생성 (조해창, 4511)
- [ ] 서버 코드 구현 (src/index.ts 등)
- [ ] 4개 API 엔드포인트 구현

### 테스트
- [ ] 서버 실행 성공 (npm run dev)
- [ ] POST /api/auth/login 동작 확인
- [ ] GET /api/auth/me 동작 확인
- [ ] POST /api/auth/signature 동작 확인
- [ ] POST /api/auth/reset-login 동작 확인
- [ ] CORS 설정 확인 (프론트엔드 연동 가능)

### Git 관리
- [ ] moducon-backend/ 디렉토리 커밋
- [ ] .env 파일이 .gitignore에 추가됨
- [ ] 커밋 메시지 작성
- [ ] **GitHub에 푸시하지 않음 확인**

---

## 🚀 다음 단계 (구현 완료 후)

### 프론트엔드 연동
1. 프론트엔드 `.env.local` 파일 확인
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

2. 프론트엔드 실행
   ```bash
   cd moducon-frontend
   npm run dev
   ```

3. 로그인 페이지에서 테스트
   - 이름: 조해창
   - 전화번호 뒤 4자리: 4511
   - 로그인 성공 확인

### 로그인 리셋 테스트
```bash
# 1. 로그인 리셋 API 호출
curl -X POST http://localhost:3001/api/auth/reset-login \
  -H "Content-Type: application/json" \
  -d '{"name": "조해창", "phone_last4": "4511"}'

# 2. 프론트엔드에서 다시 로그인 시도
# 3. 서명 화면 다시 표시됨 확인
```

---

## 💡 팁

### 개발 효율성
- `npm run dev` 사용 시 코드 변경 시 자동 재시작
- Prisma Studio로 DB 확인: `npm run db:studio`
- DB 초기화 및 재시드: `npm run db:reset`

### 디버깅
- 환경 변수 `LOG_LEVEL=debug`로 설정
- 서버 콘솔에서 상세 로그 확인
- Postman Collection 저장 (반복 테스트용)

### 성능
- 개발 단계에서는 성능 최적화 불필요
- 로컬 테스트이므로 빠른 응답 속도 보장

---

## 📞 문제 발생 시

### PostgreSQL 연결 실패
1. PostgreSQL 실행 확인
2. DATABASE_URL의 비밀번호 확인
3. 데이터베이스 `moducon_dev` 존재 확인

### Prisma 마이그레이션 실패
1. `npx prisma migrate reset --force`
2. `npx prisma migrate dev --name init`

### 서버 실행 오류
1. `rm -rf node_modules package-lock.json`
2. `npm install`
3. `npx tsc --noEmit` (타입 체크)

### CORS 에러
1. `.env` 파일의 `CORS_ORIGIN` 확인
2. 프론트엔드 URL과 일치하는지 확인

---

## 📄 작업 완료 후

### 문서 작성
다음 문서를 작성해주세요:
- `44_BACKEND_IMPLEMENTATION_LOG.md` - 구현 로그
  - 각 단계별 작업 내용
  - 발생한 문제 및 해결 방법
  - 테스트 결과
  - 스크린샷 (선택)

### 다음 담당자
- **reviewer**: 백엔드 코드 리뷰 및 검증
  - API 테스트 검증
  - 코드 품질 확인
  - 프론트엔드 연동 테스트

---

## 🎯 성공 기준

다음 조건이 모두 충족되면 작업 완료입니다:

1. ✅ 백엔드 서버가 http://localhost:3001에서 실행됨
2. ✅ 테스트 사용자 (조해창, 4511)로 로그인 가능
3. ✅ JWT 토큰 발급 및 인증 동작
4. ✅ 서명 저장 기능 동작
5. ✅ 로그인 리셋 기능 동작
6. ✅ 프론트엔드에서 로그인 테스트 성공
7. ✅ Git 커밋 완료 (GitHub 푸시 안 함)

---

**작성자**: planner (Technical Lead)
**작성일**: 2025-01-14
**다음 담당자**: hands-on worker
**예상 소요 시간**: 2시간 20분

**필독 문서**: `42_BACKEND_IMPLEMENTATION_GUIDE.md`
