import type { Paper } from '@/types/paper';

const CACHE_KEY = 'moducon_papers';
const CACHE_TIMESTAMP_KEY = 'moducon_papers_timestamp';
const CACHE_VERSION_KEY = 'moducon_papers_version';
const CACHE_DURATION = 5 * 60 * 1000; // 5분
const CACHE_VERSION = '2.0'; // DB 스키마 업데이트

// 백엔드 API URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * API에서 데이터 가져오기
 */
async function fetchFromAPI(endpoint: string): Promise<Paper[]> {
  const response = await fetch(`${API_BASE}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API 요청 실패: ${response.status}`);
  }
  return response.json();
}

/**
 * localStorage를 사용한 포스터 데이터 캐싱
 */
export async function fetchPapersWithCache(): Promise<Paper[]> {
  // SSR 환경에서는 직접 API 호출
  if (typeof window === 'undefined') {
    return fetchFromAPI('/api/papers');
  }

  try {
    // localStorage 사용
    const cached = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    const version = localStorage.getItem(CACHE_VERSION_KEY);

    // 버전 체크
    if (version !== CACHE_VERSION) {
      console.log('캐시 버전 불일치, 무효화');
      invalidatePapersCache();
    }

    // 캐시 유효성 체크
    if (cached && timestamp) {
      const age = Date.now() - parseInt(timestamp);
      if (age < CACHE_DURATION) {
        console.log(`포스터 캐시 히트 (${Math.floor(age / 1000)}초 전)`);
        return JSON.parse(cached);
      } else {
        console.log('포스터 캐시 만료');
      }
    }

    // 백엔드 API에서 데이터 로딩
    const papers = await fetchFromAPI('/api/papers');

    // localStorage에 캐시 저장
    localStorage.setItem(CACHE_KEY, JSON.stringify(papers));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    localStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
    console.log(`포스터 캐시 저장 (${papers.length}개)`);

    return papers;
  } catch (error) {
    console.error('포스터 로딩 실패:', error);

    // 오프라인 시 캐시 데이터 반환
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      console.warn('오프라인 모드: 포스터 캐시 데이터 사용');
      return JSON.parse(cached);
    }

    throw error;
  }
}

/**
 * 특정 포스터 조회 (코드로 검색)
 */
export async function fetchPaperByCode(code: string): Promise<Paper | null> {
  const papers = await fetchPapersWithCache();
  return papers.find(paper => paper.code === code) || null;
}

/**
 * 캐시 무효화
 */
export function invalidatePapersCache() {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_TIMESTAMP_KEY);
  localStorage.removeItem(CACHE_VERSION_KEY);
  console.log('포스터 캐시 무효화 완료');
}
