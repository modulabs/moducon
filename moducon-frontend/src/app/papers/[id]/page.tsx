import { fetchPapersWithCache, fetchPaperByCode } from '@/lib/paperCache';
import PaperDetailClient from './PaperDetailClient';
import Link from 'next/link';

// Static Export를 위한 generateStaticParams
export async function generateStaticParams() {
  const papers = await fetchPapersWithCache();
  return papers.map(paper => ({
    id: paper.code,
  }));
}

interface PaperDetailPageProps {
  params: {
    id: string;
  };
}

export default async function PaperDetailPage({ params }: PaperDetailPageProps) {
  // code 또는 id로 조회 시도
  let paper = await fetchPaperByCode(params.id);

  // code로 못 찾으면 id로 다시 시도
  if (!paper) {
    const papers = await fetchPapersWithCache();
    paper = papers.find(p => p.id === params.id || p.code === params.id) || null;
  }

  if (!paper) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
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
