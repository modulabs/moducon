'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Session } from '@/types/session';
import { parseTimeSlot } from '@/types/session';
import { QASection } from '@/components/qa';
import { useAuthStore } from '@/store/authStore';

interface SessionDetailClientProps {
  session: Session;
}

export default function SessionDetailClient({ session }: SessionDetailClientProps) {
  const router = useRouter();
  const { isAuthenticated, token, isHydrated } = useAuthStore();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const { startTime, endTime } = parseTimeSlot(session.timeSlot);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // 관심 등록 상태 확인
  useEffect(() => {
    if (!isHydrated || !isAuthenticated || !token) return;

    const checkFavorite = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/api/favorites/check/session/${session.code}`,
          {
            headers: { 'Authorization': `Bearer ${token}` },
          }
        );
        const data = await response.json();
        if (response.ok) {
          setIsFavorite(data.data.isFavorite);
        }
      } catch (error) {
        console.error('관심 등록 확인 실패:', error);
      }
    };

    checkFavorite();
  }, [isHydrated, isAuthenticated, token, session.code, API_BASE]);

  // 관심 등록/해제 토글
  const handleFavoriteToggle = async () => {
    if (!isAuthenticated || !token || isFavoriteLoading) return;

    setIsFavoriteLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/favorites/session/${session.code}`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setIsFavorite(data.data.isFavorite);
      }
    } catch (error) {
      console.error('관심 등록 실패:', error);
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  // 트랙별 색상 설정
  const trackColors: Record<string, { bg: string; text: string; gradient: string }> = {
    'Track 00': { bg: 'bg-purple-100', text: 'text-purple-700', gradient: 'from-purple-500 to-purple-700' },
    'Track 01': { bg: 'bg-blue-100', text: 'text-blue-700', gradient: 'from-blue-500 to-blue-700' },
    'Track 10': { bg: 'bg-green-100', text: 'text-green-700', gradient: 'from-green-500 to-green-700' },
    'Track i': { bg: 'bg-orange-100', text: 'text-orange-700', gradient: 'from-orange-500 to-orange-700' },
    'Track 101': { bg: 'bg-pink-100', text: 'text-pink-700', gradient: 'from-pink-500 to-pink-700' },
  };

  const colors = trackColors[session.track] || { bg: 'bg-gray-100', text: 'text-gray-700', gradient: 'from-gray-500 to-gray-700' };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ← 뒤로 가기
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleFavoriteToggle}
                disabled={!isHydrated || !isAuthenticated || isFavoriteLoading}
                className={`p-2 transition-colors ${
                  isFavorite
                    ? 'text-red-500'
                    : 'text-gray-500 hover:text-red-500'
                } ${(!isHydrated || !isAuthenticated) ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isFavorite ? '관심 해제' : '관심 등록'}
              >
                <svg
                  className={`w-6 h-6 ${isFavoriteLoading ? 'animate-pulse' : ''}`}
                  fill={isFavorite ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 세션 헤더 */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          {/* 그라데이션 배너 */}
          <div className={`h-32 bg-gradient-to-r ${colors.gradient} relative`}>
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute bottom-4 left-6 right-6">
              <span className={`px-3 py-1 ${colors.bg} ${colors.text} text-sm rounded-full font-medium`}>
                {session.track}
              </span>
            </div>
          </div>

          {/* 기본 정보 */}
          <div className="p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
              {session.title}
            </h1>

            {/* 연사 정보 */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
                {session.speakerName.charAt(0)}
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">{session.speakerName}</p>
                {session.speakerOrg && (
                  <p className="text-sm text-gray-600">{session.speakerOrg}</p>
                )}
              </div>
            </div>

            {/* 시간 및 장소 */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  시간
                </div>
                <p className="font-mono font-semibold text-gray-900">
                  {startTime} - {endTime}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  장소
                </div>
                <p className="font-semibold text-gray-900">{session.location}</p>
              </div>
            </div>

            {/* 키워드 */}
            {session.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {session.keywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-purple-50 text-purple-600 text-sm rounded-full font-medium"
                  >
                    #{keyword}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 상세 정보 섹션들 */}
        <div className="space-y-6">
          {/* 발표 소개 */}
          {session.description && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">📋</span>
                발표 소개
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {session.description}
              </p>
            </div>
          )}

          {/* 연사 소개 */}
          {session.speakerBio && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">👤</span>
                연사 소개
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {session.speakerBio}
              </p>
            </div>
          )}

          {/* Q&A 섹션 */}
          <QASection targetType="session" targetId={session.code} />
        </div>

        {/* 하단 액션 */}
        <div className="mt-8">
          <Link
            href="/sessions"
            className="block px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors text-center"
          >
            목록으로
          </Link>
        </div>
      </div>
    </div>
  );
}
