export interface Player {
  id: string;
  full_name: string;
  email: string;
  district: string;
  primary_role: string;
  gender: 'male' | 'female';
  created_at: string;
}

export interface Profile {
  id: string;
  player_id: string;
  batting_points: number;
  bowling_points: number;
  annual_rank: number | null;
  height: number | null;
  weight: number | null;
  school: string | null;
  dob: string | null;
  preferred_format: string;
  created_at: string;
  updated_at: string;
}

export interface Selection {
  id: string;
  player_id: string;
  district: string;
  status: 'PENDING' | 'REGISTERED' | 'SELECTED' | 'DENIED';
  created_at: string;
  updated_at: string;
}

export interface AnnualSelection {
  id: string;
  player_id: string;
  status: 'NOT_YET_ELIGIBLE' | 'SELECTED' | 'NOT_SELECTED';
  profile_access: 'DENIED' | 'ACCESS_GRANTED';
  created_at: string;
  updated_at: string;
}

export interface DistrictCapacity {
  district: string;
  gender: 'male' | 'female';
  max_capacity: number;
}