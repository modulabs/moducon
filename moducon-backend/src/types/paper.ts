/**
 * 포스터(논문) 관련 타입 정의
 */

export interface Paper {
  id: string;
  author: string;
  affiliation: string;
  conference: string;
  title: string;
  fileUrl: string;
  paperUrl: string;
  category: string;
  email: string;
  phone: string;
  presentationTime: string;
  willPresent: string;
}
