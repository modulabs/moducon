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

// 배지 계산 함수
function calculateBadges(stats: {
  totalCheckins: number;
  sessionCheckins: number;
  boothCheckins: number;
  paperCheckins: number;
  quizAttempts: number;
  quizCorrect: number;
}) {
  const badges: Array<{
    id: string;
    name: string;
    description: string;
    earnedAt: string | null;
    progress: number;
    target: number;
  }> = [];

  // 첫 체크인 배지
  badges.push({
    id: 'first_checkin',
    name: '첫 발자국',
    description: '첫 체크인을 완료하세요',
    earnedAt: stats.totalCheckins >= 1 ? new Date().toISOString() : null,
    progress: Math.min(stats.totalCheckins, 1),
    target: 1,
  });

  // 세션 마스터 배지 (세션 5개 이상)
  badges.push({
    id: 'session_master',
    name: '세션 마스터',
    description: '세션 5개 이상 참여하세요',
    earnedAt: stats.sessionCheckins >= 5 ? new Date().toISOString() : null,
    progress: Math.min(stats.sessionCheckins, 5),
    target: 5,
  });

  // 부스 탐험가 배지 (부스 3개 이상)
  badges.push({
    id: 'booth_explorer',
    name: '부스 탐험가',
    description: '부스 3개 이상 방문하세요',
    earnedAt: stats.boothCheckins >= 3 ? new Date().toISOString() : null,
    progress: Math.min(stats.boothCheckins, 3),
    target: 3,
  });

  // 논문 연구원 배지 (논문 3개 이상)
  badges.push({
    id: 'paper_researcher',
    name: '논문 연구원',
    description: '논문 3개 이상 확인하세요',
    earnedAt: stats.paperCheckins >= 3 ? new Date().toISOString() : null,
    progress: Math.min(stats.paperCheckins, 3),
    target: 3,
  });

  // 퀴즈 챌린저 배지 (퀴즈 5개 이상 시도)
  badges.push({
    id: 'quiz_challenger',
    name: '퀴즈 챌린저',
    description: '퀴즈 5개 이상 도전하세요',
    earnedAt: stats.quizAttempts >= 5 ? new Date().toISOString() : null,
    progress: Math.min(stats.quizAttempts, 5),
    target: 5,
  });

  // 퀴즈 마스터 배지 (정답 5개 이상)
  badges.push({
    id: 'quiz_master',
    name: '퀴즈 마스터',
    description: '퀴즈 5개 이상 정답을 맞추세요',
    earnedAt: stats.quizCorrect >= 5 ? new Date().toISOString() : null,
    progress: Math.min(stats.quizCorrect, 5),
    target: 5,
  });

  // 올라운더 배지 (모든 타입에서 1개 이상 체크인)
  const allTypesChecked =
    stats.sessionCheckins >= 1 && stats.boothCheckins >= 1 && stats.paperCheckins >= 1;
  const allTypesProgress =
    (stats.sessionCheckins >= 1 ? 1 : 0) +
    (stats.boothCheckins >= 1 ? 1 : 0) +
    (stats.paperCheckins >= 1 ? 1 : 0);
  badges.push({
    id: 'all_rounder',
    name: '올라운더',
    description: '세션, 부스, 논문 모두 체크인하세요',
    earnedAt: allTypesChecked ? new Date().toISOString() : null,
    progress: allTypesProgress,
    target: 3,
  });

  // 컨퍼런스 마스터 배지 (총 체크인 10개 이상)
  badges.push({
    id: 'conference_master',
    name: '컨퍼런스 마스터',
    description: '총 10개 이상 체크인하세요',
    earnedAt: stats.totalCheckins >= 10 ? new Date().toISOString() : null,
    progress: Math.min(stats.totalCheckins, 10),
    target: 10,
  });

  return badges;
}

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

    // 배지 계산
    const badges = calculateBadges(stats);
    const earnedBadges = badges.filter((b) => b.earnedAt !== null);

    logger.debug(`Retrieved stats for user ${userId}:`, stats);

    return successResponse(res, {
      stats,
      badges,
      summary: {
        totalBadges: badges.length,
        earnedBadges: earnedBadges.length,
        completionRate: Math.round((earnedBadges.length / badges.length) * 100),
      },
    });
  } catch (error) {
    logger.error('통계 조회 실패:', error);
    return errorResponse(res, '통계 조회 중 오류가 발생했습니다.', 500, 'STATS_FAILED');
  }
});

export default router;
