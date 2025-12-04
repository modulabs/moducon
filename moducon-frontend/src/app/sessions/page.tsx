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

  const loadSessions = useCallback(async (track?: string, isFavoritesFilter?: boolean) => {
    setLoading(true);
    setError(null);

    try {
      // 전체 세션 로드
      const data = await fetchSessionsWithCache();

      // 필터 적용
      if (isFavoritesFilter) {
        // 관심 세션 필터: favorites가 비어있으면 빈 배열 반환
        setSessions(data.filter((s: Session) => favorites.has(s.code)));
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
  }, [favorites]);

  // 필터 변경 시 세션 로드
  useEffect(() => {
    if (activeFilter === 'favorites') {
      // 관심 세션은 favorites Set이 로드된 후에만 필터링
      if (isHydrated) {
        loadSessions(undefined, true);
      }
    } else {
      loadSessions(activeFilter || undefined, false);
    }
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
      loadSessions(undefined, true);
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
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      {/* 헤더 */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">전체 세션</h1>
          <p className="text-muted-foreground">
            관심 있는 세션을 찾아보세요. (총 {sessions.length}개)
          </p>
        </div>

        {/* 새로고침 버튼 */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          새로고침
        </Button>
      </div>

      {/* 통합 필터 (트랙 + 관심 세션) */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          variant={activeFilter === null ? 'default' : 'outline'}
          onClick={() => handleFilterChange(null)}
        >
          All
        </Button>
        {tracks.map(track => (
          <Button
            key={track}
            variant={activeFilter === track ? 'default' : 'outline'}
            onClick={() => handleFilterChange(track)}
          >
            {track}
          </Button>
        ))}
        {/* 관심 세션 필터 (로그인 시에만 표시) */}
        {isHydrated && isAuthenticated && (
          <Button
            variant={activeFilter === 'favorites' ? 'default' : 'outline'}
            onClick={() => handleFilterChange('favorites')}
            className="gap-2"
          >
            <Heart className={`h-4 w-4 ${activeFilter === 'favorites' ? 'fill-current' : ''}`} />
            관심 세션
            {favorites.size > 0 && (
              <Badge variant="secondary" className="ml-1">
                {favorites.size}
              </Badge>
            )}
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-6">
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
              <Link key={session.id} href={`/sessions/${session.code}`}>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-3">
                      <div className="flex gap-2 mb-2 items-center">
                        <Badge variant="secondary">{session.track}</Badge>
                      </div>
                      <h3 className="text-xl font-semibold mb-1">{session.title}</h3>
                      <p className="text-muted-foreground mb-2">
                        <strong>{session.speakerName}</strong>{session.speakerOrg ? ` · ${session.speakerOrg}` : ''}
                      </p>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {session.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {session.keywords.map((keyword: string) => (
                          <Badge key={keyword} variant="outline">#{keyword}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-start md:items-end justify-between">
                      <div className="text-right">
                        <p className="font-mono text-sm">
                          {startTime} - {endTime}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {session.location}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-4 md:mt-0">
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
            );
          })
        )}
      </div>
    </div>
  );
}
