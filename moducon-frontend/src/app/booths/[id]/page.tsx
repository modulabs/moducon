import BoothDetailWrapper from './BoothDetailWrapper';

// 빌드 시 정적 페이지 틀 생성 (B01~B99 범위)
// 실제 데이터는 클라이언트에서 API 호출로 로드
export async function generateStaticParams() {
  return Array.from({ length: 99 }, (_, i) => ({
    id: `B${String(i + 1).padStart(2, '0')}`
  }));
}

export default function BoothDetailPage() {
  return <BoothDetailWrapper />;
}
