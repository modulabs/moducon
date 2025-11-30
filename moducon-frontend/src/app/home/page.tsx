'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { fetchSessionsWithCache } from '@/lib/sessionCache';
import type { Session } from '@/types/session';
import Link from 'next/link';
import { DigitalBadge } from '@/components/home/DigitalBadge';
import { QuestProgress } from '@/components/home/QuestProgress';
import { Calendar, Store, ArrowRight, FileText } from 'lucide-react';

export default function HomePage() {
  const { user } = useAuthStore();
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 실제 API 호출
        const allSessions = await fetchSessionsWithCache();

        // 다가오는 세션 3개 선택 (시작 시간 기준 정렬)
        const upcoming = allSessions
          .sort((a, b) => {
            // 시작 시간 기준 오름차순 정렬
            return a.startTime.localeCompare(b.startTime);
          })
          .slice(0, 3); // 최대 3개

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

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">로딩 중...</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <h1 className="text-3xl font-bold">안녕하세요, {user?.name}님!</h1>
          <QuestProgress />
          
          <Card>
            <CardHeader>
              <CardTitle>다가오는 세션</CardTitle>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="py-4">
                  <p className="text-sm text-destructive">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => window.location.reload()}
                  >
                    다시 시도
                  </Button>
                </div>
              ) : upcomingSessions.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                  다가오는 세션이 없습니다.
                </p>
              ) : (
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div key={session.id} className="border-b pb-4 last:border-0">
                      <h3 className="font-semibold">{session.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {session.speaker} • {session.track}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {session.startTime} - {session.endTime} | {session.location}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <Link href="/sessions">
                <Button variant="outline" className="w-full mt-4">
                  전체 세션 보기 <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <DigitalBadge />
          <Card>
            <CardHeader>
              <CardTitle>빠른 이동</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/sessions" passHref>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  세션 목록
                </Button>
              </Link>
              <Link href="/booths" passHref>
                <Button variant="outline" className="w-full justify-start">
                  <Store className="mr-2 h-4 w-4" />
                  부스 목록
                </Button>
              </Link>
              <Link href="/papers" passHref>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  포스터 발표
                </Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>추천 부스</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Mock Data */}
              <div className="space-y-4">
                <div className="border-b pb-4 last:border-0">
                  <h3 className="font-semibold">AI 기반 코드 생성기</h3>
                  <p className="text-sm text-muted-foreground">Modu-Labs</p>
                </div>
              </div>
              <Link href="/booths">
                <Button variant="outline" className="w-full mt-4">
                  전체 부스 보기 <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}