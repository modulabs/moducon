'use client';

import { useAuthStore } from '@/store/authStore';
import { Card, CardContent } from '@/components/ui/card';

export function DigitalBadge() {
  const { user } = useAuthStore();

  return (
    <Card className="w-full">
      <CardContent className="p-6 flex items-center gap-6">
        <div className="p-4 bg-primary/10 rounded-lg">
          <div className="w-16 h-16 flex items-center justify-center">
            <span className="text-4xl">🎫</span>
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">디지털 배지</p>
          <h2 className="text-2xl font-bold">{user?.name}</h2>
        </div>
      </CardContent>
    </Card>
  );
}
