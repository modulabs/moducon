# 02_TECHNICAL_REQUIREMENTS.md - 기술 요구사항 명세

**프로젝트명**: 모두콘 2025 디지털 컨퍼런스 북 개선
**버전**: v1.0
**작성일**: 2025-11-30
**작성자**: Technical Lead

---

## 📋 개요

PRD v1.8에서 정의한 신규 요구사항 2개에 대한 상세 기술 명세서입니다.

### 작업 범위
1. **QR 스캐너 UI/UX 개선**: 원형 버튼 인터페이스 구현
2. **세션 데이터 실시간 연동**: Google Sheets 33개 세션 통합

---

## 🎯 요구사항 1: QR 스캐너 UI 개선

### 1.1 현재 상태 분석

#### 기존 코드
```typescript
// moducon-frontend/src/components/qr/QRScanner.tsx
export function QRScanner({ onScan, onError }: QRScannerProps) {
  return (
    <div className="flex flex-col items-center">
      <div id="qr-reader" className="w-full max-w-md" />
      <p className="mt-4 text-sm text-muted-foreground">
        QR 코드를 카메라에 비춰주세요
      </p>
    </div>
  );
}
```

#### 문제점
- ❌ 화면 전체를 차지하는 큰 스캔 영역
- ❌ 다른 UI 요소와 분리되지 않음
- ❌ 모바일 UX 최적화 미흡
- ❌ 시각적 가이드 부족

### 1.2 개선 설계

#### 컴포넌트 구조
```
QRFloatingButton (신규)
├── CircleButton (원형 버튼)
│   ├── QR Icon SVG
│   └── Pulse Animation
└── QRScannerModal (전체 화면 모달)
    ├── CameraView (카메라 뷰)
    ├── ScanGuide (스캔 가이드라인)
    ├── Instructions (사용 안내)
    └── CloseButton (닫기 버튼)
```

#### 파일 구조
```
moducon-frontend/src/components/qr/
├── QRFloatingButton.tsx (신규)
├── QRScannerModal.tsx (신규)
├── QRScanner.tsx (기존 - 내부 로직으로 변경)
└── icons/
    └── QRIcon.tsx (신규 SVG 컴포넌트)
```

### 1.3 상세 구현 명세

#### 1.3.1 QRFloatingButton.tsx
```typescript
'use client';

import { useState } from 'react';
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

  const handleScan = (data: string) => {
    onScan(data);
    setIsModalOpen(false);

    // 햅틱 피드백 (지원 기기만)
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
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
        className={`
          fixed ${positionClasses[position]} z-50
          w-[120px] h-[120px] rounded-full
          bg-gradient-to-br from-primary to-primary/80
          shadow-lg hover:shadow-xl
          transition-all duration-300 hover:scale-110
          flex items-center justify-center
          group
        `}
        aria-label="QR 코드 스캔하기"
      >
        {/* Pulse Animation */}
        <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />

        {/* QR Icon */}
        <QRIcon className="w-16 h-16 text-white relative z-10" />

        {/* Tooltip (3초 후 자동 사라짐) */}
        {showTooltip && (
          <div className="
            absolute -top-12 left-1/2 -translate-x-1/2
            bg-black/80 text-white text-sm px-3 py-1.5 rounded
            whitespace-nowrap
            animate-fade-in-out
          ">
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

#### 1.3.2 QRScannerModal.tsx
```typescript
'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X } from 'lucide-react';

interface QRScannerModalProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export function QRScannerModal({ onScan, onClose }: QRScannerModalProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader-modal');
    scannerRef.current = scanner;

    // 카메라 시작
    scanner
      .start(
        { facingMode: 'environment' }, // 후방 카메라
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
          // 스캔 시도 중 에러는 무시 (계속 시도)
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

    // 클린업
    return () => {
      if (scanner.isScanning) {
        scanner.stop();
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      {/* 닫기 버튼 */}
      <button
        onClick={onClose}
        className="
          absolute top-4 right-4 z-10
          w-12 h-12 rounded-full bg-white/10
          flex items-center justify-center
          hover:bg-white/20 transition-colors
        "
        aria-label="닫기"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* 카메라 뷰 */}
      <div className="relative h-full flex flex-col items-center justify-center">
        <div id="qr-reader-modal" className="w-full max-w-md" />

        {/* 스캔 가이드라인 오버레이 */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="
              absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
              w-[250px] h-[250px]
              border-4 border-white/50 rounded-lg
              shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]
            ">
              {/* 모서리 강조 */}
              <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-white" />
              <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-white" />
              <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-white" />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-white" />
            </div>
          </div>
        )}

        {/* 안내 메시지 */}
        <div className="absolute bottom-24 left-0 right-0 text-center px-4">
          {error ? (
            <p className="text-red-400 text-sm">{error}</p>
          ) : (
            <div className="space-y-2">
              <p className="text-white text-lg font-medium">
                QR 코드를 사각형 안에 맞춰주세요
              </p>
              <p className="text-white/70 text-sm">
                세션, 부스, 포스터 QR 코드를 스캔할 수 있습니다
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

#### 1.3.3 QRIcon.tsx (SVG 컴포넌트)
```typescript
export function QRIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* QR 코드 심볼 */}
      <rect x="3" y="3" width="7" height="7" rx="1" fill="currentColor" />
      <rect x="14" y="3" width="7" height="7" rx="1" fill="currentColor" />
      <rect x="3" y="14" width="7" height="7" rx="1" fill="currentColor" />
      <rect x="14" y="14" width="3" height="3" fill="currentColor" />
      <rect x="18" y="14" width="3" height="3" fill="currentColor" />
      <rect x="14" y="18" width="3" height="3" fill="currentColor" />
      <rect x="18" y="18" width="3" height="3" fill="currentColor" />
    </svg>
  );
}
```

### 1.4 Tailwind CSS 설정 추가

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      animation: {
        'fade-in-out': 'fadeInOut 3s ease-in-out forwards',
        'ping': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
      },
      keyframes: {
        fadeInOut: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '20%': { opacity: '1', transform: 'translateY(0)' },
          '80%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-10px)' }
        }
      }
    }
  }
};
```

### 1.5 통합 방법

```typescript
// moducon-frontend/src/app/home/page.tsx
import { QRFloatingButton } from '@/components/qr/QRFloatingButton';

export default function HomePage() {
  const handleQRScan = async (data: string) => {
    try {
      // QR 코드 검증 및 처리
      const response = await fetch('/api/verify-qr', {
        method: 'POST',
        body: JSON.stringify({ qrCode: data })
      });

      if (response.ok) {
        // 성공 처리 (체크인, 포인트 적립 등)
        showSuccessToast('체크인 완료!');
      }
    } catch (error) {
      console.error('QR 처리 실패:', error);
      showErrorToast('QR 코드를 다시 스캔해주세요');
    }
  };

  return (
    <div>
      {/* 기존 페이지 콘텐츠 */}

      {/* QR 스캔 버튼 (모든 페이지에 고정) */}
      <QRFloatingButton onScan={handleQRScan} />
    </div>
  );
}
```

---

## 📊 요구사항 2: 세션 데이터 Google Sheets 연동

### 2.1 데이터 소스 분석

#### Google Sheets 구조
- **Spreadsheet ID**: `1djkPQzg_1-_zgbWe8e5AYZlUjVoQYmJj2HlwRsCqu9g`
- **Sheet Name**: `세션`
- **Range**: A1:N (헤더 + 33개 데이터)

#### 컬럼 매핑
| Index | Sheets 컬럼 | TypeScript 필드 | 타입 | 변환 필요 |
|-------|------------|----------------|------|----------|
| 0 | 번호 | id | string | - |
| 1 | 페이지 | pageUrl | string | - |
| 2 | 트랙 | track | string | - |
| 3 | 위치 | location | string | - |
| 4 | 발표-시간 | startTime, endTime | string | ✅ 파싱 |
| 5 | 연사-명 | speaker | string | - |
| 6 | 연사-소속 | speakerAffiliation | string | - |
| 7 | 연사-소개 | speakerBio | string | - |
| 8 | 연사-프로필 | speakerProfile | string | - |
| 9 | 발표-제목 | name | string | - |
| 10 | 발표-내용 | description | string | - |
| 11-13 | 키워드1-3 | hashtags | string[] | ✅ 배열화 |

### 2.2 백엔드 구현

#### 2.2.1 환경 변수 설정

```bash
# moducon-backend/.env
GOOGLE_SHEETS_API_KEY=your_api_key_here
SPREADSHEET_ID=1djkPQzg_1-_zgbWe8e5AYZlUjVoQYmJj2HlwRsCqu9g
```

#### 2.2.2 타입 정의

```typescript
// moducon-backend/src/types/session.ts

export interface SessionRaw {
  번호: string;
  페이지: string;
  트랙: string;
  위치: string;
  '발표-시간': string;
  '연사-명': string;
  '연사-소속': string;
  '연사-소개': string;
  '연사-프로필': string;
  '발표-제목': string;
  '발표-내용': string;
  키워드1: string;
  키워드2: string;
  키워드3: string;
}

export interface Session {
  id: string;
  pageUrl: string;
  track: string;
  location: string;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
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

#### 2.2.3 Google Sheets Service 구현

```typescript
// moducon-backend/src/services/googleSheetsService.ts

import axios from 'axios';

const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '';
const API_KEY = process.env.GOOGLE_SHEETS_API_KEY || '';
const SHEET_NAME = '세션';
const RANGE = `${SHEET_NAME}!A2:N`; // 헤더 제외

/**
 * 시간 파싱 유틸리티
 * "10:10-10:50" → { start: "10:10", end: "10:50" }
 */
function parseTimeRange(timeRange: string): { start: string; end: string } | null {
  const match = timeRange.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);
  if (!match) {
    console.warn(`Invalid time format: ${timeRange}`);
    return null;
  }
  return { start: match[1], end: match[2] };
}

/**
 * 난이도 추론 (키워드 기반)
 */
function calculateDifficulty(keywords: string[]): '초급' | '중급' | '고급' {
  const advanced = ['딥테크', '양자컴퓨팅', '가속기', 'NPU', 'Physical-AI'];
  const beginner = ['입문', '초보', '바이브코딩', 'AI부트캠프'];

  if (keywords.some(k => advanced.includes(k))) return '고급';
  if (keywords.some(k => beginner.includes(k))) return '초급';
  return '중급';
}

/**
 * 세션 데이터를 Google Sheets에서 가져오기
 */
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
        pageUrl: row[1],
        track: row[2],
        location: row[3],
        startTime: timeRange?.start || '',
        endTime: timeRange?.end || '',
        speaker: row[5],
        speakerAffiliation: row[6],
        speakerBio: row[7],
        speakerProfile: row[8],
        name: row[9],
        description: row[10],
        hashtags,
        difficulty: calculateDifficulty(hashtags)
      };
    });
  } catch (error) {
    console.error('Google Sheets 데이터 가져오기 실패:', error);
    throw new Error('Failed to fetch sessions from Google Sheets');
  }
}

/**
 * 특정 세션 ID로 조회
 */
export async function getSessionById(id: string): Promise<Session | null> {
  const sessions = await getSessions();
  return sessions.find(s => s.id === id) || null;
}

/**
 * 트랙 및 난이도로 필터링
 */
export async function filterSessions(
  track?: string,
  difficulty?: '초급' | '중급' | '고급'
): Promise<Session[]> {
  const sessions = await getSessions();

  let filtered = sessions;

  if (track) {
    filtered = filtered.filter(s => s.track === track);
  }

  if (difficulty) {
    filtered = filtered.filter(s => s.difficulty === difficulty);
  }

  return filtered;
}
```

### 2.3 프론트엔드 구현

#### 2.3.1 타입 정의

```typescript
// moducon-frontend/src/types/session.ts

export interface Session {
  id: string;
  pageUrl: string;
  track: string;
  location: string;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
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

#### 2.3.2 캐싱 레이어

```typescript
// moducon-frontend/src/lib/sessionCache.ts

const CACHE_KEY = 'moducon_sessions';
const CACHE_TIMESTAMP_KEY = 'moducon_sessions_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5분

export async function fetchSessionsWithCache(
  track?: string
): Promise<Session[]> {
  // 캐시 확인
  const cached = sessionStorage.getItem(CACHE_KEY);
  const timestamp = sessionStorage.getItem(CACHE_TIMESTAMP_KEY);

  if (cached && timestamp) {
    const age = Date.now() - parseInt(timestamp);
    if (age < CACHE_DURATION) {
      const allSessions = JSON.parse(cached);
      return track
        ? allSessions.filter((s: Session) => s.track === track)
        : allSessions;
    }
  }

  // API 호출
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const url = track
    ? `${API_URL}/api/sessions?track=${encodeURIComponent(track)}`
    : `${API_URL}/api/sessions`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch sessions');
  }

  const result = await response.json();
  const sessions = result.data || [];

  // 캐시 저장
  sessionStorage.setItem(CACHE_KEY, JSON.stringify(sessions));
  sessionStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());

  return sessions;
}

/**
 * 캐시 무효화 (수동 갱신 시)
 */
export function invalidateSessionsCache() {
  sessionStorage.removeItem(CACHE_KEY);
  sessionStorage.removeItem(CACHE_TIMESTAMP_KEY);
}
```

#### 2.3.3 세션 페이지 업데이트

```typescript
// moducon-frontend/src/app/sessions/page.tsx (기존 파일 수정)

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';
import { fetchSessionsWithCache, invalidateSessionsCache } from '@/lib/sessionCache';
import type { Session } from '@/types/session';

const tracks = ['Track 00', 'Track 01', 'Track 10', 'Track i', 'Track 101'];

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeTrack, setActiveTrack] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = async (track?: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchSessionsWithCache(track || undefined);
      setSessions(data);
    } catch (err) {
      console.error('세션 로딩 실패:', err);
      setError('세션 데이터를 불러올 수 없습니다. 네트워크를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions(activeTrack || undefined);
  }, [activeTrack]);

  const handleRefresh = () => {
    invalidateSessionsCache();
    loadSessions(activeTrack || undefined);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      {/* 헤더 */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">전체 세션</h1>
          <p className="text-muted-foreground">
            관심 있는 세션을 찾아보세요. (총 {sessions.length}개)
          </p>
        </div>

        {/* 새로고침 버튼 */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          새로고침
        </Button>
      </div>

      {/* 트랙 필터 */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeTrack === null ? 'default' : 'outline'}
            onClick={() => setActiveTrack(null)}
          >
            All
          </Button>
          {tracks.map(track => (
            <Button
              key={track}
              variant={activeTrack === track ? 'default' : 'outline'}
              onClick={() => setActiveTrack(track)}
            >
              {track}
            </Button>
          ))}
        </div>
      </div>

      {/* 세션 목록 */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">로딩 중...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={handleRefresh}
            >
              다시 시도
            </Button>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {activeTrack
                ? `${activeTrack} 세션이 없습니다.`
                : '세션 데이터가 없습니다.'
              }
            </p>
          </div>
        ) : (
          sessions.map(session => (
            <Card key={session.id}>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* 세션 정보 */}
                  <div className="md:col-span-3">
                    <div className="flex gap-2 mb-2">
                      <Badge variant="secondary">{session.track}</Badge>
                      <Badge className={getDifficultyColor(session.difficulty)}>
                        {session.difficulty}
                      </Badge>
                    </div>

                    <h3 className="text-xl font-semibold mb-1">{session.name}</h3>

                    <p className="text-muted-foreground mb-2">
                      <strong>{session.speaker}</strong> · {session.speakerAffiliation}
                    </p>

                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {session.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {session.hashtags.map(tag => (
                        <Badge key={tag} variant="outline">#{tag}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* 시간 및 액션 */}
                  <div className="flex flex-col items-start md:items-end justify-between">
                    <div className="text-right">
                      <p className="font-mono text-sm">
                        {session.startTime} - {session.endTime}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {session.location}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-4 md:mt-0"
                      onClick={() => window.open(session.pageUrl, '_blank')}
                    >
                      상세 보기 →
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case '초급':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case '중급':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case '고급':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  }
}
```

### 2.4 에러 처리 및 로깅

```typescript
// moducon-backend/src/middleware/errorHandler.ts

export function handleGoogleSheetsError(error: any, res: Response) {
  console.error('Google Sheets API Error:', error);

  if (error.response?.status === 403) {
    return res.status(403).json({
      success: false,
      error: 'API 키가 유효하지 않습니다',
      code: 'INVALID_API_KEY'
    });
  }

  if (error.response?.status === 404) {
    return res.status(404).json({
      success: false,
      error: '스프레드시트를 찾을 수 없습니다',
      code: 'SHEET_NOT_FOUND'
    });
  }

  if (error.code === 'ECONNREFUSED') {
    return res.status(503).json({
      success: false,
      error: 'Google Sheets API에 연결할 수 없습니다',
      code: 'SERVICE_UNAVAILABLE'
    });
  }

  return res.status(500).json({
    success: false,
    error: '서버 내부 오류가 발생했습니다',
    code: 'INTERNAL_SERVER_ERROR'
  });
}
```

---

## ✅ 검증 기준

### QR 스캐너 UI
- [ ] 원형 버튼이 화면 중앙 하단에 표시됨
- [ ] 버튼 클릭 시 전체 화면 모달 오픈
- [ ] 후방 카메라 자동 활성화
- [ ] 250px 스캔 가이드라인 표시
- [ ] 스캔 성공 시 햅틱 피드백
- [ ] 에러 시 재시도 안내 메시지

### 세션 데이터 연동
- [ ] Google Sheets API 연결 성공
- [ ] 33개 세션 데이터 모두 로드
- [ ] 트랙별 필터링 정상 동작
- [ ] 난이도 추론 로직 동작
- [ ] 5분 캐싱 정상 작동
- [ ] 새로고침 버튼으로 수동 갱신 가능
- [ ] 네트워크 에러 시 친절한 메시지 표시

---

**문서 버전**: v1.0
**최종 수정일**: 2025-11-30
