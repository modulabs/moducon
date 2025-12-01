import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { successResponse, errorResponse } from '../utils/response';
import { logger } from '../utils/logger';
import { prisma } from '../lib/prisma';

const router = Router();

// 1. POST /api/checkin - 체크인 생성
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { targetType, targetId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return errorResponse(res, '인증이 필요합니다.', 401, 'UNAUTHORIZED');
    }

    // 유효성 검사
    if (!['session', 'booth', 'paper'].includes(targetType)) {
      return errorResponse(
        res,
        'targetType은 session, booth, paper 중 하나여야 합니다.',
        400,
        'INVALID_TARGET_TYPE'
      );
    }

    if (!targetId) {
      return errorResponse(res, 'targetId는 필수입니다.', 400, 'TARGET_ID_REQUIRED');
    }

    // 중복 체크인 확인
    const existingCheckin = await prisma.userCheckin.findUnique({
      where: {
        unique_checkin: {
          userId,
          targetType,
          targetId,
        },
      },
    });

    if (existingCheckin) {
      return errorResponse(res, '이미 체크인하셨습니다.', 409, 'DUPLICATE_CHECKIN');
    }

    // 체크인 생성
    const checkin = await prisma.userCheckin.create({
      data: {
        userId,
        targetType,
        targetId,
      },
    });

    logger.info(
      `User ${userId} checked in to ${targetType}:${targetId} (checkin ID: ${checkin.id})`
    );

    return successResponse(res, { checkin }, '체크인이 완료되었습니다.', 201);
  } catch (error) {
    logger.error('체크인 생성 실패:', error);
    return errorResponse(res, '체크인 처리 중 오류가 발생했습니다.', 500, 'CHECKIN_FAILED');
  }
});

// 2. GET /api/checkin/user/:userId - 사용자별 체크인 목록
router.get('/user/:userId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const requestUserId = req.user?.userId;

    if (!requestUserId) {
      return errorResponse(res, '인증이 필요합니다.', 401, 'UNAUTHORIZED');
    }

    // 본인의 체크인 목록만 조회 가능
    if (userId !== requestUserId) {
      return errorResponse(
        res,
        '본인의 체크인 목록만 조회할 수 있습니다.',
        403,
        'FORBIDDEN'
      );
    }

    const checkins = await prisma.userCheckin.findMany({
      where: { userId },
      orderBy: { checkedInAt: 'desc' },
    });

    logger.debug(`Retrieved ${checkins.length} checkins for user ${userId}`);

    return successResponse(res, { checkins });
  } catch (error) {
    logger.error('체크인 목록 조회 실패:', error);
    return errorResponse(
      res,
      '체크인 목록 조회 중 오류가 발생했습니다.',
      500,
      'FETCH_FAILED'
    );
  }
});

// 3. GET /api/checkin/stats/:userId - 사용자 통계
router.get('/stats/:userId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const requestUserId = req.user?.userId;

    if (!requestUserId) {
      return errorResponse(res, '인증이 필요합니다.', 401, 'UNAUTHORIZED');
    }

    // 본인의 통계만 조회 가능
    if (userId !== requestUserId) {
      return errorResponse(res, '본인의 통계만 조회할 수 있습니다.', 403, 'FORBIDDEN');
    }

    // 체크인 통계 계산
    const [
      totalCheckins,
      sessionCheckins,
      boothCheckins,
      paperCheckins,
      quizAttempts,
      quizCorrect,
    ] = await Promise.all([
      prisma.userCheckin.count({ where: { userId } }),
      prisma.userCheckin.count({ where: { userId, targetType: 'session' } }),
      prisma.userCheckin.count({ where: { userId, targetType: 'booth' } }),
      prisma.userCheckin.count({ where: { userId, targetType: 'paper' } }),
      prisma.userQuizAttempt.count({ where: { userId } }),
      prisma.userQuizAttempt.count({ where: { userId, isCorrect: true } }),
    ]);

    const stats = {
      totalCheckins,
      sessionCheckins,
      boothCheckins,
      paperCheckins,
      quizAttempts,
      quizCorrect,
    };

    logger.debug(`Retrieved stats for user ${userId}:`, stats);

    return successResponse(res, { stats });
  } catch (error) {
    logger.error('통계 조회 실패:', error);
    return errorResponse(res, '통계 조회 중 오류가 발생했습니다.', 500, 'STATS_FAILED');
  }
});

export default router;
