# 110_CODE_IMPROVEMENT_GUIDE.md - 코드 개선 가이드

**우선순위**: 🟡 High
**대상**: hands-on worker
**작성일**: 2025-11-30

---

## 📋 개선 작업 목록

### 🔴 P0 - 즉시 수정 (필수)
1. Session 타입 중복 정의 제거
2. QRScannerModal 카메라 클린업 개선

### 🟡 P1 - 우선 수정 (권장)
3. sessionStorage → localStorage 변경
4. QRFloatingButton 키보드 접근성 개선
5. parseTimeRange 에러 핸들링 개선
6. 기본 테스트 코드 작성

### 🟢 P2 - 개선 권장 (선택)
7. console.log → logger 교체
8. 툴팁 타이머 추가
9. Magic Number 상수화

---

## 1️⃣ Session 타입 중복 정의 제거 🔴

### 현재 문제

**파일 1**: `moducon-backend/src/types/session.ts`
```typescript
export interface Session {
  id: string;
  pageUrl: string;
  track: string;
  location: string;
  startTime: string;
  endTime: string;
  speaker: string;
  speakerAffiliation: string;
  speakerBio: string;
  speakerProfile: string;
  name: string;
  description: string;
  hashtags: string[];
  difficulty: '초급' | '중급' | '고급';
}
```

**파일 2**: `moducon-backend/src/services/googleSheetsService.ts`
```typescript
// ❌ 중복 정의!
export interface Session {
  id: string;
  name: string;
  track: string;
  // ... 10개 필드 (4개 누락)
}
```

### 해결 방법

**Step 1**: `googleSheetsService.ts`에서 중복 타입 제거

```typescript
// ❌ 삭제
export interface Session {
  // ...
}

// ✅ 추가
import { Session, SessionRaw, TimeRange } from '../types/session.js';
```

**Step 2**: getSessions() 함수 수정

```typescript
export async function getSessions(): Promise<Session[]> {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;

    const response = await axios.get(url);
    const rows = response.data.values || [];

    return rows.map((row: string[]) => {
      const timeRange = parseTimeRange(row[4]);
      const hashtags = [row[11], row[12], row[13]].filter(Boolean);

      return {
        id: row[0],
        pageUrl: row[1],  // ✅ 추가
        track: row[2],
        location: row[3],
        startTime: timeRange?.start || '',
        endTime: timeRange?.end || '',
        speaker: row[5],
        speakerAffiliation: row[6],  // ✅ 추가
        speakerBio: row[7],  // ✅ 추가
        speakerProfile: row[8],  // ✅ 추가
        name: row[9],
        description: row[10],
        hashtags,
        difficulty: calculateDifficulty(hashtags)
      };
    });
  } catch (error: any) {
    console.error('Google Sheets 데이터 가져오기 실패:', error.message);
    throw new Error('Failed to fetch sessions from Google Sheets');
  }
}
```

**Step 3**: Booth, Paper 타입도 정리

```typescript
// ❌ 삭제 (별도 파일로 분리)
export interface Booth { ... }
export interface Paper { ... }

// ✅ 새 파일 생성
// src/types/booth.ts
export interface Booth { ... }

// src/types/paper.ts
export interface Paper { ... }

// googleSheetsService.ts에서 import
import { Booth } from '../types/booth.js';
import { Paper } from '../types/paper.js';
```

---

## 2️⃣ QRScannerModal 카메라 클린업 개선 🔴

### 현재 문제

```typescript
// ❌ async 함수를 await 없이 호출
return () => {
  if (scanner.isScanning) {
    scanner.stop();  // Promise 반환하는데 await 없음
  }
};
```

### 해결 방법

**파일**: `moducon-frontend/src/components/qr/QRScannerModal.tsx`

```typescript
useEffect(() => {
  const scanner = new Html5Qrcode('qr-reader-modal');
  scannerRef.current = scanner;

  // 카메라 시작
  scanner
    .start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      (decodedText) => {
        setIsScanning(false);
        onScan(decodedText);
      },
      (errorMessage) => {
        if (!errorMessage.includes('No QR code found')) {
          setError('카메라 접근 권한을 확인해주세요');
        }
      }
    )
    .then(() => setIsScanning(true))
    .catch((err) => {
      setError('카메라를 시작할 수 없습니다');
      console.error('카메라 시작 실패:', err);
    });

  // ✅ 개선된 클린업
  return () => {
    if (scannerRef.current) {
      scannerRef.current.stop()
        .then(() => {
          console.log('카메라 정지 완료');
          scannerRef.current?.clear();
        })
        .catch((err) => {
          // 이미 정지된 경우 에러 무시
          if (!err.message?.includes('not started')) {
            console.error('카메라 정지 실패:', err);
          }
        });
    }
  };
}, [onScan]);
```

**추가 개선**: 메모리 누수 방지

```typescript
const [mounted, setMounted] = useState(true);

useEffect(() => {
  return () => {
    setMounted(false);  // 언마운트 플래그
  };
}, []);

// 스캔 성공 핸들러에서 마운트 체크
(decodedText) => {
  if (!mounted) return;  // ✅ 언마운트 후 상태 업데이트 방지
  setIsScanning(false);
  onScan(decodedText);
}
```

---

## 3️⃣ sessionStorage → localStorage 변경 🟡

### 현재 문제

```typescript
// ❌ sessionStorage: 탭 닫으면 삭제됨
const cached = sessionStorage.getItem(CACHE_KEY);
const timestamp = sessionStorage.getItem(CACHE_TIMESTAMP_KEY);
```

**이슈**:
- 새 탭에서 매번 API 호출
- 5분 캐싱 전략 무의미

### 해결 방법

**파일**: `moducon-frontend/src/lib/sessionCache.ts`

```typescript
import type { Session } from '@/types/session';

const CACHE_KEY = 'moducon_sessions';
const CACHE_TIMESTAMP_KEY = 'moducon_sessions_timestamp';
const CACHE_VERSION_KEY = 'moducon_sessions_version';
const CACHE_DURATION = 5 * 60 * 1000; // 5분
const CACHE_VERSION = '1.0'; // 스키마 변경 시 버전 업

/**
 * localStorage를 사용한 세션 데이터 캐싱
 * - 탭 간 공유
 * - 브라우저 재시작 후에도 유지
 * - 버전 관리로 스키마 변경 대응
 */
export async function fetchSessionsWithCache(
  track?: string
): Promise<Session[]> {
  try {
    // ✅ localStorage 사용
    const cached = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    const version = localStorage.getItem(CACHE_VERSION_KEY);

    // 버전 체크
    if (version !== CACHE_VERSION) {
      console.log('캐시 버전 불일치, 무효화');
      invalidateSessionsCache();
    }

    // 캐시 유효성 체크
    if (cached && timestamp) {
      const age = Date.now() - parseInt(timestamp);
      if (age < CACHE_DURATION) {
        console.log(`캐시 히트 (${Math.floor(age / 1000)}초 전)`);
        const allSessions = JSON.parse(cached);
        return track
          ? allSessions.filter((s: Session) => s.track === track)
          : allSessions;
      } else {
        console.log('캐시 만료');
      }
    }

    // API 호출
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const url = track
      ? `${API_URL}/api/sessions?track=${encodeURIComponent(track)}`
      : `${API_URL}/api/sessions`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status}`);
    }

    const result = await response.json();
    const sessions = result.data || [];

    // ✅ localStorage에 캐시 저장
    localStorage.setItem(CACHE_KEY, JSON.stringify(sessions));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    localStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
    console.log(`캐시 저장 (${sessions.length}개 세션)`);

    return sessions;
  } catch (error) {
    console.error('세션 로딩 실패:', error);

    // ✅ 오프라인 시 캐시 데이터 반환
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      console.warn('오프라인 모드: 캐시 데이터 사용');
      const allSessions = JSON.parse(cached);
      return track
        ? allSessions.filter((s: Session) => s.track === track)
        : allSessions;
    }

    throw error;
  }
}

/**
 * 캐시 무효화 (수동 갱신 시)
 */
export function invalidateSessionsCache() {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_TIMESTAMP_KEY);
  localStorage.removeItem(CACHE_VERSION_KEY);
  console.log('캐시 무효화 완료');
}

/**
 * 캐시 상태 확인 (디버깅용)
 */
export function getCacheStatus() {
  const cached = localStorage.getItem(CACHE_KEY);
  const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

  if (!cached || !timestamp) {
    return { exists: false };
  }

  const age = Date.now() - parseInt(timestamp);
  const sessions = JSON.parse(cached);

  return {
    exists: true,
    count: sessions.length,
    ageSeconds: Math.floor(age / 1000),
    valid: age < CACHE_DURATION
  };
}
```

**추가 개선**: 오프라인 감지

```typescript
// src/hooks/useOnlineStatus.ts
import { useState, useEffect } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

**사용**: `sessions/page.tsx`

```typescript
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export default function SessionsPage() {
  const isOnline = useOnlineStatus();

  return (
    <div>
      {!isOnline && (
        <div className="bg-yellow-100 border border-yellow-400 px-4 py-2 rounded mb-4">
          ⚠️ 오프라인 모드: 캐시된 데이터를 표시하고 있습니다.
        </div>
      )}
      {/* ... */}
    </div>
  );
}
```

---

## 4️⃣ QRFloatingButton 키보드 접근성 개선 🟡

### 현재 문제

```tsx
// ❌ 키보드 이벤트 처리 없음
<button
  onClick={() => setIsModalOpen(true)}
  aria-label="QR 코드 스캔하기"
>
```

### 해결 방법

**파일**: `moducon-frontend/src/components/qr/QRFloatingButton.tsx`

```tsx
'use client';

import { useState, useEffect } from 'react';
import { QRScannerModal } from './QRScannerModal';
import { QRIcon } from './icons/QRIcon';

interface QRFloatingButtonProps {
  onScan: (data: string) => void;
  position?: 'bottom-center' | 'bottom-right';
}

export function QRFloatingButton({
  onScan,
  position = 'bottom-center'
}: QRFloatingButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  // ✅ 툴팁 타이머 추가
  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleScan = (data: string) => {
    onScan(data);
    setIsModalOpen(false);

    // 햅틱 피드백 (지원 기기만)
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  };

  // ✅ 키보드 이벤트 핸들러
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    // Enter 또는 Space로 활성화
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsModalOpen(true);
    }
    // Escape로 닫기
    if (e.key === 'Escape' && isModalOpen) {
      setIsModalOpen(false);
    }
  };

  const positionClasses = {
    'bottom-center': 'left-1/2 -translate-x-1/2 bottom-24',
    'bottom-right': 'right-8 bottom-24'
  };

  return (
    <>
      {/* 원형 버튼 */}
      <button
        onClick={() => setIsModalOpen(true)}
        onKeyDown={handleKeyDown}  // ✅ 키보드 이벤트
        className={`
          fixed ${positionClasses[position]} z-50
          w-[120px] h-[120px] rounded-full
          bg-gradient-to-br from-primary to-primary/80
          shadow-lg hover:shadow-xl
          transition-all duration-300 hover:scale-110
          focus:outline-none focus:ring-4 focus:ring-primary/50
          flex items-center justify-center
          group
        `}
        aria-label="QR 코드 스캔하기"
        role="button"
        tabIndex={0}  // ✅ 키보드 포커스 가능
      >
        {/* Pulse Animation */}
        <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />

        {/* QR Icon */}
        <QRIcon className="w-16 h-16 text-white relative z-10" />

        {/* Tooltip (3초 후 자동 사라짐) */}
        {showTooltip && (
          <div
            className="
              absolute -top-12 left-1/2 -translate-x-1/2
              bg-black/80 text-white text-sm px-3 py-1.5 rounded
              whitespace-nowrap
              animate-fade-in-out
            "
            role="tooltip"  // ✅ 접근성 역할
          >
            QR 코드를 스캔하세요
          </div>
        )}
      </button>

      {/* 스캔 모달 */}
      {isModalOpen && (
        <QRScannerModal
          onScan={handleScan}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
```

**추가 개선**: 포커스 트랩 (모달 열렸을 때)

```tsx
// QRScannerModal.tsx에 추가
import { useEffect, useRef } from 'react';

export function QRScannerModal({ onScan, onClose }: QRScannerModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // ✅ 모달 열릴 때 닫기 버튼에 포커스
  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  // ✅ Escape 키로 닫기
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black"
      role="dialog"  // ✅ 접근성 역할
      aria-modal="true"  // ✅ 모달임을 명시
      aria-labelledby="qr-scanner-title"
    >
      <h2 id="qr-scanner-title" className="sr-only">
        QR 코드 스캐너
      </h2>

      {/* 닫기 버튼 */}
      <button
        ref={closeButtonRef}  // ✅ ref 추가
        onClick={onClose}
        className="..."
        aria-label="닫기"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* ... */}
    </div>
  );
}
```

---

## 5️⃣ parseTimeRange 에러 핸들링 개선 🟡

### 현재 문제

```typescript
function parseTimeRange(timeRange: string): TimeRange | null {
  const match = timeRange.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);
  if (!match) {
    console.warn(`Invalid time format: ${timeRange}`);
    return null;  // ❌ null 반환
  }
  return { start: match[1], end: match[2] };
}

// 사용처에서
startTime: timeRange?.start || '',  // ⚠️ 빈 문자열 반환
```

### 해결 방법

**Option 1**: 예외 던지기 (엄격)

```typescript
/**
 * 시간 범위 파싱
 * @throws {Error} 잘못된 시간 형식
 */
function parseTimeRange(timeRange: string): TimeRange {
  const match = timeRange.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);
  if (!match) {
    throw new Error(`Invalid time format: "${timeRange}". Expected format: "HH:MM-HH:MM"`);
  }
  return { start: match[1], end: match[2] };
}

// 사용처에서 try-catch
export async function getSessions(): Promise<Session[]> {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;
    const response = await axios.get(url);
    const rows = response.data.values || [];

    return rows
      .map((row: string[], index: number) => {
        try {
          const timeRange = parseTimeRange(row[4]);
          const hashtags = [row[11], row[12], row[13]].filter(Boolean);

          return {
            id: row[0],
            pageUrl: row[1],
            track: row[2],
            location: row[3],
            startTime: timeRange.start,  // ✅ null 체크 불필요
            endTime: timeRange.end,
            speaker: row[5],
            speakerAffiliation: row[6],
            speakerBio: row[7],
            speakerProfile: row[8],
            name: row[9],
            description: row[10],
            hashtags,
            difficulty: calculateDifficulty(hashtags)
          };
        } catch (error) {
          console.error(`행 ${index + 2} 파싱 실패:`, error);
          return null;
        }
      })
      .filter((session): session is Session => session !== null);
  } catch (error: any) {
    console.error('Google Sheets 데이터 가져오기 실패:', error.message);
    throw new Error('Failed to fetch sessions from Google Sheets');
  }
}
```

**Option 2**: 기본값 반환 (관대)

```typescript
/**
 * 시간 범위 파싱 (기본값 반환)
 */
function parseTimeRange(timeRange: string): TimeRange {
  const match = timeRange.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);
  if (!match) {
    console.warn(`Invalid time format: "${timeRange}". Using default.`);
    return { start: '00:00', end: '00:00' };
  }
  return { start: match[1], end: match[2] };
}
```

**Option 3**: Result 타입 사용 (함수형)

```typescript
type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function parseTimeRange(timeRange: string): Result<TimeRange, string> {
  const match = timeRange.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);
  if (!match) {
    return {
      ok: false,
      error: `Invalid time format: "${timeRange}"`
    };
  }
  return {
    ok: true,
    value: { start: match[1], end: match[2] }
  };
}

// 사용
const result = parseTimeRange(row[4]);
if (result.ok) {
  startTime = result.value.start;
} else {
  console.error(result.error);
  startTime = '00:00';
}
```

**권장**: Option 1 (예외 던지기) + 상세 로깅

---

## 📋 개선 체크리스트

### 🔴 P0 (즉시)
- [ ] Session 타입 중복 정의 제거
- [ ] googleSheetsService.ts에서 4개 필드 추가
- [ ] QRScannerModal 카메라 클린업 async 처리

### 🟡 P1 (1-2일)
- [ ] sessionStorage → localStorage 변경
- [ ] 오프라인 감지 및 캐시 폴백 추가
- [ ] QRFloatingButton 키보드 이벤트 추가
- [ ] 툴팁 타이머 구현
- [ ] parseTimeRange 예외 처리 개선

### 🟢 P2 (선택)
- [ ] console.log → logger 교체
- [ ] Magic Number 상수화
- [ ] ARIA 속성 추가
- [ ] 포커스 트랩 구현

---

**다음 작업**: 테스트 코드 작성 가이드 (111번 문서)
