/**
 * 세션 데이터 구조 (DB 스키마 기반)
 */
export interface Session {
  id: string;
  code: string;
  track: string;
  location: string;
  timeSlot: string; // "HH:MM-HH:MM"
  speakerName: string;
  speakerOrg: string | null;
  speakerBio: string | null;
  speakerProfileUrl: string | null;
  title: string;
  description: string | null;
  keywords: string[];
  pageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 세션 시간 파싱 유틸리티
 */
export function parseTimeSlot(timeSlot: string): { startTime: string; endTime: string } {
  const [startTime, endTime] = timeSlot.split('-').map(t => t.trim());
  return { startTime: startTime || '', endTime: endTime || '' };
}
