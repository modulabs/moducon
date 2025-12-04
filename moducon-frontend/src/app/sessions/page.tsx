'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';
import { fetchSessionsWithCache, invalidateSessionsCache } from '@/lib/sessionCache';
import type { Session } from '@/types/session';
import { parseTimeSlot } from '@/types/session';

const tracks = ['Track 00', 'Track 01', 'Track 10', 'Track i', 'Track 101'];

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeTrack, setActiveTrack] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = async (track?: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchSessionsWithCache(track || undefined);
      setSessions(data);
    } catch (err) {
      console.error('세션 로딩 실패:', err);
      setError('세션 데이터를 불러올 수 없습니다. 네트워크를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions(activeTrack || undefined);
  }, [activeTrack]);

  const handleRefresh = () => {
    invalidateSessionsCache();
    loadSessions(activeTrack || undefined);
  };

  const filterByTrack = (track: string | null) => {
    setActiveTrack(track);
  };


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

      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeTrack === null ? 'default' : 'outline'}
            onClick={() => filterByTrack(null)}
          >
            All
          </Button>
          {tracks.map(track => (
            <Button
              key={track}
              variant={activeTrack === track ? 'default' : 'outline'}
              onClick={() => filterByTrack(track)}
            >
              {track}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
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
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {activeTrack
                ? `${activeTrack} 세션이 없습니다.`
                : '세션 데이터가 없습니다.'
              }
            </p>
          </div>
        ) : (
          sessions.map(session => {
            const { startTime, endTime } = parseTimeSlot(session.timeSlot);
            return (
              <Link key={session.id} href={`/sessions/${session.code}`}>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-3">
                      <div className="flex gap-2 mb-2">
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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-4 md:mt-0"
                      >
                        상세 보기 →
                      </Button>
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
