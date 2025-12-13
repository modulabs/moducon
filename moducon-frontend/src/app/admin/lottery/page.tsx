'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Participant {
  id: string;
  name: string;
  phoneLast4: string;
  lotteryNumber: number;
  lotteryWon: boolean;
}

interface LotteryStats {
  total: number;
  remaining: number;
  won: number;
}

interface Winner {
  id: string;
  name: string;
  phoneLast4: string;
  lotteryNumber: number;
}

export default function AdminLotteryPage() {
  const router = useRouter();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [stats, setStats] = useState<LotteryStats>({ total: 0, remaining: 0, won: 0 });
  const [loading, setLoading] = useState(true);
  const [drawing, setDrawing] = useState(false);
  const [currentWinner, setCurrentWinner] = useState<Winner | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animatingNumber, setAnimatingNumber] = useState<number | null>(null);
  const [winners, setWinners] = useState<Winner[]>([]);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
  }, [router]);

  const fetchParticipants = useCallback(async () => {
    const adminToken = localStorage.getItem('admin_token');
    if (!adminToken) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/lottery/participants`, {
        headers: { 'x-admin-token': adminToken },
      });

      if (response.ok) {
        const data = await response.json();
        setParticipants(data.data.participants || []);
        setStats(data.data.stats || { total: 0, remaining: 0, won: 0 });
        // 당첨자 목록 추출
        const wonList = (data.data.participants || [])
          .filter((p: Participant) => p.lotteryWon)
          .map((p: Participant) => ({
            id: p.id,
            name: p.name,
            phoneLast4: p.phoneLast4,
            lotteryNumber: p.lotteryNumber,
          }));
        setWinners(wonList);
      }
    } catch (err) {
      console.error('참가자 로딩 실패:', err);
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  const handleDraw = async () => {
    const adminToken = localStorage.getItem('admin_token');
    if (!adminToken) return;

    setDrawing(true);
    setShowAnimation(true);
    setCurrentWinner(null);

    // 애니메이션: 번호 빠르게 바꾸기
    const eligible = participants.filter(p => !p.lotteryWon);
    if (eligible.length === 0) {
      alert('추첨 가능한 대상자가 없습니다.');
      setDrawing(false);
      setShowAnimation(false);
      return;
    }

    let animationCount = 0;
    const maxAnimations = 20;
    const animationInterval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * eligible.length);
      setAnimatingNumber(eligible[randomIdx].lotteryNumber);
      animationCount++;

      if (animationCount >= maxAnimations) {
        clearInterval(animationInterval);
        // 실제 추첨 API 호출
        performDraw(adminToken);
      }
    }, 100);
  };

  const performDraw = async (adminToken: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/lottery/draw`, {
        method: 'POST',
        headers: {
          'x-admin-token': adminToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ excludeWinners: true }),
      });

      if (response.ok) {
        const data = await response.json();
        const winner = data.data.winner;
        setAnimatingNumber(winner.lotteryNumber);

        setTimeout(() => {
          setCurrentWinner(winner);
          setWinners(prev => [...prev, winner]);
          setStats(prev => ({
            ...prev,
            remaining: prev.remaining - 1,
            won: prev.won + 1,
          }));
          setParticipants(prev =>
            prev.map(p =>
              p.id === winner.id ? { ...p, lotteryWon: true } : p
            )
          );
          setShowAnimation(false);
        }, 500);
      } else {
        const data = await response.json();
        alert(data.error?.message || '추첨에 실패했습니다.');
        setShowAnimation(false);
      }
    } catch (err) {
      console.error('추첨 실패:', err);
      alert('추첨에 실패했습니다.');
      setShowAnimation(false);
    } finally {
      setDrawing(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('모든 당첨 기록을 초기화하시겠습니까?')) return;

    const adminToken = localStorage.getItem('admin_token');
    if (!adminToken) return;

    try {
      const response = await fetch(`${API_BASE}/api/admin/lottery/reset`, {
        method: 'POST',
        headers: { 'x-admin-token': adminToken },
      });

      if (response.ok) {
        setWinners([]);
        setCurrentWinner(null);
        fetchParticipants();
      }
    } catch (err) {
      console.error('초기화 실패:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-gray-900 flex items-center justify-center">
        <div className="text-white">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gray-900 text-white">
      {/* 헤더 */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-400 hover:text-white text-sm">
                ← 관리자
              </Link>
              <h1 className="text-xl font-bold">경품 추첨</h1>
            </div>
            <button
              onClick={handleReset}
              className="px-3 py-1 text-sm text-gray-400 hover:text-red-400 transition"
            >
              초기화
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 통계 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-amber-400">{stats.total}</div>
            <div className="text-sm text-gray-400">전체 대상</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-400">{stats.remaining}</div>
            <div className="text-sm text-gray-400">미당첨</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-pink-400">{stats.won}</div>
            <div className="text-sm text-gray-400">당첨자</div>
          </div>
        </div>

        {/* 추첨 영역 */}
        <div className="bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 rounded-2xl p-8 mb-8 text-center">
          {showAnimation ? (
            <div>
              <p className="text-amber-900/70 text-sm mb-2">추첨 중...</p>
              <div className="text-7xl font-bold text-amber-900 tabular-nums animate-pulse">
                {String(animatingNumber || 0).padStart(4, '0')}
              </div>
            </div>
          ) : currentWinner ? (
            <div>
              <p className="text-amber-900/70 text-sm mb-2">당첨자</p>
              <div className="text-7xl font-bold text-amber-900 tabular-nums mb-4">
                {String(currentWinner.lotteryNumber).padStart(4, '0')}
              </div>
              <div className="bg-white/30 rounded-lg px-6 py-3 inline-block">
                <p className="text-xl font-bold text-amber-900">
                  {currentWinner.name}
                </p>
                <p className="text-amber-900/70">
                  전화번호 끝자리: {currentWinner.phoneLast4}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-amber-900/70 text-sm mb-2">추첨 번호</p>
              <div className="text-7xl font-bold text-amber-900/30 tabular-nums">
                ----
              </div>
            </div>
          )}
        </div>

        {/* 추첨 버튼 */}
        <div className="text-center mb-8">
          <button
            onClick={handleDraw}
            disabled={drawing || stats.remaining === 0}
            className="px-12 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xl font-bold rounded-full hover:from-pink-600 hover:to-rose-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {drawing ? '추첨 중...' : stats.remaining === 0 ? '추첨 완료' : '추첨하기'}
          </button>
        </div>

        {/* 당첨자 목록 */}
        {winners.length > 0 && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-700">
              <h2 className="font-semibold">당첨자 목록 ({winners.length}명)</h2>
            </div>
            <div className="divide-y divide-gray-700">
              {winners.map((winner, idx) => (
                <div key={winner.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500 text-sm w-6">{idx + 1}</span>
                    <span className="font-mono text-amber-400 font-bold">
                      {String(winner.lotteryNumber).padStart(4, '0')}
                    </span>
                    <span>{winner.name}</span>
                  </div>
                  <span className="text-gray-500 text-sm">{winner.phoneLast4}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 전체 참가자 (접기) */}
        <details className="mt-8">
          <summary className="cursor-pointer text-gray-400 hover:text-white text-sm mb-4">
            전체 참가자 목록 보기 ({stats.total}명)
          </summary>
          <div className="bg-gray-800 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-700 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">번호</th>
                  <th className="px-4 py-2 text-left">이름</th>
                  <th className="px-4 py-2 text-left">전화번호</th>
                  <th className="px-4 py-2 text-center">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {participants.map(p => (
                  <tr key={p.id} className={p.lotteryWon ? 'bg-pink-900/20' : ''}>
                    <td className="px-4 py-2 font-mono text-amber-400">
                      {String(p.lotteryNumber).padStart(4, '0')}
                    </td>
                    <td className="px-4 py-2">{p.name}</td>
                    <td className="px-4 py-2 text-gray-400">{p.phoneLast4}</td>
                    <td className="px-4 py-2 text-center">
                      {p.lotteryWon ? (
                        <span className="px-2 py-0.5 bg-pink-500/20 text-pink-400 text-xs rounded">
                          당첨
                        </span>
                      ) : (
                        <span className="text-gray-500 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </div>
  );
}
