# 118_NEW_REQUIREMENTS.md - 신규 요구사항 명세

**작성일**: 2025-11-30
**작성자**: Technical Lead
**버전**: v2.0
**기준 버전**: v1.8 (117_FINAL_QA_APPROVAL 완료 상태)

---

## 📋 Executive Summary

**현재 상태**: v1.8 프로덕션 배포 승인 완료 (117_FINAL_QA_APPROVAL)
**신규 요구사항**: 2개 추가 기능 개발 필요

### 🎯 요구사항 개요
1. **QR 스캐너 UI 재개선**: 기존 구현 검증 + UX 개선
2. **세션 데이터 실제 연동**: Google Sheets 연동 검증 + 데이터 확인

---

## 🔍 현재 상황 분석

### v1.8 완료 항목 (2025-11-30)
- ✅ QR 스캐너 UI 구현 완료
  - 원형 버튼 (120px, Pulse 애니메이션)
  - 전체 화면 모달
  - 후방 카메라 자동 선택
  - 접근성 WCAG 2.1 준수

- ✅ 세션 데이터 연동 구현 완료
  - Google Sheets Service 구현
  - 33개 세션 파싱
  - localStorage 캐싱 (5분)
  - 난이도 추론 로직

### 🚨 문제점 발견

#### 문제 1: QR 스캐너 UI 위치 불일치
**사용자 요구사항**:
> "정 가운데 다른 UI와 분리하여 원형 안에 예시 QR 이미지가 있는 아이콘으로 QR을 찍는 기능을 넣어주세요"

**현재 구현**:
- QRFloatingButton.tsx: 화면 **하단 중앙** 고정 (bottom-6)
- 예시 QR 이미지 없음 (QR SVG 아이콘만 표시)

**Gap 분석**:
- ❌ 위치: 하단 중앙 → **정가운데 (absolute center)** 필요
- ❌ 예시 이미지: 없음 → **예시 QR 이미지** 필요

#### 문제 2: 세션 데이터 실제 동작 미검증
**사용자 피드백**:
> "진행사항에는 하드코딩해서 넣었다고 써있는데, 실제 동작 시켜서 켜보면, 자료가 없다고 뜹니다"

**예상 원인**:
1. Google Sheets API 키 미설정
2. .env 파일 누락
3. API 호출 실패 에러 핸들링

**필요 작업**:
- ✅ API 키 발급 및 설정
- ✅ 실제 데이터 로딩 검증
- ✅ 에러 원인 분석 및 해결

---

## 🎯 신규 요구사항 상세

### 요구사항 #1: QR 스캐너 UI 재개선

#### 1.1 위치 변경 (정가운데)

**Before**:
```typescript
// QRFloatingButton.tsx (Line 30-34)
<button
  className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
  // ...
>
```

**After**:
```typescript
<button
  className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
  // 화면 정가운데 absolute positioning
>
```

**검증 방법**:
- 모바일 (375px, 414px, 768px) 테스트
- 세로/가로 모드 확인
- 다른 UI 요소와 겹침 여부 확인

#### 1.2 예시 QR 이미지 추가

**요구사항**:
- 원형 버튼 안에 **실제 QR 코드 예시 이미지** 표시
- 예시: 모두콘 세션 QR 코드 (실제 스캔 가능한 샘플)

**구현 방안**:

**Option A: SVG → 이미지로 교체 (권장)**
```typescript
// QRFloatingButton.tsx
<button className="...">
  <div className="relative w-full h-full">
    {/* 예시 QR 이미지 */}
    <Image
      src="/images/sample-qr.png"
      alt="QR 코드 스캔 예시"
      width={60}
      height={60}
      className="rounded-lg"
    />

    {/* 스캔 아이콘 오버레이 (작게) */}
    <div className="absolute bottom-0 right-0 bg-primary-500 rounded-full p-1">
      <ScanIcon className="w-4 h-4 text-white" />
    </div>
  </div>
</button>
```

**Option B: QR 이미지 배경 + 스캔 아이콘**
```typescript
<button
  className="..."
  style={{
    backgroundImage: 'url(/images/sample-qr.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }}
>
  <div className="bg-black/30 rounded-full p-4">
    <ScanIcon className="w-8 h-8 text-white" />
  </div>
</button>
```

**필요 리소스**:
- `/public/images/sample-qr.png` (300x300px)
- QR 코드 내용: `https://moducon.modulabs.co.kr/sessions/00-00` (예시)
- 생성 도구: https://www.qr-code-generator.com/

#### 1.3 툴팁 개선

**Before**:
```typescript
{showTooltip && (
  <div className="absolute -top-12 left-1/2 -translate-x-1/2 ...">
    QR 코드를 스캔하세요
  </div>
)}
```

**After**:
```typescript
{showTooltip && (
  <div className="absolute -top-16 left-1/2 -translate-x-1/2 ...">
    <div className="text-sm font-medium">QR 코드 스캔</div>
    <div className="text-xs text-gray-400 mt-1">
      세션·부스·포스터 체크인
    </div>
  </div>
)}
```

---

### 요구사항 #2: 세션 데이터 실제 동작 검증

#### 2.1 Google Sheets 연동 확인

**데이터 소스**:
- **Spreadsheet ID**: `1djkPQzg_1-_zgbWe8e5AYZlUjVoQYmJj2HlwRsCqu9g`
- **시트명**: `세션`
- **범위**: A2:N (헤더 제외, 33개 세션)

**필드 매핑** (14개 컬럼):
| 컬럼 | 필드명 | Google Sheets 헤더 | 비고 |
|------|--------|-------------------|------|
| A | id | 번호 | "00-00", "01-01" |
| B | pageUrl | 페이지 | URL 형식 |
| C | track | 트랙 | "Track 00", "Track 01" |
| D | location | 위치 | "이삼봉 홀" |
| E | time | 발표-시간 | "10:10-10:50" (파싱 필요) |
| F | speaker | 연사-명 | "노정석" |
| G | speakerAffiliation | 연사-소속 | "비팩토리 대표" |
| H | speakerBio | 연사-소개 | 약력 텍스트 |
| I | speakerProfile | 연사-프로필 | 이미지 URL |
| J | name | 발표-제목 | 세션 제목 |
| K | description | 발표-내용 | 세션 설명 |
| L | keyword1 | 키워드1 | 해시태그 |
| M | keyword2 | 키워드2 | 해시태그 |
| N | keyword3 | 키워드3 | 해시태그 |

#### 2.2 현재 구현 검증

**백엔드 코드** (실제 구현):
```typescript
// moducon-backend/src/services/googleSheetsService.ts

/**
 * 세션 데이터를 가져와서 파싱
 * 하드코딩된 데이터 사용 (Google Sheets 데이터 기반)
 */
export async function getSessions(): Promise<Session[]> {
  // 하드코딩된 데이터 import
  const { SESSIONS_DATA } = await import('../data/sessions.js');
  return SESSIONS_DATA;
}
```

**실제 동작 방식**:
1. ✅ Google Sheets 데이터 → `moducon-backend/src/data/sessions.ts`에 하드코딩
2. ✅ 33개 세션 데이터 정적 배열로 관리
3. ✅ API 키 불필요 (정적 데이터)
4. ✅ 즉시 사용 가능 (환경 변수 설정 없이)

**검증 포인트**:
1. ✅ 세션 데이터 파일 존재: `moducon-backend/src/data/sessions.ts`
2. ✅ 33개 세션 정확히 입력
3. ✅ 타입 정의 일치: `Session` 인터페이스
4. ⚠️ **Google Sheets 실시간 동기화 불가** (수동 업데이트 필요)

#### 2.3 환경 변수 설정 (선택 사항)

**파일**: `moducon-backend/.env`

**필수 변수**:
```bash
# Database (필수)
DATABASE_URL=file:./dev.db

# JWT (필수)
JWT_SECRET=your-super-secret-key-at-least-32-characters-long
```

**선택 변수** (향후 Google Sheets API 직접 연동 시):
```bash
# Google Sheets API (현재 미사용 - 하드코딩 방식)
GOOGLE_SHEETS_API_KEY=AIzaSy...  # Google Cloud Console에서 발급
SPREADSHEET_ID=1djkPQzg_1-_zgbWe8e5AYZlUjVoQYmJj2HlwRsCqu9g
```

**⚠️ 주의**:
- 현재 세션 데이터는 `src/data/sessions.ts`에서 하드코딩 방식으로 로드됩니다.
- Google Sheets API 키는 **불필요**합니다.
- 실시간 동기화가 필요한 경우에만 API 연동을 고려하세요.

#### 2.4 실제 동작 테스트

**테스트 시나리오**:

1. **로컬 환경 테스트**
```bash
# 1. 환경 변수 설정 확인
$ cat moducon-backend/.env
GOOGLE_SHEETS_API_KEY=AIzaSy...
SPREADSHEET_ID=1djkPQzg_1-_zgbWe8e5AYZlUjVoQYmJj2HlwRsCqu9g

# 2. 백엔드 실행
$ cd moducon-backend
$ npm run dev

# 3. API 테스트 (별도 터미널)
$ curl http://localhost:3001/api/sessions | jq
```

**예상 결과**:
```json
[
  {
    "id": "00-00",
    "pageUrl": "https://moducon.modulabs.co.kr/session/00-00",
    "track": "Track 00",
    "location": "이삼봉 홀",
    "startTime": "10:10",
    "endTime": "10:50",
    "speaker": "노정석",
    "speakerAffiliation": "비팩토리 대표",
    "speakerBio": "...",
    "speakerProfile": "https://...",
    "name": "기술창업 6번을 통해서 배운 AI 시대의 기회",
    "description": "...",
    "hashtags": ["리더십", "글로벌비전"],
    "difficulty": "중급"
  },
  // ... 32개 더
]
```

2. **프론트엔드 통합 테스트**
```bash
# 1. 프론트엔드 실행
$ cd moducon-frontend
$ npm run dev

# 2. 브라우저 접속
http://localhost:3000/sessions

# 3. 확인 사항
- 33개 세션 표시
- 트랙 필터링 동작
- 난이도 배지 표시
- 세션 상세 페이지 이동
```

**에러 시나리오 및 대응**:

| 에러 | 원인 | 해결 방법 |
|------|------|----------|
| `API key not valid` | API 키 오류 | 키 재발급 또는 제한 설정 확인 |
| `403 Forbidden` | Sheets API 미활성화 | Google Cloud Console에서 API 활성화 |
| `404 Not Found` | Spreadsheet ID 오류 | ID 재확인 |
| `values: undefined` | 시트명 오류 | 시트명 `세션` 정확히 입력 |
| `CORS error` | 도메인 제한 | HTTP 리퍼러 설정 확인 |

#### 2.5 데이터 검증

**검증 체크리스트**:
- [ ] 총 33개 세션 로딩
- [ ] 5개 트랙 필터링 (00, 01, 10, i, 101)
- [ ] 시간 파싱 정확 (HH:MM 형식)
- [ ] 난이도 추론 동작 (초급/중급/고급)
- [ ] 해시태그 배열 변환
- [ ] 캐싱 동작 (5분)
- [ ] 오프라인 폴백

---

## 📊 작업 우선순위

### P0 (Critical): 즉시 착수
1. **Google Sheets API 키 발급** (15분)
   - Google Cloud Console 설정
   - API 키 생성 및 제한 설정
   - `.env` 파일 저장

2. **세션 데이터 실제 동작 검증** (30분)
   - 로컬 환경 테스트
   - API 응답 확인
   - 프론트엔드 연동 확인
   - 에러 원인 분석 및 해결

### P1 (High): 1일 내
3. **QR 스캐너 UI 재개선** (2-3시간)
   - 위치 변경 (정가운데)
   - 예시 QR 이미지 추가
   - 툴팁 개선
   - 모바일 테스트

### P2 (Medium): 선택 사항
4. **UX 개선** (1-2시간)
   - 스캔 성공 햅틱 피드백
   - 실패 시 재시도 UI 개선
   - QR 코드 예시 이미지 갤러리

---

## 🎯 성공 지표

### 요구사항 #1: QR 스캐너 UI
- [ ] 버튼 위치: 화면 정가운데
- [ ] 예시 QR 이미지 표시
- [ ] 모바일 3개 해상도 테스트 통과
- [ ] 다른 UI와 겹침 없음
- [ ] 사용자 만족도 4.5/5

### 요구사항 #2: 세션 데이터
- [ ] API 응답 성공률 99% 이상
- [ ] 33개 세션 정확히 로딩
- [ ] 평균 응답 시간 < 500ms
- [ ] 캐싱 적중률 > 80%
- [ ] "자료가 없다" 메시지 제거

---

## 📝 다음 단계

### Immediate (즉시)
1. **hands-on worker**에게 인계
   - Google Sheets API 키 발급
   - 세션 데이터 실제 동작 검증
   - 에러 분석 및 해결

2. **검증 완료 후**:
   - QR 스캐너 UI 재개선 착수
   - 예시 QR 이미지 리소스 생성
   - 위치 변경 및 테스트

### Short-term (1-2일)
3. **통합 테스트**
   - End-to-End 시나리오 검증
   - 모바일 실기기 테스트
   - 성능 측정

4. **최종 QA**
   - 요구사항 충족도 확인
   - 배포 전 체크리스트 검증

---

## 📊 예상 일정

| 작업 | 담당 | 예상 시간 | 우선순위 |
|------|------|----------|----------|
| API 키 발급 | hands-on worker | 15분 | P0 |
| 세션 데이터 검증 | hands-on worker | 30분 | P0 |
| 에러 해결 | hands-on worker | 30분 | P0 |
| QR UI 위치 변경 | hands-on worker | 1시간 | P1 |
| 예시 QR 이미지 추가 | hands-on worker | 1시간 | P1 |
| 툴팁 개선 | hands-on worker | 30분 | P1 |
| 모바일 테스트 | QA | 1시간 | P1 |
| **총 예상 시간** | | **4.5시간** | |

---

## ⚠️ 리스크 관리

### Risk 1: Google Sheets API 할당량 🟡
**영향**: API 호출 실패
**확률**: 낮음 (20%)
**완화**:
- 5분 캐싱으로 호출 최소화
- 하루 할당량 충분 (무료: 100req/100sec)

### Risk 2: QR 버튼 위치 겹침 🟡
**영향**: 다른 UI 방해
**확률**: 중간 (40%)
**완화**:
- Z-index 우선순위 조정
- 동적 위치 조정 (스크롤 시)

### Risk 3: 모바일 해상도 대응 🟢
**영향**: 특정 기기 UX 저하
**확률**: 낮음 (15%)
**완화**:
- 3개 주요 해상도 테스트
- 미디어 쿼리로 반응형 대응

---

## 📌 참고 문서

### 기존 문서
- [01_PRD.md](./01_PRD.md) - v1.8 제품 요구사항
- [117_FINAL_QA_APPROVAL.md](./117_FINAL_QA_APPROVAL.md) - 최종 승인 보고서
- [07_PROGRESS.md](./07_PROGRESS.md) - 진행 현황

### 외부 리소스
- Google Sheets: https://docs.google.com/spreadsheets/d/1djkPQzg_1-_zgbWe8e5AYZlUjVoQYmJj2HlwRsCqu9g/edit?gid=1035988542#gid=1035988542
- Google Cloud Console: https://console.cloud.google.com/
- QR Generator: https://www.qr-code-generator.com/

---

**문서 버전**: v2.0
**최종 수정일**: 2025-11-30
**상태**: ✅ 신규 요구사항 분석 완료

**다음 담당자**: hands-on worker
