'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import type { Question } from './types';

interface QuestionCardProps {
  question: Question;
  onLikeToggle: (questionId: string, isLiked: boolean, likeCount: number) => void;
  onDelete: (questionId: string) => void;
}

export default function QuestionCard({ question, onLikeToggle, onDelete }: QuestionCardProps) {
  const { isAuthenticated, token, isHydrated } = useAuthStore();
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // hydrate 전에는 로그인 상태를 알 수 없으므로 대기
  const canInteract = isHydrated && isAuthenticated;

  const handleLike = async () => {
    if (!canInteract || isLiking) return;

    setIsLiking(true);
    try {
      const response = await fetch(`${API_BASE}/api/questions/${question.id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        onLikeToggle(question.id, data.data.isLiked, data.data.likeCount);
      }
    } catch (error) {
      console.error('좋아요 실패:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('질문을 삭제하시겠습니까?')) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`${API_BASE}/api/questions/${question.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        onDelete(question.id);
      }
    } catch (error) {
      console.error('삭제 실패:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  return (
    <div className={`p-4 rounded-lg border ${question.isPinned ? 'border-purple-300 bg-purple-50' : 'border-gray-100 bg-white'}`}>
      {/* 고정 배지 */}
      {question.isPinned && (
        <div className="flex items-center gap-1 text-purple-600 text-xs font-medium mb-2">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
          </svg>
          고정된 질문
        </div>
      )}

      {/* 질문 내용 */}
      <p className="text-gray-800 mb-3 whitespace-pre-wrap">{question.content}</p>

      {/* 메타 정보 */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3 text-gray-500">
          <span>{question.author.name}</span>
          <span>·</span>
          <span>{formatDate(question.createdAt)}</span>
          {question.isAnswered && (
            <>
              <span>·</span>
              <span className="text-green-600 font-medium">답변완료</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* 좋아요 버튼 */}
          <button
            onClick={handleLike}
            disabled={!canInteract || isLiking}
            className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
              question.isLiked
                ? 'text-red-500 bg-red-50'
                : 'text-gray-500 hover:bg-gray-100'
            } ${!canInteract ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <svg
              className="w-4 h-4"
              fill={question.isLiked ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span>{question.likeCount}</span>
          </button>

          {/* 삭제 버튼 (본인 질문만) */}
          {question.isOwner && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-gray-400 hover:text-red-500 transition-colors p-1"
              title="삭제"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 답변 섹션 */}
      {question.answer && (
        <div className="mt-3">
          <button
            onClick={() => setShowAnswer(!showAnswer)}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
          >
            {showAnswer ? '답변 접기' : '답변 보기'}
            <svg
              className={`w-4 h-4 transform transition-transform ${showAnswer ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showAnswer && (
            <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-700 font-medium text-sm">
                  {question.answer.answeredBy || '운영진'}
                </span>
                <span className="text-green-600 text-xs">
                  {formatDate(question.answer.createdAt)}
                </span>
              </div>
              <p className="text-green-800 text-sm whitespace-pre-wrap">
                {question.answer.content}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
