import type { Booth } from '@/types/booth';

const CACHE_KEY = 'moducon_booths';
const CACHE_TIMESTAMP_KEY = 'moducon_booths_timestamp';
const CACHE_VERSION_KEY = 'moducon_booths_version';
const CACHE_DURATION = 5 * 60 * 1000; // 5분
const CACHE_VERSION = '1.0';

/**
 * localStorage를 사용한 부스 데이터 캐싱
 */
export async function fetchBoothsWithCache(): Promise<Booth[]> {
  try {
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
        return JSON.parse(cached);
      } else {
        console.log('부스 캐시 만료');
      }
    }

    // 정적 JSON 파일 로딩
    const response = await fetch('/data/booths.json');
    if (!response.ok) {
      throw new Error(`부스 데이터 로딩 실패: ${response.status}`);
    }

    const booths = await response.json();

    // localStorage에 캐시 저장
    localStorage.setItem(CACHE_KEY, JSON.stringify(booths));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    localStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
    console.log(`부스 캐시 저장 (${booths.length}개)`);

    return booths;
  } catch (error) {
    console.error('부스 로딩 실패:', error);

    // 오프라인 시 캐시 데이터 반환
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      console.warn('오프라인 모드: 부스 캐시 데이터 사용');
      return JSON.parse(cached);
    }

    throw error;
  }
}

/**
 * 캐시 무효화
 */
export function invalidateBoothsCache() {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_TIMESTAMP_KEY);
  localStorage.removeItem(CACHE_VERSION_KEY);
  console.log('부스 캐시 무효화 완료');
}
