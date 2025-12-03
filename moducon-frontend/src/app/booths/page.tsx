'use client';

import { useState, useEffect, useMemo } from 'react';
import { fetchBoothsWithCache } from '@/lib/boothCache';
import type { Booth } from '@/types/booth';
import Link from 'next/link';

export default function BoothsPage() {
  const [booths, setBooths] = useState<Booth[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const boothTypes = [
    '전체',
    '기업',
    '모두의연구소 LAB',
    '모두의연구소 교육사업팀',
    '테크포임팩트 부스',
  ];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchBoothsWithCache();
        setBooths(data);
      } catch (error) {
        console.error('부스 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredBooths = useMemo(() => {
    let result = booths;

    // 타입 필터 (orgType 필드 사용)
    if (selectedType && selectedType !== '전체') {
      result = result.filter(booth => booth.orgType === selectedType);
    }

    // 검색
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(booth =>
        booth.name.toLowerCase().includes(query) ||
        booth.description?.toLowerCase().includes(query) ||
        booth.boothDescription?.toLowerCase().includes(query) ||
        booth.hashtags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return result;
  }, [booths, selectedType, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">부스 정보를 불러오는 중...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">부스 안내</h1>
              <p className="text-sm text-gray-600 mt-1">MODUCON 2025 참가 부스를 만나보세요</p>
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
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          {/* 검색바 */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="부스 이름, 설명, 해시태그로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* 타입 필터 */}
          <div className="flex flex-wrap gap-2">
            {boothTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type === '전체' ? '' : type)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  (type === '전체' && !selectedType) || selectedType === type
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* 부스 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooths.map((booth) => (
            <Link
              key={booth.id}
              href={`/booths/${booth.id}`}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden group"
            >
              {/* 이미지 영역 */}
              <div className="h-48 bg-gradient-to-br from-purple-100 to-blue-100 relative overflow-hidden">
                {booth.imageUrl ? (
                  <img
                    src={booth.imageUrl}
                    alt={booth.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🏢</div>
                      <p className="text-gray-600 font-medium">{booth.name}</p>
                    </div>
                  </div>
                )}
                {/* 타입 배지 */}
                {booth.orgType && (
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-purple-600 shadow-sm">
                      {booth.orgType}
                    </span>
                  </div>
                )}
              </div>

              {/* 내용 영역 */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                  {booth.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {booth.boothDescription || booth.description}
                </p>

                {/* 해시태그 */}
                {booth.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {booth.hashtags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                    {booth.hashtags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{booth.hashtags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* 결과 없음 */}
        {filteredBooths.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-600 text-lg">검색 결과가 없습니다.</p>
            <p className="text-gray-500 text-sm mt-2">다른 검색어를 시도해보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
