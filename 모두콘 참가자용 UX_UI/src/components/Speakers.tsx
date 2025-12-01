import { useState } from 'react';
import { Briefcase, ExternalLink } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Speaker {
  id: string;
  name: string;
  role: string;
  company: string;
  bio: string;
  session: string;
  image: string;
}

const speakers: Speaker[] = [
  {
    id: '1',
    name: '김태현',
    role: 'AI Research Lead',
    company: 'OpenAI Korea',
    bio: '생성형 AI 분야의 선구자로, GPT 시리즈 연구에 참여한 경험을 바탕으로 한국에서 AI 기술 발전을 이끌고 있습니다.',
    session: '생성형 AI의 현재와 미래',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
  },
  {
    id: '2',
    name: '박지민',
    role: 'ML Engineer',
    company: 'Naver AI Lab',
    bio: '대규모 언어 모델 파인튜닝 전문가로, HyperCLOVA 개발에 참여했으며 실무 적용 경험이 풍부합니다.',
    session: 'LLM 파인튜닝 실전 가이드',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'
  },
  {
    id: '3',
    name: '이서연',
    role: 'AI Ethics Researcher',
    company: 'KAIST AI대학원',
    bio: 'AI 윤리와 공정성 연구를 선도하며, 책임있는 AI 개발을 위한 정책 수립에 기여하고 있습니다.',
    session: 'AI 윤리와 책임있는 개발',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop'
  },
  {
    id: '4',
    name: '최민호',
    role: 'Senior Backend Engineer',
    company: 'Kakao Enterprise',
    bio: 'RAG 시스템 구축 전문가로, 검색 증강 생성 기술을 실제 서비스에 적용한 다양한 경험을 보유하고 있습니다.',
    session: 'RAG 시스템 구축 실전',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop'
  },
  {
    id: '5',
    name: '정유진',
    role: 'Computer Vision Lead',
    company: 'Samsung Research',
    bio: '멀티모달 AI 연구의 최전선에서 활동하며, 차세대 AI 모델 개발을 주도하고 있습니다.',
    session: '멀티모달 AI의 활용',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop'
  },
  {
    id: '6',
    name: '한상우',
    role: 'AI Product Manager',
    company: 'Upstage',
    bio: 'LangChain과 AI 에이전트 개발 전문가로, 자율 행동하는 AI 시스템 구축 경험이 풍부합니다.',
    session: 'AI 에이전트 개발하기',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'
  },
  {
    id: '7',
    name: '김예린',
    role: 'Prompt Engineer',
    company: 'Wrtn Technologies',
    bio: 'AI 서비스 기획 및 프롬프트 엔지니어링 전문가로, 최고의 AI 활용 노하우를 보유하고 있습니다.',
    session: '프롬프트 엔지니어링 마스터',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop'
  },
  {
    id: '8',
    name: '조현준',
    role: 'CEO & Founder',
    company: 'AI Startup Inc.',
    bio: 'AI 스타트업을 성공적으로 운영하며, AI 기술의 비즈니스 적용 전략을 공유하고 있습니다.',
    session: 'AI 스타트업 성공 전략',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop'
  }
];

export function Speakers() {
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);

  if (selectedSpeaker) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-[#F7585C] text-white p-6">
          <button 
            onClick={() => setSelectedSpeaker(null)}
            className="mb-4 text-sm"
          >
            ← 뒤로가기
          </button>
        </div>

        {/* Speaker Profile */}
        <div className="p-6 -mt-2">
          <div className="text-center mb-6">
            <ImageWithFallback
              src={selectedSpeaker.image}
              alt={selectedSpeaker.name}
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
            />
            <h1 className="text-2xl mb-2">{selectedSpeaker.name}</h1>
            <div className="flex items-center justify-center gap-2 text-gray-600 mb-2">
              <Briefcase className="w-4 h-4" />
              <span>{selectedSpeaker.role}</span>
            </div>
            <p className="text-gray-600">{selectedSpeaker.company}</p>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg mb-3">소개</h2>
              <p className="text-gray-700 leading-relaxed">{selectedSpeaker.bio}</p>
            </div>

            <div>
              <h2 className="text-lg mb-3">발표 세션</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900">{selectedSpeaker.session}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#FF6B9D] via-[#FF8B5A] to-[#FFA94D] text-black p-6 mb-6">
        <h1 className="text-2xl mb-1">스피커</h1>
        <p className="opacity-75">전문가들을 만나보세요</p>
      </div>

      {/* Speakers Grid */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-2 gap-4">
          {speakers.map((speaker) => (
            <button
              key={speaker.id}
              onClick={() => setSelectedSpeaker(speaker)}
              className="bg-white rounded-lg shadow-sm p-4 text-left transition-shadow hover:shadow-md"
            >
              <ImageWithFallback
                src={speaker.image}
                alt={speaker.name}
                className="w-full aspect-square rounded-lg mb-3 object-cover"
              />
              <h3 className="mb-1">{speaker.name}</h3>
              <p className="text-sm text-gray-600 mb-1">{speaker.role}</p>
              <p className="text-xs text-gray-500">{speaker.company}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}