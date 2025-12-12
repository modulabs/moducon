/**
 * 마이페이지 라우트
 * 사용자 정보, 체크인, 관심, 배지, 통계 통합 API
 */

import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// 배지 정의 (3개)
const BADGE_DEFINITIONS = [
  {
    id: 'session_master',
    name: '세션 마스터',
    description: '3개 세션 참석',
    icon: '🎤',
    condition: (stats: Stats) => stats.sessionCheckins >= 3,
    progress: (stats: Stats) => Math.min(stats.sessionCheckins, 3),
    target: 3,
  },
  {
    id: 'booth_explorer',
    name: '부스 탐험가',
    description: '5개 부스 방문',
    icon: '🏢',
    condition: (stats: Stats) => stats.boothCheckins >= 5,
    progress: (stats: Stats) => Math.min(stats.boothCheckins, 5),
    target: 5,
  },
  {
    id: 'paper_researcher',
    name: '논문 연구원',
    description: '5개 포스터 방문',
    icon: '📄',
    condition: (stats: Stats) => stats.paperCheckins >= 5,
    progress: (stats: Stats) => Math.min(stats.paperCheckins, 5),
    target: 5,
  },
];

interface Stats {
  totalCheckins: number;
  sessionCheckins: number;
  boothCheckins: number;
  paperCheckins: number;
  quizAttempts: number;
  quizCorrect: number;
  questionsAsked: number;
}

/**
 * GET /api/mypage
 * 마이페이지 전체 데이터 조회 (본인만)
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        signatures: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    }

    // 병렬로 모든 데이터 조회
    const [
      checkins,
      favorites,
      quizAttempts,
      quizCorrect,
      questionsAsked,
      sessions,
      booths,
      posters,
    ] = await Promise.all([
      // 체크인 목록
      prisma.userCheckin.findMany({
        where: { userId },
        orderBy: { checkedInAt: 'desc' },
      }),
      // 관심 목록
      prisma.userFavorite.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      // 퀴즈 시도 수
      prisma.userQuizAttempt.count({ where: { userId } }),
      // 퀴즈 정답 수
      prisma.userQuizAttempt.count({ where: { userId, isCorrect: true } }),
      // 질문 수
      prisma.question.count({ where: { userId } }),
      // 세션 정보 (체크인/관심 상세 정보용)
      prisma.session.findMany({ where: { isActive: true } }),
      // 부스 정보
      prisma.booth.findMany({ where: { isActive: true } }),
      // 포스터 정보
      prisma.poster.findMany({ where: { isActive: true } }),
    ]);

    // 체크인 타입별 분류 및 상세 정보 추가
    const sessionCheckins = checkins.filter(c => c.targetType === 'session');
    const boothCheckins = checkins.filter(c => c.targetType === 'booth');
    const paperCheckins = checkins.filter(c => c.targetType === 'paper');

    // 체크인에 상세 정보 추가
    const enrichCheckin = (checkin: typeof checkins[0]) => {
      let target = null;
      if (checkin.targetType === 'session') {
        const session = sessions.find(s => s.code === checkin.targetId || s.id === checkin.targetId);
        target = session ? { title: session.title, speakerName: session.speakerName, track: session.track } : null;
      } else if (checkin.targetType === 'booth') {
        const booth = booths.find(b => b.code === checkin.targetId || b.id === checkin.targetId);
        target = booth ? { name: booth.name, organization: booth.organization } : null;
      } else if (checkin.targetType === 'paper') {
        const poster = posters.find(p => p.code === checkin.targetId || p.id === checkin.targetId);
        target = poster ? { title: poster.title, researcher: poster.researcher } : null;
      }
      return {
        targetType: checkin.targetType,
        targetId: checkin.targetId,
        checkedInAt: checkin.checkedInAt,
        target,
      };
    };

    // 관심 타입별 분류 및 상세 정보 추가
    const sessionFavorites = favorites.filter(f => f.targetType === 'session');
    const boothFavorites = favorites.filter(f => f.targetType === 'booth');
    const paperFavorites = favorites.filter(f => f.targetType === 'paper');

    const enrichFavorite = (favorite: typeof favorites[0]) => {
      let target = null;
      if (favorite.targetType === 'session') {
        const session = sessions.find(s => s.code === favorite.targetId || s.id === favorite.targetId);
        target = session ? { title: session.title, speakerName: session.speakerName, track: session.track, timeSlot: session.timeSlot, location: session.location } : null;
      } else if (favorite.targetType === 'booth') {
        const booth = booths.find(b => b.code === favorite.targetId || b.id === favorite.targetId);
        target = booth ? { name: booth.name, organization: booth.organization } : null;
      } else if (favorite.targetType === 'paper') {
        const poster = posters.find(p => p.code === favorite.targetId || p.id === favorite.targetId);
        target = poster ? { title: poster.title, researcher: poster.researcher } : null;
      }
      return {
        targetType: favorite.targetType,
        targetId: favorite.targetId,
        createdAt: favorite.createdAt,
        target,
      };
    };

    // 통계 계산
    const stats: Stats = {
      totalCheckins: checkins.length,
      sessionCheckins: sessionCheckins.length,
      boothCheckins: boothCheckins.length,
      paperCheckins: paperCheckins.length,
      quizAttempts,
      quizCorrect,
      questionsAsked,
    };

    // 배지 계산
    const badges = BADGE_DEFINITIONS.map(badge => ({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      earned: badge.condition(stats),
      progress: badge.progress(stats),
      target: badge.target,
    }));

    const earnedBadges = badges.filter(b => b.earned);

    logger.debug(`마이페이지 조회 - userId: ${userId}, 체크인: ${stats.totalCheckins}, 관심: ${favorites.length}, 배지: ${earnedBadges.length}/${badges.length}`);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          signatureUrl: user.signatureUrl,
          signatureData: user.signatures?.signatureData || null,
          registrationType: user.registrationType,
          registeredAt: user.registeredAt,
        },
        checkins: {
          total: checkins.length,
          sessions: sessionCheckins.map(enrichCheckin),
          booths: boothCheckins.map(enrichCheckin),
          papers: paperCheckins.map(enrichCheckin),
        },
        favorites: {
          total: favorites.length,
          sessions: sessionFavorites.map(enrichFavorite),
          booths: boothFavorites.map(enrichFavorite),
          papers: paperFavorites.map(enrichFavorite),
        },
        badges,
        stats: {
          ...stats,
          totalBadges: badges.length,
          earnedBadges: earnedBadges.length,
          completionRate: Math.round((earnedBadges.length / badges.length) * 100),
        },
      },
    });
  } catch (error) {
    logger.error('마이페이지 조회 실패:', error);
    res.status(500).json({ success: false, message: '마이페이지 정보를 불러올 수 없습니다.' });
  }
});

export default router;
