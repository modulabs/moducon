'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchBooths, type Booth } from '@/lib/googleSheets';
import Link from 'next/link';

export default function BoothDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [booth, setBooth] = useState<Booth | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQRScanner, setShowQRScanner] = useState(false);

  useEffect(() => {
    loadBooth();
  }, [params.id]);

  async function loadBooth() {
    setLoading(true);
    const booths = await fetchBooths();
    const found = booths.find(b => b.id === params.id);
    setBooth(found || null);
    setLoading(false);
  }

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

  if (!booth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-gray-600 text-lg mb-4">부스를 찾을 수 없습니다.</p>
          <Link
            href="/booths"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            부스 목록으로
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ← 뒤로 가기
            </button>
            <button
              onClick={() => setShowQRScanner(true)}
              className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              QR 인증하기
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 부스 헤더 */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          {/* 이미지 */}
          <div className="h-64 bg-gradient-to-br from-purple-100 to-blue-100 relative">
            {booth.imageUrl ? (
              <img
                src={booth.imageUrl}
                alt={booth.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🏢</div>
                  <p className="text-2xl font-bold text-gray-700">{booth.name}</p>
                </div>
              </div>
            )}
            {/* 타입 배지 */}
            <div className="absolute top-4 left-4">
              <span className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-purple-600 shadow-md">
                {booth.type}
              </span>
            </div>
          </div>

          {/* 기본 정보 */}
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{booth.name}</h1>

            {/* 해시태그 */}
            {booth.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {booth.hashtags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-purple-50 text-purple-600 text-sm rounded-full font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* 담당자 */}
            {booth.contactPerson && (
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <span className="text-sm font-medium">담당자:</span>
                <span className="text-sm">{booth.contactPerson}</span>
              </div>
            )}
          </div>
        </div>

        {/* 상세 정보 섹션들 */}
        <div className="space-y-6">
          {/* 단체 소개 */}
          {booth.description && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">ℹ️</span>
                단체 소개
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{booth.description}</p>
            </div>
          )}

          {/* 부스 소개 */}
          {booth.boothDescription && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">🏢</span>
                부스 소개
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{booth.boothDescription}</p>
            </div>
          )}

          {/* 솔루션 */}
          {booth.solutions && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">💡</span>
                제공 솔루션
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{booth.solutions}</p>
            </div>
          )}

          {/* 핵심 기술 */}
          {booth.technologies && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">⚙️</span>
                핵심 기술
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{booth.technologies}</p>
            </div>
          )}

          {/* 연구 주제 및 목표 */}
          {booth.researchGoals && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                연구 주제 및 목표
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{booth.researchGoals}</p>
            </div>
          )}

          {/* 주요 제품 */}
          {booth.mainProducts && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">📦</span>
                주요 제품
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{booth.mainProducts}</p>
            </div>
          )}

          {/* 데모 내용 */}
          {booth.demoContent && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">🎬</span>
                부스 내용 (데모)
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{booth.demoContent}</p>
            </div>
          )}
        </div>

        {/* 하단 액션 */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => setShowQRScanner(true)}
            className="flex-1 px-6 py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            QR 코드로 방문 인증하기
          </button>
          <Link
            href="/booths"
            className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors text-center"
          >
            목록으로
          </Link>
        </div>
      </div>

      {/* QR 스캐너 모달 (placeholder) */}
      {showQRScanner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">QR 스캔</h3>
            <p className="text-gray-600 mb-4">
              부스의 QR 코드를 스캔하여 방문을 인증하세요.
            </p>
            <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center mb-4">
              <p className="text-gray-500">카메라 화면</p>
            </div>
            <button
              onClick={() => setShowQRScanner(false)}
              className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
