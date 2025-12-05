'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchPapersWithCache } from '@/lib/paperCache';
import PaperDetailClient from './PaperDetailClient';
import Link from 'next/link';
import type { Paper } from '@/types/paper';

export default function PaperDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadPaper() {
      try {
        const papers = await fetchPapersWithCache();
        const found = papers.find(p => p.id === id || p.code === id);
        setPaper(found || null);
      } catch (err) {
        console.error('포스터 로딩 실패:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadPaper();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">포스터 정보를 불러오는 중...</p>
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
            href="/papers"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-block"
          >
            포스터 목록으로
          </Link>
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <p className="text-gray-600 text-lg mb-4">포스터를 찾을 수 없습니다.</p>
          <Link
            href="/papers"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-block"
          >
            포스터 목록으로
          </Link>
        </div>
      </div>
    );
  }

  return <PaperDetailClient paper={paper} />;
}
