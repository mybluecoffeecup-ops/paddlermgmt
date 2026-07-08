// Core domain types mirroring the Supabase/Postgres schema
// (see supabase/migrations/0001_init.sql).

export type Discipline = "DB" | "OC" | "Both";
export type PaddleSide = "Left" | "Right" | "Ambi";
export type BoatType = "DB12" | "DB22" | "V6";
export type AttendanceStatus = "Unconfirmed" | "Attending" | "Absent" | "Waitlist";

export type CrewTag =
  | "Premier Mixed"
  | "Women"
  | "Men"
  | "Masters"
  | "Youth"
  | "Novice";

export interface Benchmarks {
  erg_2k_seconds?: number;
  erg_500m_seconds?: number;
  bench_press_kg?: number;
  [key: string]: number | undefined;
}

export interface Profile {
  id: string;
  full_name: string;
  weight_kg: number | null;
  is_pr_or_citizen: boolean;
  primary_discipline: Discipline;
  preferred_side: PaddleSide;
  is_coach: boolean;
  is_pacer: boolean;
  is_steer: boolean;
  is_drummer: boolean;
  benchmarks: Benchmarks;
  coaching_feedback: string | null;
  crew_tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  title: string;
  description: string | null;
  session_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  discipline: Discipline;
  type: string;
  capacity_limit: number | null;
  workout_program: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  session_id: string;
  paddler_id: string;
  status: AttendanceStatus;
  paddler_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Race {
  id: string;
  name: string;
  location: string | null;
  description: string | null;
  discipline: Discipline;
  race_date: string; // YYYY-MM-DD
  registration_deadline: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface RaceCommitment {
  id: string;
  race_id: string;
  paddler_id: string;
  status: AttendanceStatus;
  has_paid: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** seat id -> paddler id (or null if empty) */
export type SeatingConfiguration = Record<string, string | null>;

export interface Lineup {
  id: string;
  session_id: string;
  title: string;
  boat: BoatType;
  seating_configuration: SeatingConfiguration;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
