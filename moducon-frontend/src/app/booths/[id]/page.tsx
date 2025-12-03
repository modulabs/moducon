import { fetchBoothsWithCache } from '@/lib/boothCache';
import BoothDetailClient from './BoothDetailClient';
import Link from 'next/link';

// Static Export를 위한 generateStaticParams
export async function generateStaticParams() {
  const booths = await fetchBoothsWithCache();
  return booths.map(booth => ({
    id: booth.id,
  }));
}

interface BoothDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BoothDetailPage({ params }: BoothDetailPageProps) {
  const resolvedParams = await params;
  const booths = await fetchBoothsWithCache();
  const booth = booths.find(b => b.id === resolvedParams.id || b.code === resolvedParams.id);

  if (!booth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
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
