'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, CheckCircle, Heart, ChevronRight } from 'lucide-react';

interface ActivityStats {
  totalCheckins: number;
  earnedBadges: number;
  totalBadges: number;
  completionRate: number;
}

interface FavoritesData {
  total: number;
}

export function QuestProgress() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, token } = useAuthStore();
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [favorites, setFavorites] = useState<FavoritesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || !token) return;

    const fetchData = async () => {
      setLoading(true);
      setError(false);
      try {
        const response = await fetch(`${API_BASE}/api/mypage`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch');
        }

        const result = await response.json();
        if (result.success && result.data) {
          setStats(result.data.stats);
          setFavorites(result.data.favorites);
        }
      } catch (err) {
        console.error('활동 데이터 로드 실패:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isHydrated, isAuthenticated, token, API_BASE]);

  const handleClick = () => {
    if (isAuthenticated) {
      router.push('/mypage');
    } else {
      router.push('/login');
    }
  };

  // 로딩 중 (hydration 전)
  if (!isHydrated) {
    return (
      <Card className="bg-gradient-to-br from-orange-50 to-pink-50 border-orange-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">참가자님의 활동</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-white/50 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-white/50 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 로그인하지 않은 경우
  if (!isAuthenticated) {
    return (
      <Card
        className="bg-gradient-to-br from-orange-50 to-pink-50 border-orange-200 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={handleClick}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-orange-500" />
              참가자님의 활동
            </CardTitle>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            로그인하면 체크인 기록, 배지 수집 진행률, 관심 목록을 확인할 수 있어요!
          </p>
        </CardContent>
      </Card>
    );
  }

  // 로딩 중
  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-orange-50 to-pink-50 border-orange-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-orange-500" />
            참가자님의 활동
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-white/50 rounded w-1/2"></div>
            <div className="h-2 bg-white/50 rounded"></div>
            <div className="grid grid-cols-3 gap-2">
              <div className="h-16 bg-white/50 rounded"></div>
              <div className="h-16 bg-white/50 rounded"></div>
              <div className="h-16 bg-white/50 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 에러 발생
  if (error || !stats) {
    return (
      <Card
        className="bg-gradient-to-br from-orange-50 to-pink-50 border-orange-200 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={handleClick}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-orange-500" />
              참가자님의 활동
            </CardTitle>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-2">
            데이터를 불러올 수 없습니다. 탭하여 다시 시도해주세요.
          </p>
        </CardContent>
      </Card>
    );
  }

  // 로그인한 경우 - 실제 데이터 표시
  return (
    <Card
      className="bg-gradient-to-br from-orange-50 to-pink-50 border-orange-200 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-orange-500" />
            참가자님의 활동
          </CardTitle>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 진행률 */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600">퀘스트 진행률</span>
            <span className="text-sm font-bold text-[#FF8B5A]">{stats.completionRate}%</span>
          </div>
          <Progress value={stats.completionRate} className="h-2" />
        </div>

        {/* 통계 요약 */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-3 bg-white/60 rounded-lg">
            <CheckCircle className="w-5 h-5 mx-auto text-blue-500 mb-1" />
            <div className="text-lg font-bold text-gray-800">{stats.totalCheckins}</div>
            <div className="text-xs text-gray-500">체크인</div>
          </div>
          <div className="text-center p-3 bg-white/60 rounded-lg">
            <Heart className="w-5 h-5 mx-auto text-pink-500 mb-1" />
            <div className="text-lg font-bold text-gray-800">{favorites?.total || 0}</div>
            <div className="text-xs text-gray-500">관심</div>
          </div>
          <div className="text-center p-3 bg-white/60 rounded-lg">
            <Trophy className="w-5 h-5 mx-auto text-orange-500 mb-1" />
            <div className="text-lg font-bold text-gray-800">{stats.earnedBadges}/{stats.totalBadges}</div>
            <div className="text-xs text-gray-500">배지</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
