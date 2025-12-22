'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { fetchSessionsWithCache } from '@/lib/sessionCache';
import type { Session } from '@/types/session';
import Link from 'next/link';
import { DigitalBadge } from '@/components/home/DigitalBadge';
import { QuestProgress } from '@/components/home/QuestProgress';
import { Clock, Users, Zap, TrendingUp, ArrowRight, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import MascotCharacter from '@/imports/Group';
import ModulabsLogo from '@/imports/Group-53-445';
import WhiteBear from '@/imports/Group-53-73';
import GreenBearGroup from '@/imports/Group2';
import { Button } from '@/components/ui/button';
import { parseTimeSlot } from '@/types/session';

export default function HomePage() {
  const { user } = useAuthStore();
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data for live status
  const liveStatus = [
    { track: 'AI to ∞', occupancy: 12, status: 'low', location: '이삼봉홀', emoji: '🚀' },
    { track: 'AI to Reality', occupancy: 45, status: 'medium', location: '트랙 1', emoji: '⚡' },
    { track: '10 Years', occupancy: 89, status: 'high', location: '트랙 2', emoji: '🎉' },
    { track: 'Tech for Impact', occupancy: 23, status: 'low', location: '트랙 3', emoji: '💡' },
    { track: 'Papershop', occupancy: 67, status: 'medium', location: '포스터존', emoji: '📊' },
    { track: 'Workshop', occupancy: 34, status: 'medium', location: '워크샵룸', emoji: '🛠️' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const allSessions = await fetchSessionsWithCache();
        const upcoming = allSessions
          .sort((a, b) => {
            const aTime = parseTimeSlot(a.timeSlot).startTime;
            const bTime = parseTimeSlot(b.timeSlot).startTime;
            return aTime.localeCompare(bTime);
          })
          .slice(0, 3);
        setUpcomingSessions(upcoming);
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
        setError('세션 정보를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh] bg-gradient-to-br from-gray-50 via-orange-50/30 to-pink-50/20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#FF6B9D] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] pb-24 bg-gradient-to-br from-gray-50 via-orange-50/30 to-pink-50/20 relative overflow-hidden">
      {/* Static gradient background - optimized for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-[#FF6B9D]/15 to-transparent rounded-full blur-2xl" />
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-bl from-[#FF8B5A]/15 to-transparent rounded-full blur-2xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-gradient-to-l from-[#FFA94D]/15 to-transparent rounded-full blur-2xl" />
      </div>

      {/* Mascot with speech bubble */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="absolute bottom-24 right-4 z-30 pointer-events-none"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="absolute -top-16 -left-36 bg-white rounded-2xl shadow-lg p-2.5 border-2 border-black"
          style={{ width: '160px' }}
        >
          <p className="text-[10px] text-black font-bold text-center leading-relaxed">
            MODUCON에 오신<br />여러분을 환영해요! 🎉
          </p>
          <div className="absolute -bottom-2 right-6 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] border-t-black" />
          <div className="absolute -bottom-1.5 right-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-white" />
        </motion.div>

        <div className="w-16 h-16 relative">
          <MascotCharacter />
        </div>
      </motion.div>

      {/* Event Info Card */}
      <div className="px-4 pt-4">
        <div className="bg-gradient-to-r from-[#FF6B9D] via-[#FF8B5A] to-[#FFA94D] rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-white text-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">📅</span>
              <span className="font-medium">2025.12.13 (토)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">📍</span>
              <span className="font-medium">이화여대 ECC</span>
            </div>
          </div>
        </div>
      </div>

      {/* My Activity Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="px-4 mt-4 mb-6 relative z-20"
      >
        <div className="relative bg-gradient-to-br from-white to-orange-50/50 rounded-3xl p-6 shadow-xl border border-orange-200/50">

          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B9D] to-[#FF8B5A]">
                🏆 {user?.name || '참가자'}님의 활동
              </h2>
              <TrendingUp className="w-5 h-5 text-[#FF8B5A]" />
            </div>

            <QuestProgress />
          </div>
        </div>
      </motion.div>

      {/* Contributors */}
      <div className="px-4 mb-6">
        <h2 className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B9D] to-[#FF8B5A] mb-4">
          🙌 만든 사람들
        </h2>
        <div className="bg-white rounded-2xl p-5 shadow-lg border border-orange-100">
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Powered by</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs rounded-full">Claude Code</span>
              <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs rounded-full">Antigravity</span>
              <span className="px-3 py-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs rounded-full">Figma Make</span>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-500 mb-3">Contributors</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-800">박수빈</span>
                <span className="text-xs text-gray-500">프론트엔드, UX/UI</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-800">강신우</span>
                <span className="text-xs text-gray-500">백엔드, DB설계, QR & QnA 로직</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-800">조성진</span>
                <span className="text-xs text-gray-500">사용자 서명 이펙트</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-800">김현</span>
                <span className="text-xs text-gray-500">퀴즈 설계</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-800">홍민지</span>
                <span className="text-xs text-gray-500">지도 기능</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-800">신현길</span>
                <span className="text-xs text-gray-500">개인 식별 방법</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-800">조해창</span>
                <span className="text-xs text-gray-500">나머지 잔업</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Status */}
      <div className="px-4 mb-6 relative">
        <div className="absolute -top-10 -right-4 w-24 h-24 z-10">
          <GreenBearGroup />
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B9D] to-[#FF8B5A]">
            🔥 실시간 혼잡도
          </h2>
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs shadow-lg animate-pulse">
            <Zap className="w-3 h-3" />
            LIVE
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {liveStatus.map((item, index) => (
            <div key={index} className="relative group">
              <div className="bg-white p-4 border border-orange-100 shadow-md hover:shadow-lg transition-shadow rounded-2xl">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{item.emoji}</span>
                      <h3 className="text-sm text-gray-800">{item.track}</h3>
                    </div>
                    <p className="text-xs text-gray-500">{item.location}</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${getStatusColor(item.status)} shadow-sm`} />
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
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="px-4 mb-6">
        <h2 className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B9D] to-[#FF8B5A] mb-4">
          ⚡ 다가오는 세션
        </h2>

        <div className="space-y-3 relative">
          <div className="absolute -top-12 -left-2 w-16 h-16 z-10">
            <WhiteBear />
          </div>

          {error ? (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100">
              <p className="text-sm text-red-500 mb-3">{error}</p>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                다시 시도
              </Button>
            </div>
          ) : upcomingSessions.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 text-center">
              <p className="text-sm text-gray-500">다가오는 세션이 없습니다.</p>
            </div>
          ) : (
            upcomingSessions.map((session, index) => {
              const { startTime, endTime } = parseTimeSlot(session.timeSlot);
              return (
                <div
                  key={session.id}
                  className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#FF6B9D] via-[#FF8B5A] to-[#FFA94D]"
                >
                  <div className="relative p-5 text-white">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-sm font-medium flex-1">{session.title}</h3>
                      {index === 0 && (
                        <div className="px-3 py-1 bg-white/30 backdrop-blur-sm rounded-full text-xs font-bold border border-white/40 shadow-md whitespace-nowrap animate-pulse">
                          🔴 NEXT
                        </div>
                      )}
                    </div>

                    <p className="text-xs opacity-90 mb-2">{session.speakerName}</p>

                    <div className="flex items-center gap-4 text-xs opacity-95">
                      <span className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded-lg">
                        <Clock className="w-3 h-3" />
                        {startTime} - {endTime}
                      </span>
                      <span className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded-lg">
                        <MapPin className="w-3 h-3" />
                        {session.track}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          <Link href="/sessions">
            <Button
              variant="outline"
              className="w-full mt-4 border-[#FF8B5A] text-[#FF8B5A] hover:bg-[#FF8B5A] hover:text-white transition-all"
            >
              전체 세션 보기 <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Digital Badge */}
      <div className="px-4 mb-6">
        <h2 className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B9D] to-[#FF8B5A] mb-4">
          🎖️ 나의 배지
        </h2>
        <DigitalBadge />
      </div>

    </div>
  );
}
