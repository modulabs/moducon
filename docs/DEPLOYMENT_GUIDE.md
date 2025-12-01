# Moducon 2025 배포 가이드

이 문서는 Moducon 2025 프로젝트를 프로덕션 환경에 배포하는 전체 과정을 설명합니다.

## 📋 목차
1. [사전 준비사항](#사전-준비사항)
2. [로컬 개발 환경 설정](#로컬-개발-환경-설정)
3. [GitHub Pages 배포 (프론트엔드)](#github-pages-배포-프론트엔드)
4. [백엔드 배포](#백엔드-배포)
5. [데이터베이스 설정](#데이터베이스-설정)
6. [보안 설정](#보안-설정)
7. [배포 후 검증](#배포-후-검증)
8. [트러블슈팅](#트러블슈팅)

---

## 사전 준비사항

### 필수 소프트웨어
- Node.js 18.x 이상
- npm 9.x 이상
- Git 2.x 이상
- PostgreSQL 14.x 이상

### 필수 계정
- GitHub 계정 (프론트엔드 배포)
- Render/Railway/Vercel 계정 (백엔드 배포)
- 도메인 (선택사항)

### 환경 확인
```bash
node --version  # v18.x.x 이상
npm --version   # 9.x.x 이상
git --version   # 2.x.x 이상
psql --version  # PostgreSQL 14.x 이상
```

---

## 로컬 개발 환경 설정

### 1. 프로젝트 클론
```bash
git clone https://github.com/your-username/moducon.git
cd moducon
```

### 2. 백엔드 설정
```bash
cd moducon-backend

# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env
nano .env  # DATABASE_URL, JWT_SECRET, ADMIN_SECRET 설정

# 데이터베이스 마이그레이션
npm run db:migrate

# 초기 데이터 시딩 (16명 테스터)
npm run db:seed

# 개발 서버 실행
npm run dev
# ✅ Server running on http://localhost:3001
```

### 3. 프론트엔드 설정
```bash
cd ../moducon-frontend

# 의존성 설치
npm install

# 환경변수 설정
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local

# 개발 서버 실행
npm run dev
# ✅ Ready on http://localhost:3000
```

### 4. 로컬 테스트
```bash
# 브라우저에서 확인
http://localhost:3000         # 메인 페이지
http://localhost:3000/admin   # 관리자 페이지

# 테스트 로그인
이름: 조해창
전화번호 뒷 4자리: 4511

# 관리자 토큰 생성
cd moducon-backend
npm run admin:token
# 출력된 토큰을 x-admin-token 헤더로 사용
```

---

## GitHub Pages 배포 (프론트엔드)

### 1. Next.js Static Export 설정

**파일**: `moducon-frontend/next.config.js`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Static HTML Export
  images: {
    unoptimized: true,  // GitHub Pages용
  },
  basePath: process.env.NODE_ENV === 'production' ? '/moducon' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/moducon/' : '',
};

export default nextConfig;
```

### 2. 배포 스크립트 추가

**파일**: `moducon-frontend/package.json`
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "export": "next build && next export",
    "deploy": "npm run export && touch out/.nojekyll && gh-pages -d out"
  }
}
```

```bash
# gh-pages 패키지 설치
npm install --save-dev gh-pages
```

### 3. GitHub Repository 설정

```bash
# GitHub에 저장소 생성 후
git remote add origin https://github.com/your-username/moducon.git
git branch -M main
git push -u origin main
```

### 4. GitHub Pages 배포

```bash
cd moducon-frontend

# 프로덕션 빌드 및 배포
npm run deploy

# ✅ Published
# 배포 URL: https://your-username.github.io/moducon
```

### 5. GitHub 저장소 설정
1. GitHub 저장소 → Settings
2. Pages → Source: `gh-pages` branch 선택
3. 5분 후 https://your-username.github.io/moducon 접속

---

## 백엔드 배포

### 옵션 1: Render 배포 (추천)

#### 1. Render 회원가입
- https://render.com 접속
- GitHub 계정으로 로그인

#### 2. PostgreSQL 데이터베이스 생성
1. Dashboard → New → PostgreSQL
2. Name: `moducon-db`
3. Database: `moducon_prod`
4. User: 자동 생성
5. Region: Singapore (가장 가까운 리전)
6. Plan: Free
7. Create Database
8. **Internal Database URL** 복사 (나중에 사용)

#### 3. Web Service 생성
1. Dashboard → New → Web Service
2. Connect Repository: `moducon` 선택
3. 설정:
   - Name: `moducon-backend`
   - Root Directory: `moducon-backend`
   - Runtime: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Plan: Free

#### 4. 환경변수 설정
Environment 탭에서 추가:
```bash
DATABASE_URL=[복사한 Internal Database URL]
PORT=3001
JWT_SECRET=[64자 무작위 문자열]
ADMIN_SECRET=[64자 무작위 문자열]
NODE_ENV=production
```

시크릿 생성:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### 5. 배포 실행
- "Create Web Service" 클릭
- 자동 빌드 및 배포 시작 (5-10분 소요)
- ✅ Live: `https://moducon-backend.onrender.com`

#### 6. 데이터베이스 마이그레이션
```bash
# Render Shell 접속 (Dashboard → Shell)
npm run db:migrate
npm run db:seed
```

---

### 옵션 2: Railway 배포

#### 1. Railway 회원가입
- https://railway.app 접속
- GitHub 계정으로 로그인

#### 2. 프로젝트 생성
1. New Project → Deploy from GitHub repo
2. `moducon` 저장소 선택
3. Add variables:
   ```bash
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   PORT=3001
   JWT_SECRET=[생성한 시크릿]
   ADMIN_SECRET=[생성한 시크릿]
   ```

#### 3. PostgreSQL 추가
1. New → Database → Add PostgreSQL
2. 자동으로 `DATABASE_URL` 환경변수 생성됨

#### 4. 배포 설정
- Root Directory: `moducon-backend`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Deploy 클릭

---

### 옵션 3: Vercel 배포

#### 1. Vercel 회원가입
- https://vercel.com 접속
- GitHub 계정으로 로그인

#### 2. 프로젝트 Import
1. Add New → Project
2. Import Git Repository: `moducon`
3. Framework Preset: Other
4. Root Directory: `moducon-backend`
5. Build Command: `npm run build`
6. Output Directory: `dist`

#### 3. 환경변수 설정
```bash
DATABASE_URL=[Neon/PlanetScale PostgreSQL URL]
JWT_SECRET=[생성한 시크릿]
ADMIN_SECRET=[생성한 시크릿]
NODE_ENV=production
```

---

## 데이터베이스 설정

### 프로덕션 데이터베이스 마이그레이션

```bash
# 1. Render/Railway Shell 접속 또는 로컬에서 실행
export DATABASE_URL="postgresql://..."  # 프로덕션 DB URL

# 2. Prisma 마이그레이션
npx prisma migrate deploy

# 3. 초기 데이터 시딩
npm run db:seed

# 4. 확인
npx prisma studio  # 브라우저에서 데이터 확인
```

### 백업 설정 (중요!)

```bash
# 데이터베이스 백업
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# 복구
psql $DATABASE_URL < backup_20251121.sql
```

---

## 보안 설정

### 1. CORS 설정
**파일**: `moducon-backend/src/index.ts`
```typescript
app.use(cors({
  origin: [
    'https://your-username.github.io',
    'http://localhost:3000'  // 로컬 개발용
  ],
  credentials: true
}));
```

### 2. 환경변수 체크
```bash
# ❌ 절대 Git에 커밋하지 말 것
.env
.env.local
.env.production

# ✅ .gitignore에 반드시 포함
echo ".env*" >> .gitignore
```

### 3. 관리자 토큰 관리
```bash
# 프로덕션 토큰 생성
ADMIN_SECRET=your-production-secret npm run admin:token

# 토큰을 안전한 곳에 보관 (1Password, Vault)
# 팀원과 공유 시 Slack/Email 금지
```

### 4. HTTPS 강제
```typescript
// src/index.ts
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

---

## 배포 후 검증

### 1. 백엔드 Health Check
```bash
# API 서버 응답 확인
curl https://moducon-backend.onrender.com/api/auth/verify

# 예상 응답
{
  "success": true,
  "message": "서버가 정상 작동 중입니다."
}
```

### 2. 데이터베이스 연결 확인
```bash
# Render Shell 또는 로컬에서
npm run db:studio

# 브라우저에서 Prisma Studio 접속
# Participant 테이블에 16명 확인
```

### 3. 프론트엔드 배포 확인
```bash
# GitHub Pages URL 접속
https://your-username.github.io/moducon

# 체크리스트
- [ ] 메인 페이지 로딩
- [ ] 로그인 페이지 동작
- [ ] 서명 페이지 동작
- [ ] 관리자 페이지 접근
```

### 4. 통합 테스트
```bash
# 1. 테스터 로그인
이름: 조해창
전화번호 뒷 4자리: 4511

# 2. 서명 등록
# 3. 관리자 페이지에서 서명 확인
# 4. API 응답 시간 체크 (< 100ms)
```

---

## 프로덕션 체크리스트

### 배포 전
- [ ] 모든 테스트 통과
- [ ] 환경변수 설정 완료
- [ ] 데이터베이스 백업
- [ ] CORS 설정 확인
- [ ] HTTPS 강제 설정
- [ ] 시크릿 키 강화 (64자 이상)

### 배포 중
- [ ] 빌드 성공 확인
- [ ] 데이터베이스 마이그레이션 실행
- [ ] 초기 데이터 시딩 완료
- [ ] 배포 로그 에러 없음

### 배포 후
- [ ] Health check API 응답 확인
- [ ] 프론트엔드 페이지 로딩 확인
- [ ] 로그인/서명 시나리오 테스트
- [ ] 관리자 페이지 접근 확인
- [ ] 성능 모니터링 설정
- [ ] 에러 로깅 설정

---

## 트러블슈팅

### 빌드 실패
```bash
# 증상: Build failed with exit code 1
# 해결:
1. package.json의 scripts 확인
2. TypeScript 컴파일 에러 확인: npm run build
3. 의존성 설치 확인: npm install
```

### 데이터베이스 연결 실패
```bash
# 증상: Can't reach database server
# 해결:
1. DATABASE_URL 확인 (환경변수 탭)
2. IP 화이트리스트 확인 (Render: 0.0.0.0/0 허용)
3. SSL 설정 확인: ?sslmode=require
```

### CORS 에러
```bash
# 증상: Access to fetch blocked by CORS policy
# 해결:
1. 백엔드 CORS origin 설정 확인
2. 프론트엔드 API_URL 확인 (https://)
3. 브라우저 캐시 삭제
```

### GitHub Pages 404 에러
```bash
# 증상: Page not found (404)
# 해결:
1. gh-pages 브랜치 확인: git branch -a
2. .nojekyll 파일 확인: touch out/.nojekyll
3. basePath 설정 확인 (next.config.js)
```

### 관리자 페이지 401 에러
```bash
# 증상: 401 Unauthorized
# 해결:
1. 관리자 토큰 생성: npm run admin:token
2. 헤더 확인: x-admin-token: [토큰]
3. ADMIN_SECRET 환경변수 확인
```

---

## 모니터링 설정

### 1. 로그 모니터링
```bash
# Render Logs 탭
# 실시간 로그 스트리밍 확인
```

### 2. 성능 모니터링
```bash
# Render Metrics 탭
# CPU, 메모리, 응답 시간 확인
```

### 3. 알림 설정
- Render: Dashboard → Notifications
- 이메일, Slack, Discord 연동 가능

---

## 업데이트 배포

### 1. 코드 변경 후 배포
```bash
# 1. 변경사항 커밋
git add .
git commit -m "feat: 새로운 기능 추가"

# 2. GitHub에 푸시
git push origin main

# 3. 자동 배포 (Render/Railway/Vercel)
# Webhooks로 자동 배포 트리거
```

### 2. 데이터베이스 스키마 변경
```bash
# 1. Prisma 스키마 수정
nano moducon-backend/prisma/schema.prisma

# 2. 마이그레이션 생성
npx prisma migrate dev --name add_new_field

# 3. 프로덕션 적용
npx prisma migrate deploy
```

---

## 비용 예상

### Free Tier 사용 시
- **Render**: Free (750시간/월, 휴면 모드)
- **Railway**: $5/월 크레딧 (초과 시 과금)
- **GitHub Pages**: 무료
- **총 비용**: $0-5/월

### Paid Tier 사용 시
- **Render**: $7/월 (항상 활성, 더 빠른 성능)
- **Railway**: $10/월 (높은 사용량)
- **도메인**: $10-15/년
- **총 비용**: $20-30/월

---

**작성일**: 2025-11-21
**버전**: 1.0.0
**관련 문서**: [환경변수 가이드](ENV_SETUP_GUIDE.md)
