'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchSessionsWithCache } from '@/lib/sessionCache';
import type { Session } from '@/types/session';
import { parseTimeSlot } from '@/types/session';

const tracks = ['Track 00', 'Track 01', 'Track 10', 'Track i', 'Track 101'];

export default function AdminSessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 관리자 인증 체크
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
  }, [router]);

  const loadSessions = useCallback(async (track?: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchSessionsWithCache();
      if (track) {
        setSessions(data.filter((s: Session) => s.track === track));
      } else {
        setSessions(data);
      }
    } catch (err) {
      console.error('세션 로딩 실패:', err);
      setError('세션 데이터를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions(activeFilter || undefined);
  }, [activeFilter, loadSessions]);

  const handleFilterChange = (filter: string | null) => {
    setActiveFilter(filter);
  };

  return (
    <div className="min-h-[100dvh] bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">세션 Q&A 관리</h1>
            <p className="text-gray-600 text-sm">세션별 질문을 관리합니다. (총 {sessions.length}개)</p>
          </div>
          <Link
            href="/admin"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition text-sm"
          >
            ← 대시보드
          </Link>
        </div>

        {/* 트랙 필터 */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => handleFilterChange(null)}
            className={`px-4 py-2 rounded text-sm font-medium transition shrink-0 ${
              activeFilter === null
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            전체
          </button>
          {tracks.map(track => (
            <button
              key={track}
              onClick={() => handleFilterChange(track)}
              className={`px-4 py-2 rounded text-sm font-medium transition shrink-0 ${
                activeFilter === track
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {track}
            </button>
          ))}
        </div>

        {/* 세션 목록 */}
        <div className="bg-white rounded border border-gray-300">
          {loading ? (
            <div className="p-8 text-center text-gray-500">로딩 중...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">세션이 없습니다.</div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-300">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    코드
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    트랙
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    제목
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    발표자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    시간
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sessions.map(session => {
                  const { startTime, endTime } = parseTimeSlot(session.timeSlot);
                  return (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">
                        {session.code}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 bg-gray-100 rounded text-gray-700 text-xs">
                          {session.track}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">
                        {session.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {session.speakerName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                        {startTime}-{endTime}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link
                          href={`/admin/sessions/${session.code}`}
                          className="px-3 py-1 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition"
                        >
                          Q&A 관리
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
