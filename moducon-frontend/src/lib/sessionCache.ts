import type { Session } from '@/types/session';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && process.env.NODE_ENV === 'development'
    ? 'http://localhost:3001'
    : '');

const CACHE_KEY = 'moducon_sessions';
const CACHE_TIMESTAMP_KEY = 'moducon_sessions_timestamp';
const CACHE_VERSION_KEY = 'moducon_sessions_version';
const CACHE_DURATION = 5 * 60 * 1000; // 5분
const CACHE_VERSION = '2.0'; // DB 마이그레이션으로 버전 업

/**
 * API를 사용한 세션 데이터 캐싱
 * - 탭 간 공유
 * - 브라우저 재시작 후에도 유지
 * - 버전 관리로 스키마 변경 대응
 */
export async function fetchSessionsWithCache(
  track?: string
): Promise<Session[]> {
  try {
    // SSR 환경에서는 직접 API 호출
    if (typeof window === 'undefined') {
      return await fetchFromAPI(track);
    }

    // localStorage 사용
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

    // API에서 데이터 로딩
    const sessions = await fetchFromAPI();

    // localStorage에 캐시 저장
    localStorage.setItem(CACHE_KEY, JSON.stringify(sessions));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    localStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
    console.log(`캐시 저장 (${sessions.length}개 세션)`);

    // 트랙 필터링 (클라이언트 사이드)
    return track
      ? sessions.filter((s: Session) => s.track === track)
      : sessions;
  } catch (error) {
    console.error('세션 로딩 실패:', error);

    // 오프라인 시 캐시 데이터 반환
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        console.warn('오프라인 모드: 캐시 데이터 사용');
        const allSessions = JSON.parse(cached);
        return track
          ? allSessions.filter((s: Session) => s.track === track)
          : allSessions;
      }
    }

    throw error;
  }
}

/**
 * API에서 세션 데이터 가져오기
 */
async function fetchFromAPI(track?: string): Promise<Session[]> {
  const url = track
    ? `${API_BASE}/api/sessions?track=${encodeURIComponent(track)}`
    : `${API_BASE}/api/sessions`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`세션 데이터 로딩 실패: ${response.status}`);
  }

  const data = await response.json();
  return data.data || data;
}

/**
 * 단일 세션 조회
 */
export async function fetchSessionByCode(code: string): Promise<Session | null> {
  try {
    const response = await fetch(`${API_BASE}/api/sessions/${code}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`세션 조회 실패: ${response.status}`);
    }
    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('세션 조회 실패:', error);
    return null;
  }
}

/**
 * 캐시 무효화 (수동 갱신 시)
 */
export function invalidateSessionsCache() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_TIMESTAMP_KEY);
  localStorage.removeItem(CACHE_VERSION_KEY);
  console.log('캐시 무효화 완료');
}

/**
 * 캐시 상태 확인 (디버깅용)
 */
export function getCacheStatus() {
  if (typeof window === 'undefined') {
    return { exists: false };
  }

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
