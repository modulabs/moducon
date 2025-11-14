// User
export interface User {
  id: string;
  name: string;
  phone_last4: string;
  email?: string;
  organization?: string;
  role?: string;
  interests?: string[];
  registration_type: 'pre_registered' | 'onsite';
  has_signature: boolean;
}

// Session
export interface Session {
  id: string;
  track_number: number;
  title: string;
  speaker: string;
  description?: string;
  start_time: string;
  end_time: string;
  location: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  qr_code: string;
}

// Booth
export interface Booth {
  id: string;
  name: string;
  organization: string;
  description: string;
  tech_tags: string[];
  location_x?: number;
  location_y?: number;
  estimated_duration_minutes: number;
  qr_code: string;
  image_url?: string;
  booth_type: 'lab' | 'sponsor' | 'community';
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
