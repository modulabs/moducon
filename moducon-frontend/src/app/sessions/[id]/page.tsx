'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchSessionsWithCache } from '@/lib/sessionCache';
import SessionDetailClient from './SessionDetailClient';
import Link from 'next/link';
import type { Session } from '@/types/session';

export default function SessionDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadSession() {
      try {
        const sessions = await fetchSessionsWithCache();
        const found = sessions.find(s => s.code === id || s.id === id);
        setSession(found || null);
      } catch (err) {
        console.error('세션 로딩 실패:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadSession();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">세션 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-gray-600 text-lg mb-4">데이터를 불러올 수 없습니다.</p>
          <Link
            href="/sessions"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-block"
          >
            세션 목록으로
          </Link>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎤</div>
          <p className="text-gray-600 text-lg mb-4">세션을 찾을 수 없습니다.</p>
          <Link
            href="/sessions"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-block"
          >
            세션 목록으로
          </Link>
        </div>
      </div>
    );
  }

  return <SessionDetailClient session={session} />;
}
