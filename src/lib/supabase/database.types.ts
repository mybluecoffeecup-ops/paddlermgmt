// Hand-written Supabase Database type, mirroring supabase/migrations/0001_init.sql.
// Regenerate with `supabase gen types typescript` once the project is linked.

import type {
  Attendance,
  Lineup,
  Profile,
  Race,
  RaceCommitment,
  Session,
} from "@/types";

type TableDef<Row> = {
  Row: Row;
  Insert: Partial<Row> & Record<string, unknown>;
  Update: Partial<Row>;
};

export interface Database {
  public: {
    Tables: {
      profiles: TableDef<Profile>;
      sessions: TableDef<Session>;
      attendance: TableDef<Attendance>;
      races: TableDef<Race>;
      race_commitments: TableDef<RaceCommitment>;
      lineups: TableDef<Lineup>;
    };
    Enums: {
      discipline_type: "DB" | "OC" | "Both";
      paddle_side: "Left" | "Right" | "Ambi";
      boat_type: "DB12" | "DB22" | "V6";
      attendance_status: "Unconfirmed" | "Attending" | "Absent" | "Waitlist";
      eligibility_status: "Citizen" | "PR" | "Other";
      age_range: "Under 40" | "40-50" | "50-60" | "60+";
    };
  };
}
