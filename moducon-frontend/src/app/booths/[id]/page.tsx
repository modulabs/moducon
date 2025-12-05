'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchBoothsWithCache } from '@/lib/boothCache';
import BoothDetailClient from './BoothDetailClient';
import Link from 'next/link';
import type { Booth } from '@/types/booth';

export default function BoothDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [booth, setBooth] = useState<Booth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadBooth() {
      try {
        const booths = await fetchBoothsWithCache();
        const found = booths.find(b => b.id === id || b.code === id);
        setBooth(found || null);
      } catch (err) {
        console.error('부스 로딩 실패:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadBooth();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">부스 정보를 불러오는 중...</p>
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
            href="/booths"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-block"
          >
            부스 목록으로
          </Link>
        </div>
      </div>
    );
  }

  if (!booth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏢</div>
          <p className="text-gray-600 text-lg mb-4">부스를 찾을 수 없습니다.</p>
          <Link
            href="/booths"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-block"
          >
            부스 목록으로
          </Link>
        </div>
      </div>
    );
  }

  return <BoothDetailClient booth={booth} />;
}
