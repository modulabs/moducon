import SessionDetailWrapper from './SessionDetailWrapper';

// 빌드 시 정적 페이지 틀 생성 (S01~S99 범위)
// 실제 데이터는 클라이언트에서 API 호출로 로드
export async function generateStaticParams() {
  return Array.from({ length: 99 }, (_, i) => ({
    id: `S${String(i + 1).padStart(2, '0')}`
  }));
}

export default function SessionDetailPage() {
  return <SessionDetailWrapper />;
}
