'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle } from 'lucide-react';

// Mock Data based on PRD
const mockSessions = [
  {
    id: '1',
    track_number: 1,
    title: 'AI 시대의 프론트엔드 개발',
    speaker: '김철수',
    start_time: '2025-12-13T10:00:00',
    end_time: '2025-12-13T10:50:00',
    location: 'Track 1',
    difficulty: 'intermediate',
    tags: ['AI', 'Frontend', 'React'],
  },
  {
    id: '2',
    track_number: 2,
    title: 'LLM을 활용한 챗봇 구축 실전',
    speaker: '이영희',
    start_time: '2025-12-13T10:00:00',
    end_time: '2025-12-13T10:50:00',
    location: 'Track 2',
    difficulty: 'advanced',
    tags: ['LLM', 'Chatbot', 'Backend'],
  },
  {
    id: '3',
    track_number: 1,
    title: 'WebAssembly와 Rust: 고성능 웹의 미래',
    speaker: '박민준',
    start_time: '2025-12-13T11:00:00',
    end_time: '2025-12-13T11:50:00',
    location: 'Track 1',
    difficulty: 'advanced',
    tags: ['WebAssembly', 'Rust', 'Performance'],
  },
  {
    id: '4',
    track_number: 3,
    title: '디자이너를 위한 생성 AI',
    speaker: '최지아',
    start_time: '2025-12-13T11:00:00',
    end_time: '2025-12-13T11:50:00',
    location: 'Track 3',
    difficulty: 'beginner',
    tags: ['Generative AI', 'Design', 'UI/UX'],
  },
];

const tracks = [1, 2, 3, 4, 5, 6];

export default function SessionsPage() {
  const [filteredSessions, setFilteredSessions] = useState(mockSessions);
  const [activeTrack, setActiveTrack] = useState<number | null>(null);

  const filterByTrack = (track: number | null) => {
    setActiveTrack(track);
    if (track === null) {
      setFilteredSessions(mockSessions);
    } else {
      setFilteredSessions(mockSessions.filter(s => s.track_number === track));
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
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
        {filteredSessions.map(session => (
          <Card key={session.id}>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <Badge variant="secondary" className="mb-2">Track {session.track_number}</Badge>
                <h3 className="text-xl font-semibold mb-1">{session.title}</h3>
                <p className="text-muted-foreground mb-2">{session.speaker}</p>
                <div className="flex flex-wrap gap-2">
                  {session.tags.map(tag => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-start md:items-end justify-between">
                <div className="text-right">
                  <p className="font-mono">{formatTime(session.start_time)} - {formatTime(session.end_time)}</p>
                  <p className="text-sm text-muted-foreground">{session.location}</p>
                </div>
                <Button variant="ghost" size="sm" className="mt-4 md:mt-0">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  내 일정에 추가
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
