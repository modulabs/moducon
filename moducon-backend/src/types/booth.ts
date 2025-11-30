/**
 * 부스 관련 타입 정의
 */

export interface Booth {
  id: string;
  name: string;
  type: '기업' | '모두의연구소 LAB' | '모두의연구소 교육사업팀' | '테크포임팩트 부스';
  description: string;
  contactPerson: string;
  boothDescription: string;
  imageUrl: string;
  hashtags: string[];
  solutions: string;
  technologies: string;
  researchGoals: string;
  mainProducts: string;
  demoContent: string;
}
