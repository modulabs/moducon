'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface QuestionFormProps {
  targetType?: 'session' | 'booth' | 'paper'; // 현재 session만 지원, 향후 확장용
  targetId: string;
  onQuestionSubmit: (question: any) => void;
  isCheckedIn?: boolean;
  checkinLoading?: boolean;
}

export default function QuestionForm({ targetId, onQuestionSubmit, isCheckedIn = false, checkinLoading = false }: QuestionFormProps) {
  const pathname = usePathname();
  const { isAuthenticated, token } = useAuthStore();
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // 성공 메시지 자동 숨김
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('질문 내용을 입력해주세요.');
      return;
    }

    if (content.length > 500) {
      setError('질문은 500자 이내로 작성해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // 세션 Q&A만 지원 - /api/sessions/:sessionId/questions
      const response = await fetch(`${API_BASE}/api/sessions/${targetId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: content.trim(), isAnonymous }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '질문 작성에 실패했습니다.');
      }

      // 성공 - 폼 초기화 및 부모에게 알림
      setContent('');
      setIsAnonymous(false);
      setSuccess('질문이 등록되었습니다!');
      onQuestionSubmit(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '질문 작성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
    return (
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <p className="text-gray-600 mb-3">질문을 작성하려면 로그인이 필요합니다.</p>
        <a
          href={loginUrl}
          className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          로그인하기
        </a>
      </div>
    );
  }

  // 체크인 로딩 중
  if (checkinLoading) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <div className="inline-block w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 체크인 안 한 경우
  if (!isCheckedIn) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
        <div className="text-3xl mb-2">📱</div>
        <p className="text-amber-800 font-medium mb-1">QR 체크인 후 질문할 수 있습니다</p>
        <p className="text-amber-600 text-sm">하단의 QR 버튼으로 이 세션에 체크인해주세요</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="세션에 대해 궁금한 점을 질문해주세요..."
        className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        rows={3}
        maxLength={500}
      />

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-600">익명으로 질문</span>
          </label>
          <span className="text-xs text-gray-400">
            {content.length}/500
          </span>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? '작성 중...' : '질문하기'}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}

      {success && (
        <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {success}
        </p>
      )}
    </form>
  );
}
