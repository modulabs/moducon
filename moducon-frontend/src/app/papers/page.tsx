'use client';

import { useState, useEffect, useMemo } from 'react';
import { fetchPapersWithCache, filterPapers, searchPapers } from '@/lib/paperCache';
import type { Paper } from '@/types/paper';
import Link from 'next/link';
import SignatureDisplay from '@/components/papers/SignatureDisplay';

export default function PapersPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const presentationTimes = ['전체', '12:40-13:20', '15:40-16:20', '발표X'];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchPapersWithCache();
        setPapers(data);
      } catch (error) {
        console.error('포스터 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredPapers = useMemo(() => {
    let result = papers;

    // 시간 필터
    const time = selectedTime === '전체' ? undefined : selectedTime;
    result = filterPapers(result, time);

    // 검색
    if (searchQuery.trim()) {
      result = searchPapers(result, searchQuery);
    }

    return result;
  }, [papers, selectedTime, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">포스터 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">포스터 발표</h1>
              <p className="text-sm text-gray-600 mt-1">MODUCON 2025 연구 포스터를 만나보세요</p>
            </div>
            <Link
              href="/home"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ← 홈으로
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 검색 및 필터 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 space-y-4">
          {/* 검색바 */}
          <div>
            <input
              type="text"
              placeholder="논문 제목, 연구자, 소속, 해시태그로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* 발표 시간 필터 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">발표 시간</h3>
            <div className="flex flex-wrap gap-2">
              {presentationTimes.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time === '전체' ? '' : time)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    (time === '전체' && !selectedTime) || selectedTime === time
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 포스터 목록 - 테이블 형식 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    논문명
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    연구자
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    발표시간
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    장소
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    서명
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPapers.map((paper) => (
                  <tr key={paper.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <Link
                        href={`/papers/${paper.code}`}
                        className="text-sm font-medium text-gray-900 hover:text-purple-600 line-clamp-2"
                      >
                        {paper.title}
                      </Link>
                      {/* 해시태그 */}
                      {paper.hashtags && paper.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {paper.hashtags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-purple-50 text-purple-600 text-xs rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{paper.researcher || '-'}</div>
                        {paper.affiliation && (
                          <div className="text-xs text-gray-500">{paper.affiliation}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {paper.presentationTime ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {paper.presentationTime}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {paper.location ? (
                        <span className="text-sm text-gray-600">{paper.location}</span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <SignatureDisplay
                        authorName={paper.researcher || ''}
                        className="h-12 w-full"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 결과 없음 */}
        {filteredPapers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-600 text-lg">검색 결과가 없습니다.</p>
            <p className="text-gray-500 text-sm mt-2">다른 검색어를 시도해보세요.</p>
          </div>
        )}

        {/* 통계 */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">포스터 통계</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{papers.length}</div>
              <div className="text-sm text-gray-600 mt-1">전체 포스터</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {papers.filter(p => p.presentationTime && p.presentationTime !== '발표X').length}
              </div>
              <div className="text-sm text-gray-600 mt-1">발표 예정</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {new Set(papers.map(p => p.researcher).filter(Boolean)).size}
              </div>
              <div className="text-sm text-gray-600 mt-1">참여 연구자</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
