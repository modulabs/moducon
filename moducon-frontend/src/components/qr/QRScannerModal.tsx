'use client';

import dynamic from 'next/dynamic';

// QRScanner를 동적 import (클라이언트 사이드만)
const QRScanner = dynamic(() => import('@/components/QRScanner'), {
  ssr: false,
});

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan?: (result: string) => void;
}

export function QRScannerModal({ isOpen, onClose, onScan }: QRScannerModalProps) {
  if (!isOpen) return null;

  return <QRScanner onClose={onClose} onScan={onScan} />;
}
