/**
 * Google Sheets Data Fetcher
 * Google Sheets에서 부스 및 포스터 데이터를 가져오는 유틸리티
 */

const SPREADSHEET_ID = '1djkPQzg_1-_zgbWe8e5AYZlUjVoQYmJj2HlwRsCqu9g';

export interface Booth {
  id: string;
  name: string;
  type: string;
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

/**
 * Google Sheets 부스 데이터를 Booth 타입으로 변환
 */
function parseBoothRow(row: string[], index: number): Booth {
  return {
    id: `booth-${index}`,
    name: row[1] || '',
    description: row[2] || '',
    contactPerson: row[3] || '',
    boothDescription: row[4] || '',
    imageUrl: row[5] || '',
    type: row[6] || '',
    hashtags: row[7] ? row[7].split('#').filter(t => t.trim()).map(t => t.trim()) : [],
    solutions: row[8] || '',
    technologies: row[9] || '',
    researchGoals: row[10] || '',
    mainProducts: row[11] || '',
    demoContent: row[13] || '',
  };
}

/**
 * Google Sheets 포스터 데이터를 Paper 타입으로 변환
 */
function parsePaperRow(row: string[], index: number): Paper {
  return {
    id: `paper-${index}`,
    author: row[0] || '',
    affiliation: row[1] || '',
    conference: row[2] || '',
    title: row[3] || '',
    fileUrl: row[4] || '',
    paperUrl: row[5] || '',
    category: row[6] || '',
    email: row[7] || '',
    phone: row[8] || '',
    presentationTime: row[9] || '',
    willPresent: row[10] || '',
  };
}

/**
 * 부스 데이터 가져오기 (클라이언트 사이드)
 */
export async function fetchBooths(): Promise<Booth[]> {
  try {
    // 실제 환경에서는 API를 통해 Google Sheets 데이터를 가져옴
    // 현재는 하드코딩된 샘플 데이터 반환
    const sampleBooths: Booth[] = [
      {
        id: 'booth-1',
        name: '클라비',
        type: '기업',
        description: '클라비는 지난 3년간 다양한 문제를 해결하기 위해 50곳이 넘는 기관에 솔루션과 컨설팅을 제공해왔습니다.',
        contactPerson: '김정현',
        boothDescription: '클라비의 제품, 기술 소개 및 채용에 관심이 있는 모든 분들을 환영합니다.',
        imageUrl: '',
        hashtags: ['AX SaaS', 'Agentic AI', '클라우드 네이티브'],
        solutions: 'AX 솔루션(RAG 챗봇 기반), 매니지드 클라우드 서비스/관제 솔루션',
        technologies: '컨텍스트(프롬프트) 엔지니어링, 탐색기반 생성(RAG), 에이전트 오케스트레이션',
        researchGoals: '',
        mainProducts: '생성형 AI 패키지 \'클라비안 플랫폼\'',
        demoContent: '',
      },
    ];

    return sampleBooths;
  } catch (error) {
    console.error('Failed to fetch booths:', error);
    return [];
  }
}

/**
 * 포스터 데이터 가져오기 (클라이언트 사이드)
 */
export async function fetchPapers(): Promise<Paper[]> {
  try {
    const samplePapers: Paper[] = [
      {
        id: 'paper-1',
        author: '김민중',
        affiliation: '',
        conference: 'NIPS Workshop',
        title: 'Reweighted Flow Matching via Unbalanced Optimal Transport for Long-tailed Generation',
        fileUrl: 'https://drive.google.com/file/d/1etGvJOuTovhUoPCmqV2O8zN4bTAQ2qSf/view',
        paperUrl: '',
        category: '',
        email: 'minjunggim@gmail.com',
        phone: '010-2599-7799',
        presentationTime: '',
        willPresent: '발표X',
      },
    ];

    return samplePapers;
  } catch (error) {
    console.error('Failed to fetch papers:', error);
    return [];
  }
}

/**
 * 부스 필터링 (타입별)
 */
export function filterBoothsByType(booths: Booth[], type?: string): Booth[] {
  if (!type) return booths;
  return booths.filter(b => b.type === type);
}

/**
 * 포스터 필터링 (학회별, 발표시간별)
 */
export function filterPapers(
  papers: Paper[],
  conference?: string,
  presentationTime?: string
): Paper[] {
  let filtered = papers;

  if (conference) {
    filtered = filtered.filter(p => p.conference === conference);
  }

  if (presentationTime) {
    filtered = filtered.filter(p => p.presentationTime === presentationTime);
  }

  return filtered;
}

/**
 * 부스 검색
 */
export function searchBooths(booths: Booth[], query: string): Booth[] {
  const lowerQuery = query.toLowerCase();
  return booths.filter(
    b =>
      b.name.toLowerCase().includes(lowerQuery) ||
      b.description.toLowerCase().includes(lowerQuery) ||
      b.hashtags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * 포스터 검색
 */
export function searchPapers(papers: Paper[], query: string): Paper[] {
  const lowerQuery = query.toLowerCase();
  return papers.filter(
    p =>
      p.title.toLowerCase().includes(lowerQuery) ||
      p.author.toLowerCase().includes(lowerQuery) ||
      p.conference.toLowerCase().includes(lowerQuery)
  );
}
