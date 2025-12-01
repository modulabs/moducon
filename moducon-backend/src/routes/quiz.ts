import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { successResponse, errorResponse } from '../utils/response';
import { logger } from '../utils/logger';
import { prisma } from '../lib/prisma';

const router = Router();

// 1. GET /api/quiz/:targetType/:targetId - 퀴즈 조회 (정답 숨김)
router.get('/:targetType/:targetId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { targetType, targetId } = req.params;

    // 유효성 검사
    if (!['session', 'booth', 'paper'].includes(targetType)) {
      return errorResponse(
        res,
        'targetType은 session, booth, paper 중 하나여야 합니다.',
        400,
        'INVALID_TARGET_TYPE'
      );
    }

    const quiz = await prisma.quiz.findFirst({
      where: {
        targetType,
        targetId,
        isActive: true,
      },
      select: {
        id: true,
        question: true,
        options: true,
        // correctAnswer는 클라이언트에 노출하지 않음 (보안)
      },
    });

    if (!quiz) {
      return errorResponse(res, '퀴즈를 찾을 수 없습니다.', 404, 'QUIZ_NOT_FOUND');
    }

    logger.debug(`Retrieved quiz ${quiz.id} for ${targetType}:${targetId}`);

    return successResponse(res, { quiz });
  } catch (error) {
    logger.error('퀴즈 조회 실패:', error);
    return errorResponse(res, '퀴즈 조회 중 오류가 발생했습니다.', 500, 'QUIZ_FETCH_FAILED');
  }
});

// 2. POST /api/quiz/submit - 퀴즈 제출 및 정답 확인
router.post('/submit', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { quizId, answer } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return errorResponse(res, '인증이 필요합니다.', 401, 'UNAUTHORIZED');
    }

    // 입력 검증
    if (!quizId) {
      return errorResponse(res, 'quizId는 필수입니다.', 400, 'QUIZ_ID_REQUIRED');
    }

    if (typeof answer !== 'number' || answer < 0 || answer > 3) {
      return errorResponse(
        res,
        'answer는 0에서 3 사이의 숫자여야 합니다.',
        400,
        'INVALID_ANSWER'
      );
    }

    // 퀴즈 조회
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      return errorResponse(res, '퀴즈를 찾을 수 없습니다.', 404, 'QUIZ_NOT_FOUND');
    }

    if (!quiz.isActive) {
      return errorResponse(res, '비활성화된 퀴즈입니다.', 400, 'QUIZ_INACTIVE');
    }

    // 정답 확인
    const isCorrect = answer === quiz.correctAnswer;

    // 응답 기록 저장
    const attempt = await prisma.userQuizAttempt.create({
      data: {
        userId,
        quizId,
        answer,
        isCorrect,
      },
    });

    logger.info(
      `User ${userId} submitted quiz ${quizId}: ${isCorrect ? 'CORRECT' : 'INCORRECT'} (attempt ID: ${attempt.id})`
    );

    // 정답 시에만 정답 값 노출
    return successResponse(res, {
      isCorrect,
      correctAnswer: isCorrect ? quiz.correctAnswer : undefined,
      explanation: isCorrect
        ? '정답입니다! 🎉'
        : '오답입니다. 다시 한번 생각해보세요. 🤔',
    });
  } catch (error) {
    logger.error('퀴즈 제출 실패:', error);
    return errorResponse(res, '퀴즈 제출 중 오류가 발생했습니다.', 500, 'QUIZ_SUBMIT_FAILED');
  }
});

export default router;
