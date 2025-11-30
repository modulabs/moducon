import { Map as MapIcon } from 'lucide-react';

export default function MapPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-128px)] bg-gray-50">
      <MapIcon className="w-24 h-24 text-gray-300 mb-4" />
      <h2 className="text-2xl font-bold text-gray-700 mb-2">
        지도 페이지
      </h2>
      <p className="text-gray-500 text-center px-4">
        추후 추가 예정입니다.
      </p>
    </div>
  );
}
