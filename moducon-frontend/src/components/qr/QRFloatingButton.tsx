'use client';

import { useState, useEffect } from 'react';
import { QRScannerModal } from './QRScannerModal';
import { QRIcon } from './icons/QRIcon';

interface QRFloatingButtonProps {
  onScan: (data: string) => void;
  position?: 'bottom-center' | 'bottom-right';
}

export function QRFloatingButton({
  onScan,
  position = 'bottom-center'
}: QRFloatingButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  // 툴팁 타이머 추가
  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleScan = (data: string) => {
    onScan(data);
    setIsModalOpen(false);

    // 햅틱 피드백 (지원 기기만)
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  };

  // 키보드 이벤트 핸들러
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    // Enter 또는 Space로 활성화
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsModalOpen(true);
    }
    // Escape로 닫기
    if (e.key === 'Escape' && isModalOpen) {
      setIsModalOpen(false);
    }
  };

  const positionClasses = {
    'bottom-center': 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
    'bottom-right': 'right-8 bottom-24'
  };

  return (
    <>
      {/* 원형 버튼 */}
      <button
        onClick={() => setIsModalOpen(true)}
        onKeyDown={handleKeyDown}
        className={`
          fixed ${positionClasses[position]} z-50
          w-[140px] h-[140px] rounded-full
          bg-gradient-to-br from-primary to-primary/80
          shadow-lg hover:shadow-xl
          transition-all duration-300 hover:scale-110
          focus:outline-none focus:ring-4 focus:ring-primary/50
          flex flex-col items-center justify-center gap-2
          group
        `}
        aria-label="QR 코드 스캔하기"
        role="button"
        tabIndex={0}
      >
        {/* Pulse Animation */}
        <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />

        {/* 예시 QR 이미지 (작은 아이콘 형태) */}
        <div className="relative z-10 w-12 h-12 bg-white rounded-lg p-1.5 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* 간단한 QR 코드 패턴 */}
            <rect x="0" y="0" width="30" height="30" fill="black"/>
            <rect x="70" y="0" width="30" height="30" fill="black"/>
            <rect x="0" y="70" width="30" height="30" fill="black"/>
            <rect x="10" y="10" width="10" height="10" fill="white"/>
            <rect x="80" y="10" width="10" height="10" fill="white"/>
            <rect x="10" y="80" width="10" height="10" fill="white"/>
            {/* 중앙 패턴 */}
            <rect x="45" y="45" width="10" height="10" fill="black"/>
            <rect x="35" y="35" width="5" height="5" fill="black"/>
            <rect x="60" y="35" width="5" height="5" fill="black"/>
            <rect x="35" y="60" width="5" height="5" fill="black"/>
            <rect x="60" y="60" width="5" height="5" fill="black"/>
          </svg>
        </div>

        {/* 텍스트 라벨 */}
        <span className="text-white text-xs font-semibold relative z-10">QR 스캔</span>

        {/* Tooltip (3초 후 자동 사라짐) */}
        {showTooltip && (
          <div
            className="
              absolute -top-12 left-1/2 -translate-x-1/2
              bg-black/80 text-white text-sm px-3 py-1.5 rounded
              whitespace-nowrap
              animate-fade-in-out
            "
            role="tooltip"
          >
            QR 코드를 스캔하세요
          </div>
        )}
      </button>

      {/* 스캔 모달 */}
      <QRScannerModal
        isOpen={isModalOpen}
        onScan={handleScan}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
