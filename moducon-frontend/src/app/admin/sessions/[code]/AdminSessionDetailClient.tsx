'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchSessionsWithCache } from '@/lib/sessionCache';
import type { Session } from '@/types/session';
import { parseTimeSlot } from '@/types/session';

interface Question {
  id: string;
  content: string;
  isAnonymous: boolean;
  author: {
    id: string | null;
    name: string;
  };
  likeCount: number;
  isAnswered: boolean;
  isPinned: boolean;
  createdAt: string;
}

export default function AdminSessionDetailClient() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;

  const [session, setSession] = useState<Session | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'popular' | 'recent'>('popular');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
  }, [router]);

  // 세션 정보 로드
  useEffect(() => {
    const loadSession = async () => {
      try {
        const sessions = await fetchSessionsWithCache();
        const found = sessions.find((s: Session) => s.code === code);
        if (found) {
          setSession(found);
        } else {
          setError('세션을 찾을 수 없습니다.');
        }
      } catch (err) {
        console.error('세션 로딩 실패:', err);
        setError('세션 데이터를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [code]);

  // 질문 목록 로드
  const loadQuestions = useCallback(async () => {
    if (!session) return;

    setQuestionsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/sessions/${session.code}/questions?sort=${sortBy}&limit=100`
      );
      const data = await response.json();

      if (response.ok) {
        setQuestions(data.data.questions || []);
      } else {
        console.error('질문 로딩 실패:', data);
      }
    } catch (err) {
      console.error('질문 로딩 실패:', err);
    } finally {
      setQuestionsLoading(false);
    }
  }, [API_BASE, session, sortBy]);

  useEffect(() => {
    if (session) {
      loadQuestions();
    }
  }, [session, loadQuestions]);

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('이 질문을 삭제하시겠습니까?')) return;

    const adminToken = localStorage.getItem('admin_token');
    if (!adminToken) {
      alert('관리자 인증이 필요합니다.');
      router.push('/admin/login');
      return;
    }

    setDeletingIds(prev => new Set(prev).add(questionId));

    try {
      const response = await fetch(`${API_BASE}/api/admin/questions/${questionId}`, {
        method: 'DELETE',
        headers: {
          'x-admin-token': adminToken,
        },
      });

      if (response.ok) {
        setQuestions(prev => prev.filter(q => q.id !== questionId));
      } else {
        const data = await response.json();
        alert(data.error?.message || '삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('삭제 실패:', err);
      alert('삭제에 실패했습니다.');
    } finally {
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(questionId);
        return next;
      });
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

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-[100dvh] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || '세션을 찾을 수 없습니다.'}</p>
          <Link href="/admin/sessions" className="text-gray-600 hover:text-gray-900">
            ← 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const { startTime, endTime } = parseTimeSlot(session.timeSlot);

  return (
    <div className="min-h-[100dvh] bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-6">
          <Link
            href="/admin/sessions"
            className="text-gray-600 hover:text-gray-900 text-sm mb-2 inline-block"
          >
            ← 세션 목록
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-gray-200 rounded text-gray-700 text-xs font-mono">
                  {session.code}
                </span>
                <span className="px-2 py-1 bg-gray-100 rounded text-gray-600 text-xs">
                  {session.track}
                </span>
                <span className="text-gray-500 text-xs font-mono">
                  {startTime}-{endTime}
                </span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">{session.title}</h1>
              <p className="text-gray-600 text-sm">{session.speakerName}</p>
            </div>
          </div>
        </div>

        {/* Q&A 관리 섹션 */}
        <div className="bg-white rounded border border-gray-300">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">
              질문 관리 ({questions.length}개)
            </h2>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSortBy('popular')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  sortBy === 'popular'
                    ? 'bg-white text-gray-900 shadow-sm font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                인기순
              </button>
              <button
                onClick={() => setSortBy('recent')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  sortBy === 'recent'
                    ? 'bg-white text-gray-900 shadow-sm font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                최신순
              </button>
            </div>
          </div>

          {questionsLoading ? (
            <div className="p-8 text-center text-gray-500">질문을 불러오는 중...</div>
          ) : questions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">등록된 질문이 없습니다.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {questions.map(question => (
                <div
                  key={question.id}
                  className={`px-6 py-4 ${question.isPinned ? 'bg-purple-50' : ''}`}
                >
                  {/* 배지들 */}
                  <div className="flex items-center gap-2 mb-2">
                    {question.isPinned && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                        고정
                      </span>
                    )}
                    {question.isAnswered && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                        답변완료
                      </span>
                    )}
                    {question.isAnonymous && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        익명
                      </span>
                    )}
                  </div>

                  {/* 질문 내용 */}
                  <p className="text-gray-800 mb-3 whitespace-pre-wrap">{question.content}</p>

                  {/* 메타 정보 및 액션 */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3 text-gray-500">
                      <span>{question.author.name}</span>
                      <span>·</span>
                      <span>{formatDate(question.createdAt)}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {question.likeCount}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteQuestion(question.id)}
                      disabled={deletingIds.has(question.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition disabled:opacity-50"
                    >
                      {deletingIds.has(question.id) ? '삭제 중...' : '삭제'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
