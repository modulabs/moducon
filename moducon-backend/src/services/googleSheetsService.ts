/**
 * Google Sheets Service
 * Google Sheets MCP를 통해 데이터를 가져오는 서비스
 */

const SPREADSHEET_ID = '1djkPQzg_1-_zgbWe8e5AYZlUjVoQYmJj2HlwRsCqu9g';

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

export interface Session {
  id: string;
  name: string;
  track: string;
  startTime: string;
  endTime: string;
  location: string;
  speaker: string;
  difficulty: '초급' | '중급' | '고급';
  description: string;
  hashtags: string[];
}

/**
 * 부스 데이터를 가져와서 파싱
 */
export async function getBooths(): Promise<Booth[]> {
  // Google Sheets MCP를 통해 데이터 가져오기
  // 실제 구현에서는 MCP 클라이언트를 사용
  // 현재는 하드코딩된 데이터 반환 (MCP 연동은 프론트엔드에서 직접)

  return [];
}

/**
 * 특정 부스 데이터 가져오기
 */
export async function getBoothById(id: string): Promise<Booth | null> {
  const booths = await getBooths();
  return booths.find(b => b.id === id) || null;
}

/**
 * 부스 필터링 (타입별)
 */
export async function filterBooths(type?: string): Promise<Booth[]> {
  const booths = await getBooths();

  if (!type) return booths;

  return booths.filter(b => b.type === type);
}

/**
 * 포스터 데이터를 가져와서 파싱
 */
export async function getPapers(): Promise<Paper[]> {
  // Google Sheets MCP를 통해 데이터 가져오기
  return [];
}

/**
 * 특정 포스터 데이터 가져오기
 */
export async function getPaperById(id: string): Promise<Paper | null> {
  const papers = await getPapers();
  return papers.find(p => p.id === id) || null;
}

/**
 * 포스터 필터링 (학회별, 발표시간별)
 */
export async function filterPapers(
  conference?: string,
  presentationTime?: string
): Promise<Paper[]> {
  const papers = await getPapers();

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
 * 세션 데이터를 가져와서 파싱
 * Google Sheets의 "Sessions" 시트에서 데이터 로드
 */
export async function getSessions(): Promise<Session[]> {
  // Google Sheets MCP를 통해 데이터 가져오기
  // 시트 범위: Sessions!A2:J100 (헤더 제외)
  // 컬럼: ID, 세션명, 트랙, 시작시간, 종료시간, 장소, 연사, 난이도, 설명, 해시태그

  // 현재는 하드코딩된 데이터 반환 (향후 MCP 연동)
  return [];
}

/**
 * 특정 세션 데이터 가져오기
 */
export async function getSessionById(id: string): Promise<Session | null> {
  const sessions = await getSessions();
  return sessions.find(s => s.id === id) || null;
}

/**
 * 세션 필터링 (트랙별, 난이도별)
 */
export async function filterSessions(
  track?: string,
  difficulty?: '초급' | '중급' | '고급'
): Promise<Session[]> {
  const sessions = await getSessions();

  let filtered = sessions;

  if (track) {
    filtered = filtered.filter(s => s.track === track);
  }

  if (difficulty) {
    filtered = filtered.filter(s => s.difficulty === difficulty);
  }

  return filtered;
}
