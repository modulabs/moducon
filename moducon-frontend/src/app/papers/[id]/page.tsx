import PaperDetailWrapper from './PaperDetailWrapper';

// 빌드 시 정적 페이지 틀 생성 (P01~P99 범위)
// 실제 데이터는 클라이언트에서 API 호출로 로드
export async function generateStaticParams() {
  return Array.from({ length: 99 }, (_, i) => ({
    id: `P${String(i + 1).padStart(2, '0')}`
  }));
}

export default function PaperDetailPage() {
  return <PaperDetailWrapper />;
}
