import { fetchSessionsWithCache } from '@/lib/sessionCache';
import SessionDetailClient from './SessionDetailClient';
import Link from 'next/link';

// Static Export를 위한 generateStaticParams
export async function generateStaticParams() {
  try {
    const sessions = await fetchSessionsWithCache();
    return sessions.map(session => ({
      id: session.code,
    }));
  } catch (error) {
    console.error('generateStaticParams error:', error);
    return [];
  }
}

interface SessionDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SessionDetailPage({ params }: SessionDetailPageProps) {
  const resolvedParams = await params;

  try {
    const sessions = await fetchSessionsWithCache();
    const session = sessions.find(s => s.code === resolvedParams.id || s.id === resolvedParams.id);

    if (!session) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🎤</div>
            <p className="text-gray-600 text-lg mb-4">세션을 찾을 수 없습니다.</p>
            <Link
              href="/sessions"
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-block"
            >
              세션 목록으로
            </Link>
          </div>
        </div>
      );
    }

    return <SessionDetailClient session={session} />;
  } catch (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-gray-600 text-lg mb-4">데이터를 불러올 수 없습니다.</p>
          <Link
            href="/sessions"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-block"
          >
            세션 목록으로
          </Link>
        </div>
      </div>
    );
  }
}
