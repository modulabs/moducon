'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Booth } from '@/types/booth';

interface BoothDetailClientProps {
  booth: Booth;
  isModal?: boolean;
  onClose?: () => void;
  imageUrl?: string; // 로컬 이미지 URL 우선 사용
}

export default function BoothDetailClient({ booth, isModal, onClose, imageUrl }: BoothDetailClientProps) {
  const router = useRouter();

  const displayImageUrl = imageUrl || booth.imageUrl;

  // 모달 모드일 때
  if (isModal) {
    return (
      <div className="bg-white rounded-2xl overflow-hidden max-h-[85dvh] overflow-y-auto">
        {/* 모달 헤더 */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b z-10">
          <div className="px-4 py-3 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ← 닫기
            </button>
          </div>
        </div>

        {/* 이미지 */}
        <div className="h-48 bg-gradient-to-br from-purple-100 to-blue-100 relative">
          {displayImageUrl ? (
            <img
              src={displayImageUrl}
              alt={booth.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl mb-2">🏢</div>
                <p className="text-xl font-bold text-gray-700">{booth.name}</p>
              </div>
            </div>
          )}
          {booth.orgType && (
            <div className="absolute top-3 left-3">
              <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-purple-600 shadow-md">
                {booth.orgType}
              </span>
            </div>
          )}
        </div>

        {/* 기본 정보 */}
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{booth.name}</h1>

          {booth.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {booth.hashtags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-purple-50 text-purple-600 text-xs rounded-full font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {booth.managerName && (
            <div className="flex items-center gap-2 text-gray-600 mb-3 text-sm">
              <span className="font-medium">담당자:</span>
              <span>{booth.managerName}</span>
            </div>
          )}
        </div>

        {/* 상세 정보 */}
        <div className="px-4 pb-4 space-y-4">
          {booth.description && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h2 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span>ℹ️</span> 단체 소개
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{booth.description}</p>
            </div>
          )}

          {booth.boothDescription && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h2 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span>🏢</span> 부스 소개
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{booth.boothDescription}</p>
            </div>
          )}

          {booth.solutions && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h2 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span>💡</span> 제공 솔루션
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{booth.solutions}</p>
            </div>
          )}

          {booth.coreTech && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h2 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span>⚙️</span> 핵심 기술
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{booth.coreTech}</p>
            </div>
          )}

          {booth.researchGoals && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h2 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span>🎯</span> 연구 주제 및 목표
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{booth.researchGoals}</p>
            </div>
          )}

          {booth.mainProducts && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h2 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span>📦</span> 주요 제품
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{booth.mainProducts}</p>
            </div>
          )}

          {booth.demoContent && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h2 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span>🎬</span> 부스 내용 (데모)
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{booth.demoContent}</p>
            </div>
          )}

        </div>
      </div>
    );
  }

  // 일반 페이지 모드
  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ← 뒤로 가기
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
                className="w-full h-full object-contain"
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
            {booth.orgType && (
              <div className="absolute top-4 left-4">
                <span className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-purple-600 shadow-md">
                  {booth.orgType}
                </span>
              </div>
            )}
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
            {booth.managerName && (
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <span className="text-sm font-medium">담당자:</span>
                <span className="text-sm">{booth.managerName}</span>
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
          {booth.coreTech && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">⚙️</span>
                핵심 기술
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{booth.coreTech}</p>
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
        <div className="mt-8">
          <Link
            href="/booths"
            className="block px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors text-center"
          >
            목록으로
          </Link>
        </div>
      </div>
    </div>
  );
}
