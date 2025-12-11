'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'motion/react';
import { User, LogOut, RefreshCw, Heart, CheckCircle, Trophy, HelpCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';

// 마이페이지 데이터 타입
interface MypageData {
  user: {
    id: string;
    name: string;
    signatureUrl: string | null;
    signatureData: string | null;
    registrationType: string;
    registeredAt: string;
  };
  checkins: {
    total: number;
    sessions: CheckinItem[];
    booths: CheckinItem[];
    papers: CheckinItem[];
  };
  favorites: {
    total: number;
    sessions: FavoriteItem[];
    booths: FavoriteItem[];
    papers: FavoriteItem[];
  };
  badges: BadgeItem[];
  stats: {
    totalCheckins: number;
    sessionCheckins: number;
    boothCheckins: number;
    paperCheckins: number;
    quizAttempts: number;
    quizCorrect: number;
    questionsAsked: number;
    totalBadges: number;
    earnedBadges: number;
    completionRate: number;
  };
}

interface CheckinItem {
  targetType: string;
  targetId: string;
  checkedInAt: string;
  target: {
    title?: string;
    name?: string;
    speakerName?: string;
    researcher?: string;
    track?: string;
    organization?: string;
  } | null;
}

interface FavoriteItem {
  targetType: string;
  targetId: string;
  createdAt: string;
  target: {
    title?: string;
    name?: string;
    speakerName?: string;
    researcher?: string;
    track?: string;
    timeSlot?: string;
    location?: string;
    organization?: string;
  } | null;
}

interface BadgeItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  progress: number;
  target: number;
}

type TabType = 'checkins' | 'favorites' | 'badges';

export default function MyPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, token, logout } = useAuthStore();
  const [data, setData] = useState<MypageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('checkins');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const fetchMypageData = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/mypage`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('데이터를 불러올 수 없습니다.');
      }

      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.message || '데이터를 불러올 수 없습니다.');
      }
    } catch (err) {
      console.error('마이페이지 데이터 로드 실패:', err);
      setError(err instanceof Error ? err.message : '데이터를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [API_BASE, token]);

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.push('/login?redirect=/mypage');
      return;
    }

    fetchMypageData();
  }, [isHydrated, isAuthenticated, router, fetchMypageData]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // 로딩 중
  if (!isHydrated || loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-gray-50 via-orange-50/30 to-pink-50/20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-[#FF6B9D] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-gray-50 via-orange-50/30 to-pink-50/20 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchMypageData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              다시 시도
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const getTargetLink = (type: string, id: string) => {
    switch (type) {
      case 'session': return `/sessions/${id}`;
      case 'booth': return `/booths/${id}`;
      case 'paper': return `/papers/${id}`;
      default: return '#';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-[100dvh] pb-24 bg-gradient-to-br from-gray-50 via-orange-50/30 to-pink-50/20">
      {/* 프로필 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="px-4 pt-4"
      >
        <Card className="bg-gradient-to-r from-[#FF6B9D] via-[#FF8B5A] to-[#FFA94D] text-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {/* 서명 또는 아바타 */}
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                  {data.user.signatureData ? (
                    <img
                      src={data.user.signatureData}
                      alt="서명"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <User className="w-8 h-8 text-white/80" />
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold">{data.user.name}</h1>
                  <p className="text-white/80 text-sm">
                    {data.user.registrationType === 'pre_registered' ? '사전 등록' : '현장 등록'}
                  </p>
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/80 hover:text-white hover:bg-white/20"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>로그아웃</AlertDialogTitle>
                    <AlertDialogDescription>
                      정말 로그아웃 하시겠습니까?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>아니오</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout}>예</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* 통계 요약 */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{data.stats.totalCheckins}</div>
                <div className="text-xs text-white/80">체크인</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{data.favorites.total}</div>
                <div className="text-xs text-white/80">관심</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{data.stats.earnedBadges}/{data.stats.totalBadges}</div>
                <div className="text-xs text-white/80">배지</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 탭 네비게이션 */}
      <div className="px-4 mt-6">
        <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('checkins')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'checkins'
                ? 'bg-gradient-to-r from-[#FF6B9D] to-[#FF8B5A] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            방문기록
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'favorites'
                ? 'bg-gradient-to-r from-[#FF6B9D] to-[#FF8B5A] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Heart className="w-4 h-4" />
            관심
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'badges'
                ? 'bg-gradient-to-r from-[#FF6B9D] to-[#FF8B5A] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Trophy className="w-4 h-4" />
            배지
          </button>
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="px-4 mt-4">
        {/* 방문 기록 탭 */}
        {activeTab === 'checkins' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {data.checkins.total === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">아직 방문 기록이 없습니다.</p>
                  <p className="text-gray-400 text-sm mt-1">QR 코드를 스캔하여 체크인하세요!</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* 세션 체크인 */}
                {data.checkins.sessions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                      <span>🎤</span> 세션 ({data.checkins.sessions.length})
                    </h3>
                    {data.checkins.sessions.map((item, idx) => (
                      <Link key={idx} href={getTargetLink('session', item.targetId)}>
                        <Card className="mb-2 hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 truncate">
                                {item.target?.title || item.targetId}
                              </p>
                              {item.target?.speakerName && (
                                <p className="text-sm text-gray-500">{item.target.speakerName}</p>
                              )}
                              <p className="text-xs text-gray-400 mt-1">{formatDate(item.checkedInAt)}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}

                {/* 부스 체크인 */}
                {data.checkins.booths.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                      <span>🏢</span> 부스 ({data.checkins.booths.length})
                    </h3>
                    {data.checkins.booths.map((item, idx) => (
                      <Link key={idx} href={getTargetLink('booth', item.targetId)}>
                        <Card className="mb-2 hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 truncate">
                                {item.target?.name || item.targetId}
                              </p>
                              {item.target?.organization && (
                                <p className="text-sm text-gray-500">{item.target.organization}</p>
                              )}
                              <p className="text-xs text-gray-400 mt-1">{formatDate(item.checkedInAt)}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}

                {/* 포스터 체크인 */}
                {data.checkins.papers.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                      <span>📄</span> 포스터 ({data.checkins.papers.length})
                    </h3>
                    {data.checkins.papers.map((item, idx) => (
                      <Link key={idx} href={getTargetLink('paper', item.targetId)}>
                        <Card className="mb-2 hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 truncate">
                                {item.target?.title || item.targetId}
                              </p>
                              {item.target?.researcher && (
                                <p className="text-sm text-gray-500">{item.target.researcher}</p>
                              )}
                              <p className="text-xs text-gray-400 mt-1">{formatDate(item.checkedInAt)}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* 관심 목록 탭 */}
        {activeTab === 'favorites' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {data.favorites.total === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Heart className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">관심 등록한 항목이 없습니다.</p>
                  <p className="text-gray-400 text-sm mt-1">하트를 눌러 관심 있는 세션을 저장하세요!</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* 관심 세션 */}
                {data.favorites.sessions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                      <span>🎤</span> 세션 ({data.favorites.sessions.length})
                    </h3>
                    {data.favorites.sessions.map((item, idx) => (
                      <Link key={idx} href={getTargetLink('session', item.targetId)}>
                        <Card className="mb-2 hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                                <p className="font-medium text-gray-800 truncate">
                                  {item.target?.title || item.targetId}
                                </p>
                              </div>
                              {item.target?.speakerName && (
                                <p className="text-sm text-gray-500">{item.target.speakerName}</p>
                              )}
                              {item.target?.timeSlot && (
                                <p className="text-xs text-gray-400 mt-1">
                                  {item.target.timeSlot} · {item.target.location}
                                </p>
                              )}
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}

                {/* 관심 부스 */}
                {data.favorites.booths.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                      <span>🏢</span> 부스 ({data.favorites.booths.length})
                    </h3>
                    {data.favorites.booths.map((item, idx) => (
                      <Link key={idx} href={getTargetLink('booth', item.targetId)}>
                        <Card className="mb-2 hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                                <p className="font-medium text-gray-800 truncate">
                                  {item.target?.name || item.targetId}
                                </p>
                              </div>
                              {item.target?.organization && (
                                <p className="text-sm text-gray-500">{item.target.organization}</p>
                              )}
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}

                {/* 관심 포스터 */}
                {data.favorites.papers.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                      <span>📄</span> 포스터 ({data.favorites.papers.length})
                    </h3>
                    {data.favorites.papers.map((item, idx) => (
                      <Link key={idx} href={getTargetLink('paper', item.targetId)}>
                        <Card className="mb-2 hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                                <p className="font-medium text-gray-800 truncate">
                                  {item.target?.title || item.targetId}
                                </p>
                              </div>
                              {item.target?.researcher && (
                                <p className="text-sm text-gray-500">{item.target.researcher}</p>
                              )}
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* 배지 탭 */}
        {activeTab === 'badges' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {/* 진행률 */}
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">배지 수집 진행률</span>
                  <span className="text-sm font-bold text-[#FF8B5A]">{data.stats.completionRate}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#FF6B9D] to-[#FF8B5A] transition-all duration-500"
                    style={{ width: `${data.stats.completionRate}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {data.stats.earnedBadges}개 획득 / {data.stats.totalBadges}개 중
                </p>
              </CardContent>
            </Card>

            {/* 배지 그리드 */}
            <div className="grid grid-cols-3 gap-3">
              {data.badges.map((badge) => (
                <Card
                  key={badge.id}
                  className={`${badge.earned ? 'bg-white' : 'bg-gray-100'} transition-all`}
                >
                  <CardContent className="p-4 text-center">
                    <div
                      className={`text-3xl mb-2 ${badge.earned ? '' : 'grayscale opacity-50'}`}
                    >
                      {badge.icon}
                    </div>
                    <p className={`text-xs font-medium ${badge.earned ? 'text-gray-800' : 'text-gray-400'}`}>
                      {badge.name}
                    </p>
                    {!badge.earned && (
                      <div className="mt-2">
                        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#FF6B9D] to-[#FF8B5A]"
                            style={{ width: `${(badge.progress / badge.target) * 100}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {badge.progress}/{badge.target}
                        </p>
                      </div>
                    )}
                    {badge.earned && (
                      <Badge className="mt-2 bg-gradient-to-r from-[#FF6B9D] to-[#FF8B5A] text-white text-[10px]">
                        획득!
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 퀴즈 통계 */}
            {(data.stats.quizAttempts > 0 || data.stats.questionsAsked > 0) && (
              <Card className="mt-4">
                <CardContent className="p-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    활동 통계
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-[#FF8B5A]">
                        {data.stats.quizCorrect}/{data.stats.quizAttempts}
                      </div>
                      <div className="text-xs text-gray-500">퀴즈 정답</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-[#FF8B5A]">
                        {data.stats.questionsAsked}
                      </div>
                      <div className="text-xs text-gray-500">질문 작성</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </div>

      {/* 새로고침 버튼 */}
      <div className="fixed bottom-24 right-4">
        <Button
          onClick={fetchMypageData}
          size="icon"
          className="w-12 h-12 rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#FF8B5A] shadow-lg hover:shadow-xl"
        >
          <RefreshCw className={`w-5 h-5 text-white ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </div>
  );
}
