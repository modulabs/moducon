'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchPapers, type Paper } from '@/lib/googleSheets';
import Link from 'next/link';

// Static Export를 위한 generateStaticParams
export async function generateStaticParams() {
  // 현재는 샘플 데이터만 있으므로 빈 배열 반환
  // 실제 데이터가 있을 경우 모든 포스터 ID를 반환
  return [];
}

export default function PaperDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQRScanner, setShowQRScanner] = useState(false);

  useEffect(() => {
    loadPaper();
  }, [params.id]);

  async function loadPaper() {
    setLoading(true);
    const papers = await fetchPapers();
    const found = papers.find(p => p.id === params.id);
    setPaper(found || null);
    setLoading(false);
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

  if (!paper) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-gray-600 text-lg mb-4">포스터를 찾을 수 없습니다.</p>
          <Link
            href="/papers"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            포스터 목록으로
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
            {paper.fileUrl && (
              <a
                href={paper.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                포스터 보기
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 포스터 헤더 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          {/* 학회 정보 */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-full">
              {paper.conference}
            </span>
            {paper.presentationTime && (
              <span className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-full">
                {paper.presentationTime}
              </span>
            )}
            {paper.willPresent && (
              <span className={`px-4 py-2 text-sm font-medium rounded-full ${
                paper.willPresent === '발표X'
                  ? 'bg-gray-100 text-gray-600'
                  : 'bg-green-100 text-green-600'
              }`}>
                {paper.willPresent}
              </span>
            )}
          </div>

          {/* 제목 */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
            {paper.title}
          </h1>

          {/* 저자 및 소속 */}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-sm font-medium text-gray-500 min-w-16">저자:</span>
              <span className="text-base font-medium text-gray-900">{paper.author}</span>
            </div>
            {paper.affiliation && (
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium text-gray-500 min-w-16">소속:</span>
                <span className="text-base text-gray-700">{paper.affiliation}</span>
              </div>
            )}
            {paper.category && (
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium text-gray-500 min-w-16">분류:</span>
                <span className="text-base text-gray-700">{paper.category}</span>
              </div>
            )}
          </div>
        </div>

        {/* 상세 정보 */}
        <div className="space-y-6">
          {/* 연락처 정보 */}
          {(paper.email || paper.phone) && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">📧</span>
                연락처
              </h2>
              <div className="space-y-2">
                {paper.email && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500 min-w-20">이메일:</span>
                    <a
                      href={`mailto:${paper.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {paper.email}
                    </a>
                  </div>
                )}
                {paper.phone && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500 min-w-20">전화번호:</span>
                    <a
                      href={`tel:${paper.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {paper.phone}
                    </a>
                  </div>
                )}
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
                <p className="text-sm text-blue-700 mt-2">
                  포스터 발표장에서 직접 만나보세요!
                </p>
              </div>
            </div>
          )}

          {/* 파일 링크 */}
          {(paper.fileUrl || paper.paperUrl) && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">📎</span>
                자료
              </h2>
              <div className="space-y-3">
                {paper.fileUrl && (
                  <a
                    href={paper.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xl">📄</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">포스터 파일</p>
                        <p className="text-sm text-gray-600">Google Drive에서 보기</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                )}
                {paper.paperUrl && (
                  <a
                    href={paper.paperUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xl">📃</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">논문 링크</p>
                        <p className="text-sm text-gray-600">원문 보기</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                )}
              </div>
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
            href="/papers"
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
              포스터의 QR 코드를 스캔하여 방문을 인증하세요.
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
