'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

// 체크인 타입 정의
type CheckinType = 'registration' | 'session' | 'booth' | 'paper';

// 체크인 상태
type CheckinStatus = 'idle' | 'loading' | 'processing' | 'success' | 'duplicate' | 'error' | 'redirecting';

// 타입별 설정
const TYPE_CONFIG: Record<CheckinType, {
  label: string;
  redirectPath: (id: string) => string;
  emoji: string;
  color: string;
}> = {
  registration: {
    label: '등록',
    redirectPath: () => '/home',
    emoji: '🎫',
    color: 'from-green-500 to-emerald-600',
  },
  session: {
    label: '세션',
    redirectPath: (id) => `/sessions/${id}`,
    emoji: '🎤',
    color: 'from-purple-500 to-indigo-600',
  },
  booth: {
    label: '부스',
    redirectPath: (id) => `/booths/${id}`,
    emoji: '🏢',
    color: 'from-blue-500 to-cyan-600',
  },
  paper: {
    label: '포스터',
    redirectPath: (id) => `/papers/${id}`,
    emoji: '📄',
    color: 'from-orange-500 to-amber-600',
  },
};

interface CheckinResult {
  success: boolean;
  message: string;
  isDuplicate?: boolean;
}

export default function CheckinHandler() {
  const searchParams = useSearchParams();
  const authStore = useAuthStore();

  const [status, setStatus] = useState<CheckinStatus>('idle');
  const [message, setMessage] = useState<string>('');
  const [checkinType, setCheckinType] = useState<CheckinType | null>(null);

  // URL 파라미터
  const type = searchParams.get('type') as CheckinType | null;
  const id = searchParams.get('id');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // 중복 실행 방지 ref
  const checkinExecutedRef = useRef(false);

  // 체크인 API 호출
  const performCheckin = async (
    targetType: CheckinType,
    checkinTargetId: string,
    authToken: string
  ): Promise<CheckinResult> => {
    try {
      const response = await fetch(`${API_BASE}/api/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          targetType: targetType === 'registration' ? 'session' : targetType,
          targetId: checkinTargetId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, message: data.message || '체크인 완료!' };
      }

      // JWT 만료 시 로그인 페이지로 리다이렉트
      if (response.status === 401) {
        authStore.logout();
        const currentUrl = window.location.href;
        window.location.href = `/login?expired=true&redirect=${encodeURIComponent(currentUrl)}`;
        return { success: false, message: '인증이 만료되었습니다. 다시 로그인해주세요.' };
      }

      if (response.status === 409) {
        return { success: true, message: '이미 체크인 완료된 곳입니다.', isDuplicate: true };
      }

      return { success: false, message: data.message || '체크인에 실패했습니다.' };
    } catch (error) {
      console.error('체크인 API 오류:', error);
      return { success: false, message: '네트워크 오류가 발생했습니다.' };
    }
  };

  // 메인 체크인 플로우
  const executeCheckin = async (
    checkinTypeParam: CheckinType,
    checkinIdParam: string,
    authToken: string
  ) => {
    if (!TYPE_CONFIG[checkinTypeParam]) {
      setStatus('error');
      setMessage(`지원하지 않는 체크인 타입입니다: ${checkinTypeParam}`);
      return;
    }

    setCheckinType(checkinTypeParam);
    setStatus('processing');

    // 체크인 처리
    const result = await performCheckin(checkinTypeParam, checkinIdParam, authToken);

    if (result.success) {
      setStatus(result.isDuplicate ? 'duplicate' : 'success');
      setMessage(result.message);

      // 1.5초 후 상세 페이지로 이동
      setTimeout(() => {
        setStatus('redirecting');
        const config = TYPE_CONFIG[checkinTypeParam];
        const redirectUrl = config.redirectPath(checkinIdParam);

        // 서명 안 했으면 서명 페이지로 (서명 후 원래 페이지로 리디렉션)
        if (!authStore.user?.has_signature) {
          window.location.href = `/signature?redirect=${encodeURIComponent(redirectUrl)}`;
        } else {
          window.location.href = redirectUrl;
        }
      }, 1500);
    } else {
      setStatus('error');
      setMessage(result.message);
    }
  };

  // 메인 Effect - hydration 완료 후 한 번만 실행
  useEffect(() => {
    // 아직 hydration 안됨 → 대기
    if (!authStore.isHydrated) {
      return;
    }

    // 이미 실행됨 → 스킵
    if (checkinExecutedRef.current) {
      return;
    }

    // 파라미터 검증
    if (!type || !id) {
      setStatus('error');
      setMessage('잘못된 QR 코드입니다. (type 또는 id 누락)');
      return;
    }

    // 미로그인 시 로그인 페이지로 리다이렉트
    if (!authStore.isAuthenticated || !authStore.token) {
      const currentUrl = `/checkin?type=${type}&id=${id}`;
      window.location.href = `/login?redirect=${encodeURIComponent(currentUrl)}`;
      return;
    }

    // 실행 시작 마킹
    checkinExecutedRef.current = true;
    setStatus('loading');

    // 체크인 실행
    executeCheckin(type, id, authStore.token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStore.isHydrated, authStore.isAuthenticated, type, id]);

  // 다시 시도 버튼용 핸들러
  const handleRetry = () => {
    if (type && id && authStore.token) {
      checkinExecutedRef.current = false;
      setStatus('loading');
      executeCheckin(type, id, authStore.token);
    }
  };

  // 로딩 중 (hydration 대기)
  if (!authStore.isHydrated) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  const config = checkinType ? TYPE_CONFIG[checkinType] : null;

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {/* 상태별 UI */}
        {(status === 'idle' || status === 'loading' || status === 'processing') && (
          <>
            <div className="w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              체크인 처리 중...
            </h2>
            <p className="text-gray-500">
              {config ? `${config.emoji} ${config.label} 체크인` : '잠시만 기다려주세요'}
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${config?.color || 'from-green-500 to-emerald-600'} flex items-center justify-center mx-auto mb-6 animate-bounce`}>
              <span className="text-5xl">{config?.emoji || '✅'}</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">체크인 완료!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-purple-600">
              잠시 후 {config?.label} 페이지로 이동합니다...
            </p>
          </>
        )}

        {status === 'duplicate' && (
          <>
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">👋</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">이미 방문하셨네요!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-purple-600">
              잠시 후 {config?.label} 페이지로 이동합니다...
            </p>
          </>
        )}

        {status === 'redirecting' && (
          <>
            <div className="w-20 h-20 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              페이지 이동 중...
            </h2>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">오류 발생</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                disabled={!type || !id}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                다시 시도
              </button>
              <button
                onClick={() => window.location.href = '/home'}
                className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                홈으로 이동
              </button>
            </div>
          </>
        )}

        {/* 디버그 정보 (개발용) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left text-xs text-gray-500">
            <p><strong>Type:</strong> {type}</p>
            <p><strong>ID:</strong> {id}</p>
            <p><strong>Status:</strong> {status}</p>
            <p><strong>Authenticated:</strong> {authStore.isAuthenticated ? 'Yes' : 'No'}</p>
            <p><strong>Hydrated:</strong> {authStore.isHydrated ? 'Yes' : 'No'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
