"use strict";
/**
 * Google Sheets Service
 * Google Sheets API를 통해 데이터를 가져오는 서비스
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
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
const axios_1 = __importDefault(require("axios"));
const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '1djkPQzg_1-_zgbWe8e5AYZlUjVoQYmJj2HlwRsCqu9g';
const API_KEY = process.env.GOOGLE_SHEETS_API_KEY || '';
const SHEET_NAME = '세션';
const RANGE = `${SHEET_NAME}!A2:N`; // 헤더 제외
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
 * 시간 파싱 유틸리티
 * "10:10-10:50" → { start: "10:10", end: "10:50" }
 */
function parseTimeRange(timeRange) {
    const match = timeRange.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);
    if (!match) {
        console.warn(`Invalid time format: ${timeRange}`);
        return null;
    }
    return { start: match[1], end: match[2] };
}
/**
 * 난이도 추론 (키워드 기반)
 */
function calculateDifficulty(keywords) {
    const advanced = ['딥테크', '양자컴퓨팅', '가속기', 'NPU', 'Physical-AI'];
    const beginner = ['입문', '초보', '바이브코딩', 'AI부트캠프'];
    if (keywords.some(k => advanced.includes(k)))
        return '고급';
    if (keywords.some(k => beginner.includes(k)))
        return '초급';
    return '중급';
}
/**
 * 세션 데이터를 가져와서 파싱
 * Google Sheets API를 통해 실제 데이터 로드
 */
async function getSessions() {
    try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;
        const response = await axios_1.default.get(url);
        const rows = response.data.values || [];
        return rows.map((row) => {
            const timeRange = parseTimeRange(row[4]);
            const hashtags = [row[11], row[12], row[13]].filter(Boolean);
            return {
                id: row[0],
                pageUrl: row[1],
                track: row[2],
                location: row[3],
                startTime: timeRange?.start || '',
                endTime: timeRange?.end || '',
                speaker: row[5],
                speakerAffiliation: row[6],
                speakerBio: row[7],
                speakerProfile: row[8],
                name: row[9],
                description: row[10],
                hashtags,
                difficulty: calculateDifficulty(hashtags)
            };
        });
    }
    catch (error) {
        console.error('Google Sheets 데이터 가져오기 실패:', error.message);
        throw new Error('Failed to fetch sessions from Google Sheets');
    }
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
