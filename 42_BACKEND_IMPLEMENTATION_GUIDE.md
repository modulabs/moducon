# 42_BACKEND_IMPLEMENTATION_GUIDE.md - 백엔드 구현 가이드

## 📋 문서 정보
- **작성자**: Technical Lead
- **작성일**: 2025-01-14
- **대상**: hands-on worker
- **소요 시간**: 약 2시간 20분

---

## 🎯 구현 목표

이 가이드를 따라 다음을 구현합니다:
1. ✅ PostgreSQL 기반 백엔드 API 서버
2. ✅ 테스트 사용자 (조해창, 4511) 로그인 가능
3. ✅ 디지털 서명 저장 기능
4. ✅ 로그인 리셋 기능 (반복 테스트용)

---

## 📂 Step 1: Git 브랜치 생성 및 초기화 (5분)

### 1.1 새 브랜치 생성
```bash
cd /Users/hchang/Myspace/Modulabs/moducon
git checkout -b backend-dev
```

### 1.2 백엔드 디렉토리 생성
```bash
mkdir moducon-backend
cd moducon-backend
```

### 1.3 Node.js 프로젝트 초기화
```bash
npm init -y
```

### 1.4 package.json 수정
```json
{
  "name": "moducon-backend",
  "version": "1.0.0",
  "description": "Moducon 2025 Backend API Server",
  "main": "src/index.ts",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset --force && npm run db:seed"
  },
  "keywords": ["moducon", "backend", "api"],
  "author": "Moducon 2025",
  "license": "MIT"
}
```

---

## 📦 Step 2: 패키지 설치 (10분)

### 2.1 프로덕션 의존성
```bash
npm install express cors dotenv jsonwebtoken
npm install @prisma/client
```

### 2.2 개발 의존성
```bash
npm install -D typescript @types/node @types/express @types/cors @types/jsonwebtoken
npm install -D tsx nodemon
npm install -D prisma
```

### 2.3 TypeScript 설정
`tsconfig.json` 생성:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 🗄️ Step 3: Prisma 설정 (15분)

### 3.1 Prisma 초기화
```bash
npx prisma init
```

### 3.2 .env 파일 작성
`.env` 파일 생성:
```env
# 서버 설정
PORT=3001
NODE_ENV=development

# 데이터베이스
DATABASE_URL="postgresql://postgres:password@localhost:5432/moducon_dev?schema=public"

# JWT 설정
JWT_SECRET="moducon-dev-secret-key-2025"
JWT_EXPIRES_IN="24h"

# CORS 설정
CORS_ORIGIN="http://localhost:3000"

# 로그 레벨
LOG_LEVEL="debug"
```

**⚠️ 중요**: PostgreSQL 비밀번호를 실제 로컬 설정에 맞게 변경하세요.

### 3.3 Prisma 스키마 작성
`prisma/schema.prisma` 파일 생성:
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

### 3.4 데이터베이스 생성 및 마이그레이션
```bash
# PostgreSQL 데이터베이스 생성
psql -U postgres -c "CREATE DATABASE moducon_dev;"

# Prisma 마이그레이션 실행
npx prisma migrate dev --name init

# Prisma Client 생성
npx prisma generate
```

### 3.5 시드 데이터 작성
`prisma/seed.ts` 파일 생성:
```typescript
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
```

### 3.6 시드 실행
```bash
npm run db:seed
```

---

## 🛠️ Step 4: 유틸리티 및 미들웨어 구현 (20분)

### 4.1 응답 포맷 유틸 (`src/utils/response.ts`)
```typescript
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  message?: string;
}

export const successResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
  success: true,
  data,
  message,
});

export const errorResponse = (
  code: string,
  message: string,
  details?: any
): ApiResponse => ({
  success: false,
  error: {
    code,
    message,
    details,
  },
});
```

### 4.2 로거 유틸 (`src/utils/logger.ts`)
```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const logLevels: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLogLevel = (process.env.LOG_LEVEL || 'info') as LogLevel;

const shouldLog = (level: LogLevel): boolean => {
  return logLevels[level] >= logLevels[currentLogLevel];
};

export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (shouldLog('debug')) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },
  info: (message: string, ...args: any[]) => {
    if (shouldLog('info')) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: any[]) => {
    if (shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  error: (message: string, error?: any) => {
    if (shouldLog('error')) {
      console.error(`[ERROR] ${message}`, error);
    }
  },
};
```

### 4.3 JWT 설정 (`src/config/jwt.ts`)
```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'moducon-dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export interface JwtPayload {
  userId: string;
  name: string;
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

export const getTokenExpiry = (): Date => {
  const expiresIn = JWT_EXPIRES_IN;
  const hours = parseInt(expiresIn.replace('h', ''));
  return new Date(Date.now() + hours * 60 * 60 * 1000);
};
```

### 4.4 인증 미들웨어 (`src/middleware/auth.ts`)
```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';
import { errorResponse } from '../utils/response';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    name: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(
        errorResponse('AUTH_TOKEN_MISSING', 'No authentication token provided')
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    req.user = {
      userId: decoded.userId,
      name: decoded.name,
    };

    logger.debug(`User authenticated: ${decoded.name} (${decoded.userId})`);
    next();
  } catch (error) {
    logger.error('Authentication failed:', error);
    return res.status(401).json(
      errorResponse('AUTH_TOKEN_INVALID', 'Invalid or expired token')
    );
  }
};
```

### 4.5 에러 핸들러 (`src/middleware/errorHandler.ts`)
```typescript
import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Unhandled error:', err);

  res.status(500).json(
    errorResponse(
      'INTERNAL_SERVER_ERROR',
      'An unexpected error occurred',
      process.env.NODE_ENV === 'development' ? err.message : undefined
    )
  );
};
```

---

## 🔐 Step 5: 인증 서비스 구현 (30분)

### 5.1 인증 서비스 (`src/services/authService.ts`)
```typescript
import { PrismaClient } from '@prisma/client';
import { generateToken, getTokenExpiry } from '../config/jwt';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface LoginInput {
  name: string;
  phone_last4: string;
}

export interface LoginResult {
  token: string;
  user: {
    id: string;
    name: string;
    phone_last4: string;
    registration_type: string;
    has_signature: boolean;
  };
}

export const login = async (input: LoginInput): Promise<LoginResult | null> => {
  // 사용자 검색
  const user = await prisma.user.findUnique({
    where: {
      unique_user: {
        name: input.name,
        phoneLast4: input.phone_last4,
      },
    },
    include: {
      signatures: true,
    },
  });

  if (!user) {
    logger.warn(`Login failed: User not found (${input.name}, ${input.phone_last4})`);
    return null;
  }

  // JWT 토큰 생성
  const token = generateToken({
    userId: user.id,
    name: user.name,
  });

  // 세션 저장
  await prisma.authSession.create({
    data: {
      userId: user.id,
      token,
      expiresAt: getTokenExpiry(),
    },
  });

  // 마지막 로그인 시간 업데이트
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  logger.info(`User logged in: ${user.name} (${user.id})`);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      phone_last4: user.phoneLast4,
      registration_type: user.registrationType,
      has_signature: user.signatures.length > 0,
    },
  };
};

export interface SaveSignatureInput {
  userId: string;
  signatureData: string;
}

export const saveSignature = async (input: SaveSignatureInput) => {
  // 기존 서명 삭제 (있다면)
  await prisma.signature.deleteMany({
    where: { userId: input.userId },
  });

  // 새 서명 저장
  const signature = await prisma.signature.create({
    data: {
      userId: input.userId,
      signatureData: input.signatureData,
    },
  });

  logger.info(`Signature saved for user: ${input.userId}`);

  return {
    signature_url: `/signatures/${input.userId}.png`,
    user: {
      id: input.userId,
      has_signature: true,
    },
  };
};

export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      signatures: true,
    },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    phone_last4: user.phoneLast4,
    email: user.email,
    organization: user.organization,
    has_signature: user.signatures.length > 0,
    registration_type: user.registrationType,
    registered_at: user.registeredAt.toISOString(),
  };
};

export const resetLogin = async (input: LoginInput) => {
  // 사용자 검색
  const user = await prisma.user.findUnique({
    where: {
      unique_user: {
        name: input.name,
        phoneLast4: input.phone_last4,
      },
    },
  });

  if (!user) {
    return false;
  }

  // 모든 세션 무효화
  await prisma.authSession.updateMany({
    where: { userId: user.id },
    data: { isRevoked: true },
  });

  // 서명 삭제
  await prisma.signature.deleteMany({
    where: { userId: user.id },
  });

  // 마지막 로그인 초기화
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: null },
  });

  logger.info(`Login reset for user: ${user.name} (${user.id})`);

  return true;
};
```

---

## 🌐 Step 6: 라우트 및 컨트롤러 구현 (30분)

### 6.1 인증 컨트롤러 (`src/controllers/authController.ts`)
```typescript
import { Request, Response } from 'express';
import * as authService from '../services/authService';
import { successResponse, errorResponse } from '../utils/response';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

export const login = async (req: Request, res: Response) => {
  try {
    const { name, phone_last4 } = req.body;

    // 입력 검증
    if (!name || !phone_last4) {
      return res.status(400).json(
        errorResponse('INVALID_INPUT', 'Name and phone_last4 are required')
      );
    }

    if (phone_last4.length !== 4 || !/^\d{4}$/.test(phone_last4)) {
      return res.status(400).json(
        errorResponse('INVALID_PHONE', 'phone_last4 must be exactly 4 digits')
      );
    }

    // 로그인 시도
    const result = await authService.login({ name, phone_last4 });

    if (!result) {
      return res.status(401).json(
        errorResponse(
          'AUTH_USER_NOT_FOUND',
          '사용자 정보를 찾을 수 없습니다.'
        )
      );
    }

    res.json(successResponse(result, 'Login successful'));
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json(
      errorResponse('LOGIN_FAILED', 'Login failed due to server error')
    );
  }
};

export const saveSignature = async (req: AuthRequest, res: Response) => {
  try {
    const { signature_data } = req.body;
    const userId = req.user!.userId;

    // 입력 검증
    if (!signature_data) {
      return res.status(400).json(
        errorResponse('INVALID_INPUT', 'signature_data is required')
      );
    }

    // Base64 이미지 검증
    if (!signature_data.startsWith('data:image/')) {
      return res.status(400).json(
        errorResponse('INVALID_SIGNATURE', 'signature_data must be a valid base64 image')
      );
    }

    // 서명 저장
    const result = await authService.saveSignature({
      userId,
      signatureData: signature_data,
    });

    res.json(successResponse(result, 'Signature saved'));
  } catch (error) {
    logger.error('Save signature error:', error);
    res.status(500).json(
      errorResponse('SIGNATURE_SAVE_FAILED', 'Failed to save signature')
    );
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const user = await authService.getUserById(userId);

    if (!user) {
      return res.status(404).json(
        errorResponse('USER_NOT_FOUND', 'User not found')
      );
    }

    res.json(successResponse(user));
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json(
      errorResponse('GET_USER_FAILED', 'Failed to get user information')
    );
  }
};

export const resetLogin = async (req: Request, res: Response) => {
  try {
    const { name, phone_last4 } = req.body;

    // 입력 검증
    if (!name || !phone_last4) {
      return res.status(400).json(
        errorResponse('INVALID_INPUT', 'Name and phone_last4 are required')
      );
    }

    const success = await authService.resetLogin({ name, phone_last4 });

    if (!success) {
      return res.status(404).json(
        errorResponse('USER_NOT_FOUND', 'User not found')
      );
    }

    res.json(successResponse(null, 'Login session reset successfully'));
  } catch (error) {
    logger.error('Reset login error:', error);
    res.status(500).json(
      errorResponse('RESET_FAILED', 'Failed to reset login session')
    );
  }
};
```

### 6.2 인증 라우트 (`src/routes/auth.ts`)
```typescript
import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// 공개 엔드포인트
router.post('/login', authController.login);
router.post('/reset-login', authController.resetLogin);

// 인증 필요 엔드포인트
router.post('/signature', authenticate, authController.saveSignature);
router.get('/me', authenticate, authController.getMe);

export default router;
```

### 6.3 라우트 통합 (`src/routes/index.ts`)
```typescript
import { Router } from 'express';
import authRoutes from './auth';

const router = Router();

router.use('/auth', authRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

export default router;
```

---

## 🚀 Step 7: 서버 진입점 구현 (10분)

### 7.1 서버 메인 파일 (`src/index.ts`)
```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// 미들웨어
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 요청 로깅
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

// 라우트
app.use('/api', routes);

// 에러 핸들러
app.use(errorHandler);

// 서버 시작
app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🌐 CORS origin: ${CORS_ORIGIN}`);
});
```

---

## ✅ Step 8: 테스트 (30분)

### 8.1 서버 실행
```bash
npm run dev
```

### 8.2 API 테스트 (curl 또는 Postman)

#### 테스트 1: 로그인
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name": "조해창", "phone_last4": "4511"}'
```

**예상 응답**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "name": "조해창",
      "phone_last4": "4511",
      "registration_type": "pre_registered",
      "has_signature": false
    }
  },
  "message": "Login successful"
}
```

#### 테스트 2: 사용자 정보 조회
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

#### 테스트 3: 서명 저장
```bash
curl -X POST http://localhost:3001/api/auth/signature \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"signature_data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="}'
```

#### 테스트 4: 로그인 리셋
```bash
curl -X POST http://localhost:3001/api/auth/reset-login \
  -H "Content-Type: application/json" \
  -d '{"name": "조해창", "phone_last4": "4511"}'
```

---

## 📊 Step 9: Git 커밋 (5분)

```bash
# 백엔드 파일 스테이징
git add moducon-backend/

# 커밋
git commit -m "feat: 백엔드 초기 구현 완료

- Express + TypeScript + Prisma 서버 구축
- PostgreSQL 데이터베이스 설정 (users, auth_sessions, signatures)
- 인증 API 구현 (login, signature, me, reset-login)
- 테스트 사용자 등록 (조해창, 4511)
- JWT 인증 미들웨어 구현

테스트 완료:
- ✅ 로그인 기능 동작
- ✅ 서명 저장 기능 동작
- ✅ 사용자 정보 조회 동작
- ✅ 로그인 리셋 기능 동작

⚠️ 주의: 이 브랜치는 로컬 개발 전용이며 GitHub에 푸시하지 않음"
```

---

## 🎯 완료 체크리스트

- [ ] Git 브랜치 `backend-dev` 생성
- [ ] Node.js 프로젝트 초기화
- [ ] 패키지 설치 (express, prisma, jwt 등)
- [ ] TypeScript 설정
- [ ] Prisma 스키마 작성
- [ ] PostgreSQL 데이터베이스 생성
- [ ] 마이그레이션 실행
- [ ] 시드 데이터 실행 (테스트 사용자)
- [ ] 유틸리티 구현 (logger, response)
- [ ] JWT 설정 및 인증 미들웨어
- [ ] 인증 서비스 구현
- [ ] 인증 컨트롤러 구현
- [ ] 라우트 설정
- [ ] 서버 진입점 구현
- [ ] 서버 실행 확인
- [ ] API 테스트 (4개 엔드포인트)
- [ ] Git 커밋

---

## 🔧 문제 해결

### PostgreSQL 연결 실패
```bash
# PostgreSQL 실행 확인
psql -U postgres

# 데이터베이스 목록 확인
\l

# 연결 테스트
psql -U postgres -d moducon_dev -c "SELECT 1;"
```

### Prisma 마이그레이션 실패
```bash
# Prisma 초기화
npx prisma migrate reset --force

# 재시도
npx prisma migrate dev --name init
```

### 서버 실행 오류
```bash
# 패키지 재설치
rm -rf node_modules package-lock.json
npm install

# TypeScript 컴파일 확인
npx tsc --noEmit
```

---

## 📚 다음 단계

백엔드 구현 완료 후:
1. **프론트엔드 연동 테스트**
   - 프론트엔드에서 로그인 시도
   - CORS 설정 확인
   - API 응답 포맷 검증

2. **추가 기능 구현** (향후)
   - 세션 API (GET /api/sessions)
   - 부스 API (GET /api/booths)
   - WebSocket 실시간 기능

3. **배포 준비** (향후)
   - Docker 컨테이너화
   - 환경 변수 관리
   - 프로덕션 PostgreSQL 설정

---

**작성자**: Technical Lead
**다음 담당자**: hands-on worker
**예상 소요 시간**: 2시간 20분
