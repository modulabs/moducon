import { Calendar, MapPin, Clock, Building2, Users, Zap, TrendingUp, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import MascotCharacter from '../imports/Group';
import ModulabsLogo from '../imports/Group-53-445';
import WhiteBear from '../imports/Group-53-73';
import GreenBearGroup from '../imports/Group2';

export function Home() {
  // Mock data - 실시간 데이터는 나중에 Supabase로 교체
  const currentTime = new Date();
  const currentHour = 10; // Mock: 10시 30분

  const liveStatus = [
    { track: 'AI to ∞', occupancy: 12, status: 'low', location: '이삼봉홀', emoji: '🚀' },
    { track: 'AI to Reality', occupancy: 45, status: 'medium', location: '트랙 1', emoji: '⚡' },
    { track: '10 Years', occupancy: 89, status: 'high', location: '트랙 2', emoji: '🎉' },
    { track: 'Tech for Impact', occupancy: 23, status: 'low', location: '트랙 3', emoji: '💡' },
    { track: 'Papershop', occupancy: 67, status: 'medium', location: '포스터존', emoji: '📊' },
    { track: 'Workshop', occupancy: 34, status: 'medium', location: '워크샵룸', emoji: '🛠️' },
  ];

  const currentSessions = [
    { title: 'Meta Llama 클라우드 혁신', time: '10:00-10:40', track: 'AI to ∞', emoji: '🦙' },
    { title: 'NAVER CLOVA AI 혁신', time: '10:00-10:40', track: 'AI to Reality', emoji: '🔮' },
  ];

  const getStatusColor = (status: string) => {
    if (status === 'low') return 'from-green-400 to-emerald-500';
    if (status === 'medium') return 'from-yellow-400 to-orange-400';
    return 'from-red-400 to-pink-500';
  };

  const getStatusText = (status: string) => {
    if (status === 'low') return '여유';
    if (status === 'medium') return '보통';
    return '혼잡';
  };

  return (
    <div className="min-h-screen pb-6 bg-gradient-to-br from-gray-50 via-orange-50/30 to-pink-50/20 relative overflow-hidden">
      {/* Continuously animated wave background - 계속 움직이는 물결 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, -50, 100, 0],
            y: [0, 50, -30, 60, 0],
            scale: [1, 1.2, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-[#FF6B9D]/20 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 50, -80, 0],
            y: [0, -50, 30, -40, 0],
            scale: [1, 0.9, 1.2, 1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-bl from-[#FF8B5A]/20 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 80, -40, 70, 0],
            y: [0, -60, 40, -50, 0],
            scale: [1, 1.1, 1, 1.2, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/3 -right-40 w-96 h-96 bg-gradient-to-l from-[#FFA94D]/20 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -60, 40, -50, 0],
            y: [0, 80, -40, 70, 0],
            scale: [1, 1.2, 1.1, 0.9, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-20 -left-20 w-72 h-72 bg-gradient-to-tr from-[#FF6B9D]/15 to-transparent rounded-full blur-3xl"
        />
        
        {/* 추가 움직이는 별 효과 */}
        <motion.div
          animate={{
            x: [0, 200, 100, 150, 0],
            y: [0, 100, 200, 50, 0],
            opacity: [0.3, 0.6, 0.4, 0.7, 0.3],
            scale: [1, 1.5, 1.2, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/2 left-1/4 w-32 h-32 bg-gradient-to-br from-yellow-300/30 to-orange-300/30 rounded-full blur-2xl"
        />
      </div>

      {/* Mascot with speech bubble - 마스코트 */}
      <motion.div
        initial={{ opacity: 0, scale: 0, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, delay: 0.5, type: "spring", bounce: 0.5 }}
        className="absolute bottom-20 right-4 z-30 pointer-events-none"
      >
        {/* Speech bubble */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="absolute -top-16 -left-36 bg-white rounded-2xl shadow-2xl p-2.5 border-3 border-black"
          style={{ width: '160px' }}
        >
          <p className="text-[10px] text-black font-bold text-center leading-relaxed">
            MODUCON에 오신<br />여러분을 환영해요! 🎉
          </p>
          {/* Speech bubble tail */}
          <div className="absolute -bottom-2 right-6 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] border-t-black" />
          <div className="absolute -bottom-1.5 right-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-white" />
        </motion.div>
        
        {/* Mascot character */}
        <motion.div
          animate={{ 
            y: [0, -8, 0],
            rotate: [0, 3, -3, 0],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-16 h-16 relative"
        >
          <MascotCharacter />
        </motion.div>
      </motion.div>

      {/* Header with holographic effect */}
      <div className="relative bg-gradient-to-br from-[#FF6B9D] via-[#FF8B5A] to-[#FFA94D] text-black p-6 pb-12 overflow-hidden">
        {/* Animated background circles */}
        <motion.div 
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"
        />
        <motion.div 
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.05, 0.1, 0.05]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-0 left-0 w-48 h-48 bg-black rounded-full blur-2xl"
        />
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl mb-1 font-black tracking-tight">모두콘 2025</h1>
              <p className="text-sm opacity-90 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                From AI to Infinity
              </p>
            </div>
            {/* MODULABS Logo */}
            <motion.div
              animate={{ 
                y: [0, -3, 0],
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-24 h-12"
            >
              <ModulabsLogo />
            </motion.div>
          </div>
          
          {/* Quick Info with glassmorphism */}
          <div className="bg-white/30 backdrop-blur-md rounded-2xl p-4 border border-white/40 shadow-xl">
            <div className="flex items-center gap-4 text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">2025.12.13 (토)</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="font-medium">이화여대 ECC</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* My Activity Summary with gradient border */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="px-6 -mt-8 mb-6 relative z-20"
      >
        <div className="relative bg-gradient-to-br from-white to-orange-50/50 rounded-3xl p-6 shadow-2xl border border-orange-200/50">
          {/* Gradient border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B9D] via-[#FF8B5A] to-[#FFA94D] rounded-3xl opacity-20 blur-sm" />
          
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B9D] to-[#FF8B5A]">
                🏆 나의 활동
              </h2>
              <TrendingUp className="w-5 h-5 text-[#FF8B5A]" />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {/* 원형 디자인 */}
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="relative text-center p-4"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B9D] to-[#FF8B5A] rounded-full opacity-20 blur-md" />
                <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-[#FFE5EE] to-[#FFF0E8] rounded-full flex flex-col items-center justify-center border-4 border-[#FF6B9D]/30 shadow-xl">
                  <div className="text-2xl bg-gradient-to-br from-[#FF6B9D] to-[#FF8B5A] text-transparent bg-clip-text font-black">4</div>
                  <div className="text-xs text-gray-700 mt-1">참여 세션</div>
                </div>
              </motion.div>
              
              {/* 육각형 느낌 디자인 */}
              <motion.div 
                whileHover={{ scale: 1.05, rotate: -5 }}
                className="relative text-center p-4"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF8B5A] to-[#FFA94D] opacity-20 blur-md" 
                     style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
                <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-[#FFF0E8] to-[#FFF8F3] flex flex-col items-center justify-center border-4 border-[#FF8B5A]/30 shadow-xl"
                     style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                  <div className="text-2xl bg-gradient-to-br from-[#FF8B5A] to-[#FFA94D] text-transparent bg-clip-text font-black">3/6</div>
                  <div className="text-xs text-gray-700 mt-1">스탬프</div>
                </div>
              </motion.div>
              
              {/* 다이아몬드 디자인 */}
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="relative text-center p-4"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#FFA94D] to-[#FFB84D] opacity-20 blur-md rotate-45" />
                <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-[#FFF8F3] to-[#FFFAF8] rotate-45 flex items-center justify-center border-4 border-[#FFA94D]/30 shadow-xl">
                  <div className="-rotate-45 flex flex-col items-center">
                    <div className="text-2xl bg-gradient-to-br from-[#FFA94D] to-[#FFB84D] text-transparent bg-clip-text font-black">2</div>
                    <div className="text-xs text-gray-700 mt-1">부스 방문</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Live Status with neon effect */}
      <div className="px-6 mb-6 relative">
        {/* Green Bear Group - 초록 곰과 병아리 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: 30 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 1, type: "spring" }}
          className="absolute -top-10 -right-8 w-24 h-24 z-10"
        >
          <motion.div
            animate={{ 
              y: [0, -6, 0],
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <GreenBearGroup />
          </motion.div>
        </motion.div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B9D] to-[#FF8B5A]">
            🔥 실시간 혼잡도
          </h2>
          <motion.div 
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs shadow-lg"
          >
            <Zap className="w-3 h-3" />
            LIVE
          </motion.div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {liveStatus.map((item, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.03, y: -2 }}
              className="relative group"
            >
              {/* 다양한 모양의 글로우 효과 */}
              <div 
                className={`absolute inset-0 bg-gradient-to-br from-[#FF6B9D]/20 to-[#FFA94D]/20 blur-lg group-hover:blur-xl transition-all ${
                  index % 3 === 0 ? 'rounded-3xl' : index % 3 === 1 ? 'rounded-2xl' : 'rounded-xl'
                }`}
                style={index % 2 === 0 ? {} : { clipPath: 'polygon(0 10%, 100% 0, 100% 90%, 0 100%)' }}
              />
              
              <div 
                className={`relative bg-white p-4 border border-orange-100 shadow-lg hover:shadow-2xl transition-all ${
                  index % 3 === 0 ? 'rounded-3xl' : index % 3 === 1 ? 'rounded-2xl' : 'rounded-xl'
                }`}
                style={index % 2 === 0 ? {} : { clipPath: 'polygon(0 10%, 100% 0, 100% 90%, 0 100%)' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <motion.span 
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-lg"
                      >
                        {item.emoji}
                      </motion.span>
                      <h3 className="text-sm text-gray-800">{item.track}</h3>
                    </div>
                    <p className="text-xs text-gray-500">{item.location}</p>
                  </div>
                  <motion.div 
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`w-3 h-3 rounded-full bg-gradient-to-br ${getStatusColor(item.status)} shadow-lg`} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Users className="w-3 h-3" />
                    <span className="font-medium">{item.occupancy}명</span>
                  </div>
                  <div className={`px-2 py-1 rounded-lg bg-gradient-to-r ${getStatusColor(item.status)} text-white text-xs font-medium shadow-sm`}>
                    {getStatusText(item.status)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Current Sessions with animated gradient */}
      <div className="px-6 mb-6">
        <h2 className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B9D] to-[#FF8B5A] mb-4">
          ⚡ 지금 진행중
        </h2>
        
        <div className="space-y-3 relative">
          {/* White Bear Character - 흰색 곰 */}
          <motion.div
            initial={{ opacity: 0, x: -30, rotate: -15 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.8, type: "spring" }}
            className="absolute -top-12 -left-2 w-16 h-16 z-10"
          >
            <motion.div
              animate={{ 
                rotate: [0, -5, 5, 0],
                y: [0, -5, 0],
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <WhiteBear />
            </motion.div>
          </motion.div>

          {currentSessions.map((session, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="relative group overflow-hidden rounded-2xl"
            >
              {/* Animated gradient background */}
              <motion.div 
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-r from-[#FF6B9D] via-[#FF8B5A] to-[#FFA94D] bg-[length:200%_100%]"
              />
              
              <div className="relative p-5 text-white">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-2xl">{session.emoji}</span>
                    <h3 className="text-sm font-medium">{session.title}</h3>
                  </div>
                  <motion.div 
                    animate={{ opacity: [1, 0.6, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="px-3 py-1 bg-white/30 backdrop-blur-md rounded-full text-xs font-bold border border-white/40 shadow-lg whitespace-nowrap"
                  >
                    🔴 LIVE
                  </motion.div>
                </div>
                
                <div className="flex items-center gap-4 text-xs opacity-95">
                  <span className="flex items-center gap-1 bg-black/20 backdrop-blur-sm px-2 py-1 rounded-lg">
                    <Clock className="w-3 h-3" />
                    {session.time}
                  </span>
                  <span className="flex items-center gap-1 bg-black/20 backdrop-blur-sm px-2 py-1 rounded-lg">
                    <MapPin className="w-3 h-3" />
                    {session.track}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}