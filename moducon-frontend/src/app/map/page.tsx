'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, ChevronDown, ChevronUp, X } from 'lucide-react';

// 장소 타입 정의
interface Location {
  id: string;
  label: string;
  name: string;
  floor: 'B4' | 'B2' | 'B1';
  color: string;
  textColor?: string;
  description?: string;
}

// 마커 위치 타입 (퍼센트 기반)
interface MarkerPosition {
  id: string;
  label: string;
  x: number; // 퍼센트
  y: number; // 퍼센트
  floor: 'B4' | 'B2' | 'B1';
  color: string;
  textColor: string;
  name: string;
  description?: string;
}

// 지도 이미지 원본 크기: 1193 x 720
const MAP_WIDTH = 1193;
const MAP_HEIGHT = 720;

// Figma 좌표를 퍼센트로 변환하는 함수
const toPercent = (x: number, y: number) => ({
  x: (x / MAP_WIDTH) * 100,
  y: (y / MAP_HEIGHT) * 100,
});

// 마커 위치 데이터 (Figma 디자인 기반)
const markerPositions: MarkerPosition[] = [
  // B4층 트랙
  { id: '00', label: '00', ...toPercent(173, 301), floor: 'B4', color: 'bg-black', textColor: 'text-white', name: 'Track 00', description: '이삼봉 홀' },
  { id: '01', label: '01', ...toPercent(733, 259), floor: 'B4', color: 'bg-black', textColor: 'text-white', name: 'Track 01', description: '컨퍼런스홀 B' },
  { id: '10', label: '10', ...toPercent(884, 309), floor: 'B4', color: 'bg-black', textColor: 'text-white', name: 'Track 10', description: '컨퍼런스홀 A' },

  // B1층 트랙
  { id: 'i', label: 'i', ...toPercent(415, 74), floor: 'B1', color: 'bg-black', textColor: 'text-white', name: 'Track i', description: 'B146' },
  { id: '100', label: '100', ...toPercent(258, 181), floor: 'B2', color: 'bg-black', textColor: 'text-white', name: 'Track 100', description: '잉여계단' },
  { id: '101', label: '101', ...toPercent(258, 74), floor: 'B1', color: 'bg-black', textColor: 'text-white', name: 'Track 101', description: 'B144' },

  // B4층 시설 (아래쪽)
  { id: 'R', label: 'R', ...toPercent(847, 583), floor: 'B4', color: 'bg-[#DA2F2F]', textColor: 'text-white', name: '등록 부스', description: '3번출구 앞' },
  { id: 'EV3', label: 'EV', ...toPercent(322, 415), floor: 'B4', color: 'bg-[#7BA0FF]', textColor: 'text-white', name: '엘레베이터' },
  { id: 'EV4', label: 'EV', ...toPercent(765, 621), floor: 'B4', color: 'bg-[#7BA0FF]', textColor: 'text-white', name: '엘레베이터' },
  { id: 'WC3', label: 'WC', ...toPercent(366, 430), floor: 'B4', color: 'bg-[#7BA0FF]', textColor: 'text-white', name: '화장실' },
  { id: 'WC4', label: 'WC', ...toPercent(809, 636), floor: 'B4', color: 'bg-[#7BA0FF]', textColor: 'text-white', name: '화장실' },

  // B1층 시설 (가장 위쪽)
  { id: 'S', label: 'S', ...toPercent(733, 165), floor: 'B1', color: 'bg-[#797979]', textColor: 'text-white', name: '연사 대기실', description: 'B147' },
  { id: 'EV1', label: 'EV', ...toPercent(567, 95), floor: 'B1', color: 'bg-[#7BA0FF]', textColor: 'text-white', name: '엘레베이터' },
  { id: 'WC1', label: 'WC', ...toPercent(810, 119), floor: 'B1', color: 'bg-[#7BA0FF]', textColor: 'text-white', name: '화장실' },
  // B4층 시설 (위쪽 영역 중 아래 위치)
  { id: 'EV2', label: 'EV', ...toPercent(567, 224), floor: 'B4', color: 'bg-[#7BA0FF]', textColor: 'text-white', name: '엘레베이터' },
  { id: 'WC2', label: 'WC', ...toPercent(673, 237), floor: 'B4', color: 'bg-[#7BA0FF]', textColor: 'text-white', name: '화장실' },
];

// 레전드용 장소 데이터
const locations: Location[] = [
  // 트랙
  { id: '00', label: '00', name: 'Track 00', floor: 'B4', color: 'bg-black', textColor: 'text-white', description: '이삼봉 홀' },
  { id: '01', label: '01', name: 'Track 01', floor: 'B4', color: 'bg-black', textColor: 'text-white', description: '컨퍼런스홀 B' },
  { id: '10', label: '10', name: 'Track 10', floor: 'B4', color: 'bg-black', textColor: 'text-white', description: '컨퍼런스홀 A' },
  { id: 'i', label: 'i', name: 'Track i', floor: 'B1', color: 'bg-black', textColor: 'text-white', description: 'B146' },
  { id: '100', label: '100', name: 'Track 100', floor: 'B2', color: 'bg-black', textColor: 'text-white', description: '잉여계단' },
  { id: '101', label: '101', name: 'Track 101', floor: 'B1', color: 'bg-black', textColor: 'text-white', description: 'B144' },
  // 시설
  { id: 'R', label: 'R', name: '등록 부스', floor: 'B4', color: 'bg-[#DA2F2F]', textColor: 'text-white', description: '3번출구 앞' },
  { id: 'S', label: 'S', name: '연사 대기실', floor: 'B4', color: 'bg-[#797979]', textColor: 'text-white', description: 'B147' },
  { id: 'EV', label: 'EV', name: '엘레베이터', floor: 'B4', color: 'bg-[#7BA0FF]', textColor: 'text-white' },
  { id: 'WC', label: 'WC', name: '화장실', floor: 'B4', color: 'bg-[#7BA0FF]', textColor: 'text-white' },
];

// 층 정보
const floors = [
  { id: 'B4', name: 'B4', color: 'bg-[#F4BFD7]', description: '메인 컨퍼런스 (이삼봉홀, 컨퍼런스홀)' },
  { id: 'B2', name: 'B2', color: 'bg-[#B8E6C1]', description: '잉여계단' },
  { id: 'B1', name: 'B1', color: 'bg-[#F8DF96]', description: '세미나실 (B144, B146)' },
];

// 시설 필터 타입
type FacilityFilter = 'all' | 'EV' | 'WC';

export default function MapPage() {
  const [selectedFloor, setSelectedFloor] = useState<'B4' | 'B2' | 'B1' | 'all'>('all');
  const [facilityFilter, setFacilityFilter] = useState<FacilityFilter>('all');
  const [showLegend, setShowLegend] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [zoomTarget, setZoomTarget] = useState<{ x: number; y: number } | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const filteredLocations = selectedFloor === 'all'
    ? locations
    : locations.filter(loc => loc.floor === selectedFloor);

  // 마커 필터링 (층 + 시설)
  const filteredMarkers = markerPositions.filter(marker => {
    // 층 필터
    const floorMatch = selectedFloor === 'all' || marker.floor === selectedFloor;

    // 시설 필터
    if (facilityFilter === 'all') {
      return floorMatch;
    } else {
      // EV나 WC 필터 선택 시 해당 시설만 표시
      return floorMatch && marker.label === facilityFilter;
    }
  });

  // 마커 클릭 시 해당 영역으로 확대
  const handleMarkerClick = (marker: MarkerPosition) => {
    if (selectedMarker === marker.id) {
      // 같은 마커를 다시 클릭하면 원래대로
      setSelectedMarker(null);
      setZoomTarget(null);
    } else {
      setSelectedMarker(marker.id);
      setZoomTarget({ x: marker.x, y: marker.y });
    }
  };

  // 확대 해제
  const handleResetZoom = () => {
    setSelectedMarker(null);
    setZoomTarget(null);
  };

  const trackLocations = filteredLocations.filter(loc => loc.id.match(/^[0-9i]+$/));
  const facilityLocations = filteredLocations.filter(loc => !loc.id.match(/^[0-9i]+$/));

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-gray-50 via-orange-50/30 to-pink-50/20">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#FF8B5A]" />
            행사장 안내
          </h1>
        </div>

        {/* 층 선택 탭 */}
        <div className="px-4 pb-2 flex gap-2">
          <Button
            variant={selectedFloor === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFloor('all')}
            className={selectedFloor === 'all' ? 'bg-gradient-to-r from-[#FF6B9D] to-[#FF8B5A]' : ''}
          >
            전체
          </Button>
          {floors.map(floor => (
            <Button
              key={floor.id}
              variant={selectedFloor === floor.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFloor(floor.id as 'B4' | 'B2' | 'B1')}
              className={`gap-2 ${selectedFloor === floor.id ? 'bg-gradient-to-r from-[#FF6B9D] to-[#FF8B5A]' : ''}`}
            >
              <span className={`w-3 h-3 rounded ${floor.color}`}></span>
              {floor.name}
            </Button>
          ))}
        </div>

        {/* 시설 필터 */}
        <div className="px-4 pb-3 flex gap-2">
          <Button
            variant={facilityFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFacilityFilter('all')}
            className={facilityFilter === 'all' ? 'bg-[#7BA0FF]' : ''}
          >
            전체 시설
          </Button>
          <Button
            variant={facilityFilter === 'EV' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFacilityFilter('EV')}
            className={`gap-1 ${facilityFilter === 'EV' ? 'bg-[#7BA0FF]' : ''}`}
          >
            🛗 엘레베이터
          </Button>
          <Button
            variant={facilityFilter === 'WC' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFacilityFilter('WC')}
            className={`gap-1 ${facilityFilter === 'WC' ? 'bg-[#7BA0FF]' : ''}`}
          >
            🚻 화장실
          </Button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* 실제 지도 이미지 영역 - 필터 바로 아래 */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative">
              {/* 확대 해제 버튼 - 마커 위치에 따라 상단/하단 */}
              {zoomTarget && (
                (() => {
                  const marker = markerPositions.find(m => m.id === selectedMarker);
                  const isBottomMarker = marker && marker.y > 50;
                  return (
                    <Button
                      variant="secondary"
                      size="sm"
                      className={`absolute right-3 z-20 bg-white/90 shadow-md gap-1 ${
                        isBottomMarker ? 'bottom-3' : 'top-3'
                      }`}
                      onClick={handleResetZoom}
                    >
                      <X className="w-4 h-4" />
                      축소
                    </Button>
                  );
                })()
              )}

              {/* 지도 이미지 + 마커 오버레이 */}
              <div
                ref={mapContainerRef}
                className="overflow-hidden max-h-[60vh]"
              >
                <div
                  style={zoomTarget ? {
                    transform: `scale(1.5)`,
                    transformOrigin: `${zoomTarget.x}% ${zoomTarget.y}%`,
                  } : {
                    transform: 'scale(1)',
                    transformOrigin: 'center center',
                  }}
                  className="transition-all duration-500 ease-out relative"
                >
                  <Image
                    src="/images/map.webp"
                    alt="ECC 행사장 지도"
                    width={1193}
                    height={720}
                    className="w-full h-auto"
                    priority
                  />

                  {/* 마커 오버레이 */}
                  {filteredMarkers.map((marker) => (
                    <button
                      key={marker.id}
                      onClick={() => handleMarkerClick(marker)}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                        selectedMarker === marker.id ? 'z-30 scale-150' : 'z-10 hover:scale-125'
                      }`}
                      style={{
                        left: `${marker.x}%`,
                        top: `${marker.y}%`,
                      }}
                    >
                      {/* 마커 아이콘 */}
                      <div
                        className={`w-5 h-5 rounded-full ${marker.color} ${marker.textColor} flex items-center justify-center font-bold text-[8px] shadow-md ring-1 ring-white`}
                      >
                        {marker.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 선택된 마커 정보 표시 (마커 위치에 따라 상단/하단) */}
              {selectedMarker && (
                (() => {
                  const marker = markerPositions.find(m => m.id === selectedMarker);
                  if (!marker) return null;
                  // y좌표가 50% 이상이면 하단 마커 → 설명창을 상단에 표시
                  const isBottomMarker = marker.y > 50;
                  return (
                    <div className={`absolute left-0 right-0 bg-white shadow-lg p-4 z-30 ${
                      isBottomMarker ? 'top-0 border-b' : 'bottom-0 border-t'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full ${marker.color} ${marker.textColor} flex items-center justify-center font-bold text-sm shadow-md`}
                        >
                          {marker.label}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-800">{marker.name}</p>
                          {marker.description && (
                            <p className="text-sm text-gray-500">{marker.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`w-4 h-4 rounded ${marker.floor === 'B4' ? 'bg-[#F4BFD7]' : marker.floor === 'B2' ? 'bg-[#B8E6C1]' : 'bg-[#F8DF96]'}`}></span>
                          <span className="text-sm text-gray-600 font-medium">{marker.floor}층</span>
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          </CardContent>
        </Card>

        {/* 층별 안내 */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              {floors.map(floor => (
                <div key={floor.id} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${floor.color} flex items-center justify-center font-bold text-gray-800`}>
                    {floor.name}
                  </div>
                  <div>
                    <p className="font-semibold">{floor.name}층</p>
                    <p className="text-sm text-gray-500">{floor.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 레전드 토글 */}
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="w-full flex items-center justify-between p-3 bg-white rounded-lg shadow-sm"
        >
          <span className="font-semibold text-gray-700">장소 안내</span>
          {showLegend ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {showLegend && (
          <div className="space-y-4">
            {/* 트랙 */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-white text-xs font-bold">T</span>
                  세션 트랙
                </h3>
                <div className="space-y-2">
                  {trackLocations.map(loc => (
                    <div key={loc.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                      <div className={`w-10 h-10 rounded-full ${loc.color} ${loc.textColor} flex items-center justify-center font-bold text-sm`}>
                        {loc.label}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{loc.name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className={`w-3 h-3 rounded ${loc.floor === 'B4' ? 'bg-[#F4BFD7]' : loc.floor === 'B2' ? 'bg-[#B8E6C1]' : 'bg-[#F8DF96]'}`}></span>
                          {loc.floor} · {loc.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 시설 */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#7BA0FF]" />
                  편의시설
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {facilityLocations.map(loc => (
                    <div key={loc.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <div className={`w-8 h-8 rounded-full ${loc.color} ${loc.textColor} flex items-center justify-center font-bold text-xs ring-2 ring-white`}>
                        {loc.label}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{loc.name}</p>
                        {loc.description && (
                          <p className="text-xs text-gray-500">{loc.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 안내 문구 */}
        <div className="text-center text-sm text-gray-500 py-4">
          <p>장소를 찾기 어려우시면 등록 부스에서 안내받으실 수 있습니다.</p>
          <p className="mt-1 text-xs">📍 등록 부스: B4층 3번 출구 앞</p>
        </div>
      </div>
    </div>
  );
}
