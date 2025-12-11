'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Heart } from 'lucide-react';
import { fetchSessionsWithCache, invalidateSessionsCache } from '@/lib/sessionCache';
import { useAuthStore } from '@/store/authStore';
import type { Session } from '@/types/session';
import { parseTimeSlot } from '@/types/session';

const tracks = ['Track 00', 'Track 01', 'Track 10', 'Track i', 'Track 101'];

export default function SessionsPage() {
  const { isAuthenticated, token, isHydrated } = useAuthStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null); // null = 전체, 트랙명 또는 'favorites'
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [favoriteLoading, setFavoriteLoading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // 관심 세션 목록 로드
  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated || !token) return;

    try {
      const response = await fetch(`${API_BASE}/api/favorites?targetType=session`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        const favoriteIds = new Set<string>(data.data.map((f: { targetId: string }) => f.targetId));
        setFavorites(favoriteIds);
      }
    } catch (error) {
      console.error('관심 세션 로드 실패:', error);
    }
  }, [isAuthenticated, token, API_BASE]);

  const loadSessions = useCallback(async (track?: string, isFavoritesFilter?: boolean, currentFavorites?: Set<string>) => {
    setLoading(true);
    setError(null);

    try {
      // 전체 세션 로드
      const data = await fetchSessionsWithCache();

      // 필터 적용
      if (isFavoritesFilter && currentFavorites) {
        // 관심 세션 필터: favorites가 비어있으면 빈 배열 반환
        setSessions(data.filter((s: Session) => currentFavorites.has(s.code)));
      } else if (track) {
        setSessions(data.filter((s: Session) => s.track === track));
      } else {
        setSessions(data);
      }
    } catch (err) {
      console.error('세션 로딩 실패:', err);
      setError('세션 데이터를 불러올 수 없습니다. 네트워크를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 필터 변경 시 세션 로드
  useEffect(() => {
    if (activeFilter === 'favorites') {
      // 관심 세션은 favorites Set이 로드된 후에만 필터링
      if (isHydrated && favorites.size > 0) {
        loadSessions(undefined, true, favorites);
      } else if (isHydrated) {
        // favorites가 비어있어도 빈 목록 표시
        loadSessions(undefined, true, favorites);
      }
    } else {
      loadSessions(activeFilter || undefined, false);
    }
    // favorites는 dependency에서 제외 - 관심 필터 선택 시에만 사용
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter, isHydrated, loadSessions]);

  // 로그인 상태 변경 시 관심 세션 로드
  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      loadFavorites();
    } else {
      setFavorites(new Set());
      if (activeFilter === 'favorites') {
        setActiveFilter(null); // 로그아웃 시 favorites 필터 해제
      }
    }
  }, [isHydrated, isAuthenticated, loadFavorites]);

  const handleRefresh = () => {
    invalidateSessionsCache();
    if (activeFilter === 'favorites') {
      loadSessions(undefined, true, favorites);
    } else {
      loadSessions(activeFilter || undefined, false);
    }
    if (isAuthenticated) {
      loadFavorites();
    }
  };

  const handleFilterChange = (filter: string | null) => {
    setActiveFilter(filter);
  };

  // 관심 등록/해제 토글
  const handleFavoriteToggle = async (e: React.MouseEvent, sessionCode: string) => {
    e.preventDefault(); // Link 클릭 방지
    e.stopPropagation();

    if (!isAuthenticated || !token || favoriteLoading) return;

    setFavoriteLoading(sessionCode);
    try {
      const response = await fetch(`${API_BASE}/api/favorites/session/${sessionCode}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setFavorites(prev => {
          const newSet = new Set(prev);
          if (data.data.isFavorite) {
            newSet.add(sessionCode);
          } else {
            newSet.delete(sessionCode);
          }
          return newSet;
        });
      }
    } catch (error) {
      console.error('관심 등록 실패:', error);
    } finally {
      setFavoriteLoading(null);
    }
  };

  // 세션 목록 (API에서 이미 필터링된 데이터를 받음)
  const filteredSessions = sessions;


  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* 헤더 */}
      <div className="mb-6 md:mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">전체 세션</h1>
          {/* PC: 전체 문구, 모바일: 간단히 */}
          <p className="text-muted-foreground hidden md:block">
            관심 있는 세션을 찾아보세요. (총 {sessions.length}개)
          </p>
          <p className="text-muted-foreground text-sm md:hidden">
            총 {sessions.length}개
          </p>
        </div>

        {/* 새로고침 버튼: PC는 텍스트 포함, 모바일은 아이콘만 */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
          className="px-2 md:px-3"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline ml-2">새로고침</span>
        </Button>
      </div>

      {/* 통합 필터 (트랙 + 관심 세션) */}
      {/* 모바일: 가로 스크롤, PC: 줄바꿈 */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 md:overflow-visible md:flex-wrap md:pb-0 scrollbar-hide">
        <Button
          variant={activeFilter === null ? 'default' : 'outline'}
          onClick={() => handleFilterChange(null)}
          className="shrink-0 text-sm md:text-base"
        >
          All
        </Button>
        {tracks.map(track => (
          <Button
            key={track}
            variant={activeFilter === track ? 'default' : 'outline'}
            onClick={() => handleFilterChange(track)}
            className="shrink-0 text-sm md:text-base"
          >
            {track}
          </Button>
        ))}
        {/* 관심 세션 필터 (로그인 시에만 표시) */}
        {isHydrated && isAuthenticated && (
          <Button
            variant={activeFilter === 'favorites' ? 'default' : 'outline'}
            onClick={() => handleFilterChange('favorites')}
            className="gap-2 shrink-0 text-sm md:text-base"
          >
            <Heart className={`h-4 w-4 ${activeFilter === 'favorites' ? 'fill-current' : ''}`} />
            <span className="hidden md:inline">관심 세션</span>
            <span className="md:hidden">관심</span>
            {favorites.size > 0 && (
              <Badge variant="secondary" className="ml-1">
                {favorites.size}
              </Badge>
            )}
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">로딩 중...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={handleRefresh}
            >
              다시 시도
            </Button>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {activeFilter === 'favorites'
                ? '관심 등록한 세션이 없습니다.'
                : activeFilter
                  ? `${activeFilter} 세션이 없습니다.`
                  : '세션 데이터가 없습니다.'
              }
            </p>
          </div>
        ) : (
          filteredSessions.map(session => {
            const { startTime, endTime } = parseTimeSlot(session.timeSlot);
            const isFavorite = favorites.has(session.code);
            return (
              <div key={session.id} className="block">
                <Link href={`/sessions/${session.code}`}>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
                    <div className="md:col-span-3">
                      {/* 트랙 배지 + 하트 버튼 (모바일에서는 같은 줄) */}
                      <div className="flex gap-2 mb-2 items-center justify-between md:justify-start">
                        <Badge variant="secondary">{session.track}</Badge>
                        {/* 모바일: 하트 버튼을 상단에 배치 */}
                        {isHydrated && isAuthenticated && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleFavoriteToggle(e, session.code)}
                            disabled={favoriteLoading === session.code}
                            className={`md:hidden p-1 h-auto ${isFavorite ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-red-500'}`}
                          >
                            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''} ${favoriteLoading === session.code ? 'animate-pulse' : ''}`} />
                          </Button>
                        )}
                      </div>
                      <h3 className="text-lg md:text-xl font-semibold mb-1 line-clamp-2">{session.title}</h3>
                      {/* 모바일: 발표자 + 시간 + 장소를 한 줄에 */}
                      <p className="text-muted-foreground text-sm md:text-base mb-2">
                        <strong>{session.speakerName}</strong>
                        {/* PC: 소속 표시 */}
                        <span className="hidden md:inline">{session.speakerOrg ? ` · ${session.speakerOrg}` : ''}</span>
                        {/* 모바일: 시간/장소 같이 표시 */}
                        <span className="md:hidden text-muted-foreground"> · {startTime}-{endTime} · {session.location}</span>
                      </p>
                      {/* 설명: PC만 표시 */}
                      <p className="hidden md:block text-sm text-muted-foreground mb-3 line-clamp-2">
                        {session.description}
                      </p>
                      {/* 키워드: 모바일은 2개까지, PC는 전체 */}
                      <div className="flex flex-wrap gap-1 md:gap-2">
                        {session.keywords.slice(0, 2).map((keyword: string) => (
                          <Badge key={keyword} variant="outline" className="text-xs md:text-sm md:hidden">#{keyword}</Badge>
                        ))}
                        {session.keywords.map((keyword: string) => (
                          <Badge key={keyword} variant="outline" className="hidden md:inline-flex">#{keyword}</Badge>
                        ))}
                      </div>
                    </div>
                    {/* PC 전용: 우측 시간/장소 및 버튼 */}
                    <div className="hidden md:flex flex-col items-end justify-between">
                      <div className="text-right">
                        <p className="font-mono text-sm">
                          {startTime} - {endTime}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {session.location}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* 관심 버튼 (로그인 시에만) */}
                        {isHydrated && isAuthenticated && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleFavoriteToggle(e, session.code)}
                            disabled={favoriteLoading === session.code}
                            className={isFavorite ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-red-500'}
                          >
                            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''} ${favoriteLoading === session.code ? 'animate-pulse' : ''}`} />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                        >
                          상세 보기 →
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  </Card>
                </Link>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
