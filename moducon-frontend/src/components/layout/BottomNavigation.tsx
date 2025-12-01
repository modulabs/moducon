'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Calendar, Store, QrCode, FileText, Map } from 'lucide-react';
import { QRScannerModal } from '@/components/qr/QRScannerModal';

export function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const tabs = [
    { label: '세션', icon: Calendar, path: '/sessions' },
    { label: '부스', icon: Store, path: '/booths' },
    { label: '포스터', icon: FileText, path: '/papers' },
    { label: '지도', icon: Map, path: '/map' },
  ];

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-lg border-t border-gray-200 z-50">
        <div className="flex items-center justify-around h-full max-w-screen-lg mx-auto px-4">
          {/* 세션 탭 */}
          <TabButton
            label={tabs[0].label}
            icon={tabs[0].icon}
            isActive={pathname.startsWith(tabs[0].path)}
            onClick={() => router.push(tabs[0].path)}
          />

          {/* 부스 탭 */}
          <TabButton
            label={tabs[1].label}
            icon={tabs[1].icon}
            isActive={pathname.startsWith(tabs[1].path)}
            onClick={() => router.push(tabs[1].path)}
          />

          {/* 중앙 QR 버튼 (특별 UI) */}
          <button
            onClick={() => setQrModalOpen(true)}
            className="relative -top-2 flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary to-primary/80 shadow-[0_4px_12px_rgba(79,70,229,0.4)] ring-4 ring-white hover:scale-105 transition-transform"
            aria-label="QR 코드 스캔"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <rect width="5" height="5" x="3" y="3" rx="1"></rect>
              <rect width="5" height="5" x="16" y="3" rx="1"></rect>
              <rect width="5" height="5" x="3" y="16" rx="1"></rect>
              <path d="M21 16h-3a2 2 0 0 0-2 2v3"></path>
              <path d="M21 21v.01"></path>
              <path d="M12 7v3a2 2 0 0 1-2 2H7"></path>
              <path d="M3 12h.01"></path>
              <path d="M12 3h.01"></path>
              <path d="M12 16v.01"></path>
              <path d="M16 12h1"></path>
              <path d="M21 12v.01"></path>
              <path d="M12 21v-1"></path>
            </svg>
          </button>

          {/* 포스터 탭 */}
          <TabButton
            label={tabs[2].label}
            icon={tabs[2].icon}
            isActive={pathname.startsWith(tabs[2].path)}
            onClick={() => router.push(tabs[2].path)}
          />

          {/* 지도 탭 */}
          <TabButton
            label={tabs[3].label}
            icon={tabs[3].icon}
            isActive={pathname.startsWith(tabs[3].path)}
            onClick={() => router.push(tabs[3].path)}
          />
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
      />
    </>
  );
}

interface TabButtonProps {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  onClick: () => void;
}

function TabButton({ label, icon: Icon, isActive, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center space-y-1 ${
        isActive ? 'text-primary font-semibold' : 'text-gray-500'
      }`}
    >
      <Icon className="w-6 h-6" />
      <span className="text-xs">{label}</span>
    </button>
  );
}
