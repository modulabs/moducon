/**
 * 세션 라우트
 * Google Sheets에서 세션 데이터를 가져와 제공
 */

import express, { Request, Response } from 'express';
import {
  getSessions,
  getSessionById,
  filterSessions
} from '../services/googleSheetsService';

const router = express.Router();

/**
 * GET /api/sessions
 * 세션 목록 조회 (트랙, 난이도 필터링 지원)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { track, difficulty } = req.query;

    const sessions = await filterSessions(
      track as string | undefined,
      difficulty as '초급' | '중급' | '고급' | undefined
    );

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('세션 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error'
    });
  }
});

/**
 * GET /api/sessions/:id
 * 특정 세션 상세 조회
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const session = await getSessionById(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('세션 상세 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error'
    });
  }
});

export default router;
