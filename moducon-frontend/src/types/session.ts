/**
 * 세션 데이터 구조
 */
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
  name: string; // 세션 제목
  description: string;
  hashtags: string[];
  difficulty: '초급' | '중급' | '고급';
}
