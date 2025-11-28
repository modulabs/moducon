'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle } from 'lucide-react';

interface Session {
  id: string;
  name: string;
  track: string;
  startTime: string;
  endTime: string;
  location: string;
  speaker: string;
  difficulty: '초급' | '중급' | '고급';
  description: string;
  hashtags: string[];
}

const tracks = ['Track 1', 'Track 2', 'Track 3', 'Track 4', 'Track 5', 'Track 6'];

// API에서 세션 데이터 가져오기
async function fetchSessions(track?: string): Promise<Session[]> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const url = track
      ? `${API_URL}/api/sessions?track=${encodeURIComponent(track)}`
      : `${API_URL}/api/sessions`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch sessions');
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('세션 데이터 가져오기 실패:', error);
    return [];
  }
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeTrack, setActiveTrack] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions(activeTrack);
  }, [activeTrack]);

  const loadSessions = async (track: string | null) => {
    setLoading(true);
    const data = await fetchSessions(track || undefined);
    setSessions(data);
    setLoading(false);
  };

  const filterByTrack = (track: string | null) => {
    setActiveTrack(track);
  };

  const formatTime = (timeStr: string) => {
    // "09:00" 형식의 시간 문자열을 그대로 표시
    return timeStr;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '초급':
        return 'bg-green-100 text-green-800';
      case '중급':
        return 'bg-blue-100 text-blue-800';
      case '고급':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">전체 세션</h1>
        <p className="text-muted-foreground">관심 있는 세션을 찾아보세요.</p>
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
              Track {track}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">세션 데이터가 없습니다.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Google Sheets에서 세션 정보를 추가해주세요.
            </p>
          </div>
        ) : (
          sessions.map(session => (
            <Card key={session.id}>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <div className="flex gap-2 mb-2">
                    <Badge variant="secondary">{session.track}</Badge>
                    <Badge className={getDifficultyColor(session.difficulty)}>
                      {session.difficulty}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-semibold mb-1">{session.name}</h3>
                  <p className="text-muted-foreground mb-2">
                    <strong>연사:</strong> {session.speaker}
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    {session.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {session.hashtags.map(tag => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-start md:items-end justify-between">
                  <div className="text-right">
                    <p className="font-mono">
                      {formatTime(session.startTime)} - {formatTime(session.endTime)}
                    </p>
                    <p className="text-sm text-muted-foreground">{session.location}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="mt-4 md:mt-0">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    내 일정에 추가
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
