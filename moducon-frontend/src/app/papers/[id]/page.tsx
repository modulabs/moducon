import { fetchPapers } from '@/lib/googleSheets';
import PaperDetailClient from './PaperDetailClient';
import Link from 'next/link';

// Static Export를 위한 generateStaticParams
export async function generateStaticParams() {
  const papers = await fetchPapers();
  return papers.map(paper => ({
    id: paper.id,
  }));
}

interface PaperDetailPageProps {
  params: {
    id: string;
  };
}

export default async function PaperDetailPage({ params }: PaperDetailPageProps) {
  const papers = await fetchPapers();
  const paper = papers.find(p => p.id === params.id);

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
