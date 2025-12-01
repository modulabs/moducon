import qrCode from 'figma:asset/b27f1f2d6108fe9425680932f450c51efe833ce3.png';
import { motion } from 'framer-motion';
import { Scan, Sparkles } from 'lucide-react';

export function QRCode() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF6B9D] via-[#FF8B5A] to-[#FFA94D] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0]
        }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute top-20 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"
      />
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          rotate: [0, -90, 0]
        }}
        transition={{ duration: 15, repeat: Infinity }}
        className="absolute bottom-20 left-10 w-48 h-48 bg-black/10 rounded-full blur-2xl"
      />
      
      <motion.div 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 relative z-10"
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-block mb-3"
        >
          <Sparkles className="w-12 h-12 text-white" />
        </motion.div>
        <h1 className="text-4xl text-white mb-3 font-black tracking-tight drop-shadow-lg">🎫 디지털 출입증</h1>
        <p className="text-white/90 text-lg">세션 입장 시 이 QR 코드를 제시해주세요</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative"
      >
        {/* Outer glow ring */}
        <motion.div 
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute -inset-4 bg-gradient-to-r from-white/30 to-white/10 rounded-[2.5rem] blur-xl"
        />
        
        {/* QR Container with glassmorphism */}
        <div className="relative bg-white/95 backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl border-4 border-white/50">
          {/* Corner decorations */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-4 border-l-4 border-[#FF8B5A] rounded-tl-lg" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-4 border-r-4 border-[#FF8B5A] rounded-tr-lg" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-4 border-l-4 border-[#FF8B5A] rounded-bl-lg" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-4 border-r-4 border-[#FF8B5A] rounded-br-lg" />
          
          <motion.img 
            animate={{ 
              scale: [1, 1.02, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            src={qrCode} 
            alt="모두콘 2025 QR 코드" 
            className="w-72 h-72 object-contain"
            style={{
              filter: 'grayscale(1) brightness(0.4) contrast(2)',
            }}
          />
        </div>
        
        {/* Scan indicator animation */}
        <motion.div
          animate={{ y: [0, 280, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute left-8 top-8 right-8 h-1 bg-gradient-to-r from-transparent via-[#FF8B5A] to-transparent opacity-50 blur-sm"
        />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-10 text-center relative z-10"
      >
        <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-6 border border-white/30 shadow-2xl max-w-sm">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Scan className="w-5 h-5 text-white" />
            <p className="text-white text-lg font-bold">체크인 방법</p>
          </div>
          <p className="text-white/90 text-sm leading-relaxed">
            세션장 입구에서 QR 코드를 스캔하면<br />
            자동으로 출석이 체크되고<br />
            <span className="font-bold text-yellow-300">스탬프를 획득</span>할 수 있습니다 🏆
          </p>
        </div>
      </motion.div>
    </div>
  );
}