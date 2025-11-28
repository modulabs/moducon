# 82_MOBILE_PWA_IMPLEMENTATION.md

## 모바일 PWA 구현 완료 보고서

**작성일**: 2025-11-28
**담당**: hands-on worker
**상태**: 백엔드 API + 프론트엔드 UI + QR 스캔 기능 구현 완료

---

## 📋 구현 완료 항목

### 1. 백엔드 API 구현 ✅

#### 생성된 파일
- `moducon-backend/src/services/googleSheetsService.ts` - Google Sheets 데이터 처리 서비스
- `moducon-backend/src/controllers/boothController.ts` - 부스 컨트롤러
- `moducon-backend/src/controllers/paperController.ts` - 포스터 컨트롤러
- `moducon-backend/src/routes/booths.ts` - 부스 라우트
- `moducon-backend/src/routes/papers.ts` - 포스터 라우트

#### API 엔드포인트
```typescript
// 부스 API
GET /api/booths              // 부스 목록 (타입 필터 가능)
GET /api/booths/:id          // 부스 상세 정보

// 포스터 API
GET /api/papers              // 포스터 목록 (학회, 발표시간 필터 가능)
GET /api/papers/:id          // 포스터 상세 정보
```

#### 데이터 구조
```typescript
// Booth 타입
interface Booth {
  id: string;
  name: string;
  type: string;
  description: string;
  contactPerson: string;
  boothDescription: string;
  imageUrl: string;
  hashtags: string[];
  solutions: string;
  technologies: string;
  researchGoals: string;
  mainProducts: string;
  demoContent: string;
}

// Paper 타입
interface Paper {
  id: string;
  author: string;
  affiliation: string;
  conference: string;
  title: string;
  fileUrl: string;
  paperUrl: string;
  category: string;
  email: string;
  phone: string;
  presentationTime: string;
  willPresent: string;
}
```

---

### 2. 프론트엔드 UI 구현 ✅

#### 생성된 파일

**라이브러리**
- `moducon-frontend/src/lib/googleSheets.ts` - Google Sheets 데이터 fetcher 및 유틸리티

**페이지**
- `moducon-frontend/src/app/booths/page.tsx` - 부스 목록 페이지
- `moducon-frontend/src/app/booths/[id]/page.tsx` - 부스 상세 페이지
- `moducon-frontend/src/app/papers/page.tsx` - 포스터 목록 페이지
- `moducon-frontend/src/app/papers/[id]/page.tsx` - 포스터 상세 페이지

**컴포넌트**
- `moducon-frontend/src/components/QRScanner.tsx` - QR 스캐너 컴포넌트

#### 주요 기능

**부스 목록 (`/booths`)**
- ✅ 부스 카드 그리드 레이아웃 (반응형)
- ✅ 검색 기능 (이름, 설명, 해시태그)
- ✅ 타입별 필터 (전체, 기업, LAB, 교육사업팀, 테크포임팩트)
- ✅ 이미지 표시 (있는 경우)
- ✅ 해시태그 표시
- ✅ 호버 효과 및 애니메이션

**부스 상세 (`/booths/[id]`)**
- ✅ 부스 헤더 (이미지, 타입, 제목)
- ✅ 상세 정보 섹션:
  - 단체 소개
  - 부스 소개
  - 제공 솔루션
  - 핵심 기술
  - 연구 주제 및 목표
  - 주요 제품
  - 데모 내용
- ✅ QR 인증 버튼
- ✅ 뒤로 가기 네비게이션

**포스터 목록 (`/papers`)**
- ✅ 포스터 목록 (카드 형식)
- ✅ 검색 기능 (제목, 저자, 학회명)
- ✅ 학회별 필터 (CVPR, ICCV, ACL, EMNLP, NeurIPS 등)
- ✅ 발표 시간별 필터
- ✅ 포스터 통계 (전체 포스터 수, 참여 학회, 발표 예정, 참여 연구자)

**포스터 상세 (`/papers/[id]`)**
- ✅ 학회 정보 배지
- ✅ 발표 시간 정보
- ✅ 저자 및 소속
- ✅ 연락처 정보 (이메일, 전화번호)
- ✅ 발표 정보
- ✅ 파일 링크 (포스터 파일, 논문 링크)
- ✅ QR 인증 버튼

**홈 페이지 연동 (`/home`)**
- ✅ 포스터 발표 링크 추가

---

### 3. QR 스캔 기능 개선 ✅

#### 주요 개선 사항
- ✅ **후방 카메라 사용**: `facingMode: 'environment'`
- ✅ **실시간 스캔**: html5-qrcode 라이브러리 사용
- ✅ **자동 라우팅**: QR 값 파싱 후 해당 페이지로 이동
- ✅ **스캔 가이드 UI**: 스캔 영역 표시

#### QR 코드 값 파싱 로직
```typescript
// 부스 이름: "클라비" -> /booths/booth-클라비
// 학회 이름: "CVPR 2025" -> /papers/paper-cvpr-2025
// 직접 URL: "/booths/booth-1" -> /booths/booth-1
```

#### 에러 처리
- 카메라 권한 에러 처리
- 유효하지 않은 QR 코드 에러 메시지
- 스캐너 종료 시 리소스 정리

---

## 📊 Google Sheets 데이터 확인 결과

### 부스 데이터 (13개)
1. 클라비 (기업)
2. K-HP (모두의연구소 교육사업팀)
3. 아이펠 리서치팀 (모두의연구소 교육사업팀)
4. 모두의연구소/비즈팀 (모두의연구소 교육사업팀)
5. NVIDIA 기술랩 (모두의연구소 LAB)
6. DAO LAB/다바코단 길드 (모두의연구소 LAB)
7. Tenstorrent (기업)
8. GenAI in Finance / RAG / Safety Generative Lab (모두의연구소 LAB)
9. Hell Maker (모두의연구소 LAB)
10. AI에이전트랩 (모두의연구소 LAB)
11. VLM Safety LAB (모두의연구소 LAB)
12. 피치마켓/B-Peach Lab (테크포임팩트 부스)

### 포스터 데이터 (33개)
- **CVPR 2025**: 7개
- **ICCV 2025**: 3개
- **ACL 2025**: 3개
- **EMNLP 2025**: 3개
- **NeurIPS 2025**: 2개
- **AAAI 2025**: 2개
- **기타**: ICML, NAACL, ICLR, Interspeech, ICASSP, MICCAI 등

---

## 🎨 디자인 및 UX

### 디자인 시스템
- **색상**:
  - Primary: Purple (#8B5CF6)
  - Secondary: Blue (#3B82F6)
  - Background: Gradient (Purple-50 → White → Blue-50)
- **타이포그래피**:
  - 한글: 시스템 기본 폰트
  - 영문: Inter, -apple-system
- **레이아웃**: 모바일 퍼스트 (320px~)

### 반응형 디자인
- **모바일** (< 768px): 1열 그리드
- **태블릿** (768px ~ 1024px): 2열 그리드
- **데스크톱** (> 1024px): 3열 그리드

### 애니메이션
- 호버 효과 (scale, shadow)
- 페이드 인/아웃
- 부드러운 전환 (transition-all)

---

## 🔧 기술 스택

### 백엔드
- **언어**: TypeScript
- **프레임워크**: Express.js 5.1.0
- **데이터**: Google Sheets (MCP 연동)

### 프론트엔드
- **프레임워크**: Next.js 16
- **UI 라이브러리**: shadcn/ui + Tailwind CSS
- **QR 스캔**: html5-qrcode
- **아이콘**: lucide-react

---

## 📝 다음 단계

### 즉시 필요한 작업
1. **Google Sheets MCP 실제 연동**
   - 현재 하드코딩된 샘플 데이터를 Google Sheets 실제 데이터로 교체
   - `fetchBooths()`, `fetchPapers()` 함수 구현

2. **QR 코드 생성**
   - 각 부스 및 포스터에 대한 QR 코드 생성
   - QR 값: 부스명, 학회명, 또는 직접 URL

3. **PWA 기능 추가**
   - Service Worker 등록
   - 오프라인 지원
   - Add to Home Screen
   - Push Notification

### 향상 작업
1. **이미지 최적화**
   - Google Drive 이미지 로딩 최적화
   - 플레이스홀더 이미지 개선

2. **검색 기능 개선**
   - 한글 초성 검색
   - 검색 결과 하이라이팅

3. **필터 기능 확장**
   - 복합 필터 (AND/OR)
   - 필터 상태 URL 반영

4. **성능 최적화**
   - 이미지 lazy loading
   - 무한 스크롤 또는 페이지네이션

---

## 🐛 알려진 이슈

1. **Google Sheets 데이터 연동**
   - 현재 샘플 데이터 사용 중
   - MCP를 통한 실제 데이터 fetching 필요

2. **QR 스캐너 카메라 권한**
   - iOS Safari에서 카메라 권한 요청 필요
   - HTTPS 환경에서만 작동

3. **이미지 로딩**
   - Google Drive 이미지 CORS 이슈 가능성
   - 대체 이미지 서버 또는 Base64 인코딩 고려

---

## 📁 생성/수정된 파일 목록

### 백엔드 (5개 파일)
```
moducon-backend/src/
├── services/googleSheetsService.ts (신규)
├── controllers/boothController.ts (신규)
├── controllers/paperController.ts (신규)
├── routes/booths.ts (신규)
├── routes/papers.ts (신규)
└── routes/index.ts (수정)
```

### 프론트엔드 (6개 파일)
```
moducon-frontend/src/
├── lib/googleSheets.ts (신규)
├── components/QRScanner.tsx (신규)
├── app/
│   ├── booths/
│   │   ├── page.tsx (신규)
│   │   └── [id]/page.tsx (신규)
│   ├── papers/
│   │   ├── page.tsx (신규)
│   │   └── [id]/page.tsx (신규)
│   └── home/page.tsx (수정)
```

### 의존성
```json
{
  "html5-qrcode": "^2.3.8" // 신규 추가
}
```

---

## ✅ 완료 체크리스트

- [x] Google Sheets 데이터 확인 (부스 13개, 포스터 33개)
- [x] 백엔드 API 라우트 구현 (/api/booths, /api/papers)
- [x] 백엔드 컨트롤러 및 서비스 구현
- [x] 프론트엔드 부스 목록 페이지 구현
- [x] 프론트엔드 부스 상세 페이지 구현
- [x] 프론트엔드 포스터 목록 페이지 구현
- [x] 프론트엔드 포스터 상세 페이지 구현
- [x] QR 스캐너 컴포넌트 구현 (후방 카메라)
- [x] 홈 페이지에 링크 추가
- [x] 검색 및 필터 기능 구현
- [x] 반응형 디자인 적용
- [x] 문서 작성

---

**다음 담당자**: editor (코드 리뷰 및 문서 검토)
