'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Booth } from '@/types/booth';
import BoothDetailClient from '@/app/booths/[id]/BoothDetailClient';

interface BoothMapProps {
  booths: Booth[];
  onBoothSelect?: (booth: Booth) => void;
}

// 부스 위치 좌표 (SVG 기준)
interface BoothPosition {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  boothCode: string | null; // 실제 부스 코드와 매핑
  label: string; // 표시할 라벨
  type: 'booth' | 'event' | 'reserved'; // 부스 타입
}

// 부스 코드 → 로컬 이미지 매핑
const boothImages: Record<string, string> = {
  'B01': '', // 클라비 - 이미지 없음
  'B02': '/images/booths/khp.webp', // K-HP
  'B03': '', // 아이펠 - 이미지 없음
  'B04': '/images/booths/bizteam.webp', // 비즈팀
  'B05': '/images/booths/nvidia-rapids-lab.webp', // NVIDIA RAPIDS
  'B06': '/images/booths/dao-lab.webp', // DAO LAB
  'B07': '/images/booths/tenstorrent.webp', // Tenstorrent
  'B08': '/images/booths/genai-finance.webp', // GenAI Finance
  'B09': '', // Hell Maker - 이미지 없음
  'B10': '/images/booths/ai-agent-lab.webp', // AI에이전트
  'B11': '', // B-Peach - 이미지 없음
  'B12': '', // 온소리 - 이미지 없음 (나중에 추가)
  'B13': '/images/booths/what2eat.webp', // 쩝쩝LAB
  'B14': '/images/booths/persona-lab.webp', // 페르소나
  'B15': '/images/booths/gabangssa.webp', // 가방싸
  'B16': '/images/booths/dongjeop.webp', // 동접
  'B17': '/images/booths/ieul-lab.webp', // 이을
};

// SVG 좌표 기반 부스 위치 데이터 (하드코딩 매핑)
const boothPositions: BoothPosition[] = [
  // 섹션 1: 6개 부스 (y=80, 부스 y=50)
  { id: 1, x: 20, y: 130, width: 55, height: 28, boothCode: 'B01', label: '클라비', type: 'booth' },
  { id: 2, x: 80, y: 130, width: 55, height: 28, boothCode: null, label: '예비', type: 'reserved' },
  { id: 3, x: 140, y: 130, width: 55, height: 28, boothCode: 'B07', label: 'Tenstorrent', type: 'booth' },
  { id: 4, x: 205, y: 130, width: 55, height: 28, boothCode: 'B12', label: '온소리', type: 'booth' },
  { id: 5, x: 265, y: 130, width: 55, height: 28, boothCode: 'B12', label: '온소리', type: 'booth' },
  { id: 6, x: 325, y: 130, width: 55, height: 28, boothCode: 'B12', label: '온소리', type: 'booth' },

  // 섹션 2 상단: 6개 부스 (y=260)
  { id: 7, x: 20, y: 260, width: 55, height: 28, boothCode: 'B14', label: '페르소나', type: 'booth' },
  { id: 8, x: 80, y: 260, width: 55, height: 28, boothCode: null, label: '예비', type: 'reserved' },
  { id: 9, x: 140, y: 260, width: 55, height: 28, boothCode: 'B11', label: 'B-Peach', type: 'booth' },
  { id: 10, x: 205, y: 260, width: 55, height: 28, boothCode: 'B15', label: '가방싸', type: 'booth' },
  { id: 11, x: 265, y: 260, width: 55, height: 28, boothCode: 'B16', label: '동접', type: 'booth' },
  { id: 12, x: 325, y: 260, width: 55, height: 28, boothCode: 'B17', label: '이을', type: 'booth' },

  // 섹션 2 하단: 6개 부스 (y=260+100=360)
  { id: 13, x: 20, y: 360, width: 55, height: 28, boothCode: 'B09', label: 'HellMaker', type: 'booth' },
  { id: 14, x: 80, y: 360, width: 55, height: 28, boothCode: 'B10', label: 'AI에이전트', type: 'booth' },
  { id: 15, x: 140, y: 360, width: 55, height: 28, boothCode: 'B13', label: '쩝쩝', type: 'booth' },
  { id: 16, x: 205, y: 360, width: 55, height: 28, boothCode: 'B05', label: 'NVIDIA', type: 'booth' },
  { id: 17, x: 265, y: 360, width: 55, height: 28, boothCode: 'B06', label: 'DAO', type: 'booth' },
  { id: 18, x: 325, y: 360, width: 55, height: 28, boothCode: 'B08', label: 'GenAI', type: 'booth' },

  // 섹션 3: 6개 부스 (y=520, 부스 y=50)
  { id: 19, x: 20, y: 570, width: 55, height: 28, boothCode: null, label: '이벤트1', type: 'event' },
  { id: 20, x: 80, y: 570, width: 55, height: 28, boothCode: null, label: '이벤트2', type: 'event' },
  { id: 21, x: 140, y: 570, width: 55, height: 28, boothCode: null, label: '홍보물', type: 'event' },
  { id: 22, x: 205, y: 570, width: 55, height: 28, boothCode: 'B04', label: '비즈팀', type: 'booth' },
  { id: 23, x: 265, y: 570, width: 55, height: 28, boothCode: 'B02', label: 'KHP', type: 'booth' },
  { id: 24, x: 325, y: 570, width: 55, height: 28, boothCode: 'B03', label: '아이펠', type: 'booth' },
];

export default function BoothMap({ booths, onBoothSelect }: BoothMapProps) {
  const [selectedBooth, setSelectedBooth] = useState<{
    booth: Booth | null;
    position: BoothPosition | null;
  }>({ booth: null, position: null });
  const containerRef = useRef<HTMLDivElement>(null);

  // 부스 클릭 핸들러
  const handleBoothClick = (position: BoothPosition) => {
    // 예비/이벤트 부스는 클릭 무시
    if (!position.boothCode || position.type !== 'booth') {
      return;
    }

    // boothCode로 실제 부스 데이터 찾기
    const booth = booths.find(b => b.code === position.boothCode) || null;

    setSelectedBooth({ booth, position });
    if (booth && onBoothSelect) {
      onBoothSelect(booth);
    }
  };

  // 타입별 색상 반환
  const getBoothColors = (position: BoothPosition, isSelected: boolean) => {
    if (isSelected) {
      return { fill: '#FF6B9D', stroke: '#FF6B9D', text: '#fff' };
    }
    switch (position.type) {
      case 'reserved':
        return { fill: '#f9fafb', stroke: '#d1d5db', text: '#9ca3af' };
      case 'event':
        return { fill: '#fef3c7', stroke: '#fbbf24', text: '#92400e' };
      default:
        return { fill: '#f3f4f6', stroke: '#e5e7eb', text: '#717182' };
    }
  };

  // 팝업 닫기
  const handleClose = () => {
    setSelectedBooth({ booth: null, position: null });
  };

  // SVG 좌표를 화면 좌표로 변환
  const getScreenPosition = (pos: BoothPosition) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = rect.width / 400;
    const scaleY = rect.height / 700;
    return {
      x: pos.x * scaleX + (pos.width * scaleX) / 2,
      y: pos.y * scaleY + (pos.height * scaleY) / 2,
    };
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* SVG 맵 */}
      <svg viewBox="0 0 400 700" className="w-full h-auto">
        {/* 배경 */}
        <rect width="400" height="700" fill="#fafafa"/>

        {/* 홀 표시 - 벽 형태 */}
        {/* 이삼봉홀 (왼쪽 벽 상단부) */}
        <g>
          <line x1="5" y1="20" x2="5" y2="180" stroke="#7dd3fc" strokeWidth="4" strokeLinecap="round"/>
          <text x="14" y="70" fill="#0369a1" fontSize="11" fontWeight="600" fontFamily="system-ui" writingMode="vertical-rl">이삼봉홀</text>
        </g>

        {/* 삼성홀 (상단 벽 오른쪽) */}
        <g>
          <line x1="250" y1="5" x2="395" y2="5" stroke="#7dd3fc" strokeWidth="4" strokeLinecap="round"/>
          <text x="320" y="20" textAnchor="middle" fill="#0369a1" fontSize="11" fontWeight="600" fontFamily="system-ui">삼성홀</text>
        </g>

        {/* 섹션 1 기둥 */}
        <rect x="188" y="80" width="24" height="24" rx="2" fill="#d1d5db" stroke="#9ca3af" strokeWidth="1"/>

        {/* 섹션 2 기둥 */}
        <rect x="188" y="310" width="24" height="24" rx="2" fill="#d1d5db" stroke="#9ca3af" strokeWidth="1"/>

        {/* 섹션 3 기둥 */}
        <rect x="188" y="520" width="24" height="24" rx="2" fill="#d1d5db" stroke="#9ca3af" strokeWidth="1"/>

        {/* 부스들 */}
        {boothPositions.map((pos) => {
          const isSelected = selectedBooth.position?.id === pos.id;
          const colors = getBoothColors(pos, isSelected);
          const isClickable = pos.type === 'booth' && pos.boothCode;

          return (
            <g
              key={pos.id}
              onClick={() => handleBoothClick(pos)}
              style={{ cursor: isClickable ? 'pointer' : 'default' }}
            >
              <rect
                x={pos.x}
                y={pos.y}
                width={pos.width}
                height={pos.height}
                rx="4"
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth="1"
                className={isClickable ? 'transition-colors duration-200 hover:fill-[#ffe4ec] hover:stroke-[#FF6B9D]' : ''}
              />
              {/* 부스 라벨 */}
              <text
                x={pos.x + pos.width / 2}
                y={pos.y + pos.height / 2 + 3}
                textAnchor="middle"
                fill={colors.text}
                fontSize="9"
                fontWeight="500"
                fontFamily="system-ui"
              >
                {pos.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Genie Effect 모달 - 세부 페이지 표시 */}
      <AnimatePresence>
        {selectedBooth.booth && selectedBooth.position && (
          <>
            {/* 오버레이 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={handleClose}
            />

            {/* 세부 페이지 모달 */}
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.1,
                x: getScreenPosition(selectedBooth.position).x - 160,
                y: getScreenPosition(selectedBooth.position).y - 200,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                x: 0,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.1,
                x: getScreenPosition(selectedBooth.position).x - 160,
                y: getScreenPosition(selectedBooth.position).y - 200,
              }}
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 300,
              }}
              className="fixed left-2 right-2 top-[5vh] bottom-[5vh] z-50 max-w-lg mx-auto overflow-hidden"
            >
              <BoothDetailClient
                booth={selectedBooth.booth}
                isModal={true}
                onClose={handleClose}
                imageUrl={selectedBooth.booth.code ? boothImages[selectedBooth.booth.code] : undefined}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
