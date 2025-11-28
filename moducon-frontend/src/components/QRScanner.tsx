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
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Scanner stop error:', err);
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
      const typeMessages = {
        session: '세션',
        booth: '부스',
        paper: '포스터'
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
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">QR 코드 스캔</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* 안내 메시지 */}
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
            <p className="text-sm text-blue-900">
              📱 부스 또는 포스터의 QR 코드를 카메라에 비춰주세요.
            </p>
          </div>

          {/* QR 리더 */}
          <div className="relative">
            <div
              id="qr-reader"
              className="rounded-lg overflow-hidden"
              style={{ width: '100%' }}
            ></div>

            {/* 스캔 가이드 오버레이 */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 border-2 border-white/30 rounded-lg"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-64 h-64 border-4 border-purple-500 rounded-lg shadow-lg"></div>
              </div>
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded">
              <p className="text-sm text-red-900">{error}</p>
            </div>
          )}

          {/* 스캔 결과 */}
          {result && (
            <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
              <p className="text-sm font-medium text-green-900 mb-1">스캔 완료!</p>
              <p className="text-sm text-green-700">{result}</p>
            </div>
          )}

          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
