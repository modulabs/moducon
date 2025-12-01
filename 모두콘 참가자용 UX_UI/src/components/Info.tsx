import { MapPin, Car, Train, Sparkles, Building2 } from 'lucide-react';
import { motion } from 'motion/react';
import modulabsLogo from 'figma:asset/0f37af57cf776947104caaad0dc51247cb5a45bd.png';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function Info() {
  const sponsors = [
    { type: '주관', names: ['모두의연구소', '이화여대 창업지원단', '이화여대 AIX 사업단'], emoji: '🏢' },
    { type: '후원', names: ['고용노동부', '한국산업인력공단', 'K-하이테크 플랫폼', '카카오임팩트'], emoji: '🤝' },
    { type: '협력', names: ['동그라미재단', '요즘IT', '제이펍', 'AI프렌즈'], emoji: '💼' },
  ];

  return (
    <div className="min-h-screen pb-6 bg-gradient-to-br from-gray-50 via-orange-50/30 to-pink-50/20 relative overflow-hidden">
      {/* Animated wave background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-[#FF6B9D]/20 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -80, 0], y: [0, -60, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/3 -right-40 w-80 h-80 bg-gradient-to-l from-[#FFA94D]/20 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -60, 0], y: [0, 80, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 -left-20 w-72 h-72 bg-gradient-to-tr from-[#FF8B5A]/15 to-transparent rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#FF6B9D] via-[#FF8B5A] to-[#FFA94D] text-black p-6 mb-6 relative overflow-hidden"
      >
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"
        />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6" />
            <h1 className="text-2xl font-black">행사 정보</h1>
          </div>
          <p className="opacity-90">모두콘 2025 - From AI to Infinity</p>
        </div>
      </motion.div>

      {/* Event Overview */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-6 mb-6 relative z-10"
      >
        <h2 className="text-lg mb-3 text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B9D] to-[#FF8B5A] font-bold">📖 행사 개요</h2>
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-2xl shadow-xl p-6 border border-orange-100"
        >
          <p className="text-gray-700 leading-relaxed mb-4">
            모두콘은 모두의연구소가 2018년부터 매년 개최해온 <span className="font-bold text-[#FF8B5A]">대한민국 대표 커뮤니티 기반 AI·테크 컨퍼런스</span>입니다.
          </p>
          <p className="text-gray-700 leading-relaxed">
            2025년에는 모두의연구소 <span className="font-bold text-[#FF8B5A]">10주년</span>을 맞아 AI의 미래·실전·커뮤니티의 확장을 모두 담았습니다.
          </p>
        </motion.div>
      </motion.div>

      {/* Organizers */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-6 mb-6 relative z-10"
      >
        <h2 className="text-lg mb-3 text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B9D] to-[#FF8B5A] font-bold">🤝 주관 & 협력</h2>
        <div className="space-y-3">
          {sponsors.map((sponsor, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ scale: 1.02, x: 5 }}
              className="bg-white rounded-2xl shadow-lg p-5 border border-orange-100"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{sponsor.emoji}</span>
                <div className="px-3 py-1 bg-gradient-to-r from-[#FFE5EE] to-[#FFF0E8] rounded-lg">
                  <span className="text-sm text-[#FF8B5A] font-bold">{sponsor.type}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {sponsor.names.map((name, idx) => (
                  <motion.span
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    className="text-sm text-gray-700 bg-gray-50 px-3 py-1 rounded-lg"
                  >
                    {name}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* MODULABS Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
          className="mt-4 bg-white rounded-2xl shadow-lg p-6 border border-orange-100 flex items-center justify-center"
        >
          <ImageWithFallback
            src={modulabsLogo} 
            alt="MODULABS" 
            className="h-12 object-contain"
          />
        </motion.div>
      </motion.div>

      {/* Venue */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="px-6 mb-6 relative z-10"
      >
        <h2 className="text-lg mb-3 text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B9D] to-[#FF8B5A] font-bold">📍 장소</h2>
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-2xl shadow-xl p-6 border border-orange-100"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-[#FFE5EE] to-[#FFF0E8] rounded-lg">
              <MapPin className="w-5 h-5 text-[#FF8B5A]" />
            </div>
            <div>
              <div className="font-bold text-gray-800 mb-1">이화여자대학교 ECC</div>
              <p className="text-sm text-gray-600">서울특별시 서대문구 화여대길 52</p>
            </div>
          </div>
          
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.open('https://map.naver.com/v5/search/이화여자대학교%20ECC', '_blank')}
            className="relative bg-gradient-to-br from-[#FFE5EE] via-[#FFF0E8] to-[#FFF8F3] rounded-2xl h-48 overflow-hidden border-2 border-[#FF8B5A]/20 cursor-pointer group mb-4"
          >
            {/* Animated background */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-br from-[#FF6B9D]/10 to-[#FFA94D]/10"
            />
            
            {/* Map icon placeholder */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  y: [0, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-6 bg-white rounded-full shadow-xl"
              >
                <MapPin className="w-12 h-12 text-[#FF8B5A]" />
              </motion.div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-gray-700">네이버 지도 보기</p>
                <span className="text-2xl">🗺️</span>
              </div>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileHover={{ opacity: 1, scale: 1 }}
                className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all"
              >
                <p className="text-sm font-bold text-[#FF8B5A] flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  클릭하여 네이버 지도 열기
                </p>
              </motion.div>
            </div>
            
            {/* Location label */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg">
              <div className="flex items-center gap-2">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-2 h-2 bg-[#FF8B5A] rounded-full"
                />
                <div>
                  <p className="text-xs text-gray-500">행사 장소</p>
                  <p className="font-bold text-gray-800">이화여자대학교 ECC</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.open('https://map.naver.com/v5/search/이화여자대학교%20ECC', '_blank')}
            className="w-full bg-gradient-to-r from-[#FF6B9D] via-[#FF8B5A] to-[#FFA94D] text-white py-3 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg"
          >
            <MapPin className="w-4 h-4" />
            네이버 지도에서 길찾기
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Transportation */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="px-6 mb-6 relative z-10"
      >
        <h2 className="text-lg mb-3 text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B9D] to-[#FF8B5A] font-bold">🚇 오시는 길</h2>
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-orange-100 space-y-4">
          <motion.div 
            whileHover={{ x: 5 }}
            className="flex items-start gap-3 p-4 bg-gradient-to-br from-[#FFE5EE] to-[#FFF0E8] rounded-xl"
          >
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Train className="w-5 h-5 text-[#FF8B5A]" />
            </div>
            <div>
              <div className="font-bold text-gray-800 mb-1">지하철</div>
              <p className="text-sm text-gray-600">
                2호선 이대역 2, 3번 출구 (도보 5분)<br />
                신촌역에서 이대까지 도보 10분
              </p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ x: 5 }}
            className="flex items-start gap-3 p-4 bg-gradient-to-br from-[#FFF0E8] to-[#FFF8F3] rounded-xl"
          >
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Car className="w-5 h-5 text-[#FF8B5A]" />
            </div>
            <div>
              <div className="font-bold text-gray-800 mb-1">주차</div>
              <p className="text-sm text-gray-600">
                ECC 지하주차장 이용 가능<br />
                행사 참가자 주차 할인 제공
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}