import { useState, useEffect } from 'react';
import { Clock, MapPin, ChevronRight, X } from 'lucide-react';

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

interface SessionsProps {
  selectedTrackCategory: string | null;
  onClearTrack: () => void;
}

export function Sessions({ selectedTrackCategory, onClearTrack }: SessionsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [selectedType, setSelectedType] = useState<'all' | 'main' | 'interactive'>('all');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  
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

  const getTrackColor = (trackCategory: string) => {
    switch (trackCategory) {
      case 'AI to ∞':
        return 'border-purple-500 bg-purple-50';
      case 'AI to Reality':
        return 'border-blue-500 bg-blue-50';
      case '10 Years of MODULABS':
        return 'border-amber-500 bg-amber-50';
      case 'Tech for Impact':
        return 'border-green-500 bg-green-50';
      case 'Papershop Poster':
        return 'border-pink-500 bg-pink-50';
      case 'Hands-on Workshop':
        return 'border-indigo-500 bg-indigo-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  if (selectedSession) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#FF6B9D] via-[#FF8B5A] to-[#FFA94D] text-black p-6 pb-8">
          <button 
            onClick={() => setSelectedSession(null)}
            className="mb-4 text-sm"
          >
            ← 뒤로가기
          </button>
          <span className="inline-block bg-black/20 text-black px-3 py-1 rounded text-xs mb-3">
            {selectedSession.category}
          </span>
          <h1 className="text-2xl mb-2">{selectedSession.title}</h1>
          <p className="opacity-75">{selectedSession.speaker}</p>
        </div>

        {/* Details */}
        <div className="p-6 -mt-4">
          <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-700">
                <Clock className="w-5 h-5 text-[#FF8B5A]" />
                <span>{selectedSession.time}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <MapPin className="w-5 h-5 text-[#FF8B5A]" />
                <span>{selectedSession.track}</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg mb-3">세션 소개</h2>
            <p className="text-gray-700 leading-relaxed">{selectedSession.description}</p>
          </div>

          <button className="w-full bg-gradient-to-r from-[#FF6B9D] via-[#FF8B5A] to-[#FFA94D] text-black py-4 rounded-lg">
            내 일정에 추가
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#FF6B9D] via-[#FF8B5A] to-[#FFA94D] text-black p-6">
        <h1 className="text-2xl mb-1">세션</h1>
        <p className="opacity-75">모든 세션을 확인하세요</p>
      </div>

      {/* Track Category Filter */}
      {selectedTrackCategory && (
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className={`flex-1 px-4 py-2 rounded-lg border-l-4 ${getTrackColor(selectedTrackCategory)}`}>
              <span className="text-sm">{selectedTrackCategory}</span>
            </div>
            <button
              onClick={onClearTrack}
              className="ml-3 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* Type Filter */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              selectedType === 'all'
                ? 'bg-[#FF8B5A] text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setSelectedType('main')}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              selectedType === 'main'
                ? 'bg-[#FF8B5A] text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Main Session
          </button>
          <button
            onClick={() => setSelectedType('interactive')}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              selectedType === 'interactive'
                ? 'bg-[#FF8B5A] text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Interactive Session
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions List */}
      <div className="p-6 space-y-4">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>해당 트랙의 세션이 없습니다.</p>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <button
              key={session.id}
              onClick={() => setSelectedSession(session)}
              className="w-full bg-white rounded-lg shadow-sm p-5 text-left transition-shadow hover:shadow-md"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 pr-2">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {session.type === 'interactive' && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                        Interactive
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded border ${getTrackColor(session.trackCategory)}`}>
                      {session.trackCategory}
                    </span>
                  </div>
                  <h3>{session.title}</h3>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
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
                <span className={`px-2 py-0.5 rounded ${
                  session.category === '키노트' 
                    ? 'bg-[#FF8B5A] text-white'
                    : session.category === '핸즈온'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {session.category}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}