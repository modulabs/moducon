# 01_PRD.md - Product Requirements Document

**프로젝트명**: 모두콘 2025 디지털 컨퍼런스 북 개선
**버전**: v1.8
**작성일**: 2025-11-30
**작성자**: Technical Lead
**승인자**: Product Owner

---

## 📋 Executive Summary

모두콘 2025 디지털 컨퍼런스 북은 게임화된 퀘스트 기반 컨퍼런스 경험을 제공하는 Progressive Web App입니다. 현재 기본 인프라는 완료되었으나, **QR 스캐너 UX 개선**과 **실제 세션 데이터 통합** 작업이 필요합니다.

### 현재 상태
- ✅ 백엔드 서명 기능 완료 (96/100점)
- ✅ 부스 데이터 하드코딩 완료 (13개)
- ✅ 포스터 데이터 하드코딩 완료 (33개)
- ✅ Google Sheets API 인프라 준비 완료
- ⚠️ QR 스캐너 UX 미흡
- ⚠️ 세션 데이터 실제 연동 필요

### 이번 작업 목표
1. **QR 스캐너 UI/UX 개선**: 사용자 친화적인 원형 버튼 인터페이스 구현
2. **세션 데이터 실시간 연동**: Google Sheets 33개 세션 데이터 통합

---

## 🎯 프로젝트 개요

### 비전
"AI/SW 트렌드를 탐험하는 게임화된 컨퍼런스 경험"

### 미션
컨퍼런스 참가자에게 퀘스트 기반 탐험 경험을 제공하여 능동적 참여와 네트워킹을 촉진

### 핵심 가치 제안
1. **게임화된 경험**: 퀘스트, 배지, 히든 요소를 통한 재미
2. **개인화 추천**: 관심사 기반 동선 최적화
3. **실시간 정보**: 세션, 부스, 혼잡도 즉시 반영
4. **오픈소스 기여**: GitHub 공개로 커뮤니티 확산

---

## 📊 타겟 사용자

### Primary Persona
1. **탐험가 지수** (주니어 개발자)
   - 목표: 다양한 기술 트렌드 탐색
   - 니즈: 쉬운 네비게이션, 초보자 친화적 설명

2. **연구자 민지** (대학원생)
   - 목표: 최신 논문 및 연구 동향 파악
   - 니즈: 학회별 포스터 필터링, 연구자 네트워킹

3. **매니저 현우** (팀 리드)
   - 목표: 기술 트렌드 파악 및 팀 적용 방안 모색
   - 니즈: 효율적 일정 관리, 핵심 세션 집중

4. **초보자 서연** (대학생)
   - 목표: AI 분야 입문 및 커리어 탐색
   - 니즈: 쉬운 이해, 단계별 학습 가이드

### 사용 목표
- 앱 사용률: 80% (전체 참가자 기준)
- 퀘스트 완료율: 60%
- 부스 방문 증가: +40% (기존 컨퍼런스 대비)
- 참가자 만족도: 4.5/5

---

## 🔧 신규 요구사항 (v1.8)

### 요구사항 1: QR 스캐너 UI 개선

#### 현재 문제점
```typescript
// 현재: 기본 html5-qrcode UI
<div id="qr-reader" className="w-full max-w-md" />
```
- 다른 UI 요소와 분리되지 않음
- 사용자 가이드 부족
- 모바일 UX 최적화 미흡

#### 개선 요구사항
> "정 가운데 다른 UI와 분리하여 원형 안에 예시 QR 이미지가 있는 아이콘으로 QR을 찍는 기능"

#### 상세 명세
1. **원형 버튼 디자인**
   - 위치: 화면 정중앙 (absolute positioning)
   - 크기: 120px × 120px
   - 배경: 반투명 그라데이션 (primary color)
   - 아이콘: QR 코드 SVG (white, 60px)

2. **카메라 모달**
   - 버튼 클릭 시 전체 화면 모달
   - 후방 카메라 자동 선택 (`facingMode: 'environment'`)
   - 스캔 가이드라인 표시 (250px × 250px 중앙 박스)
   - 스캔 성공 시 햅틱 피드백

3. **사용자 가이드**
   - 첫 사용 시 간단한 툴팁 (3초 자동 사라짐)
   - 스캔 실패 시 재시도 안내
   - QR 코드 예시 이미지 제공

4. **접근성**
   - ARIA 라벨: "QR 코드 스캔하기"
   - 키보드 접근 가능 (Tab 키)
   - 고대비 모드 지원

#### 성공 지표
- QR 스캔 성공률: 95% 이상
- 첫 스캔까지 평균 시간: 5초 이내
- UX 만족도: 4.5/5

---

### 요구사항 2: 세션 데이터 Google Sheets 연동

#### 현재 문제점
```typescript
// 백엔드: getSessions() 함수가 빈 배열 반환
export async function getSessions(): Promise<Session[]> {
  return []; // 하드코딩 데이터 없음
}

// 프론트엔드: API 호출하지만 데이터 없음
const data = await fetchSessions(activeTrack || undefined);
// 결과: "세션 데이터가 없습니다" 메시지 표시
```

#### 데이터 소스
- **Google Sheets ID**: `1djkPQzg_1-_zgbWe8e5AYZlUjVoQYmJj2HlwRsCqu9g`
- **시트명**: `세션`
- **데이터 규모**: 33개 세션 × 14개 필드

#### 데이터 스키마
| 필드명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| 번호 | string | 세션 고유 ID | "00-00", "01-01" |
| 페이지 | string | 세션 상세 페이지 URL | "https://moducon.modulabs.co.kr/session/00-00" |
| 트랙 | string | 트랙 분류 | "Track 00", "Track 01" |
| 위치 | string | 장소 | "이삼봉 홀", "컨퍼런스홀 B" |
| 발표-시간 | string | 시간 범위 (파싱 필요) | "10:10-10:50" |
| 연사-명 | string | 연사 이름 | "노정석" |
| 연사-소속 | string | 소속 기관 | "비팩토리 대표" |
| 연사-소개 | string | 연사 약력 | "..." (최대 500자) |
| 연사-프로필 | string | 프로필 이미지 URL | "https://drive.google.com/..." |
| 발표-제목 | string | 세션 제목 | "기술창업 6번을 통해서 배운 AI 시대의 기회" |
| 발표-내용 | string | 세션 설명 | "..." (최대 500자) |
| 키워드1-3 | string[] | 해시태그 (배열 변환) | ["리더십", "글로벌비전"] |

#### 기술적 요구사항

**1. 백엔드 구현**
```typescript
// moducon-backend/src/services/googleSheetsService.ts

export async function getSessions(): Promise<Session[]> {
  try {
    // Google Sheets MCP 호출
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/세션!A2:N`,
      {
        headers: {
          'Authorization': `Bearer ${GOOGLE_SHEETS_API_KEY}`
        }
      }
    );

    const data = await response.json();
    const rows = data.values || [];

    // 데이터 파싱 및 변환
    return rows.map(row => ({
      id: row[0],
      pageUrl: row[1],
      track: row[2],
      location: row[3],
      startTime: parseTime(row[4])?.start || '',
      endTime: parseTime(row[4])?.end || '',
      speaker: row[5],
      speakerAffiliation: row[6],
      speakerBio: row[7],
      speakerProfile: row[8],
      name: row[9],
      description: row[10],
      hashtags: [row[11], row[12], row[13]].filter(Boolean),
      difficulty: calculateDifficulty(row[11], row[12], row[13]) // 키워드 기반 추론
    }));
  } catch (error) {
    console.error('세션 데이터 가져오기 실패:', error);
    return [];
  }
}

// 시간 파싱 유틸리티
function parseTime(timeRange: string): { start: string; end: string } | null {
  // "10:10-10:50" → { start: "10:10", end: "10:50" }
  const match = timeRange.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);
  if (!match) return null;
  return { start: match[1], end: match[2] };
}

// 난이도 추론 (키워드 기반)
function calculateDifficulty(
  keyword1: string,
  keyword2: string,
  keyword3: string
): '초급' | '중급' | '고급' {
  const keywords = [keyword1, keyword2, keyword3].filter(Boolean);
  const advanced = ['딥테크', '양자컴퓨팅', '가속기'];
  const beginner = ['입문', '초보', '바이브코딩'];

  if (keywords.some(k => advanced.includes(k))) return '고급';
  if (keywords.some(k => beginner.includes(k))) return '초급';
  return '중급';
}
```

**2. 프론트엔드 타입 정의**
```typescript
// moducon-frontend/src/types/session.ts

export interface Session {
  id: string;
  pageUrl: string;
  track: string;
  location: string;
  startTime: string; // "HH:MM" 형식
  endTime: string;
  speaker: string;
  speakerAffiliation: string;
  speakerBio: string;
  speakerProfile: string;
  name: string; // 세션 제목
  description: string;
  hashtags: string[];
  difficulty: '초급' | '중급' | '고급';
}
```

**3. 캐싱 전략**
```typescript
// 5분 캐싱 (sessionStorage)
const CACHE_DURATION = 5 * 60 * 1000;

export async function fetchSessionsWithCache(): Promise<Session[]> {
  const cached = sessionStorage.getItem('sessions');
  const timestamp = sessionStorage.getItem('sessions_timestamp');

  if (cached && timestamp) {
    const age = Date.now() - parseInt(timestamp);
    if (age < CACHE_DURATION) {
      return JSON.parse(cached);
    }
  }

  const data = await fetchSessions();
  sessionStorage.setItem('sessions', JSON.stringify(data));
  sessionStorage.setItem('sessions_timestamp', Date.now().toString());

  return data;
}
```

#### 성공 지표
- 세션 데이터 로딩 성공률: 99% 이상
- 평균 응답 시간: 500ms 이내 (캐시 적중 시 < 10ms)
- 데이터 일관성: Google Sheets 변경 후 5분 이내 반영

---

## 🎨 UX/UI 개선 사항

### QR 스캐너 플로우
```
사용자 진입 (홈/부스/세션 페이지)
  ↓
원형 QR 버튼 클릭 (화면 중앙 하단 고정)
  ↓
전체 화면 카메라 모달 오픈
  ↓
후방 카메라 자동 활성화
  ↓
QR 코드 인식 (250px 가이드라인 표시)
  ↓
성공: 햅틱 피드백 + 체크인 완료 메시지
실패: 재시도 안내 + 예시 QR 표시
```

### 세션 페이지 개선
```
세션 목록 페이지 (/sessions)
  ↓
트랙 필터 (Track 00, 01, 10, i, 101)
  ↓
세션 카드 (33개)
  - 트랙 배지 (색상 구분)
  - 난이도 배지 (초급/중급/고급)
  - 세션 제목
  - 연사 정보 (이름, 소속)
  - 시간 및 장소
  - 해시태그 (최대 3개)
  - "내 일정에 추가" 버튼
  ↓
세션 상세 페이지 (클릭 시)
  - 연사 프로필 이미지
  - 연사 약력
  - 세션 상세 설명
  - 관련 세션 추천
```

---

## 🔒 기술적 제약사항

### 필수 준수 사항
1. **PWA 호환성**: iOS Safari, Android Chrome 지원
2. **카메라 권한**: 사용자 명시적 동의 필요
3. **오프라인 지원**: Service Worker를 통한 주요 데이터 캐싱
4. **성능**: 초기 로딩 < 3초, QR 스캔 응답 < 1초

### 의존성
- **html5-qrcode**: v2.3.8 (QR 스캔 라이브러리)
- **Google Sheets API**: v4 (데이터 소스)
- **Next.js**: v16 (프레임워크)
- **Tailwind CSS**: v4 (스타일링)

### 보안 요구사항
- Google Sheets API 키: 환경 변수 관리 (`.env.local`)
- QR 코드 검증: 백엔드에서 유효성 확인
- CORS 설정: 허용된 도메인만 API 접근

---

## 📈 성공 지표 (KPI)

### 정량적 지표
| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| QR 스캔 성공률 | 95% 이상 | 스캔 시도 대비 성공 횟수 |
| 세션 데이터 로딩 성공률 | 99% 이상 | API 호출 성공 비율 |
| 평균 QR 스캔 시간 | 5초 이내 | 버튼 클릭 → 스캔 성공 |
| 세션 페이지 응답 시간 | 500ms 이내 | API 응답 시간 (캐시 제외) |
| 앱 사용률 | 80% | 전체 참가자 대비 |

### 정성적 지표
| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| UX 만족도 | 4.5/5 | 사용자 설문조사 |
| QR 스캔 편의성 | "매우 편함" 70% 이상 | 사용자 피드백 |
| 세션 정보 만족도 | 4.0/5 이상 | 설문조사 |

---

## 🚀 우선순위 및 일정

### Phase 1: 핵심 기능 개선 (D-14일 이내)
**우선순위: P0 (Critical)**

#### Week 1: QR 스캐너 UI 개선 (2-4시간)
- [ ] 원형 버튼 컴포넌트 제작
- [ ] QR 아이콘 SVG 추가
- [ ] 카메라 모달 재설계
- [ ] 후방 카메라 자동 선택 검증

#### Week 1: 세션 데이터 통합 (4-6시간)
- [ ] Google Sheets API 연동 함수 작성
- [ ] Session 타입 정의 (14개 필드)
- [ ] 트랙별 필터링 로직
- [ ] 시간대별 정렬
- [ ] 캐싱 전략 구현

#### Week 1: 에러 처리 강화 (2시간)
- [ ] 네트워크 오류 시 재시도
- [ ] 친절한 에러 메시지
- [ ] 로딩 상태 표시

### Phase 2: 선택적 개선 (행사 후)
**우선순위: P2 (Nice to Have)**
- 퀘스트 자동 생성 (8-12시간)
- 실시간 혼잡도 (6-8시간)
- 배지 시스템 (4-6시간)

---

## 🔍 리스크 관리

### High Risk 🔴
1. **시간 압박**: D-14일, 핵심 기능 미완성
   - **완화**: 신규 기능 축소, 핵심만 완성

2. **Google Sheets API 제한**: 분당 100회
   - **완화**: 5분 캐싱 + 수동 갱신 버튼

3. **네트워크 의존**: 오프라인 시 QR 인증 불가
   - **완화**: 중요 데이터만 Service Worker 캐싱

### Medium Risk 🟡
1. **사용자 온보딩**: 퀘스트 시스템 이해에 시간 소요
   - **완화**: 첫 화면에 간단한 튜토리얼

2. **성능**: 500-1500명 동시 접속 시 부하
   - **완화**: CDN + 캐싱 전략

---

## 📝 참고 문서

### 내부 문서
- [94_FINAL_APPROVAL.md](./94_FINAL_APPROVAL.md): 이전 배포 승인 기록
- [MODUCON_PRODUCT_ANALYSIS_REPORT.md](./MODUCON_PRODUCT_ANALYSIS_REPORT.md): 제품 분석 보고서

### 외부 리소스
- Google Sheets: https://docs.google.com/spreadsheets/d/1djkPQzg_1-_zgbWe8e5AYZlUjVoQYmJj2HlwRsCqu9g/edit
- html5-qrcode 문서: https://github.com/mebjas/html5-qrcode

---

**문서 버전**: v1.8
**최종 수정일**: 2025-11-30
**다음 검토 예정일**: 개발 완료 후
