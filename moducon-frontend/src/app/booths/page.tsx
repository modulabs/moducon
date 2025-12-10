'use client';

import { useState, useEffect } from 'react';
import { fetchBoothsWithCache } from '@/lib/boothCache';
import type { Booth } from '@/types/booth';
import Link from 'next/link';
import BoothMap from '@/components/booths/BoothMap';
import { Map, List } from 'lucide-react';

// 부스 코드 → 로컬 이미지 매핑
const boothImages: Record<string, string> = {
  'B01': '',
  'B02': '/images/booths/khp.webp',
  'B03': '',
  'B04': '/images/booths/bizteam.webp',
  'B05': '/images/booths/nvidia-rapids-lab.webp',
  'B06': '/images/booths/dao-lab.webp',
  'B07': '/images/booths/tenstorrent.webp',
  'B08': '/images/booths/genai-finance.webp',
  'B09': '',
  'B10': '/images/booths/ai-agent-lab.webp',
  'B11': '',
  'B12': '',
  'B13': '/images/booths/what2eat.webp',
  'B14': '/images/booths/persona-lab.webp',
  'B15': '/images/booths/gabangssa.webp',
  'B16': '/images/booths/dongjeop.webp',
  'B17': '/images/booths/ieul-lab.webp',
};

export default function BoothsPage() {
  const [booths, setBooths] = useState<Booth[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B9D] mx-auto"></div>
          <p className="mt-4 text-gray-600">부스 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">부스 안내</h1>
              <p className="text-xs text-gray-500">부스를 터치해서 정보를 확인하세요</p>
            </div>

            {/* 뷰 모드 토글 */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 transition-colors ${
                  viewMode === 'map'
                    ? 'bg-white text-[#FF6B9D] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Map className="w-4 h-4" />
                지도
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-[#FF6B9D] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4" />
                목록
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        {viewMode === 'map' ? (
          /* 맵 뷰 */
          <div className="px-4 py-4">
            <BoothMap booths={booths} />
          </div>
        ) : (
          /* 리스트 뷰 */
          <div className="px-4 py-4 space-y-3">
            {booths.map((booth) => (
              <Link
                key={booth.id}
                href={`/booths/${booth.code}`}
                className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  {/* 이미지 */}
                  <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-[#FF6B9D]/20 to-[#FF8B5A]/20 flex-shrink-0 overflow-hidden">
                    {(() => {
                      const localImage = booth.code ? boothImages[booth.code] : '';
                      const imageUrl = localImage || booth.imageUrl;
                      return imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={booth.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          🏢
                        </div>
                      );
                    })()}
                  </div>

                  {/* 내용 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{booth.name}</h3>
                    {booth.orgType && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-[#FF6B9D]/10 text-[#FF6B9D] text-xs rounded-full">
                        {booth.orgType}
                      </span>
                    )}
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                      {booth.boothDescription || booth.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}

            {booths.length === 0 && (
              <div className="text-center py-12">
                <span className="text-4xl">📭</span>
                <p className="mt-2 text-gray-600">등록된 부스가 없습니다.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
