# 배포 가이드

## 📅 최종 업데이트
**날짜**: 2025-12-02
**작성자**: Technical Lead

---

## 🌐 환경 정보

| 환경 | Frontend URL | Backend URL |
|------|-------------|-------------|
| Production | https://moducon.vibemakers.kr | https://backend.vibemakers.kr |
| Development | http://localhost:3000 | http://localhost:3001 |

---

## 📋 사전 요구사항

### 시스템 요구사항
- Node.js 20.x 이상
- npm 10.x 이상
- PostgreSQL 15.x 이상
- Git

### 환경 변수

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://backend.vibemakers.kr
```

#### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@host:5432/moducon
JWT_SECRET=your-super-secret-jwt-key
PORT=3001
CORS_ORIGIN=https://moducon.vibemakers.kr
NODE_ENV=production
GOOGLE_SHEETS_API_KEY=your_api_key_here
SPREADSHEET_ID=1djkPQzg_1-_zgbWe8e5AYZlUjVoQYmJj2HlwRsCqu9g
```

---

## 🛠️ 로컬 개발 환경 설정

### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd moducon_dev
```

### 2. Frontend 설정
```bash
cd moducon-frontend
npm install
cp .env.example .env.local
# .env.local 파일 수정
npm run dev
```

### 3. Backend 설정
```bash
cd moducon-backend
npm install
cp .env.example .env
# .env 파일 수정
npx prisma generate
npx prisma db push
npm run dev
```

---

## 🏗️ 프로덕션 빌드

### Frontend 빌드
```bash
cd moducon-frontend
npm run build
npm start
```

**빌드 결과**:
- 빌드 시간: ~8.7초
- 정적 페이지: 55개
- TypeScript: 컴파일 성공
- ESLint: 0 errors

### Backend 빌드
```bash
cd moducon-backend
npm run build
npm start
```

---

## 🐳 Docker 배포 (선택)

### Frontend Dockerfile
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

### Backend Dockerfile
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  frontend:
    build:
      context: ./moducon-frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3001
    depends_on:
      - backend

  backend:
    build:
      context: ./moducon-backend
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - CORS_ORIGIN=${CORS_ORIGIN}
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=moducon
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=moducon
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

---

## 🌍 CORS 설정 확인

### Backend CORS 설정 위치
파일: `/moducon-backend/src/index.ts`

```typescript
const allowedOrigins = [
  'http://localhost:3000',
  'https://moducon.vibemakers.kr',
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : []),
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
```

---

## 🗄️ 데이터베이스 마이그레이션

### 개발 환경
```bash
# 스키마 변경 적용 (개발용)
npx prisma db push

# 마이그레이션 생성 (버전 관리)
npx prisma migrate dev --name <migration-name>

# Prisma Client 재생성
npx prisma generate
```

### 프로덕션 환경
```bash
# 프로덕션 마이그레이션 적용
npx prisma migrate deploy
```

### Phase 3 마이그레이션 (예정)
```bash
cd moducon-backend
npx prisma migrate dev --name add-checkin-quiz
npx prisma generate
```

---

## 🚀 GitHub Actions (자동 배포)

### Frontend 배포 워크플로우
파일: `.github/workflows/deploy-frontend.yml`

```yaml
name: Deploy Frontend to Vercel
on:
  push:
    branches: [main]
    paths:
      - 'moducon-frontend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: cd moducon-frontend && npm ci
      - name: Build
        run: cd moducon-frontend && npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./moducon-frontend
```

### Backend 배포 워크플로우
파일: `.github/workflows/deploy-backend.yml`

```yaml
name: Deploy Backend to Railway
on:
  push:
    branches: [main]
    paths:
      - 'moducon-backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@main
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
          service: moducon-backend
```

---

## ✅ 헬스 체크

### Frontend 헬스 체크
```bash
curl https://moducon.vibemakers.kr
# 응답: HTML 페이지 (200 OK)
```

### Backend 헬스 체크
```bash
curl https://backend.vibemakers.kr/api/health
# 응답: {"status":"ok","timestamp":"..."}
```

### API 테스트
```bash
# 세션 목록 조회
curl https://backend.vibemakers.kr/api/sessions

# 부스 목록 조회
curl https://backend.vibemakers.kr/api/booths

# 포스터 목록 조회
curl https://backend.vibemakers.kr/api/papers
```

---

## 📋 배포 체크리스트

### 배포 전
- [ ] 환경 변수 설정 확인 (`.env` 파일)
- [ ] 데이터베이스 연결 테스트
- [ ] CORS 설정 확인 (도메인 허용)
- [ ] SSL 인증서 유효성 확인
- [ ] 빌드 성공 확인 (`npm run build`)
- [ ] 로컬 테스트 통과

### 배포 후
- [ ] 헬스 체크 통과
- [ ] 로그인 기능 테스트
- [ ] API 응답 확인
- [ ] 프론트엔드 렌더링 확인
- [ ] Google Sheets 연동 확인
- [ ] 모바일 반응형 확인

---

## 🔄 롤백 절차

### Git 기반 롤백
```bash
# 이전 버전 태그 확인
git tag -l

# 이전 버전으로 롤백
git checkout <previous-tag>
npm run build
npm start

# 또는 revert
git revert HEAD
git push origin main
```

### 데이터베이스 롤백
```bash
# 마이그레이션 상태 확인
npx prisma migrate status

# 마이그레이션 롤백 (수동)
# 이전 마이그레이션 SQL 실행
```

---

## 📊 모니터링

### 로그 확인
```bash
# Backend 로그 (PM2 사용 시)
pm2 logs moducon-backend

# 실시간 로그 추적
tail -f /var/log/moducon-backend.log
```

### 모니터링 지표
| 지표 | 목표 | 알림 임계값 |
|------|------|------------|
| API 응답 시간 | < 200ms | > 500ms |
| 에러율 | < 1% | > 5% |
| CPU 사용률 | < 70% | > 90% |
| 메모리 사용률 | < 80% | > 95% |

### 외부 모니터링 서비스 (권장)
- **Uptime 모니터링**: UptimeRobot, Pingdom
- **APM**: Sentry, New Relic
- **로그 관리**: LogDNA, Datadog

---

## 📈 성과 지표

### 빌드 성과
| 항목 | 목표 | 실제 | 상태 |
|------|------|------|------|
| 빌드 시간 | < 15초 | 8.7초 | ✅ |
| ESLint | 0 errors | 0 errors | ✅ |
| TypeScript | 컴파일 성공 | 성공 | ✅ |
| 정적 페이지 | 50+ | 55개 | ✅ |

### 배포 이력
| 날짜 | 버전 | 내용 |
|------|------|------|
| 2025-11-28 | v1.0.0 | 초기 배포 완료 |
| 2025-12-02 | v1.1.0 | UI/UX 개선, CORS 설정 |

---

**문서 버전**: v2.0
**최종 수정일**: 2025-12-02
