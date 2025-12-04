'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

// 체크인 타입 정의
type CheckinType = 'registration' | 'session' | 'booth' | 'paper';

// 체크인 상태
type CheckinStatus = 'loading' | 'checking_quiz' | 'processing' | 'success' | 'duplicate' | 'error';

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, token, isHydrated } = useAuthStore();

  const [status, setStatus] = useState<CheckinStatus>('loading');
  const [message, setMessage] = useState<string>('');
  const [checkinType, setCheckinType] = useState<CheckinType | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // URL 파라미터 파싱
  const type = searchParams.get('type') as CheckinType | null;
  const id = searchParams.get('id');

  // 체크인 API 호출
  const performCheckin = useCallback(async (targetType: CheckinType, targetId: string): Promise<CheckinResult> => {
    try {
      const response = await fetch(`${API_BASE}/api/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetType: targetType === 'registration' ? 'session' : targetType, // registration은 별도 처리 필요 시 수정
          targetId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, message: data.message || '체크인 완료!' };
      }

      if (response.status === 409) {
        return { success: true, message: '이미 체크인 완료된 곳입니다.', isDuplicate: true };
      }

      return { success: false, message: data.message || '체크인에 실패했습니다.' };
    } catch (error) {
      console.error('체크인 API 오류:', error);
      return { success: false, message: '네트워크 오류가 발생했습니다.' };
    }
  }, [API_BASE, token]);

  // 퀴즈 확인 (향후 구현을 위한 placeholder)
  const checkQuiz = useCallback(async (_targetType: CheckinType, _targetId: string): Promise<{ hasQuiz: boolean; quizData?: unknown }> => {
    // TODO: Phase 4.3에서 구현
    // GET /api/quiz/:targetType/:targetId 호출
    // 퀴즈가 있으면 { hasQuiz: true, quizData: {...} } 반환
    // 퀴즈가 없으면 { hasQuiz: false } 반환
    return { hasQuiz: false };
  }, []);

  // 메인 체크인 플로우
  const handleCheckin = useCallback(async () => {
    if (!type || !id) {
      setStatus('error');
      setMessage('잘못된 QR 코드입니다. (type 또는 id 누락)');
      return;
    }

    if (!TYPE_CONFIG[type]) {
      setStatus('error');
      setMessage(`지원하지 않는 체크인 타입입니다: ${type}`);
      return;
    }

    setCheckinType(type);
    setTargetId(id);

    // 퀴즈 확인 단계
    setStatus('checking_quiz');
    const quizResult = await checkQuiz(type, id);

    if (quizResult.hasQuiz) {
      // TODO: Phase 4.3 - 퀴즈 모달 표시
      // setQuizData(quizResult.quizData);
      // setShowQuizModal(true);
      // 퀴즈 정답 후 performCheckin 호출
      console.log('퀴즈가 있습니다:', quizResult.quizData);
    }

    // 체크인 처리
    setStatus('processing');
    const result = await performCheckin(type, id);

    if (result.success) {
      setStatus(result.isDuplicate ? 'duplicate' : 'success');
      setMessage(result.message);

      // 3초 후 상세 페이지로 이동
      setTimeout(() => {
        const config = TYPE_CONFIG[type];
        router.push(config.redirectPath(id));
      }, 2000);
    } else {
      setStatus('error');
      setMessage(result.message);
    }
  }, [type, id, checkQuiz, performCheckin, router]);

  // 인증 상태 확인 및 체크인 실행
  useEffect(() => {
    if (!isHydrated) return;

    // 미로그인 시 로그인 페이지로 리다이렉트
    if (!isAuthenticated) {
      const currentUrl = `/checkin?type=${type}&id=${id}`;
      router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }

    // 체크인 실행
    handleCheckin();
  }, [isHydrated, isAuthenticated, type, id, router, handleCheckin]);

  // 로딩 중 (hydration 대기)
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  const config = checkinType ? TYPE_CONFIG[checkinType] : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {/* 상태별 UI */}
        {status === 'loading' || status === 'checking_quiz' || status === 'processing' ? (
          <>
            <div className="w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {status === 'checking_quiz' ? '퀴즈 확인 중...' : '체크인 처리 중...'}
            </h2>
            <p className="text-gray-500">
              {config ? `${config.emoji} ${config.label} 체크인` : '잠시만 기다려주세요'}
            </p>
          </>
        ) : status === 'success' ? (
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
        ) : status === 'duplicate' ? (
          <>
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-6`}>
              <span className="text-5xl">👋</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">이미 방문하셨네요!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-purple-600">
              잠시 후 {config?.label} 페이지로 이동합니다...
            </p>
          </>
        ) : status === 'error' ? (
          <>
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">오류 발생</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => handleCheckin()}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors"
              >
                다시 시도
              </button>
              <button
                onClick={() => router.push('/home')}
                className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                홈으로 이동
              </button>
            </div>
          </>
        ) : null}

        {/* 디버그 정보 (개발용) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left text-xs text-gray-500">
            <p><strong>Type:</strong> {type}</p>
            <p><strong>ID:</strong> {id}</p>
            <p><strong>Status:</strong> {status}</p>
            <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
