'use client';

import { useState, useEffect } from 'react';
import { fetchPapers, filterPapers, searchPapers, type Paper } from '@/lib/googleSheets';
import Link from 'next/link';

export default function PapersPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [filteredPapers, setFilteredPapers] = useState<Paper[]>([]);
  const [selectedConference, setSelectedConference] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // 학회 목록 (실제 데이터에서 추출)
  const conferences = ['전체', 'CVPR 2025', 'ICCV 2025', 'ACL 2025', 'EMNLP 2025', 'NeurIPS 2025', 'AAAI 2025', 'ICML', 'NAACL 2025', 'ICLR 2025'];
  const presentationTimes = ['전체', '12:40-13:20', '15:40-16:20', '발표X'];

  useEffect(() => {
    loadPapers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [papers, selectedConference, selectedTime, searchQuery]);

  async function loadPapers() {
    setLoading(true);
    const data = await fetchPapers();
    setPapers(data);
    setLoading(false);
  }

  function applyFilters() {
    let result = papers;

    // 학회 필터
    const conf = selectedConference === '전체' ? undefined : selectedConference;
    // 시간 필터
    const time = selectedTime === '전체' ? undefined : selectedTime;

    result = filterPapers(result, conf, time);

    // 검색
    if (searchQuery.trim()) {
      result = searchPapers(result, searchQuery);
    }

    setFilteredPapers(result);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">포스터 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
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
              placeholder="논문 제목, 저자, 학회명으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* 학회 필터 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">학회별</h3>
            <div className="flex flex-wrap gap-2">
              {conferences.map((conf) => (
                <button
                  key={conf}
                  onClick={() => setSelectedConference(conf)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    (conf === '전체' && !selectedConference) || selectedConference === conf
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {conf}
                </button>
              ))}
            </div>
          </div>

          {/* 발표 시간 필터 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">발표 시간</h3>
            <div className="flex flex-wrap gap-2">
              {presentationTimes.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
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

        {/* 포스터 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPapers.map((paper) => (
            <Link
              key={paper.id}
              href={`/papers/${paper.id}`}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all p-5 group"
            >
              <div className="flex items-start gap-4">
                {/* 학회 아이콘 */}
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <span className="text-2xl">📄</span>
                </div>

                {/* 내용 */}
                <div className="flex-1 min-w-0">
                  {/* 학회 배지 */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-purple-50 text-purple-600 text-xs font-medium rounded-full">
                      {paper.conference}
                    </span>
                    {paper.presentationTime && (
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                        {paper.presentationTime}
                      </span>
                    )}
                  </div>

                  {/* 제목 */}
                  <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {paper.title}
                  </h3>

                  {/* 저자 및 소속 */}
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">{paper.author}</p>
                    {paper.affiliation && (
                      <p className="text-xs text-gray-500 mt-1">{paper.affiliation}</p>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{papers.length}</div>
              <div className="text-sm text-gray-600 mt-1">전체 포스터</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {new Set(papers.map(p => p.conference)).size}
              </div>
              <div className="text-sm text-gray-600 mt-1">참여 학회</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {papers.filter(p => p.presentationTime && p.presentationTime !== '발표X').length}
              </div>
              <div className="text-sm text-gray-600 mt-1">발표 예정</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {new Set(papers.map(p => p.author)).size}
              </div>
              <div className="text-sm text-gray-600 mt-1">참여 연구자</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
