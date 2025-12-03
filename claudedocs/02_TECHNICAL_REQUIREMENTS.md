# 기술 요구사항 명세서

## 📅 최종 업데이트
**날짜**: 2025-12-03
**작성자**: Technical Lead

---

## 📋 개요

PRD v1.8에서 정의한 핵심 요구사항에 대한 상세 기술 명세서입니다.

### 작업 범위
1. **QR 스캐너 UI/UX**: 원형 버튼 인터페이스 및 모달 스캐너
2. **데이터 연동**: PostgreSQL DB 기반 세션/부스/포스터 데이터 (백엔드 API)
3. **사용자 인증**: JWT 기반 인증 및 디지털 서명
4. **모바일 PWA**: 반응형 디자인 및 오프라인 지원

---

## 📁 프로젝트 구조

```
moducon_dev/
├── moducon-frontend/          # Next.js 프론트엔드
│   ├── src/
│   │   ├── app/               # App Router 페이지
│   │   │   ├── home/          # 홈 대시보드
│   │   │   ├── sessions/      # 세션 목록/상세
│   │   │   ├── booths/        # 부스 목록/상세
│   │   │   ├── papers/        # 포스터 목록/상세
│   │   │   └── mypage/        # 마이페이지 (Phase 5)
│   │   ├── components/        # React 컴포넌트
│   │   │   ├── layout/        # Header, BottomNavigation
│   │   │   ├── home/          # DigitalBadge, QuestProgress
│   │   │   ├── profile/       # ProfileCard, QRCodeDisplay
│   │   │   └── ui/            # shadcn/ui 컴포넌트
│   │   ├── imports/           # SVG/아이콘 에셋
│   │   ├── lib/               # 유틸리티 함수
│   │   │   └── sessionCache.ts
│   │   ├── store/             # Zustand 스토어
│   │   └── types/             # TypeScript 타입 정의
│   └── package.json
├── moducon-backend/           # Express 백엔드
│   ├── src/
│   │   ├── routes/            # API 라우트
│   │   │   ├── auth.ts        # 인증 API
│   │   │   ├── sessions.ts    # 세션 API
│   │   │   ├── booths.ts      # 부스 API
│   │   │   └── papers.ts      # 포스터 API
│   │   ├── services/          # 비즈니스 로직
│   │   │   └── googleSheetsService.ts
│   │   ├── middleware/        # 미들웨어
│   │   │   ├── auth.ts        # JWT 인증
│   │   │   └── errorHandler.ts
│   │   └── index.ts           # 서버 진입점
│   ├── prisma/
│   │   └── schema.prisma      # DB 스키마
│   └── package.json
└── claudedocs/                # 프로젝트 문서
    ├── 01_PRD.md
    ├── 02_TECHNICAL_REQUIREMENTS.md (본 문서)
    └── archive/               # 이전 문서 보관
```

---

## 🖥️ 프론트엔드 요구사항

### 의존성 패키지
```json
{
  "next": "^15.1.3",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "typescript": "^5.x",
  "tailwindcss": "^4.x",
  "zustand": "^5.x",
  "framer-motion": "^11.x",
  "html5-qrcode": "^2.3.8",
  "lucide-react": "^0.460.x",
  "@radix-ui/react-*": "latest"
}
```

### 주요 컴포넌트

| 컴포넌트 | 경로 | 설명 |
|----------|------|------|
| Header | `components/layout/Header.tsx` | 그라데이션 네비게이션 바 |
| BottomNavigation | `components/layout/BottomNavigation.tsx` | 하단 탭 네비게이션 |
| DigitalBadge | `components/home/DigitalBadge.tsx` | 참가자 배지 표시 |
| QuestProgress | `components/home/QuestProgress.tsx` | 퀘스트 진행률 |
| QRCodeDisplay | `components/profile/QRCodeDisplay.tsx` | QR 코드 표시 |
| ProfileCard | `components/profile/ProfileCard.tsx` | 프로필 카드 |

### 스타일 가이드

```css
/* 브랜드 그라데이션 */
.brand-gradient {
  background: linear-gradient(to right, #FF6B9D, #FF8B5A, #FFA94D);
}

/* Tailwind 클래스 */
bg-gradient-to-r from-[#FF6B9D] via-[#FF8B5A] to-[#FFA94D]
```

### 컬러 팔레트

| 색상 | HEX | 용도 |
|------|-----|------|
| Pink | `#FF6B9D` | 그라데이션 시작점 |
| Orange | `#FF8B5A` | 그라데이션 중간점 |
| Yellow | `#FFA94D` | 그라데이션 끝점 |
| Primary | `#4F46E5` | 보라색 (QR 버튼) |
| White | `#FFFFFF` | 텍스트, 배경 |

---

## 🔧 백엔드 요구사항

### 의존성 패키지
```json
{
  "express": "^4.x",
  "prisma": "^6.x",
  "@prisma/client": "^6.x",
  "jsonwebtoken": "^9.x",
  "bcryptjs": "^2.x",
  "cors": "^2.x",
  "axios": "^1.x",
  "zod": "^3.x"
}
```

### CORS 설정
```typescript
// moducon-backend/src/index.ts
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

### 환경 변수

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

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://backend.vibemakers.kr
```

---

## 🗄️ 데이터베이스 스키마

### 콘텐츠 모델 (Session, Booth, Poster) ✅
```prisma
model Session {
  id                String   @id @default(dbgenerated("uuid_v7()")) @db.Uuid
  code              String   @unique @db.VarChar(20)
  track             String   @db.VarChar(50)
  location          String   @db.VarChar(100)
  timeSlot          String   @map("time_slot") @db.VarChar(50)  // "HH:MM-HH:MM"
  speakerName       String   @map("speaker_name") @db.VarChar(200)
  speakerOrg        String?  @map("speaker_org") @db.VarChar(500)
  speakerBio        String?  @map("speaker_bio")
  speakerProfileUrl String?  @map("speaker_profile_url")
  title             String   @db.VarChar(500)
  description       String?
  keywords          String[] @db.VarChar(100)
  pageUrl           String?  @map("page_url")
  isActive          Boolean  @default(true) @map("is_active")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @default(now()) @updatedAt @map("updated_at")
  @@map("sessions")
}

model Booth {
  id               String   @id @default(dbgenerated("uuid_v7()")) @db.Uuid
  code             String   @unique @db.VarChar(20)
  name             String   @db.VarChar(200)
  organization     String?  @db.VarChar(200)
  orgType          String?  @map("org_type") @db.VarChar(50)
  description      String?
  boothDescription String?  @map("booth_description")
  hashtags         String[] @db.VarChar(100)
  solutions        String?
  coreTech         String?  @map("core_tech")
  researchGoals    String?  @map("research_goals")
  mainProducts     String?  @map("main_products")
  demoContent      String?  @map("demo_content")
  imageUrl         String?  @map("image_url")
  managerName      String?  @map("manager_name") @db.VarChar(100)
  isActive         Boolean  @default(true) @map("is_active")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @default(now()) @updatedAt @map("updated_at")
  @@map("booths")
}

model Poster {
  id               String   @id @default(dbgenerated("uuid_v7()")) @db.Uuid
  code             String   @unique @db.VarChar(20)
  title            String
  abstract         String?
  researcher       String?  @db.VarChar(200)
  affiliation      String?  @db.VarChar(300)
  hashtags         String[] @db.VarChar(100)
  presentationTime String?  @map("presentation_time") @db.VarChar(100)
  location         String?  @db.VarChar(100)
  isActive         Boolean  @default(true) @map("is_active")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @default(now()) @updatedAt @map("updated_at")
  @@map("posters")
}
```

### 사용자 모델 (User, CheckIn, Quiz) ✅
```prisma
model User {
  id               String            @id @default(dbgenerated("uuid_v7()")) @db.Uuid
  name             String            @db.VarChar(100)
  phoneLast4       String            @map("phone_last4") @db.VarChar(4)
  email            String?           @db.VarChar(255)
  organization     String?           @db.VarChar(255)
  signatureUrl     String?           @map("signature_url")
  registrationType String            @default("pre_registered") @map("registration_type")
  isActive         Boolean           @default(true) @map("is_active")
  @@unique([name, phoneLast4], name: "unique_user")
  @@map("users")
}

model UserCheckin {
  id          String   @id @default(dbgenerated("uuid_v7()")) @db.Uuid
  userId      String   @map("user_id") @db.Uuid
  targetType  String   @map("target_type") @db.VarChar(20)
  targetId    String   @map("target_id") @db.VarChar(50)
  checkedInAt DateTime @default(now()) @map("checked_in_at")
  @@unique([userId, targetType, targetId], name: "unique_checkin")
  @@map("user_checkins")
}

model Quiz {
  id            String   @id @default(dbgenerated("uuid_v7()")) @db.Uuid
  targetType    String   @map("target_type") @db.VarChar(20)
  targetId      String   @map("target_id") @db.VarChar(50)
  question      String
  options       String[] @db.VarChar(255)
  correctAnswer Int      @map("correct_answer")
  isActive      Boolean  @default(true) @map("is_active")
  @@unique([targetType, targetId], name: "unique_quiz_target")
  @@map("quizzes")
}
```

---

## 📊 데이터 연동

### 데이터 현황 (DB 마이그레이션 완료)
- **세션**: 32개 (xlsx → PostgreSQL)
- **부스**: 15개 (xlsx → PostgreSQL)
- **포스터**: 33개 (xlsx → PostgreSQL)

### 프론트엔드 캐시 레이어
| 파일 | API 엔드포인트 | 캐시 TTL |
|------|---------------|----------|
| `sessionCache.ts` | `/api/sessions` | 5분 |
| `boothCache.ts` | `/api/booths` | 5분 |
| `paperCache.ts` | `/api/papers` | 5분 |

### 캐싱 전략
- **저장소**: localStorage (프론트엔드)
- **버전 관리**: CACHE_VERSION = '2.0' (DB 스키마 반영)
- **SSR 지원**: `typeof window === 'undefined'` 체크
- **무효화**: 수동 새로고침 버튼

---

## 📱 QR 스캐너 요구사항

### 컴포넌트 구조
```
QRFloatingButton (하단 네비게이션)
├── CircleButton (원형 버튼)
│   ├── QR Icon SVG (32px, stroke: #666666)
│   └── 그라데이션 배경
└── QRScannerModal (전체 화면 모달)
    ├── CameraView (html5-qrcode)
    ├── ScanGuide (250px 가이드라인)
    ├── Instructions (사용 안내)
    └── CloseButton (닫기 버튼)
```

### 스타일링 명세
```tsx
// BottomNavigation QR 버튼
<button className="
  absolute left-1/2 -translate-x-1/2 -top-8
  w-16 h-16 rounded-full
  bg-gradient-to-r from-primary to-primary/80
  shadow-[0_4px_12px_rgba(79,70,229,0.4)]
  ring-4 ring-white
">
  <svg width="32" height="32" stroke="#666666" />
</button>
```

### 기능 요구사항
- [ ] 후방 카메라 자동 활성화
- [ ] 250px 스캔 가이드라인 표시
- [ ] 스캔 성공 시 햅틱 피드백
- [ ] 에러 시 재시도 안내 메시지

---

## ⚡ 성능 요구사항

| 지표 | 목표값 | 현재 |
|------|--------|------|
| First Contentful Paint (FCP) | < 1.5s | ~1.2s |
| Largest Contentful Paint (LCP) | < 2.5s | ~2.0s |
| Time to Interactive (TTI) | < 3.0s | ~2.5s |
| Cumulative Layout Shift (CLS) | < 0.1 | ~0.05 |
| 빌드 시간 | < 15s | ~8.7s |

---

## 🔒 보안 요구사항

### 인증
- **방식**: JWT (JSON Web Token)
- **만료**: 24시간
- **저장**: HTTP-only cookies
- **알고리즘**: HS256

### 데이터 보호
1. **HTTPS**: 프로덕션 환경 SSL/TLS 필수
2. **CORS**: 허용된 도메인만 접근 가능
3. **Input Validation**: Zod 스키마 기반 검증
4. **SQL Injection 방어**: Prisma ORM 사용
5. **XSS 방어**: React 기본 이스케이핑
6. **Password Hashing**: bcrypt 해싱 적용

---

## 🌐 브라우저 호환성

| 브라우저 | 버전 | 지원 |
|----------|------|------|
| Chrome | 120+ | ✅ |
| Safari | 17+ | ✅ |
| Firefox | 120+ | ✅ |
| Edge | 120+ | ✅ |
| Mobile Safari | iOS 17+ | ✅ |
| Chrome Mobile | Android 14+ | ✅ |

---

## ✅ 검증 기준

### QR 스캐너 UI
- [ ] 원형 버튼이 하단 네비게이션 중앙에 표시
- [ ] 버튼 클릭 시 전체 화면 모달 오픈
- [ ] 후방 카메라 자동 활성화
- [ ] 250px 스캔 가이드라인 표시
- [ ] 스캔 성공 시 햅틱 피드백
- [ ] 에러 시 친절한 안내 메시지

### 세션 데이터 연동
- [ ] Google Sheets API 연결 성공
- [ ] 33개 세션 데이터 모두 로드
- [ ] 트랙별 필터링 정상 동작
- [ ] 5분 캐싱 정상 작동
- [ ] 새로고침 버튼으로 수동 갱신 가능
- [ ] 네트워크 에러 시 친절한 메시지 표시

---

**문서 버전**: v2.0
**최종 수정일**: 2025-12-02
