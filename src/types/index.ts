// Core domain types mirroring the Supabase/Postgres schema
// (see supabase/migrations/0001_init.sql).

export type Discipline = "DB" | "OC" | "Both";
export type PaddleSide = "Left" | "Right" | "Ambi";
export type BoatType = "DB12" | "DB22" | "V6";
export type AttendanceStatus = "Going" | "Maybe" | "Not Going";

export type EligibilityStatus = "Citizen" | "PR" | "Other";
export const ALL_ELIGIBILITY_STATUSES: EligibilityStatus[] = ["Citizen", "PR", "Other"];

export type AgeRange = "Under 40" | "40-50" | "50-60" | "60+";
export const ALL_AGE_RANGES: AgeRange[] = ["Under 40", "40-50", "50-60", "60+"];

export type CrewTag =
  | "Men's"
  | "Women's"
  | "Mixed"
  | "Opens"
  | "Masters"
  | "Masters 50"
  | "Masters 60"
  | "Masters 70"
  | "Premier Mixed"
  | "Novice";

export const CREW_TAG_GENDER_OPTIONS: CrewTag[] = ["Men's", "Women's", "Mixed"];

export const CREW_TAG_AGE_RANGE_OPTIONS: CrewTag[] = [
  "Opens",
  "Masters",
  "Masters 50",
  "Masters 60",
  "Masters 70",
];

export const CREW_TAG_OTHER_OPTIONS: CrewTag[] = ["Premier Mixed", "Novice"];

export const ALL_CREW_TAGS: CrewTag[] = [
  ...CREW_TAG_GENDER_OPTIONS,
  ...CREW_TAG_AGE_RANGE_OPTIONS,
  ...CREW_TAG_OTHER_OPTIONS,
];

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
  eligibility: EligibilityStatus;
  age_range: AgeRange | null;
  primary_discipline: Discipline;
  preferred_side: PaddleSide;
  is_coach: boolean;
  is_pacer: boolean;
  is_oc_steer: boolean;
  is_db_steer: boolean;
  is_drummer: boolean;
  benchmarks: Benchmarks;
  coaching_feedback: string | null;
  crew_tags: string[];
  created_at: string;
  updated_at: string;
}

export type SessionType = "Training" | "Race Simulation" | "Race";

export interface Session {
  id: string;
  title: string;
  description: string | null;
  session_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  location: string | null;
  discipline: Discipline;
  type: SessionType;
  capacity_limit: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkoutProgram {
  id: string;
  content: string;
  updated_by: string | null;
  updated_at: string;
}

export const SESSION_TYPE_OPTIONS: SessionType[] = [
  "Training",
  "Race Simulation",
  "Race",
];

export type CompetitivenessLevel = "Target Race" | "Participation/Experience Race";

export const ALL_COMPETITIVENESS_LEVELS: CompetitivenessLevel[] = [
  "Target Race",
  "Participation/Experience Race",
];

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
  race_categories: string[];
  competitiveness_level: CompetitivenessLevel;
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

export type CalendarEventCategory =
  | "Race"
  | "Training"
  | "Social"
  | "Meeting"
  | "Holiday"
  | "Deadline"
  | "Other";

export const CALENDAR_EVENT_CATEGORIES: CalendarEventCategory[] = [
  "Race",
  "Training",
  "Social",
  "Meeting",
  "Holiday",
  "Deadline",
  "Other",
];

/**
 * A broader club-calendar entry, distinct from `Race` — most of these are
 * informational (public holidays, membership deadlines, socials, training
 * blocks) rather than races the club is fielding a boat/lineup for. Real
 * races stay in the `Race` table and are merged into the calendar view
 * alongside these, not represented here.
 */
export interface CalendarEvent {
  id: string;
  title: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD, >= start_date
  category: CalendarEventCategory;
  discipline: Discipline | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/** seat id -> paddler id (or null if empty) */
export type SeatingConfiguration = Record<string, string | null>;

export interface Lineup {
  id: string;
  session_id: string | null;
  race_id: string | null;
  title: string;
  boat: BoatType;
  seating_configuration: SeatingConfiguration;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  session_id: string | null;
  race_id: string | null;
  author_id: string;
  body: string;
  created_at: string;
}

export type NotificationAudience = "all" | "coach";

export interface Notification {
  id: string;
  session_id: string | null;
  race_id: string | null;
  order_id: string | null;
  audience: NotificationAudience;
  title: string;
  body: string;
  read_by: string[];
  created_by: string | null;
  created_at: string;
}

/**
 * A link to an external web document (Google Doc/Slides/Form/Sheet, or any
 * other URL) surfaced in the "Team Info" panel. Deliberately link-only —
 * no file storage/upload — so this is just a title/url/description, not a
 * file record.
 */
export interface TeamDocument {
  id: string;
  title: string;
  url: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type ShopOrderStatus = "pending" | "accepted" | "rejected" | "cancelled";
export const ALL_SHOP_ORDER_STATUSES: ShopOrderStatus[] = [
  "pending",
  "accepted",
  "rejected",
  "cancelled",
];

export interface ShopSizeChart {
  id: string;
  name: string;
  image_url: string;
  created_at: string;
}

export interface ShopStyle {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  active: boolean;
  size_chart_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShopStyleSize {
  id: string;
  style_id: string;
  size: string;
  stock_count: number;
  created_at: string;
  updated_at: string;
}

export interface ShopOrder {
  id: string;
  paddler_id: string;
  status: ShopOrderStatus;
  created_at: string;
  updated_at: string;
  decided_at: string | null;
  decided_by: string | null;
}

export interface ShopOrderItem {
  id: string;
  order_id: string;
  style_id: string | null;
  size: string;
  quantity: number;
  style_name_snapshot: string;
  size_snapshot: string;
  created_at: string;
}

/**
 * A client-only cart line — never a DB row until checkout submits it as a
 * real ShopOrderItem. Denormalizes styleName/imageUrl so the cart still
 * renders sensibly if a style is deactivated/edited while items sit in it.
 */
export interface CartLine {
  styleId: string;
  size: string;
  quantity: number;
  styleName: string;
  imageUrl: string | null;
}
