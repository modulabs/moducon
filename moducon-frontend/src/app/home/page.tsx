'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { sessionAPI, boothAPI } from '@/lib/api';
import type { Session, Booth } from '@/types';
import Link from 'next/link';

export default function HomePage() {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [booths, setBooths] = useState<Booth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessionsData, boothsData] = await Promise.all([
          sessionAPI.getAll(),
          boothAPI.getAll(),
        ]);
        setSessions(sessionsData.slice(0, 3)); // 최근 3개만
        setBooths(boothsData.slice(0, 3));
      } catch (error) {
        console.error('Failed to fetch data:', error);
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
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">안녕하세요, {user?.name}님!</h1>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Link href="/sessions">
          <Card className="cursor-pointer hover:bg-accent transition-colors">
            <CardContent className="p-6 text-center">
              <p className="text-lg font-semibold">세션 목록</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/booths">
          <Card className="cursor-pointer hover:bg-accent transition-colors">
            <CardContent className="p-6 text-center">
              <p className="text-lg font-semibold">부스 목록</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Sessions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>다가오는 세션</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="border-b pb-4 last:border-0">
                <h3 className="font-semibold">{session.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {session.speaker} • {session.location}
                </p>
              </div>
            ))}
          </div>
          <Link href="/sessions">
            <Button variant="outline" className="w-full mt-4">
              전체 세션 보기
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Featured Booths */}
      <Card>
        <CardHeader>
          <CardTitle>추천 부스</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {booths.map((booth) => (
              <div key={booth.id} className="border-b pb-4 last:border-0">
                <h3 className="font-semibold">{booth.name}</h3>
                <p className="text-sm text-muted-foreground">{booth.organization}</p>
              </div>
            ))}
          </div>
          <Link href="/booths">
            <Button variant="outline" className="w-full mt-4">
              전체 부스 보기
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
