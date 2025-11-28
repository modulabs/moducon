'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
// API imports commented out for future use
// import { sessionAPI, boothAPI } from '@/lib/api';
// import type { Session, Booth } from '@/types';
import Link from 'next/link';
import { DigitalBadge } from '@/components/home/DigitalBadge';
import { QuestProgress } from '@/components/home/QuestProgress';
import { Calendar, Store, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const { user } = useAuthStore();
  // State variables commented out for future use
  // const [sessions, setSessions] = useState<Session[]>([]);
  // const [booths, setBooths] = useState<Booth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // API calls will fail without the backend, so we'll use mock data for now
        // const [sessionsData, boothsData] = await Promise.all([
        //   sessionAPI.getAll(),
        //   boothAPI.getAll(),
        // ]);
        // setSessions(sessionsData.slice(0, 3));
        // setBooths(boothsData.slice(0, 3));
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
              {/* Mock Data */}
              <div className="space-y-4">
                <div className="border-b pb-4 last:border-0">
                  <h3 className="font-semibold">AI 시대의 프론트엔드 개발</h3>
                  <p className="text-sm text-muted-foreground">
                    김철수 • Track 1
                  </p>
                </div>
                <div className="border-b pb-4 last:border-0">
                  <h3 className="font-semibold">LLM을 활용한 챗봇 구축</h3>
                  <p className="text-sm text-muted-foreground">
                    이영희 • Track 2
                  </p>
                </div>
              </div>
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