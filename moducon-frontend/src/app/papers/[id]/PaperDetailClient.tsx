'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Paper } from '@/types/paper';
import SignatureDisplay from '@/components/papers/SignatureDisplay';

interface PaperDetailClientProps {
  paper: Paper;
}

export default function PaperDetailClient({ paper }: PaperDetailClientProps) {
  const router = useRouter();

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
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 포스터 헤더 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          {/* 발표 정보 배지 */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {paper.presentationTime && (
              <span className={`px-4 py-2 text-sm font-medium rounded-full ${
                paper.presentationTime === '발표X'
                  ? 'bg-gray-100 text-gray-600'
                  : 'bg-blue-600 text-white'
              }`}>
                {paper.presentationTime}
              </span>
            )}
            {paper.location && (
              <span className="px-4 py-2 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                {paper.location}
              </span>
            )}
          </div>

          {/* 제목 */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
            {paper.title}
          </h1>

          {/* 연구자 및 소속 */}
          <div className="space-y-2">
            {paper.researcher && (
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium text-gray-500 min-w-16">연구자:</span>
                <span className="text-base font-medium text-gray-900">{paper.researcher}</span>
              </div>
            )}
            {paper.affiliation && (
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium text-gray-500 min-w-16">소속:</span>
                <span className="text-base text-gray-700">{paper.affiliation}</span>
              </div>
            )}
          </div>

          {/* 해시태그 */}
          {paper.hashtags && paper.hashtags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {paper.hashtags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-purple-50 text-purple-600 text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 상세 정보 */}
        <div className="space-y-6">
          {/* 초록 */}
          {paper.abstract && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">📝</span>
                초록
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {paper.abstract}
              </p>
            </div>
          )}

          {/* 서명 섹션 */}
          {paper.researcher && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">✍️</span>
                연구자 서명
              </h2>
              <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                <SignatureDisplay
                  authorName={paper.researcher}
                  className="h-20 w-auto"
                />
              </div>
            </div>
          )}

          {/* 발표 정보 */}
          {paper.presentationTime && paper.presentationTime !== '발표X' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">🎤</span>
                발표 정보
              </h2>
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                <p className="text-sm font-medium text-blue-900 mb-1">발표 시간</p>
                <p className="text-lg font-bold text-blue-600">{paper.presentationTime}</p>
                {paper.location && (
                  <p className="text-sm text-blue-700 mt-2">
                    장소: {paper.location}
                  </p>
                )}
                <p className="text-sm text-blue-700 mt-2">
                  포스터 발표장에서 직접 만나보세요!
                </p>
              </div>
            </div>
          )}

        </div>

        {/* 하단 액션 */}
        <div className="mt-8">
          <Link
            href="/papers"
            className="block px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors text-center"
          >
            목록으로
          </Link>
        </div>
      </div>
    </div>
  );
}
