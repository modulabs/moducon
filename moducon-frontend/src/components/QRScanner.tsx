'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useRouter } from 'next/navigation';
import { parseQRCode, getRouteFromQRData } from '@/lib/qrParser';

interface QRScannerProps {
  onClose: () => void;
  onScan?: (result: string) => void;
}

export default function QRScanner({ onClose, onScan }: QRScannerProps) {
  const router = useRouter();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  /**
   * 햅틱 피드백 (모바일)
   */
  const triggerHaptic = useCallback(() => {
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
  }, []);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        // 2 = SCANNING, 3 = PAUSED (these states can be stopped)
        if (state === 2 || state === 3) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        // Ignore stop errors - scanner may already be stopped
      }
    }
  }, []);

  const handleScanSuccess = useCallback((decodedText: string) => {
    console.log('QR Scan Success:', decodedText);
    setResult(decodedText);

    // QR 값 파싱
    const parsed = parseQRCode(decodedText);
    if (parsed) {
      // 햅틱 피드백
      triggerHaptic();

      // 라우트 생성
      const route = getRouteFromQRData(parsed);

      // 스캐너 정지 및 이동
      stopScanner();
      if (onScan) {
        onScan(decodedText);
      }

      // 타입별 메시지
      const typeMessages: Record<typeof parsed.type, string> = {
        session: '세션',
        booth: '부스',
        paper: '포스터',
        checkin: '체크인',
        quiz: '퀴즈',
        hidden: '히든 배지',
        registration: '등록'
      };
      const message = `${typeMessages[parsed.type]} 페이지로 이동합니다.`;

      // 성공 표시 (알림은 토스트 라이브러리 추가 시 활용)
      console.log(`✅ ${message}`);
      setResult(`${message} (${parsed.id})`);

      // 페이지 이동
      setTimeout(() => {
        router.push(route);
      }, 500);
    } else {
      // 햅틱 피드백 (에러)
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
      setError('유효하지 않은 QR 코드입니다.');
    }
  }, [router, onScan, stopScanner, triggerHaptic]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleScanError = useCallback((_errorMessage: string) => {
    // QR 코드를 찾지 못한 경우는 무시 (너무 많은 로그 방지)
    // console.error('QR Scan Error:', errorMessage);
  }, []);

  useEffect(() => {
    const startScanner = async () => {
      try {
        setError(null);

        const scanner = new Html5Qrcode('qr-reader');
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' }, // 후방 카메라 사용
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          handleScanSuccess,
          handleScanError
        );
      } catch (err) {
        console.error('Scanner start error:', err);
        setError('카메라를 시작할 수 없습니다. 카메라 권한을 확인해주세요.');
      }
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, [handleScanSuccess, handleScanError, stopScanner]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
      {/* 안내 메시지 (상단) */}
      <div className="mb-8">
        <p className="text-white text-center text-lg font-medium px-4">
          QR 코드를 네모 박스 안에 맞춰주세요
        </p>
      </div>

      {/* 정사각형 스캔 박스 (280x280px) - 카메라 영상 포함 */}
      <div className="relative">
        {/* 카메라 영상 컨테이너 (정사각형 박스 안에만 표시) */}
        <div
          id="qr-reader"
          className="w-[280px] h-[280px] rounded-2xl overflow-hidden"
        ></div>

        {/* 흰색 테두리 오버레이 */}
        <div
          className="absolute inset-0 border-4 border-white rounded-2xl pointer-events-none"
          aria-label="QR 코드 스캔 영역"
        >
          {/* 모서리 강조선 */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-2xl" />
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="absolute bottom-32 left-0 right-0 px-4 pointer-events-none">
          <div className="bg-red-500/90 backdrop-blur-sm p-4 rounded-lg max-w-md mx-auto">
            <p className="text-white text-center text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* 스캔 결과 */}
      {result && (
        <div className="absolute bottom-32 left-0 right-0 px-4 pointer-events-none">
          <div className="bg-green-500/90 backdrop-blur-sm p-4 rounded-lg max-w-md mx-auto">
            <p className="text-white text-center text-sm font-bold mb-1">✅ 스캔 완료!</p>
            <p className="text-white text-center text-sm">{result}</p>
          </div>
        </div>
      )}

      {/* 닫기 버튼 (상단 우측) */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full
                   hover:bg-white/30 transition-colors pointer-events-auto z-10"
        aria-label="QR 스캔 닫기"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
