export type Gender = 'boys' | 'girls';

export interface Workshop {
  id: string;
  province: string;
  gender: Gender;
  coach_name: string;
  venue_name: string;
  location_lat: number;
  location_lng: number;
  session_completed_count: number;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface Session {
  topic: string;
  coach: string;
  venue: string;
  location: { lat: number; lng: number };
}

export interface Statistics {
  totalSessions: number;
  totalProvinces: number;
  completionRate: string;
}