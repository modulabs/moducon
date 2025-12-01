import { Home, Info, Layers, User, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';

interface NavigationProps {
  activeTab: 'home' | 'tracks' | 'qr' | 'my' | 'info';
  onTabChange: (tab: 'home' | 'tracks' | 'qr' | 'my' | 'info') => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    { id: 'home' as const, icon: Home, label: '홈' },
    { id: 'tracks' as const, icon: Layers, label: '탐험' },
    { id: 'qr' as const, icon: QrCode, label: 'QR', isCenter: true },
    { id: 'my' as const, icon: User, label: '마이' },
    { id: 'info' as const, icon: Info, label: '정보' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-[#FF6B9D] via-[#FF8B5A] to-[#FFA94D] border-t border-white/20 max-w-md mx-auto z-50 backdrop-blur-lg shadow-2xl">
      <div className="flex justify-around items-center h-16 relative">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          // Center QR button - make it bigger and elevated with pulse animation
          if (tab.isCenter) {
            return (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="absolute left-1/2 -translate-x-1/2 -top-8 z-10"
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
                  <div className={`relative w-16 h-16 rounded-full shadow-2xl flex flex-col items-center justify-center transition-all ${
                    isActive 
                      ? 'bg-gradient-to-br from-[#FF6B9D] via-[#FF8B5A] to-[#FFA94D] text-white scale-110' 
                      : 'bg-white text-[#FF8B5A] border-4 border-[#FF8B5A]'
                  }`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  
                  {/* Glow effect */}
                  {isActive && (
                    <motion.div 
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#FFA94D] opacity-50 blur-xl"
                    />
                  )}
                </div>
              </motion.button>
            );
          }
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all relative ${
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
  );
}