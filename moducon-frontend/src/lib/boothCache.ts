import type { Booth } from '@/types/booth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && process.env.NODE_ENV === 'development'
    ? 'http://localhost:3001'
    : '');

const CACHE_KEY = 'moducon_booths';
const CACHE_TIMESTAMP_KEY = 'moducon_booths_timestamp';
const CACHE_VERSION_KEY = 'moducon_booths_version';
const CACHE_DURATION = 5 * 60 * 1000; // 5분
const CACHE_VERSION = '2.0'; // DB 마이그레이션으로 버전 업

/**
 * API를 사용한 부스 데이터 캐싱
 */
export async function fetchBoothsWithCache(type?: string): Promise<Booth[]> {
  try {
    // SSR 환경에서는 직접 API 호출
    if (typeof window === 'undefined') {
      return await fetchFromAPI(type);
    }

    // localStorage 사용
    const cached = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    const version = localStorage.getItem(CACHE_VERSION_KEY);

    // 버전 체크
    if (version !== CACHE_VERSION) {
      console.log('캐시 버전 불일치, 무효화');
      invalidateBoothsCache();
    }

    // 캐시 유효성 체크
    if (cached && timestamp) {
      const age = Date.now() - parseInt(timestamp);
      if (age < CACHE_DURATION) {
        console.log(`부스 캐시 히트 (${Math.floor(age / 1000)}초 전)`);
        const allBooths = JSON.parse(cached);
        return type
          ? allBooths.filter((b: Booth) => b.orgType === type)
          : allBooths;
      } else {
        console.log('부스 캐시 만료');
      }
    }

    // API에서 데이터 로딩
    const booths = await fetchFromAPI();

    // localStorage에 캐시 저장
    localStorage.setItem(CACHE_KEY, JSON.stringify(booths));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    localStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
    console.log(`부스 캐시 저장 (${booths.length}개)`);

    return type
      ? booths.filter((b: Booth) => b.orgType === type)
      : booths;
  } catch (error) {
    console.error('부스 로딩 실패:', error);

    // 오프라인 시 캐시 데이터 반환
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        console.warn('오프라인 모드: 부스 캐시 데이터 사용');
        const allBooths = JSON.parse(cached);
        return type
          ? allBooths.filter((b: Booth) => b.orgType === type)
          : allBooths;
      }
    }

    throw error;
  }
}

/**
 * API에서 부스 데이터 가져오기
 */
async function fetchFromAPI(type?: string): Promise<Booth[]> {
  const url = type
    ? `${API_BASE}/api/booths?type=${encodeURIComponent(type)}`
    : `${API_BASE}/api/booths`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`부스 데이터 로딩 실패: ${response.status}`);
  }

  const data = await response.json();
  return data.data || data;
}

/**
 * 단일 부스 조회
 */
export async function fetchBoothByCode(code: string): Promise<Booth | null> {
  try {
    const response = await fetch(`${API_BASE}/api/booths/${code}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`부스 조회 실패: ${response.status}`);
    }
    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('부스 조회 실패:', error);
    return null;
  }
}

/**
 * 캐시 무효화
 */
export function invalidateBoothsCache() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_TIMESTAMP_KEY);
  localStorage.removeItem(CACHE_VERSION_KEY);
  console.log('부스 캐시 무효화 완료');
}
