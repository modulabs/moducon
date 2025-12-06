'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Calendar, Store, FileText, Map, QrCode } from 'lucide-react';
import { QRScannerModal } from '@/components/qr/QRScannerModal';
import { motion } from 'motion/react';

export function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const tabs = [
    { label: '세션', icon: Calendar, path: '/sessions', position: 'left' },
    { label: '부스', icon: Store, path: '/booths', position: 'center-left' },
    { label: 'QR', icon: QrCode, path: 'qr', isCenter: true },
    { label: '포스터', icon: FileText, path: '/papers', position: 'center-right' },
    { label: '지도', icon: Map, path: '/map', position: 'right' },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-[#FF6B9D] via-[#FF8B5A] to-[#FFA94D] border-t border-white/20 z-50 backdrop-blur-lg shadow-2xl">
        <div className="flex justify-around items-center h-16 relative max-w-screen-lg mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.path !== 'qr' && pathname.startsWith(tab.path);

            // Center QR button
            if (tab.isCenter) {
              return (
                <motion.button
                  key={tab.path}
                  onClick={() => setQrModalOpen(true)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute left-1/2 -translate-x-1/2 -top-5 z-10"
                  aria-label="QR 코드 스캔"
                >
                  <div className="relative">
                    {/* Pulse ring animation */}
                    <motion.div
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 0, 0.5]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#FFA94D] blur-md"
                    />

                    {/* Main button */}
                    <div className="relative w-16 h-16 rounded-full shadow-2xl flex flex-col items-center justify-center bg-white/80 text-[#FF8B5A] border-4 border-[#FF8B5A]/80 hover:bg-gradient-to-br hover:from-[#FF6B9D] hover:via-[#FF8B5A] hover:to-[#FFA94D] hover:text-white hover:border-white transition-all">
                      <Icon className="w-7 h-7" />
                    </div>
                  </div>
                </motion.button>
              );
            }

            // 부스/포스터 버튼은 QR 버튼과 간격 추가
            const spacingClass = tab.position === 'center-left'
              ? 'mr-6'
              : tab.position === 'center-right'
                ? 'ml-6'
                : '';

            return (
              <motion.button
                key={tab.path}
                onClick={() => router.push(tab.path)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-all relative ${spacingClass} ${
                  isActive ? 'text-white scale-110' : 'text-black/60'
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{tab.label}</span>

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white shadow-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
      />
    </>
  );
}
