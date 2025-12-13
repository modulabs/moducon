'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Participant {
  id: string;
  name: string;
  phone_last4: string;
  lottery_number: number;
  lottery_won: boolean;
  registered_at: string;
}

interface Winner {
  id: string;
  name: string;
  phone_last4: string;
  lottery_number: number;
}

interface Stats {
  total_participants: number;
  winners: number;
}

export default function AdminLotteryPage() {
  const router = useRouter();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [stats, setStats] = useState<Stats>({ total_participants: 0, winners: 0 });
  const [loading, setLoading] = useState(true);
  const [drawing, setDrawing] = useState(false);
  const [currentWinner, setCurrentWinner] = useState<Winner | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [slotNumbers, setSlotNumbers] = useState<number[]>([0, 0, 0, 0]);
  const [drawCount, setDrawCount] = useState(1);
  const slotRef = useRef<NodeJS.Timeout | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
  }, [router]);

  const getHeaders = () => {
    const adminToken = localStorage.getItem('admin_token');
    const userToken = localStorage.getItem('moducon_token');
    return {
      'Authorization': userToken ? `Bearer ${userToken}` : '',
      'x-admin-token': adminToken || '',
      'Content-Type': 'application/json',
    };
  };

  // 참가자 목록 조회
  const fetchParticipants = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/lottery/participants`, {
        headers: getHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setParticipants(data.data.participants || []);
        setStats(data.data.stats || { total_participants: 0, winners: 0 });
      }
    } catch (err) {
      console.error('참가자 로딩 실패:', err);
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  // 당첨자 목록 조회
  const fetchWinners = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/lottery/winners`, {
        headers: getHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setWinners(data.data.winners || []);
      }
    } catch (err) {
      console.error('당첨자 로딩 실패:', err);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchParticipants();
    fetchWinners();
  }, [fetchParticipants, fetchWinners]);

  // 슬롯 머신 애니메이션
  const startSlotAnimation = (finalNumber: number, duration: number = 3000) => {
    const startTime = Date.now();
    const finalDigits = String(finalNumber).padStart(4, '0').split('').map(Number);

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutQuint for smooth deceleration
      const easeProgress = 1 - Math.pow(1 - progress, 5);

      if (progress < 1) {
        // 진행 중: 랜덤 숫자 표시 (점점 느려짐)
        const shouldUpdate = Math.random() > progress * 0.8;
        if (shouldUpdate) {
          setSlotNumbers(prev => prev.map((_, i) => {
            // 뒷자리부터 먼저 멈춤
            const stopThreshold = 0.4 + (i * 0.15);
            if (progress > stopThreshold) {
              return finalDigits[i];
            }
            return Math.floor(Math.random() * 10);
          }));
        }
        slotRef.current = setTimeout(animate, 50 + (progress * 100));
      } else {
        // 완료: 최종 숫자
        setSlotNumbers(finalDigits);
      }
    };

    animate();
  };

  // 추첨 실행
  const handleDraw = async () => {
    const remaining = stats.total_participants - stats.winners;
    if (remaining === 0) {
      alert('추첨 가능한 대상자가 없습니다.');
      return;
    }

    setDrawing(true);
    setShowResult(false);
    setCurrentWinner(null);

    // 슬롯 애니메이션 시작 (임시 숫자)
    setSlotNumbers([0, 0, 0, 0]);

    // 빠른 숫자 변경 시작
    const quickSpin = setInterval(() => {
      setSlotNumbers(prev => prev.map(() => Math.floor(Math.random() * 10)));
    }, 50);

    try {
      const response = await fetch(`${API_BASE}/api/admin/lottery/draw`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ count: drawCount }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const winner = data.data.winners[0];

        // 빠른 스핀 멈추고 최종 애니메이션
        clearInterval(quickSpin);
        startSlotAnimation(winner.lottery_number, 2500);

        // 결과 표시
        setTimeout(() => {
          setCurrentWinner(winner);
          setShowResult(true);
          setWinners(prev => [winner, ...prev]);
          setStats(prev => ({
            ...prev,
            winners: prev.winners + 1,
          }));
          setParticipants(prev =>
            prev.map(p =>
              p.id === winner.id ? { ...p, lottery_won: true } : p
            )
          );
        }, 2800);
      } else {
        clearInterval(quickSpin);
        alert(data.message || '추첨에 실패했습니다.');
      }
    } catch (err) {
      clearInterval(quickSpin);
      console.error('추첨 실패:', err);
      alert('추첨에 실패했습니다.');
    } finally {
      setTimeout(() => setDrawing(false), 3000);
    }
  };

  // 초기화
  const handleReset = async () => {
    if (!confirm('모든 당첨 기록을 초기화하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) return;

    try {
      const response = await fetch(`${API_BASE}/api/admin/lottery/reset`, {
        method: 'POST',
        headers: getHeaders(),
      });

      if (response.ok) {
        setWinners([]);
        setCurrentWinner(null);
        setShowResult(false);
        setSlotNumbers([0, 0, 0, 0]);
        fetchParticipants();
      }
    } catch (err) {
      console.error('초기화 실패:', err);
    }
  };

  const remaining = stats.total_participants - stats.winners;

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white overflow-hidden">
      {/* 배경 효과 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
      </div>

      {/* 헤더 */}
      <div className="relative bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-400 hover:text-white text-sm transition">
                ← 관리자
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                🎰 경품 추첨
              </h1>
            </div>
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm text-gray-400 hover:text-red-400 border border-gray-700 rounded-lg hover:border-red-400/50 transition"
            >
              초기화
            </button>
          </div>
        </div>
      </div>

      <div className="relative container mx-auto px-4 py-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10">
            <div className="text-4xl font-bold text-amber-400 mb-1">{stats.total_participants}</div>
            <div className="text-sm text-gray-400">전체 대상</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10">
            <div className="text-4xl font-bold text-emerald-400 mb-1">{remaining}</div>
            <div className="text-sm text-gray-400">남은 인원</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10">
            <div className="text-4xl font-bold text-pink-400 mb-1">{stats.winners}</div>
            <div className="text-sm text-gray-400">당첨자</div>
          </div>
        </div>

        {/* 슬롯 머신 */}
        <div className="bg-gradient-to-b from-amber-500/20 to-amber-600/10 rounded-3xl p-8 mb-8 border-2 border-amber-500/30 shadow-2xl shadow-amber-500/10">
          <div className="text-center mb-6">
            <span className="text-amber-400/80 text-sm font-medium">추첨 번호</span>
          </div>

          {/* 슬롯 숫자 */}
          <div className="flex justify-center gap-3 mb-8">
            {slotNumbers.map((num, idx) => (
              <div
                key={idx}
                className={`w-20 h-28 bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl flex items-center justify-center border-2 border-amber-500/50 shadow-lg shadow-black/50 ${
                  drawing ? 'animate-pulse' : ''
                }`}
              >
                <span className={`text-5xl font-bold tabular-nums transition-all duration-100 ${
                  showResult ? 'text-amber-400 scale-110' : 'text-white'
                }`}>
                  {num}
                </span>
              </div>
            ))}
          </div>

          {/* 당첨자 정보 */}
          {showResult && currentWinner && (
            <div className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl p-6 text-center animate-bounce-once">
              <div className="text-amber-900 text-sm font-medium mb-2">🎉 축하합니다! 🎉</div>
              <div className="text-3xl font-bold text-amber-900 mb-1">{currentWinner.name}</div>
              <div className="text-amber-900/70">전화번호 끝자리: {currentWinner.phone_last4}</div>
            </div>
          )}
        </div>

        {/* 추첨 버튼 */}
        <div className="text-center mb-8">
          <button
            onClick={handleDraw}
            disabled={drawing || remaining === 0}
            className={`px-16 py-5 text-2xl font-bold rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-2xl ${
              drawing
                ? 'bg-gray-600 cursor-wait'
                : remaining === 0
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 via-red-500 to-pink-500 hover:from-pink-600 hover:via-red-600 hover:to-pink-600 shadow-pink-500/30'
            }`}
          >
            {drawing ? (
              <span className="flex items-center gap-3">
                <span className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                추첨 중...
              </span>
            ) : remaining === 0 ? (
              '추첨 완료'
            ) : (
              '🎲 추첨하기'
            )}
          </button>
        </div>

        {/* 당첨자 목록 */}
        {winners.length > 0 && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                당첨자 목록
              </h2>
              <span className="text-gray-400 text-sm">{winners.length}명</span>
            </div>
            <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
              {winners.map((winner, idx) => (
                <div
                  key={winner.id}
                  className={`px-6 py-4 flex items-center justify-between ${
                    idx === 0 && showResult ? 'bg-amber-500/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center text-amber-900 font-bold text-sm">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-mono text-amber-400 font-bold text-lg mr-3">
                        {String(winner.lottery_number).padStart(4, '0')}
                      </span>
                      <span className="text-white">{winner.name}</span>
                    </div>
                  </div>
                  <span className="text-gray-500 text-sm font-mono">{winner.phone_last4}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 전체 참가자 (접기) */}
        <details className="mt-8">
          <summary className="cursor-pointer text-gray-400 hover:text-white text-sm mb-4 transition">
            전체 참가자 목록 보기 ({stats.total_participants}명)
          </summary>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/10 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-400">번호</th>
                  <th className="px-4 py-3 text-left text-gray-400">이름</th>
                  <th className="px-4 py-3 text-left text-gray-400">전화번호</th>
                  <th className="px-4 py-3 text-center text-gray-400">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {participants.map(p => (
                  <tr key={p.id} className={p.lottery_won ? 'bg-amber-500/10' : ''}>
                    <td className="px-4 py-3 font-mono text-amber-400">
                      {String(p.lottery_number).padStart(4, '0')}
                    </td>
                    <td className="px-4 py-3">{p.name}</td>
                    <td className="px-4 py-3 text-gray-400 font-mono">{p.phone_last4}</td>
                    <td className="px-4 py-3 text-center">
                      {p.lottery_won ? (
                        <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                          🎉 당첨
                        </span>
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>

      {/* CSS 애니메이션 */}
      <style jsx>{`
        @keyframes bounce-once {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-once {
          animation: bounce-once 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
