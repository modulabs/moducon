/**
 * 질문 개별 작업 라우트
 * 질문 목록/작성은 /api/sessions/:sessionId/questions 로 이동
 * 이 파일은 개별 질문에 대한 좋아요, 삭제, 답변 작업만 처리
 */

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
