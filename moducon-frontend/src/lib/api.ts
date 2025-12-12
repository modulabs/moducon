import type { User, Session, Booth } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:3001'
    : '');

if (!API_BASE && process.env.NODE_ENV === 'production') {
  console.error('❌ NEXT_PUBLIC_API_URL is required in production');
}

export async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('moducon_token')
    : null;

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    // JWT 만료 시 로그아웃 처리 (로그인 API는 제외)
    const isLoginEndpoint = endpoint === '/api/auth/login';
    if (response.status === 401 && !isLoginEndpoint) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('moducon_token');
        localStorage.removeItem('moducon_user');
        window.location.href = '/login?expired=true';
      }
      throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
    }

    const errorMessage = data.error?.message || `API Error (${response.status})`;
    console.error('[API Error]', {
      url: `${API_BASE}${endpoint}`,
      status: response.status,
      error: data.error,
    });
    throw new Error(errorMessage);
  }

  return data.data;
}

// Auth APIs
export const authAPI = {
  login: (name: string, phone_last4: string) =>
    apiCall<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ name, phone_last4 }),
    }),

  register: (data: { name: string; phone: string; email?: string; organization?: string }) =>
    apiCall<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  saveSignature: (signatureData: string) =>
    apiCall<{ signature_url: string }>('/api/auth/signature', {
      method: 'POST',
      body: JSON.stringify({ signature_data: signatureData }),
    }),

  getMe: () => apiCall<User>('/api/auth/me'),

  getSignatureByUser: (name: string, phone_last4: string) =>
    apiCall<{ signature_data: string; user_name: string }>(`/api/auth/signature/user?name=${encodeURIComponent(name)}&phone_last4=${phone_last4}`),

  getSignature: (userId: string) =>
    apiCall<{ signature_data: string; user_name: string }>(`/api/auth/signature/${userId}`),
};

// Session APIs
export const sessionAPI = {
  getAll: () => apiCall<Session[]>('/api/sessions'),

  getById: (id: string) => apiCall<Session>(`/api/sessions/${id}`),

  checkin: (sessionId: string) =>
    apiCall<{ success: boolean }>(`/api/sessions/${sessionId}/checkin`, {
      method: 'POST',
    }),
};

// Booth APIs
export const boothAPI = {
  getAll: () => apiCall<Booth[]>('/api/booths'),

  getById: (id: string) => apiCall<Booth>(`/api/booths/${id}`),

  visit: (boothId: string) =>
    apiCall<{ success: boolean }>(`/api/booths/${boothId}/visit`, {
      method: 'POST',
    }),
};
