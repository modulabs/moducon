'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X } from 'lucide-react';

interface QRScannerModalProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export function QRScannerModal({ onScan, onClose }: QRScannerModalProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    return () => {
      setMounted(false); // 언마운트 플래그
    };
  }, []);

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader-modal');
    scannerRef.current = scanner;

    // 카메라 시작
    scanner
      .start(
        { facingMode: 'environment' }, // 후방 카메라
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          if (!mounted) return; // 언마운트 후 상태 업데이트 방지
          setIsScanning(false);
          onScan(decodedText);
        },
        (errorMessage) => {
          // 스캔 시도 중 에러는 무시 (계속 시도)
          if (!errorMessage.includes('No QR code found')) {
            setError('카메라 접근 권한을 확인해주세요');
          }
        }
      )
      .then(() => {
        if (mounted) setIsScanning(true);
      })
      .catch((err) => {
        if (mounted) {
          setError('카메라를 시작할 수 없습니다');
          console.error('카메라 시작 실패:', err);
        }
      });

    // 개선된 클린업
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            console.log('카메라 정지 완료');
            scannerRef.current?.clear();
          })
          .catch((err) => {
            // 이미 정지된 경우 에러 무시
            if (!err.message?.includes('not started')) {
              console.error('카메라 정지 실패:', err);
            }
          });
      }
    };
  }, [onScan, mounted]);

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      {/* 닫기 버튼 */}
      <button
        onClick={onClose}
        className="
          absolute top-4 right-4 z-10
          w-12 h-12 rounded-full bg-white/10
          flex items-center justify-center
          hover:bg-white/20 transition-colors
        "
        aria-label="닫기"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* 카메라 뷰 */}
      <div className="relative h-full flex flex-col items-center justify-center">
        <div id="qr-reader-modal" className="w-full max-w-md" />

        {/* 스캔 가이드라인 오버레이 */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="
              absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
              w-[250px] h-[250px]
              border-4 border-white/50 rounded-lg
              shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]
            ">
              {/* 모서리 강조 */}
              <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-white" />
              <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-white" />
              <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-white" />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-white" />
            </div>
          </div>
        )}

        {/* 안내 메시지 */}
        <div className="absolute bottom-24 left-0 right-0 text-center px-4">
          {error ? (
            <p className="text-red-400 text-sm">{error}</p>
          ) : (
            <div className="space-y-2">
              <p className="text-white text-lg font-medium">
                QR 코드를 사각형 안에 맞춰주세요
              </p>
              <p className="text-white/70 text-sm">
                세션, 부스, 포스터 QR 코드를 스캔할 수 있습니다
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
