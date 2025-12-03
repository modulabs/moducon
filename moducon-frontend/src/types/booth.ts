/**
 * 부스 데이터 구조 (DB 스키마 기반)
 */
export interface Booth {
  id: string;
  code: string;
  name: string;
  organization: string | null;
  orgType: string | null; // '기업' | '모두의연구소 LAB' | '모두의연구소 교육사업팀' | '테크포임팩트 부스'
  description: string | null;
  boothDescription: string | null;
  hashtags: string[];
  solutions: string | null;
  coreTech: string | null;
  researchGoals: string | null;
  mainProducts: string | null;
  demoContent: string | null;
  imageUrl: string | null;
  managerName: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
