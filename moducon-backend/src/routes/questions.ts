import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    userId: string;
    name: string;
  };
}

/**
 * GET /api/questions/:targetType/:targetId
 * 특정 대상(세션/부스/포스터)의 질문 목록 조회
 */
router.get('/:targetType/:targetId', async (req: Request, res: Response) => {
  try {
    const { targetType, targetId } = req.params;
    const { sort = 'popular', page = '1', limit = '20' } = req.query;

    // 현재 사용자 ID (로그인한 경우)
    let currentUserId: string | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const { verifyToken } = await import('../config/jwt');
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
        targetType,
        targetId,
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
            { createdAt: 'desc' }, // 기본은 최신순 (추후 좋아요 수로 변경 가능)
          ],
      skip,
      take: limitNum,
    });

    // 전체 개수
    const total = await prisma.question.count({
      where: { targetType, targetId },
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
    console.error('질문 목록 조회 실패:', error);
    res.status(500).json({ success: false, message: '질문 목록을 불러올 수 없습니다.' });
  }
});

/**
 * POST /api/questions/:targetType/:targetId
 * 질문 작성 (로그인 필요)
 */
router.post('/:targetType/:targetId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { targetType, targetId } = req.params;
    const { content, isAnonymous = false } = req.body;
    const userId = req.user!.userId;

    // 유효성 검사
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: '질문 내용을 입력해주세요.' });
    }

    if (content.length > 500) {
      return res.status(400).json({ success: false, message: '질문은 500자 이내로 작성해주세요.' });
    }

    // targetType 유효성 검사
    if (!['session', 'booth', 'paper'].includes(targetType)) {
      return res.status(400).json({ success: false, message: '잘못된 대상 타입입니다.' });
    }

    // 질문 생성
    const question = await prisma.question.create({
      data: {
        userId,
        targetType,
        targetId,
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
    console.error('질문 작성 실패:', error);
    res.status(500).json({ success: false, message: '질문 작성에 실패했습니다.' });
  }
});

/**
 * DELETE /api/questions/:questionId
 * 본인 질문 삭제 (로그인 필요)
 */
router.delete('/:questionId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { questionId } = req.params;
    const userId = req.user!.userId;

    // 질문 조회
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return res.status(404).json({ success: false, message: '질문을 찾을 수 없습니다.' });
    }

    // 본인 질문인지 확인
    if (question.userId !== userId) {
      return res.status(403).json({ success: false, message: '본인의 질문만 삭제할 수 있습니다.' });
    }

    // 삭제
    await prisma.question.delete({
      where: { id: questionId },
    });

    res.json({ success: true, message: '질문이 삭제되었습니다.' });
  } catch (error) {
    console.error('질문 삭제 실패:', error);
    res.status(500).json({ success: false, message: '질문 삭제에 실패했습니다.' });
  }
});

/**
 * POST /api/questions/:questionId/like
 * 좋아요 토글 (로그인 필요)
 */
router.post('/:questionId/like', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { questionId } = req.params;
    const userId = req.user!.userId;

    // 질문 존재 확인
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { likes: true },
    });

    if (!question) {
      return res.status(404).json({ success: false, message: '질문을 찾을 수 없습니다.' });
    }

    // 기존 좋아요 확인
    const existingLike = await prisma.questionLike.findUnique({
      where: {
        unique_question_like: {
          questionId,
          userId,
        },
      },
    });

    let isLiked: boolean;
    let likeCount: number;

    if (existingLike) {
      // 좋아요 취소
      await prisma.questionLike.delete({
        where: { id: existingLike.id },
      });
      isLiked = false;
      likeCount = question.likes.length - 1;
    } else {
      // 좋아요 추가
      await prisma.questionLike.create({
        data: {
          questionId,
          userId,
        },
      });
      isLiked = true;
      likeCount = question.likes.length + 1;
    }

    res.json({
      success: true,
      data: {
        isLiked,
        likeCount,
      },
    });
  } catch (error) {
    console.error('좋아요 토글 실패:', error);
    res.status(500).json({ success: false, message: '좋아요 처리에 실패했습니다.' });
  }
});

/**
 * POST /api/questions/:questionId/answer
 * 답변 작성 (관리자용 - 추후 권한 체크 추가)
 */
router.post('/:questionId/answer', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { questionId } = req.params;
    const { content, answeredBy } = req.body;

    // 유효성 검사
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: '답변 내용을 입력해주세요.' });
    }

    // 질문 존재 확인
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return res.status(404).json({ success: false, message: '질문을 찾을 수 없습니다.' });
    }

    // 기존 답변 확인
    const existingAnswer = await prisma.questionAnswer.findUnique({
      where: { questionId },
    });

    let answer;
    if (existingAnswer) {
      // 답변 수정
      answer = await prisma.questionAnswer.update({
        where: { questionId },
        data: {
          content: content.trim(),
          answeredBy: answeredBy || null,
        },
      });
    } else {
      // 새 답변 생성
      answer = await prisma.questionAnswer.create({
        data: {
          questionId,
          content: content.trim(),
          answeredBy: answeredBy || null,
        },
      });

      // 질문 상태 업데이트
      await prisma.question.update({
        where: { id: questionId },
        data: { isAnswered: true },
      });
    }

    res.status(201).json({
      success: true,
      data: {
        id: answer.id,
        content: answer.content,
        answeredBy: answer.answeredBy,
        createdAt: answer.createdAt,
      },
    });
  } catch (error) {
    console.error('답변 작성 실패:', error);
    res.status(500).json({ success: false, message: '답변 작성에 실패했습니다.' });
  }
});

export default router;
