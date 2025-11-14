'use client';

import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      (decodedText) => {
        onScan(decodedText);
        scanner.stop();
      },
      (errorMessage) => {
        onError?.(errorMessage);
      }
    );

    return () => {
      if (scanner.isScanning) {
        scanner.stop();
      }
    };
  }, [onScan, onError]);

  return (
    <div className="flex flex-col items-center">
      <div id="qr-reader" className="w-full max-w-md" />
      <p className="mt-4 text-sm text-muted-foreground">
        QR 코드를 카메라에 비춰주세요
      </p>
    </div>
  );
}
