'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function QuestProgress() {
  // TODO: Fetch real quest progress
  const progress = 33;

  return (
    <Card>
      <CardHeader>
        <CardTitle>나의 퀘스트 진행률</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Progress value={progress} className="flex-1" />
          <span className="font-bold">{progress}%</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          퀘스트를 완료하고 특별한 보상을 획득하세요!
        </p>
      </CardContent>
    </Card>
  );
}
