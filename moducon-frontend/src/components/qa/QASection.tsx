'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import QuestionForm from './QuestionForm';
import QuestionCard from './QuestionCard';
import type { Question, TargetType } from './types';

interface QASectionProps {
  targetType: TargetType;
  targetId: string;
  title?: string;
}

export default function QASection({ targetType, targetId, title = 'Q&A' }: QASectionProps) {
  const { user, token, isAuthenticated } = useAuthStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'popular' | 'recent'>('popular');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkinLoading, setCheckinLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // 체크인 여부 확인
  useEffect(() => {
    const checkCheckinStatus = async () => {
      if (!isAuthenticated || !user?.id || !token) {
        setCheckinLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/checkin/user/${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          const checkins = data.data?.checkins || [];
          // 해당 세션에 체크인했는지 확인
          const hasCheckedIn = checkins.some(
            (c: { targetType: string; targetId: string }) =>
              c.targetType === targetType && c.targetId === targetId
          );
          setIsCheckedIn(hasCheckedIn);
        }
      } catch (err) {
        console.error('체크인 상태 확인 실패:', err);
      } finally {
        setCheckinLoading(false);
      }
    };

    checkCheckinStatus();
  }, [API_BASE, isAuthenticated, user?.id, token, targetType, targetId]);

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 로컬 스토리지에서 토큰 가져오기 (좋아요 상태 확인용)
      const token = typeof window !== 'undefined' ? localStorage.getItem('moducon_token') : null;

      // 세션 Q&A만 지원 - /api/sessions/:sessionId/questions
      const response = await fetch(
        `${API_BASE}/api/sessions/${targetId}/questions?sort=${sortBy}&page=${pagination.page}`,
        {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '질문을 불러올 수 없습니다.');
      }

      setQuestions(data.data.questions);
      setPagination(data.data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : '질문을 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE, targetType, targetId, sortBy, pagination.page]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleQuestionSubmit = (newQuestion: Question) => {
    setQuestions(prev => [newQuestion, ...prev]);
    setPagination(prev => ({ ...prev, total: prev.total + 1 }));
  };

  const handleLikeToggle = (questionId: string, isLiked: boolean, likeCount: number) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId ? { ...q, isLiked, likeCount } : q
      )
    );
  };

  const handleDelete = (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
    setPagination(prev => ({ ...prev, total: prev.total - 1 }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span className="text-2xl">💬</span>
          {title}
          {pagination.total > 0 && (
            <span className="text-sm font-normal text-gray-500">
              ({pagination.total})
            </span>
          )}
        </h2>

        {/* 정렬 탭 */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setSortBy('popular')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              sortBy === 'popular'
                ? 'bg-white text-purple-600 shadow-sm font-medium'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            인기순
          </button>
          <button
            onClick={() => setSortBy('recent')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              sortBy === 'recent'
                ? 'bg-white text-purple-600 shadow-sm font-medium'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            최신순
          </button>
        </div>
      </div>

      {/* 질문 작성 폼 */}
      <div className="mb-6">
        <QuestionForm
          targetType={targetType}
          targetId={targetId}
          onQuestionSubmit={handleQuestionSubmit}
          isCheckedIn={isCheckedIn}
          checkinLoading={checkinLoading}
        />
      </div>

      {/* 질문 목록 */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-2 text-gray-500 text-sm">질문을 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
            <button
              onClick={fetchQuestions}
              className="mt-2 text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              다시 시도
            </button>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>아직 등록된 질문이 없습니다.</p>
            <p className="text-sm mt-1">첫 번째 질문을 남겨보세요!</p>
          </div>
        ) : (
          questions.map(question => (
            <QuestionCard
              key={question.id}
              question={question}
              onLikeToggle={handleLikeToggle}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* 페이지네이션 (추후 구현) */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            className="px-3 py-1 text-sm border rounded-md disabled:opacity-50"
          >
            이전
          </button>
          <span className="px-3 py-1 text-sm">
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.totalPages}
            className="px-3 py-1 text-sm border rounded-md disabled:opacity-50"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
