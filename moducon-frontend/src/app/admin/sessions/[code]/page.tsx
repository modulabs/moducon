import AdminSessionDetailClient from './AdminSessionDetailClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

// 빌드 시 API에서 세션 코드 목록을 가져와 정적 페이지 생성
export async function generateStaticParams() {
  if (!API_BASE) {
    console.warn('API_URL not set, skipping static generation for admin sessions');
    return [];
  }

  try {
    const response = await fetch(`${API_BASE}/api/sessions`);
    if (!response.ok) {
      console.warn('Failed to fetch sessions for static generation');
      return [];
    }

    const data = await response.json();
    const sessions = data.data || [];

    return sessions
      .filter((s: { code?: string }) => s.code)
      .map((s: { code: string }) => ({ code: s.code }));
  } catch (error) {
    console.warn('Error generating static params for admin sessions:', error);
    return [];
  }
}

export default function AdminSessionDetailPage() {
  return <AdminSessionDetailClient />;
}
