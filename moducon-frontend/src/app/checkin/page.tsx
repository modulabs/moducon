'use client';

import { Suspense } from 'react';
import CheckinHandler from './CheckinHandler';

export default function CheckinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">체크인 처리 중...</p>
        </div>
      </div>
    }>
      <CheckinHandler />
    </Suspense>
  );
}
