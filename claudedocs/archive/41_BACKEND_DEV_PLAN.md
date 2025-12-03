# 41_BACKEND_DEV_PLAN.md - 백엔드 개발 계획서

## 📋 문서 정보
- **프로젝트명**: 모두콘 2025 디지털 컨퍼런스 북 - Backend API
- **문서 버전**: 1.0
- **작성일**: 2025-01-14
- **작성자**: Technical Lead
- **상태**: Planning

---

## 🎯 개발 목표

### 주요 목표
1. **로컬 PostgreSQL 기반 백엔드 구축**
2. **테스트 사용자 계정 등록** (조해창, 4511)
3. **로그인 기능 동작 테스트 가능**
4. **로그인 리셋 기능 제공** (반복 테스트용)

### 개발 제약사항
- 백엔드는 별도 Git 브랜치로 관리
- **GitHub에 푸시하지 않음** (로컬 개발 전용)
- 프론트엔드와 독립적으로 개발 및 테스트

---

## 🏗️ 기술 스택

### Backend Framework
- **Node.js** 20.x LTS
- **Express.js** 4.x
- **TypeScript** 5.x

### Database
- **PostgreSQL** 14+ (로컬)
- **Prisma ORM** 5.x
  - 타입 안전성
  - 자동 마이그레이션
  - 우수한 TypeScript 지원

### 인증
- **jsonwebtoken** (JWT)
- **bcrypt** (패스워드 해싱 - 향후 확장용)

### 개발 도구
- **tsx**: TypeScript 실행
- **nodemon**: 개발 서버 자동 재시작
- **dotenv**: 환경 변수 관리

---

## 📁 디렉토리 구조

```
moducon-backend/          # 백엔드 루트 디렉토리
├── src/
│   ├── index.ts          # 서버 진입점
│   ├── config/
│   │   ├── database.ts   # DB 연결 설정
│   │   └── jwt.ts        # JWT 설정
│   ├── routes/
│   │   ├── auth.ts       # 인증 라우트
│   │   └── index.ts      # 라우트 통합
│   ├── controllers/
│   │   └── authController.ts  # 인증 컨트롤러
│   ├── middleware/
│   │   ├── auth.ts       # JWT 인증 미들웨어
│   │   └── errorHandler.ts  # 에러 핸들러
│   ├── services/
│   │   └── authService.ts    # 인증 비즈니스 로직
│   └── utils/
│       ├── logger.ts     # 로깅 유틸
│       └── response.ts   # 응답 포맷 유틸
├── prisma/
│   ├── schema.prisma     # Prisma 스키마
│   ├── migrations/       # DB 마이그레이션
│   └── seed.ts           # 시드 데이터 (테스트 사용자)
├── tests/                # 테스트 코드
│   └── auth.test.ts
├── .env                  # 환경 변수 (Git 무시)
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🗄️ 데이터베이스 설계

### 초기 구현 테이블 (MVP)

#### 1. users 테이블
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  phone_last4 VARCHAR(4) NOT NULL,
  email VARCHAR(255),
  organization VARCHAR(255),
  signature_url TEXT,
  registration_type VARCHAR(20) DEFAULT 'pre_registered',
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,

  CONSTRAINT unique_user UNIQUE(name, phone_last4)
);
```

#### 2. auth_sessions 테이블 (로그인 세션 추적)
```sql
CREATE TABLE auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_revoked BOOLEAN DEFAULT FALSE,

  CONSTRAINT idx_auth_token UNIQUE(token)
);
```

#### 3. signatures 테이블 (서명 관리)
```sql
CREATE TABLE signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  signature_data TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_user_signature UNIQUE(user_id)
);
```

### 초기 시드 데이터

#### 테스트 사용자
```sql
INSERT INTO users (name, phone_last4, registration_type)
VALUES ('조해창', '4511', 'pre_registered');
```

---

## 🔐 API 명세 (Phase 1 - MVP)

### 1. POST /api/auth/login
**목적**: 이름 + 전화번호 뒤 4자리로 로그인

**Request**:
```json
{
  "name": "조해창",
  "phone_last4": "4511"
}
```

**Response** (성공):
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
  },
  "message": "Login successful"
}
```

**Response** (실패):
```json
{
  "success": false,
  "error": {
    "code": "AUTH_USER_NOT_FOUND",
    "message": "사용자 정보를 찾을 수 없습니다."
  }
}
```

---

### 2. POST /api/auth/signature
**목적**: 디지털 서명 저장

**Headers**:
```
Authorization: Bearer <token>
```

**Request**:
```json
{
  "signature_data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**Response** (성공):
```json
{
  "success": true,
  "data": {
    "signature_url": "/signatures/uuid-123.png",
    "user": {
      "id": "uuid-123",
      "has_signature": true
    }
  },
  "message": "Signature saved"
}
```

---

### 3. GET /api/auth/me
**목적**: 현재 로그인한 사용자 정보 조회

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (성공):
```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "name": "조해창",
    "phone_last4": "4511",
    "email": null,
    "organization": null,
    "has_signature": false,
    "registration_type": "pre_registered",
    "registered_at": "2025-01-14T10:00:00Z"
  }
}
```

---

### 4. POST /api/auth/reset-login (테스트 전용)
**목적**: 로그인 기록 초기화 (반복 테스트용)

**Request**:
```json
{
  "name": "조해창",
  "phone_last4": "4511"
}
```

**Response** (성공):
```json
{
  "success": true,
  "message": "Login session reset successfully"
}
```

**구현 로직**:
1. 해당 사용자의 모든 auth_sessions을 is_revoked = true로 변경
2. signatures 테이블에서 서명 데이터 삭제 (선택)
3. users 테이블의 last_login을 NULL로 변경

---

## 🔧 환경 변수 설정

### .env 파일
```env
# 서버 설정
PORT=3001
NODE_ENV=development

# 데이터베이스
DATABASE_URL="postgresql://postgres:password@localhost:5432/moducon_dev?schema=public"

# JWT 설정
JWT_SECRET="moducon-dev-secret-key-change-in-production"
JWT_EXPIRES_IN="24h"

# CORS 설정
CORS_ORIGIN="http://localhost:3000"

# 로그 레벨
LOG_LEVEL="debug"
```

---

## 📝 Prisma 스키마

### prisma/schema.prisma
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                String    @id @default(uuid()) @db.Uuid
  name              String    @db.VarChar(100)
  phoneLast4        String    @map("phone_last4") @db.VarChar(4)
  email             String?   @db.VarChar(255)
  organization      String?   @db.VarChar(255)
  signatureUrl      String?   @map("signature_url") @db.Text
  registrationType  String    @default("pre_registered") @map("registration_type") @db.VarChar(20)
  registeredAt      DateTime  @default(now()) @map("registered_at") @db.Timestamptz
  lastLogin         DateTime? @map("last_login") @db.Timestamptz
  isActive          Boolean   @default(true) @map("is_active")

  authSessions      AuthSession[]
  signatures        Signature[]

  @@unique([name, phoneLast4], name: "unique_user")
  @@index([name, phoneLast4], name: "idx_users_name_phone")
  @@map("users")
}

model AuthSession {
  id        String    @id @default(uuid()) @db.Uuid
  userId    String    @map("user_id") @db.Uuid
  token     String    @unique @db.Text
  createdAt DateTime  @default(now()) @map("created_at") @db.Timestamptz
  expiresAt DateTime  @map("expires_at") @db.Timestamptz
  isRevoked Boolean   @default(false) @map("is_revoked")

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([token], name: "idx_auth_token")
  @@map("auth_sessions")
}

model Signature {
  id            String   @id @default(uuid()) @db.Uuid
  userId        String   @unique @map("user_id") @db.Uuid
  signatureData String   @map("signature_data") @db.Text
  createdAt     DateTime @default(now()) @map("created_at") @db.Timestamptz

  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("signatures")
}
```

---

## 🚀 개발 단계

### Phase 1: 프로젝트 초기화 (30분)
1. **Git 브랜치 생성**
   ```bash
   git checkout -b backend-dev
   ```

2. **백엔드 디렉토리 생성**
   ```bash
   mkdir moducon-backend
   cd moducon-backend
   ```

3. **Node.js 프로젝트 초기화**
   ```bash
   npm init -y
   npm install express cors dotenv jsonwebtoken
   npm install -D typescript @types/node @types/express @types/cors @types/jsonwebtoken
   npm install -D tsx nodemon
   npm install @prisma/client
   npm install -D prisma
   ```

4. **Prisma 초기화**
   ```bash
   npx prisma init
   ```

---

### Phase 2: 데이터베이스 설정 (20분)
1. **PostgreSQL 확인**
   ```bash
   psql -U postgres -c "SELECT version();"
   ```

2. **데이터베이스 생성**
   ```sql
   CREATE DATABASE moducon_dev;
   ```

3. **Prisma 스키마 작성**
   - `prisma/schema.prisma` 작성

4. **마이그레이션 실행**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **시드 데이터 생성**
   - `prisma/seed.ts` 작성
   ```bash
   npx prisma db seed
   ```

---

### Phase 3: 서버 구현 (1시간)
1. **기본 서버 설정**
   - `src/index.ts` - Express 서버 진입점
   - CORS 설정
   - JSON 바디 파서

2. **인증 라우트 구현**
   - `POST /api/auth/login`
   - `POST /api/auth/signature`
   - `GET /api/auth/me`
   - `POST /api/auth/reset-login`

3. **JWT 미들웨어 구현**
   - 토큰 검증
   - 사용자 인증

4. **에러 핸들링**
   - 공통 에러 응답 포맷
   - 에러 로깅

---

### Phase 4: 테스트 (30분)
1. **API 테스트** (Postman 또는 curl)
   - 로그인 테스트
   - 서명 저장 테스트
   - 사용자 정보 조회 테스트
   - 로그인 리셋 테스트

2. **프론트엔드 연동 테스트**
   - CORS 확인
   - API 응답 포맷 확인
   - JWT 토큰 처리 확인

---

## 🧪 테스트 시나리오

### 시나리오 1: 초기 로그인
1. POST /api/auth/login
   - name: "조해창"
   - phone_last4: "4511"
2. 응답으로 token 받기
3. GET /api/auth/me (with token)
4. 사용자 정보 확인 (has_signature: false)

### 시나리오 2: 서명 저장
1. POST /api/auth/signature (with token)
   - signature_data: "data:image/png;base64,..."
2. 응답 확인 (signature_url)
3. GET /api/auth/me (with token)
4. 사용자 정보 확인 (has_signature: true)

### 시나리오 3: 로그인 리셋
1. POST /api/auth/reset-login
   - name: "조해창"
   - phone_last4: "4511"
2. 기존 토큰으로 GET /api/auth/me 시도
3. 401 Unauthorized 응답 확인
4. 다시 로그인 시도 (시나리오 1 반복)

---

## 📊 예상 작업 시간

| 단계 | 작업 내용 | 예상 시간 |
|-----|----------|---------|
| Phase 1 | 프로젝트 초기화 | 30분 |
| Phase 2 | 데이터베이스 설정 | 20분 |
| Phase 3 | 서버 구현 | 1시간 |
| Phase 4 | 테스트 | 30분 |
| **총계** | | **2시간 20분** |

---

## 🔄 다음 단계 (향후 확장)

### Phase 5: 세션 API (추후)
- GET /api/sessions
- GET /api/sessions/:id
- POST /api/sessions/:id/checkin

### Phase 6: 부스 API (추후)
- GET /api/booths
- GET /api/booths/:id
- POST /api/booths/:id/visit

### Phase 7: 배포 (추후)
- Docker 컨테이너화
- PostgreSQL 프로덕션 설정
- 환경 변수 관리
- SSL/TLS 설정

---

## ⚠️ 주의사항

### Git 관리
- ✅ 백엔드는 `backend-dev` 브랜치에서만 작업
- ❌ **절대로 GitHub에 푸시하지 않음**
- ✅ `.env` 파일은 `.gitignore`에 추가
- ✅ 로컬에서만 테스트

### 보안
- JWT_SECRET은 개발용 임시 값 사용
- 프로덕션 환경에서는 강력한 시크릿 키 필요
- 패스워드 기능 추가 시 bcrypt 사용

### 데이터베이스
- 로컬 PostgreSQL만 사용
- 마이그레이션 파일은 Git에 포함 가능
- 시드 데이터는 테스트 사용자만 포함

---

## 📚 참고 자료

### 공식 문서
- [Prisma Docs](https://www.prisma.io/docs)
- [Express.js](https://expressjs.com/)
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)

### 관련 프로젝트 문서
- `01_PRD.md` - 제품 요구사항
- `05_API_SPEC.md` - API 명세서
- `06_DB_DESIGN.md` - 데이터베이스 설계서

---

**작성자**: Technical Lead
**작성일**: 2025-01-14
**다음 담당자**: hands-on worker
