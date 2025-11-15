'use client';

import { useAuthStore } from '@/store/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { QrCode } from 'lucide-react';

export function DigitalBadge() {
  const { user } = useAuthStore();

  return (
    <Card className="w-full">
      <CardContent className="p-6 flex items-center gap-6">
        <div className="p-4 bg-gray-100 rounded-lg">
          <QrCode className="w-16 h-16" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">참가자</p>
          <h2 className="text-2xl font-bold">{user?.name}</h2>
        </div>
      </CardContent>
    </Card>
  );
}
