/**
 * 관심 등록(즐겨찾기) 라우트
 * 세션, 부스, 포스터에 대한 관심 등록/해제 기능
 */

import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/favorites
 * 사용자의 관심 목록 조회
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { targetType } = req.query;

    const where: { userId: string; targetType?: string } = { userId };
    if (targetType && typeof targetType === 'string') {
      where.targetType = targetType;
    }

    const favorites = await prisma.userFavorite.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: favorites.map(f => ({
        id: f.id,
        targetType: f.targetType,
        targetId: f.targetId,
        createdAt: f.createdAt,
      })),
    });
  } catch (error) {
    logger.error('관심 목록 조회 실패:', error);
    res.status(500).json({ success: false, message: '관심 목록을 불러올 수 없습니다.' });
  }
});

/**
 * GET /api/favorites/sessions
 * 사용자가 관심 등록한 세션 목록 (세션 정보 포함)
 */
router.get('/sessions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    // 관심 등록된 세션 ID 목록
    const favorites = await prisma.userFavorite.findMany({
      where: {
        userId,
        targetType: 'session',
      },
      orderBy: { createdAt: 'desc' },
    });

    const sessionIds = favorites.map(f => f.targetId);

    // 세션 정보 조회
    const sessions = await prisma.session.findMany({
      where: {
        OR: [
          { code: { in: sessionIds } },
          { id: { in: sessionIds } },
        ],
        isActive: true,
      },
      orderBy: [{ track: 'asc' }, { timeSlot: 'asc' }],
    });

    // 관심 등록 시간 포함하여 반환
    const sessionsWithFavorite = sessions.map(session => {
      const favorite = favorites.find(f => f.targetId === session.code || f.targetId === session.id);
      return {
        ...session,
        isFavorite: true,
        favoritedAt: favorite?.createdAt,
      };
    });

    res.json({
      success: true,
      data: sessionsWithFavorite,
    });
  } catch (error) {
    logger.error('관심 세션 목록 조회 실패:', error);
    res.status(500).json({ success: false, message: '관심 세션 목록을 불러올 수 없습니다.' });
  }
});

/**
 * POST /api/favorites/:targetType/:targetId
 * 관심 등록 토글
 */
router.post('/:targetType/:targetId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { targetType, targetId } = req.params;
    const userId = req.user!.userId;

    // targetType 유효성 검사
    if (!['session', 'booth', 'paper'].includes(targetType)) {
      return res.status(400).json({ success: false, message: '잘못된 대상 타입입니다.' });
    }

    // 기존 관심 등록 확인
    const existing = await prisma.userFavorite.findUnique({
      where: {
        unique_favorite: {
          userId,
          targetType,
          targetId,
        },
      },
    });

    let isFavorite: boolean;

    if (existing) {
      // 관심 해제
      await prisma.userFavorite.delete({
        where: { id: existing.id },
      });
      isFavorite = false;
    } else {
      // 관심 등록
      await prisma.userFavorite.create({
        data: {
          userId,
          targetType,
          targetId,
        },
      });
      isFavorite = true;
    }

    res.json({
      success: true,
      data: {
        isFavorite,
        targetType,
        targetId,
      },
    });
  } catch (error) {
    logger.error('관심 등록 토글 실패:', error);
    res.status(500).json({ success: false, message: '관심 등록 처리에 실패했습니다.' });
  }
});

/**
 * GET /api/favorites/check/:targetType/:targetId
 * 특정 대상의 관심 등록 여부 확인
 */
router.get('/check/:targetType/:targetId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { targetType, targetId } = req.params;
    const userId = req.user!.userId;

    const existing = await prisma.userFavorite.findUnique({
      where: {
        unique_favorite: {
          userId,
          targetType,
          targetId,
        },
      },
    });

    res.json({
      success: true,
      data: {
        isFavorite: !!existing,
        targetType,
        targetId,
      },
    });
  } catch (error) {
    logger.error('관심 등록 확인 실패:', error);
    res.status(500).json({ success: false, message: '관심 등록 확인에 실패했습니다.' });
  }
});

/**
 * DELETE /api/favorites/:targetType/:targetId
 * 관심 해제
 */
router.delete('/:targetType/:targetId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { targetType, targetId } = req.params;
    const userId = req.user!.userId;

    const existing = await prisma.userFavorite.findUnique({
      where: {
        unique_favorite: {
          userId,
          targetType,
          targetId,
        },
      },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: '관심 등록된 항목이 아닙니다.' });
    }

    await prisma.userFavorite.delete({
      where: { id: existing.id },
    });

    res.json({
      success: true,
      message: '관심 등록이 해제되었습니다.',
    });
  } catch (error) {
    logger.error('관심 해제 실패:', error);
    res.status(500).json({ success: false, message: '관심 해제에 실패했습니다.' });
  }
});

export default router;
