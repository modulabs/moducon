/**
 * 세션 라우트
 * PostgreSQL DB에서 세션 데이터를 가져와 제공
 * 세션별 Q&A 기능 포함
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { successResponse, errorResponse } from '../utils/response';
import { logger } from '../utils/logger';
import { authenticate, AuthRequest } from '../middleware/auth';
import { verifyToken } from '../config/jwt';

const router = Router();

/**
 * GET /api/sessions
 * 세션 목록 조회 (트랙 필터링 지원)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { track } = req.query;

    const where: { track?: string; isActive: boolean } = {
      isActive: true,
    };

    if (track && typeof track === 'string') {
      where.track = track;
    }

    const sessions = await prisma.session.findMany({
      where,
      orderBy: [{ track: 'asc' }, { timeSlot: 'asc' }],
    });

    return successResponse(res, sessions, '세션 목록을 성공적으로 조회했습니다.');
  } catch (error) {
    logger.error('세션 목록 조회 실패:', error);
    return errorResponse(res, '세션 목록 조회에 실패했습니다.', 500);
  }
});

/**
 * GET /api/sessions/:code
 * 특정 세션 상세 조회 (code로 조회)
 */
router.get('/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    const session = await prisma.session.findFirst({
      where: {
        OR: [{ code }, { id: code }],
        isActive: true,
      },
    });

    if (!session) {
      return errorResponse(res, '세션을 찾을 수 없습니다.', 404, 'SESSION_NOT_FOUND');
    }

    return successResponse(res, session, '세션 상세 정보를 성공적으로 조회했습니다.');
  } catch (error) {
    logger.error('세션 상세 조회 실패:', error);
    return errorResponse(res, '세션 상세 조회에 실패했습니다.', 500);
  }
});

/**
 * GET /api/sessions/track/:track
 * 트랙별 세션 목록 조회
 */
router.get('/track/:track', async (req: Request, res: Response) => {
  try {
    const { track } = req.params;

    const sessions = await prisma.session.findMany({
      where: {
        track,
        isActive: true,
      },
      orderBy: { timeSlot: 'asc' },
    });

    return successResponse(res, sessions, `${track} 트랙 세션 목록을 조회했습니다.`);
  } catch (error) {
    logger.error('트랙별 세션 조회 실패:', error);
    return errorResponse(res, '트랙별 세션 조회에 실패했습니다.', 500);
  }
});

// ============================================
// 세션 Q&A API
// ============================================

/**
 * GET /api/sessions/:sessionId/questions
 * 특정 세션의 질문 목록 조회
 */
router.get('/:sessionId/questions', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { sort = 'popular', page = '1', limit = '20' } = req.query;

    // 현재 사용자 ID (로그인한 경우)
    let currentUserId: string | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        currentUserId = decoded.userId;
      } catch {
        // 토큰 검증 실패 - 로그인하지 않은 사용자
      }
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // 질문 조회 with 좋아요 수
    const questions = await prisma.question.findMany({
      where: {
        targetType: 'session',
        targetId: sessionId,
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
        likes: true,
        answer: true,
      },
      orderBy: sort === 'recent'
        ? { createdAt: 'desc' }
        : [
            { isPinned: 'desc' },
            { createdAt: 'desc' },
          ],
      skip,
      take: limitNum,
    });

    // 전체 개수
    const total = await prisma.question.count({
      where: { targetType: 'session', targetId: sessionId },
    });

    // 응답 데이터 가공
    const formattedQuestions = questions.map(q => ({
      id: q.id,
      content: q.content,
      isAnonymous: q.isAnonymous,
      author: q.isAnonymous
        ? { id: null, name: '익명' }
        : { id: q.user.id, name: q.user.name },
      likeCount: q.likes.length,
      isLiked: currentUserId ? q.likes.some(like => like.userId === currentUserId) : false,
      isAnswered: q.isAnswered,
      isPinned: q.isPinned,
      isOwner: currentUserId === q.userId,
      answer: q.answer ? {
        content: q.answer.content,
        answeredBy: q.answer.answeredBy,
        createdAt: q.answer.createdAt,
      } : null,
      createdAt: q.createdAt,
    }));

    // 좋아요 수 기준 정렬 (인기순)
    if (sort === 'popular') {
      formattedQuestions.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return b.likeCount - a.likeCount;
      });
    }

    res.json({
      success: true,
      data: {
        questions: formattedQuestions,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    logger.error('세션 질문 목록 조회 실패:', error);
    res.status(500).json({ success: false, message: '질문 목록을 불러올 수 없습니다.' });
  }
});

/**
 * POST /api/sessions/:sessionId/questions
 * 세션에 질문 작성 (로그인 필요)
 */
router.post('/:sessionId/questions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { content, isAnonymous = false } = req.body;
    const userId = req.user!.userId;

    // 유효성 검사
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: '질문 내용을 입력해주세요.' });
    }

    if (content.length > 500) {
      return res.status(400).json({ success: false, message: '질문은 500자 이내로 작성해주세요.' });
    }

    // 질문 생성
    const question = await prisma.question.create({
      data: {
        userId,
        targetType: 'session',
        targetId: sessionId,
        content: content.trim(),
        isAnonymous,
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: {
        id: question.id,
        content: question.content,
        isAnonymous: question.isAnonymous,
        author: question.isAnonymous
          ? { id: null, name: '익명' }
          : { id: question.user.id, name: question.user.name },
        likeCount: 0,
        isLiked: false,
        isOwner: true,
        createdAt: question.createdAt,
      },
    });
  } catch (error) {
    logger.error('세션 질문 작성 실패:', error);
    res.status(500).json({ success: false, message: '질문 작성에 실패했습니다.' });
  }
});

export default router;
