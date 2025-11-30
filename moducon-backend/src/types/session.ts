/**
 * 세션 관련 타입 정의
 */

/**
 * Google Sheets Raw 데이터 구조
 */
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

/**
 * 세션 데이터 구조 (파싱 후)
 */
export interface Session {
  id: string;
  pageUrl?: string; // Google Sheets 연동 대비 optional
  track: string;
  location: string;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  speaker: string;
  speakerAffiliation?: string; // Google Sheets 연동 대비 optional
  speakerBio?: string; // Google Sheets 연동 대비 optional
  speakerProfile?: string; // Google Sheets 연동 대비 optional
  name: string; // 세션 제목
  description: string;
  hashtags: string[];
  difficulty: '초급' | '중급' | '고급';
}

/**
 * 시간 범위 파싱 결과
 */
export interface TimeRange {
  start: string;
  end: string;
}
