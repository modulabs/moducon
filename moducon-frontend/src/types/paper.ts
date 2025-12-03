/**
 * 포스터(논문) 데이터 구조 (DB 스키마 기반)
 */
export interface Paper {
  id: string;
  code: string;
  title: string;
  abstract: string | null;
  researcher: string | null;
  affiliation: string | null;
  hashtags: string[];
  presentationTime: string | null;
  location: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
