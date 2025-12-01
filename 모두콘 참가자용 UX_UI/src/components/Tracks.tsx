import { useState, useEffect } from 'react';
import { Clock, MapPin, ChevronRight, ArrowLeft, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import WhiteBear from '../imports/Group-53-73';

interface Session {
  id: string;
  title: string;
  speaker: string;
  time: string;
  track: string;
  category: string;
  description: string;
  type: 'main' | 'interactive';
  trackCategory: string;
}

const sessions: Session[] = [
  // Main Sessions - Morning
  {
    id: '1',
    title: '기술창업 6번을 통해서 배운 AI 시대의 기회',
    speaker: '노정석 비팩토리 대표',
    time: '10:10 - 10:50',
    track: '이삼봉 홀',
    category: '키노트',
    description: '모두콘 2025의 시작을 알리는 개회식입니다.',
    type: 'main',
    trackCategory: 'AI to Reality'
  },
  {
    id: '2',
    title: 'Meta Llama를 활용한 클라우드 인프라 혁신',
    speaker: 'Meta 연사',
    time: '10:00 - 10:40',
    track: '트랙 1',
    category: '기술',
    description: 'Meta Llama 모델을 활용한 클라우드 인프라 구축 사례를 소개합니다.',
    type: 'main',
    trackCategory: 'AI to ∞'
  },
  {
    id: '3',
    title: 'AI 기반의 효율 혁신 - NAVER CLOVA',
    speaker: 'NAVER CLOVA 팀',
    time: '10:00 - 10:40',
    track: '트랙 2',
    category: '기술',
    description: 'NAVER CLOVA를 통한 업무 효율성 향상 사례를 공유합니다.',
    type: 'main',
    trackCategory: 'AI to Reality'
  },
  {
    id: '4',
    title: 'AI 기반의 사물 인공지능',
    speaker: 'IoT AI 전문가',
    time: '10:00 - 10:40',
    track: '트랙 3',
    category: '기술',
    description: '사물인터넷과 AI의 결합을 통한 혁신 사례를 다룹니다.',
    type: 'main',
    trackCategory: 'Tech for Impact'
  },
  {
    id: '5',
    title: 'AI 시대의 혁신 방향 - AMD',
    speaker: 'AMD 연사',
    time: '10:40 - 11:20',
    track: '트랙 1',
    category: '기술',
    description: 'AMD의 AI 하드웨어 기술과 미래 방향성을 소개합니다.',
    type: 'main',
    trackCategory: 'AI to ∞'
  },
  {
    id: '6',
    title: 'AI Network Agent & Social Matching',
    speaker: 'BTC 나비',
    time: '10:40 - 11:20',
    track: '트랙 2',
    category: '기술',
    description: 'AI 네트워크 에이전트와 소셜 매칭 기술을 다룹니다.',
    type: 'main',
    trackCategory: 'AI to Reality'
  },
  {
    id: '7',
    title: '검색 광고 AI 모델 생산성과 고도화',
    speaker: '광고 AI 전문가',
    time: '10:40 - 11:20',
    track: '트랙 3',
    category: '비즈니스',
    description: '검색 광고에서의 AI 모델 활용과 최적화 방법을 공유합니다.',
    type: 'main',
    trackCategory: 'AI to Reality'
  },
  {
    id: '8',
    title: 'From Basic To OpenAI - OpenAI 오픈소스화',
    speaker: 'OpenAI 전문가',
    time: '11:20 - 12:00',
    track: '트랙 1',
    category: '기술',
    description: 'OpenAI의 기본부터 오픈소스 활용까지 전반적인 내용을 다룹니다.',
    type: 'main',
    trackCategory: 'AI to ∞'
  },
  {
    id: '9',
    title: 'AI 기반 의료 혁신',
    speaker: '의료 AI 연구자',
    time: '11:20 - 12:00',
    track: '트랙 2',
    category: '인사이트',
    description: 'AI 기술이 의료 분야에 가져온 혁신적 변화를 살펴봅니다.',
    type: 'main',
    trackCategory: 'Tech for Impact'
  },
  {
    id: '10',
    title: '법무 법인의 AI 활용',
    speaker: '법무법인 전문가',
    time: '11:20 - 12:00',
    track: '트랙 3',
    category: '비즈니스',
    description: '법률 분야에서의 AI 도입과 활용 사례를 소개합니다.',
    type: 'main',
    trackCategory: 'AI to Reality'
  },
  // Main Sessions - Afternoon
  {
    id: '11',
    title: 'Headspace - 뇌 데이터와 LLM',
    speaker: 'Headspace 연구팀',
    time: '13:30 - 14:10',
    track: '트랙 1',
    category: '기술',
    description: '뇌과학 데이터와 대규모 언어 모델의 융합을 다룹니다.',
    type: 'main',
    trackCategory: 'AI to ∞'
  },
  {
    id: '12',
    title: 'AI를 활용한 광고 혁신',
    speaker: '광고 플랫폼 전문가',
    time: '13:30 - 14:10',
    track: '트랙 2',
    category: '비즈니스',
    description: 'AI 기술로 광고 산업을 혁신하는 방법을 공유합니다.',
    type: 'main',
    trackCategory: 'AI to Reality'
  },
  {
    id: '13',
    title: 'AI 기반 서비스 구축',
    speaker: 'AI 서비스 개발자',
    time: '13:30 - 14:10',
    track: '트랙 3',
    category: '기술',
    description: 'AI 기반 서비스 개발 과정과 노하우를 전달합니다.',
    type: 'main',
    trackCategory: '10 Years of MODULABS'
  },
  {
    id: '14',
    title: 'AI for the Mastery of Visual Media',
    speaker: 'Visual AI 전문가',
    time: '14:50 - 15:30',
    track: '트랙 1',
    category: '기술',
    description: '비주얼 미디어 분야에서의 AI 마스터리를 다룹니다.',
    type: 'main',
    trackCategory: 'AI to ∞'
  },
  {
    id: '15',
    title: '법인 컨설팅 최신서비스 및 시장 현황',
    speaker: '컨설팅 전문가',
    time: '14:50 - 15:30',
    track: '트랙 2',
    category: '비즈니스',
    description: '법인 컨설팅 시장의 최신 동향과 AI 활용을 소개합니다.',
    type: 'main',
    trackCategory: 'AI to Reality'
  },
  {
    id: '16',
    title: 'LLT에서 Big Large Token Data Generation',
    speaker: 'LLM 연구자',
    time: '14:50 - 15:30',
    track: '트랙 3',
    category: '기술',
    description: '대규모 토큰 데이터 생성 기술을 다룹니다.',
    type: 'main',
    trackCategory: 'Papershop Poster'
  },
  {
    id: '17',
    title: '무형자산 프로세스의 혁신',
    speaker: 'IP 전문가',
    time: '15:30 - 16:10',
    track: '트랙 1',
    category: '비즈니스',
    description: 'AI를 활용한 무형자산 관리 혁신을 소개합니다.',
    type: 'main',
    trackCategory: 'AI to Reality'
  },
  {
    id: '18',
    title: 'AI 플랫폼 혁신과 향후 발전 소프트웨어',
    speaker: '플랫폼 개발자',
    time: '15:30 - 16:10',
    track: '트랙 2',
    category: '기술',
    description: 'AI 플랫폼의 현재와 미래를 전망합니다.',
    type: 'main',
    trackCategory: '10 Years of MODULABS'
  },
  {
    id: '19',
    title: 'Next-Data-Agent-Tech 협업과 경험',
    speaker: 'Data Agent 개발자',
    time: '15:30 - 16:10',
    track: '트랙 3',
    category: '기술',
    description: '차세대 데이터 에이전트 기술의 실제 활용 경험을 공유합니다.',
    type: 'main',
    trackCategory: 'AI to ∞'
  },
  {
    id: '20',
    title: 'Biological Models for Human-Centered Clinical AI',
    speaker: '의료 AI 전문가',
    time: '16:10 - 16:50',
    track: '트랙 1',
    category: '인사이트',
    description: '인간 중심의 임상 AI를 위한 생물학적 모델을 다룹니다.',
    type: 'main',
    trackCategory: 'Tech for Impact'
  },
  {
    id: '21',
    title: 'AI 에이전트, 현실로의 증강 모델이 되는가?',
    speaker: 'AI Agent 연구자',
    time: '16:10 - 16:50',
    track: '트랙 2',
    category: '인사이트',
    description: 'AI 에이전트의 현실 적용 가능성을 탐구합니다.',
    type: 'main',
    trackCategory: 'AI to ∞'
  },
  // Interactive Sessions
  {
    id: 'int1',
    title: '6개월 후, 우리는 리서처가 되었다',
    speaker: '모두의연구소 팀',
    time: '10:10 - 10:50',
    track: '트랙 101',
    category: '핸즈온',
    description: '6개월간의 리서치 여정을 공유하는 인터랙티브 세션입니다.',
    type: 'interactive',
    trackCategory: 'Hands-on Workshop'
  },
  {
    id: 'int2',
    title: 'Google Antigravity를 만드는 인공지능 어플리케이션 구축하기',
    speaker: 'Google 개발자',
    time: '11:10 - 11:50',
    track: '트랙 101',
    category: '핸즈온',
    description: '실습을 통해 AI 어플리케이션을 직접 구축해봅니다.',
    type: 'interactive',
    trackCategory: 'Hands-on Workshop'
  },
  {
    id: 'int3',
    title: 'AI 코딩 도구 Cursor로 만드는 나만의 서비스 - Vibe Coding 핸즈온',
    speaker: 'Cursor 전문가',
    time: '12:00 - 12:40',
    track: '트랙 101',
    category: '핸즈온',
    description: 'AI 코딩 도구를 활용한 서비스 개발 실습 세션입니다.',
    type: 'interactive',
    trackCategory: 'Hands-on Workshop'
  },
  {
    id: 'int4',
    title: '지금, 팀패드 가입은 어떻게 AI 모델을 가지고 있을까요?',
    speaker: '팀패드 개발팀',
    time: '13:20 - 14:00',
    track: '트랙 101',
    category: '핸즈온',
    description: '팀패드의 AI 모델 활용 사례를 실습과 함께 알아봅니다.',
    type: 'interactive',
    trackCategory: 'Hands-on Workshop'
  }
];

export function Tracks() {
  const [selectedTrackCategory, setSelectedTrackCategory] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [selectedType, setSelectedType] = useState<'all' | 'main' | 'interactive'>('all');

  const tracks = [
    {
      id: 'AI to ∞',
      name: 'AI to ∞',
      description: '미래 AI 기술과 인사이트',
      gradient: 'from-purple-500 via-purple-600 to-indigo-600',
      bgGradient: 'from-purple-50 to-purple-100',
      icon: '∞'
    },
    {
      id: 'AI to Reality',
      name: 'AI to Reality',
      description: '실전 프로젝트·스타트업·비즈니스 사례',
      gradient: 'from-blue-500 via-blue-600 to-cyan-600',
      bgGradient: 'from-blue-50 to-blue-100',
      icon: '🚀'
    },
    {
      id: '10 Years of MODULABS',
      name: '10 Years of MODULABS',
      description: '모두의연구소 10년의 연구 성과 공개',
      gradient: 'from-amber-500 via-orange-500 to-red-500',
      bgGradient: 'from-amber-50 to-amber-100',
      icon: '🎂'
    },
    {
      id: 'Tech for Impact',
      name: 'Tech for Impact',
      description: '기술이 사회를 변화시키는 실제 적용',
      gradient: 'from-green-500 via-emerald-500 to-teal-500',
      bgGradient: 'from-green-50 to-green-100',
      icon: '🌱'
    },
    {
      id: 'Papershop Poster',
      name: 'Papershop Poster',
      description: '해외 학회 포스터 & 최신 논문 공유',
      gradient: 'from-pink-500 via-rose-500 to-fuchsia-500',
      bgGradient: 'from-pink-50 to-pink-100',
      icon: '📄'
    },
    {
      id: 'Hands-on Workshop',
      name: 'Hands-on Workshop',
      description: '직접 만들고 바로 쓰는 실무형 실습',
      gradient: 'from-indigo-500 via-violet-500 to-purple-500',
      bgGradient: 'from-indigo-50 to-indigo-100',
      icon: '💻'
    }
  ];

  const categories = ['전체', '키노트', '기술', '인사이트', '비즈니스', '핸즈온'];

  // Reset filters when track category changes
  useEffect(() => {
    if (selectedTrackCategory) {
      setSelectedCategory('전체');
      setSelectedType('all');
    }
  }, [selectedTrackCategory]);

  const filteredSessions = sessions.filter(s => {
    const trackCategoryMatch = !selectedTrackCategory || s.trackCategory === selectedTrackCategory;
    const categoryMatch = selectedCategory === '전체' || s.category === selectedCategory;
    const typeMatch = selectedType === 'all' || s.type === selectedType;
    return trackCategoryMatch && categoryMatch && typeMatch;
  }).sort((a, b) => {
    // Sort by time
    const timeA = a.time.split(' - ')[0];
    const timeB = b.time.split(' - ')[0];
    return timeA.localeCompare(timeB);
  });

  // Session Detail View
  if (selectedSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-pink-50/20">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#FF6B9D] via-[#FF8B5A] to-[#FFA94D] text-black p-6 pb-8 relative overflow-hidden"
        >
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"
          />
          
          <motion.button 
            onClick={() => setSelectedSession(null)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mb-4 text-sm flex items-center gap-2 relative z-10 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로가기
          </motion.button>
          
          <div className="relative z-10">
            <span className="inline-block bg-black/20 backdrop-blur-sm text-black px-3 py-1 rounded-lg text-xs mb-3 border border-white/30">
              {selectedSession.category}
            </span>
            <h1 className="text-2xl mb-2 font-bold">{selectedSession.title}</h1>
            <p className="opacity-90">{selectedSession.speaker}</p>
          </div>
        </motion.div>

        {/* Details */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 -mt-4"
        >
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-orange-100">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-700">
                <div className="p-2 bg-gradient-to-br from-[#FFE5EE] to-[#FFF0E8] rounded-lg">
                  <Clock className="w-5 h-5 text-[#FF8B5A]" />
                </div>
                <span className="font-medium">{selectedSession.time}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <div className="p-2 bg-gradient-to-br from-[#FFE5EE] to-[#FFF0E8] rounded-lg">
                  <MapPin className="w-5 h-5 text-[#FF8B5A]" />
                </div>
                <span className="font-medium">{selectedSession.track}</span>
              </div>
            </div>
          </div>

          <div className="mb-6 bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
            <h2 className="text-lg mb-3 text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B9D] to-[#FF8B5A]">세션 소개</h2>
            <p className="text-gray-700 leading-relaxed">{selectedSession.description}</p>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-[#FF6B9D] via-[#FF8B5A] to-[#FFA94D] text-white py-4 rounded-2xl font-bold shadow-xl"
          >
            내 일정에 추가
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Track Sessions List View
  if (selectedTrackCategory) {
    const currentTrack = tracks.find(t => t.id === selectedTrackCategory);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-pink-50/20 relative overflow-hidden">
        {/* Animated wave background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className={`absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br ${currentTrack?.gradient}/20 rounded-full blur-3xl`}
          />
          <motion.div
            animate={{ x: [0, -80, 0], y: [0, -40, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className={`absolute top-1/3 -right-40 w-80 h-80 bg-gradient-to-l ${currentTrack?.gradient}/15 rounded-full blur-3xl`}
          />
        </div>

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-r ${currentTrack?.gradient} text-white p-6 relative overflow-hidden`}
        >
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute inset-0 bg-white/10 rounded-full blur-3xl"
          />
          
          <motion.button 
            onClick={() => setSelectedTrackCategory(null)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mb-4 text-sm flex items-center gap-2 relative z-10 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            트랙 목록
          </motion.button>
          
          <div className="relative z-10">
            <motion.div 
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl mb-3"
            >
              {currentTrack?.icon}
            </motion.div>
            <h1 className="text-2xl mb-1 font-black">{selectedTrackCategory}</h1>
            <p className="opacity-90">{currentTrack?.description}</p>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-md border-b border-orange-200/50 p-4 sticky top-0 z-10 shadow-sm">
          <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
            {['all', 'main', 'interactive'].map((type) => (
              <motion.button
                key={type}
                onClick={() => setSelectedType(type as any)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedType === type
                    ? 'bg-gradient-to-r from-[#FF6B9D] to-[#FF8B5A] text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-orange-200'
                }`}
              >
                {type === 'all' ? '전체' : type === 'main' ? 'Main Session' : 'Interactive Session'}
              </motion.button>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-[#FF8B5A] text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-orange-200'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Sessions List */}
        <div className="p-6 space-y-3 relative z-10">
          {filteredSessions.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 text-gray-500 bg-white rounded-2xl shadow-lg"
            >
              <p>해당 조건의 세션이 없습니다.</p>
            </motion.div>
          ) : (
            filteredSessions.map((session, index) => (
              <motion.button
                key={session.id}
                onClick={() => setSelectedSession(session)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="w-full bg-white rounded-2xl shadow-lg hover:shadow-2xl p-5 text-left transition-all border border-orange-100"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 pr-2">
                    {session.type === 'interactive' && (
                      <span className="inline-block text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-lg mb-2 font-medium">
                        💻 Interactive
                      </span>
                    )}
                    <h3 className="font-bold text-gray-800">{session.title}</h3>
                  </div>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ChevronRight className="w-5 h-5 text-[#FF8B5A] flex-shrink-0" />
                  </motion.div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{session.speaker}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {session.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {session.track}
                  </span>
                  <span className={`px-2 py-1 rounded-lg font-medium ${
                    session.category === '키노트' 
                      ? 'bg-gradient-to-r from-[#FF6B9D] to-[#FF8B5A] text-white'
                      : session.category === '핸즈온'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-orange-50 text-[#FF8B5A]'
                  }`}>
                    {session.category}
                  </span>
                </div>
              </motion.button>
            ))
          )}
        </div>
      </div>
    );
  }

  // Tracks List View
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-pink-50/20 relative overflow-hidden">
      {/* Animated wave background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 80, 0], y: [0, 40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-[#FF6B9D]/20 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -60, 0], y: [0, 60, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 -right-20 w-80 h-80 bg-gradient-to-l from-[#FFA94D]/20 to-transparent rounded-full blur-3xl"
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
            <h1 className="text-2xl font-black">트랙 탐험</h1>
          </div>
          <p className="opacity-90">6개의 전문 트랙을 만나보세요</p>
        </div>
      </motion.div>

      {/* Tracks Grid */}
      <div className="px-6 pb-6 space-y-4 relative z-10">
        {tracks.map((track, index) => (
          <motion.button
            key={track.id}
            onClick={() => setSelectedTrackCategory(track.id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03, y: -5 }}
            className="w-full relative overflow-hidden rounded-2xl shadow-xl text-left group"
          >
            {/* Animated gradient background */}
            <motion.div
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 5, repeat: Infinity }}
              className={`absolute inset-0 bg-gradient-to-r ${track.gradient} bg-[length:200%_100%] opacity-90 group-hover:opacity-100 transition-opacity`}
            />
            
            {/* Glow effect */}
            <div className={`absolute inset-0 bg-gradient-to-r ${track.gradient} opacity-0 group-hover:opacity-30 blur-xl transition-opacity`} />
            
            <div className="relative p-6 flex items-center gap-4 text-white">
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-5xl"
              >
                {track.icon}
              </motion.div>
              <div className="flex-1">
                <h3 className="text-lg mb-2 font-black">{track.name}</h3>
                <p className="text-sm opacity-95 leading-relaxed">{track.description}</p>
              </div>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ChevronRight className="w-6 h-6" />
              </motion.div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Info Section */}
      <div className="px-6 pb-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-6 border border-orange-100"
        >
          <h3 className="mb-3 text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B9D] to-[#FF8B5A] font-bold">💡 트랙 안내</h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            각 트랙을 클릭하면 해당 트랙의 모든 세션을 시간순으로 확인할 수 있습니다. 
            관심있는 분야의 세션들을 한눈에 살펴보세요.
          </p>
        </motion.div>
      </div>
    </div>
  );
}