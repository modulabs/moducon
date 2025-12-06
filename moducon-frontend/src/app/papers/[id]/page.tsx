import PaperDetailWrapper from './PaperDetailWrapper';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

// 빌드 시 API에서 포스터 코드 목록을 가져와 정적 페이지 생성
export async function generateStaticParams() {
  if (!API_BASE) {
    console.warn('API_URL not set, skipping static generation for papers');
    return [];
  }

  try {
    const response = await fetch(`${API_BASE}/api/papers`);
    if (!response.ok) {
      console.warn('Failed to fetch papers for static generation');
      return [];
    }

    const data = await response.json();
    const papers = data.data || [];

    return papers
      .filter((p: { code?: string }) => p.code)
      .map((p: { code: string }) => ({ id: p.code }));
  } catch (error) {
    console.warn('Error generating static params for papers:', error);
    return [];
  }
}

export default function PaperDetailPage() {
  return <PaperDetailWrapper />;
}
