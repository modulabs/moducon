'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Participant {
  id: string;
  name: string;
  phone_last4: string;
  has_signature: boolean;
  signature_data: string | null;
  last_login: string | null;
  registered_at: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // 인증 체크
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    fetchParticipants();
  }, [router]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('admin_token');

      const response = await fetch(`${API_URL}/api/admin/participants`, {
        headers: {
          'x-admin-token': token || '',
        },
      });

      const result = await response.json();

      if (response.status === 401) {
        // 토큰 만료 또는 무효
        localStorage.removeItem('admin_token');
        router.push('/admin/login');
        return;
      }

      if (result.success) {
        setParticipants(result.data.participants);
        setError(null);
      } else {
        setError('참가자 목록을 불러오지 못했습니다.');
      }
    } catch (err) {
      setError('서버 연결에 실패했습니다.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  const filteredParticipants = participants.filter(
    (p) =>
      p.name.includes(searchQuery) || p.phone_last4.includes(searchQuery)
  );

  const stats = {
    total: participants.length,
    withSignature: participants.filter((p) => p.has_signature).length,
    withLogin: participants.filter((p) => p.last_login).length,
  };

  return (
    <div className="min-h-[100dvh] bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              관리자 대시보드
            </h1>
            <p className="text-gray-600">참가자 목록 및 서명 관리</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            로그아웃
          </button>
        </div>

        {/* 통계 - 공공문서 스타일 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded border border-gray-300">
            <div className="text-sm text-gray-600 mb-1">전체 참가자</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white p-6 rounded border border-gray-300">
            <div className="text-sm text-gray-600 mb-1">서명 완료</div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.withSignature}
            </div>
          </div>
          <div className="bg-white p-6 rounded border border-gray-300">
            <div className="text-sm text-gray-600 mb-1">로그인 기록</div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.withLogin}
            </div>
          </div>
        </div>

        {/* 검색 */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="이름 또는 전화번호로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-gray-400 focus:border-transparent text-gray-900"
          />
        </div>

        {/* 참가자 목록 - 탭으로 분리 */}
        <Tabs defaultValue="main" className="w-full">
          <TabsList className="w-full justify-start border-b border-gray-300 rounded-none bg-transparent p-0">
            <TabsTrigger
              value="main"
              className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent"
            >
              메인
            </TabsTrigger>
            <TabsTrigger
              value="detail"
              className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent"
            >
              상세
            </TabsTrigger>
          </TabsList>

          {/* 메인 탭 - 이름, 전화번호, 서명만 표시 */}
          <TabsContent value="main" className="mt-0">
            <div className="bg-white rounded border border-gray-300 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-300">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        이름
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        전화번호 뒷자리
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider" style={{ width: '250px' }}>
                        서명
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                          로딩 중...
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-red-500">
                          {error}
                        </td>
                      </tr>
                    ) : filteredParticipants.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                          검색 결과가 없습니다.
                        </td>
                      </tr>
                    ) : (
                      filteredParticipants.map((participant) => (
                        <tr key={participant.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {participant.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            *{participant.phone_last4}
                          </td>
                          <td className="px-6 py-4">
                            {participant.has_signature && participant.signature_data ? (
                              <div className="flex items-center">
                                <img
                                  src={participant.signature_data}
                                  alt={`${participant.name} 서명`}
                                  className="h-12 w-auto max-w-[220px] object-contain border border-gray-300 rounded bg-white"
                                />
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400"></span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* 상세 탭 - 최근 로그인, 등록일시, 상세보기 버튼 */}
          <TabsContent value="detail" className="mt-0">
            <div className="bg-white rounded border border-gray-300 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-300">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        이름
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        전화번호 뒷자리
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        최근 로그인
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        등록일시
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        상세
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                          로딩 중...
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-red-500">
                          {error}
                        </td>
                      </tr>
                    ) : filteredParticipants.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                          검색 결과가 없습니다.
                        </td>
                      </tr>
                    ) : (
                      filteredParticipants.map((participant) => (
                        <tr key={participant.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {participant.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            *{participant.phone_last4}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                            {participant.last_login
                              ? new Date(participant.last_login).toLocaleString('ko-KR')
                              : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                            {new Date(participant.registered_at).toLocaleDateString('ko-KR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                            <button
                              onClick={() => setSelectedParticipant(participant)}
                              className="text-gray-700 hover:text-gray-900 font-medium underline"
                            >
                              상세보기
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* 서명 상세 모달 - 공공문서 스타일 */}
        {selectedParticipant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded border-2 border-gray-400 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6 border-b border-gray-300 pb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    참가자 상세 정보
                  </h2>
                  <button
                    onClick={() => setSelectedParticipant(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      이름
                    </label>
                    <div className="text-lg font-semibold text-gray-900">
                      {selectedParticipant.name}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      전화번호 뒷자리
                    </label>
                    <div className="text-lg text-gray-900">
                      *{selectedParticipant.phone_last4}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      서명
                    </label>
                    {selectedParticipant.has_signature &&
                    selectedParticipant.signature_data ? (
                      <div className="border-2 border-gray-300 rounded p-4 bg-white">
                        <img
                          src={selectedParticipant.signature_data}
                          alt="서명"
                          className="w-full h-auto max-h-64 object-contain"
                        />
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded p-8 text-center text-gray-500">
                        서명이 등록되지 않았습니다.
                      </div>
                    )}
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => setSelectedParticipant(null)}
                      className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 border border-gray-300"
                    >
                      닫기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
