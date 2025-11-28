"use strict";
/**
 * Google Sheets Service
 * Google Sheets MCP를 통해 데이터를 가져오는 서비스
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBooths = getBooths;
exports.getBoothById = getBoothById;
exports.filterBooths = filterBooths;
exports.getPapers = getPapers;
exports.getPaperById = getPaperById;
exports.filterPapers = filterPapers;
exports.getSessions = getSessions;
exports.getSessionById = getSessionById;
exports.filterSessions = filterSessions;
const SPREADSHEET_ID = '1djkPQzg_1-_zgbWe8e5AYZlUjVoQYmJj2HlwRsCqu9g';
/**
 * 부스 데이터를 가져와서 파싱
 */
async function getBooths() {
    // Google Sheets MCP를 통해 데이터 가져오기
    // 실제 구현에서는 MCP 클라이언트를 사용
    // 현재는 하드코딩된 데이터 반환 (MCP 연동은 프론트엔드에서 직접)
    return [];
}
/**
 * 특정 부스 데이터 가져오기
 */
async function getBoothById(id) {
    const booths = await getBooths();
    return booths.find(b => b.id === id) || null;
}
/**
 * 부스 필터링 (타입별)
 */
async function filterBooths(type) {
    const booths = await getBooths();
    if (!type)
        return booths;
    return booths.filter(b => b.type === type);
}
/**
 * 포스터 데이터를 가져와서 파싱
 */
async function getPapers() {
    // Google Sheets MCP를 통해 데이터 가져오기
    return [];
}
/**
 * 특정 포스터 데이터 가져오기
 */
async function getPaperById(id) {
    const papers = await getPapers();
    return papers.find(p => p.id === id) || null;
}
/**
 * 포스터 필터링 (학회별, 발표시간별)
 */
async function filterPapers(conference, presentationTime) {
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
async function getSessions() {
    // Google Sheets MCP를 통해 데이터 가져오기
    // 시트 범위: Sessions!A2:J100 (헤더 제외)
    // 컬럼: ID, 세션명, 트랙, 시작시간, 종료시간, 장소, 연사, 난이도, 설명, 해시태그
    // 현재는 하드코딩된 데이터 반환 (향후 MCP 연동)
    return [];
}
/**
 * 특정 세션 데이터 가져오기
 */
async function getSessionById(id) {
    const sessions = await getSessions();
    return sessions.find(s => s.id === id) || null;
}
/**
 * 세션 필터링 (트랙별, 난이도별)
 */
async function filterSessions(track, difficulty) {
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
