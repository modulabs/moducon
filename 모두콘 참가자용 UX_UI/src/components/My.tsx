import { User, Award, CheckCircle, Star, Calendar, TrendingUp, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function My() {
  // Mock data - 나중에 Supabase로 교체
  const profile = {
    name: '참가자 이름',
    organization: '소속',
    role: '직무',
  };

  const stats = {
    sessionsAttended: 4,
    stampsCollected: 3,
    boothsVisited: 2,
  };

  const tracks = [
    { name: 'AI to ∞', completed: true, emoji: '🚀' },
    { name: 'AI to Reality', completed: true, emoji: '⚡' },
    { name: '10 Years of MODULABS', completed: false, emoji: '🎉' },
    { name: 'Tech for Impact', completed: true, emoji: '💡' },
    { name: 'Papershop Poster', completed: false, emoji: '📊' },
    { name: 'Hands-on Workshop', completed: false, emoji: '🛠️' },
  ];

  const progress = (stats.stampsCollected / 6) * 100;

  return (
    <div className="min-h-screen pb-6 bg-gradient-to-br from-gray-50 via-orange-50/30 to-pink-50/20">
      {/* Header with holographic effect */}
      <div className="relative bg-gradient-to-br from-[#FF6B9D] via-[#FF8B5A] to-[#FFA94D] text-black p-6 pb-12 overflow-hidden">
        {/* Animated background */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl"
        />
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-6 h-6" />
            <h1 className="text-2xl font-black">마이 페이지</h1>
          </div>
          
          {/* Profile Card with glassmorphism */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white/30 backdrop-blur-lg rounded-3xl p-6 border border-white/40 shadow-2xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-16 h-16 bg-gradient-to-br from-white to-orange-100 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
              >
                <User className="w-8 h-8 text-[#FF8B5A]" />
              </motion.div>
              <div>
                <h2 className="text-xl mb-1 font-bold">{profile.name}</h2>
                <p className="text-sm opacity-80">{profile.organization}</p>
                <p className="text-xs opacity-70">{profile.role}</p>
              </div>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-black/20 backdrop-blur-sm text-black py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-black/30 transition-all"
            >
              프로필 수정
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* Stats with gradient cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="px-6 -mt-8 mb-6 relative z-20"
      >
        <div className="grid grid-cols-3 gap-3">
          <motion.div 
            whileHover={{ scale: 1.05, y: -5 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FF6B9D] to-[#FF8B5A] p-5 text-center shadow-xl"
          >
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-white/20"
            />
            <div className="relative">
              <div className="text-3xl text-white mb-2 font-black">{stats.sessionsAttended}</div>
              <div className="text-xs text-white/90 font-medium">참여 세션</div>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.05, y: -5 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FF8B5A] to-[#FFA94D] p-5 text-center shadow-xl"
          >
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              className="absolute inset-0 bg-white/20"
            />
            <div className="relative">
              <div className="text-3xl text-white mb-2 font-black">{stats.stampsCollected}/6</div>
              <div className="text-xs text-white/90 font-medium">트랙 스탬프</div>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.05, y: -5 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FFA94D] to-[#FFB84D] p-5 text-center shadow-xl"
          >
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
              className="absolute inset-0 bg-white/20"
            />
            <div className="relative">
              <div className="text-3xl text-white mb-2 font-black">{stats.boothsVisited}</div>
              <div className="text-xs text-white/90 font-medium">부스 방문</div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Stamp Collection with animated progress */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B9D] to-[#FF8B5A]">
            🏆 스탬프 컬렉션
          </h2>
          <TrendingUp className="w-5 h-5 text-[#FF8B5A]" />
        </div>
        
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-orange-100">
          <div className="mb-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-600 font-medium">진행률</span>
              <span className="text-sm text-[#FF8B5A] font-bold">{stats.stampsCollected}/6 트랙</span>
            </div>
            
            {/* Animated progress bar */}
            <div className="relative w-full bg-gradient-to-r from-gray-100 to-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative h-3 rounded-full overflow-hidden"
              >
                <motion.div
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-[#FF6B9D] via-[#FF8B5A] to-[#FFA94D] bg-[length:200%_100%]"
                />
                <motion.div
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 bg-white/30"
                />
              </motion.div>
            </div>
          </div>

          <div className="space-y-2">
            {tracks.map((track, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.02, x: 5 }}
                className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                  track.completed 
                    ? 'bg-gradient-to-r from-[#FFE5EE] to-[#FFF0E8] border-2 border-[#FF8B5A]/30 shadow-md' 
                    : 'bg-gray-50 border-2 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {track.completed ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: index * 0.1 }}
                    >
                      <CheckCircle className="w-6 h-6 text-[#FF8B5A]" />
                    </motion.div>
                  ) : (
                    <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
                  )}
                  <span className="text-lg">{track.emoji}</span>
                  <span className={`text-sm font-medium ${track.completed ? 'text-gray-800' : 'text-gray-400'}`}>
                    {track.name}
                  </span>
                </div>
                {track.completed && (
                  <motion.div
                    animate={{ rotate: [0, 20, -20, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Star className="w-5 h-5 text-[#FFA94D] fill-[#FFA94D]" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Badges with hover effects */}
      <div className="px-6 mb-6">
        <h2 className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B9D] to-[#FF8B5A] mb-4">
          🎖️ 획득한 뱃지
        </h2>
        
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-orange-100">
          <div className="grid grid-cols-3 gap-4">
            <motion.div 
              whileHover={{ scale: 1.1, y: -5 }}
              className="text-center"
            >
              <div className="relative">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-[#FF6B9D] to-[#FF8B5A] rounded-full opacity-20 blur-md"
                />
                <div className="relative w-16 h-16 mx-auto bg-gradient-to-br from-[#FFE5EE] to-[#FFF0E8] rounded-full flex items-center justify-center mb-2 border-3 border-[#FF8B5A] shadow-lg">
                  <Award className="w-8 h-8 text-[#FF8B5A]" />
                </div>
              </div>
              <p className="text-xs text-gray-700 font-bold">얼리버드</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="text-center opacity-40"
            >
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-2 border-3 border-gray-300">
                <Award className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-xs text-gray-400 font-medium">컴플리트</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="text-center opacity-40"
            >
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-2 border-3 border-gray-300">
                <Award className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-xs text-gray-400 font-medium">네트워커</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Recent Activity with timeline */}
      <div className="px-6 mb-6">
        <h2 className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B9D] to-[#FF8B5A] mb-4">
          📅 최근 활동
        </h2>
        
        <div className="space-y-3">
          {[
            { title: 'Meta Llama 세션 체크인', time: '10:15 AM', location: '트랙 1', emoji: '🦙' },
            { title: '부스 방문 체크', time: '09:45 AM', location: '포스터 세션', emoji: '📊' },
          ].map((activity, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, x: 5 }}
              className="bg-white rounded-2xl p-4 shadow-lg border border-orange-100"
            >
              <div className="flex items-start gap-3">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                >
                  <CheckCircle className="w-5 h-5 text-[#FF8B5A] flex-shrink-0 mt-0.5" />
                </motion.div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{activity.emoji}</span>
                    <p className="text-sm font-medium">{activity.title}</p>
                  </div>
                  <p className="text-xs text-gray-500">{activity.time} · {activity.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}