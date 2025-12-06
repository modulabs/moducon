import BoothDetailWrapper from './BoothDetailWrapper';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

// 빌드 시 API에서 부스 코드 목록을 가져와 정적 페이지 생성
export async function generateStaticParams() {
  if (!API_BASE) {
    console.warn('API_URL not set, skipping static generation for booths');
    return [];
  }

  try {
    const response = await fetch(`${API_BASE}/api/booths`);
    if (!response.ok) {
      console.warn('Failed to fetch booths for static generation');
      return [];
    }

    const data = await response.json();
    const booths = data.data || [];

    return booths
      .filter((b: { code?: string }) => b.code)
      .map((b: { code: string }) => ({ id: b.code }));
  } catch (error) {
    console.warn('Error generating static params for booths:', error);
    return [];
  }
}

export default function BoothDetailPage() {
  return <BoothDetailWrapper />;
}
