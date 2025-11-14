import type { User, Session, Booth } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('token')
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
    throw new Error(data.error?.message || 'API Error');
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

  saveSignature: (signatureData: string) =>
    apiCall<{ badgeUrl: string }>('/api/auth/signature', {
      method: 'POST',
      body: JSON.stringify({ signatureData }),
    }),

  getMe: () => apiCall<User>('/api/auth/me'),
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
