"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { fetchAttendance, upsertAttendance } from "@/lib/api/attendance";
import { updateLineupSeating as apiUpdateLineupSeating, createLineup as apiCreateLineup, fetchLineups } from "@/lib/api/lineups";
import { fetchProfiles, updateProfile as apiUpdateProfile } from "@/lib/api/profiles";
import { fetchRaceCommitments, fetchRaces, upsertRaceCommitment } from "@/lib/api/races";
import { createSession as apiCreateSession, fetchSessions, updateSession as apiUpdateSession } from "@/lib/api/sessions";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Session as SupabaseSession } from "@supabase/supabase-js";
import {
  CURRENT_COACH_ID,
  CURRENT_USER_ID,
  MOCK_ATTENDANCE,
  MOCK_LINEUPS,
  MOCK_PROFILES,
  MOCK_RACES,
  MOCK_RACE_COMMITMENTS,
  MOCK_SESSIONS,
} from "@/lib/mock-data";
import type {
  Attendance,
  AttendanceStatus,
  Lineup,
  Profile,
  Race,
  RaceCommitment,
  SeatingConfiguration,
  Session,
} from "@/types";

export type ViewRole = "paddler" | "coach";

interface AppDataValue {
  profiles: Profile[];
  sessions: Session[];
  attendance: Attendance[];
  races: Race[];
  raceCommitments: RaceCommitment[];
  lineups: Lineup[];
  loading: boolean;
  usingLiveBackend: boolean;

  role: ViewRole;
  setRole: (role: ViewRole) => void;
  currentUserId: string;
  currentUser: Profile | undefined;

  rsvpToSession: (sessionId: string, status: AttendanceStatus, paddlerId?: string) => void;
  updateProfile: (id: string, patch: Partial<Profile>) => void;
  updateSession: (id: string, patch: Partial<Session>) => void;
  createSession: (session: Omit<Session, "id" | "created_at" | "updated_at">) => Session;
  updateRaceCommitment: (
    raceId: string,
    paddlerId: string,
    patch: { status?: AttendanceStatus; has_paid?: boolean; notes?: string | null }
  ) => void;
  createLineup: (lineup: Omit<Lineup, "id" | "created_at" | "updated_at">) => Lineup;
  saveLineupSeating: (lineupId: string, seating: SeatingConfiguration) => void;
  attendanceFor: (sessionId: string) => Attendance[];
  attendanceStatusFor: (sessionId: string, paddlerId: string) => AttendanceStatus;
}

const AppDataContext = createContext<AppDataValue | null>(null);

function nowIso() {
  return new Date().toISOString();
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>(MOCK_PROFILES);
  const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS);
  const [attendance, setAttendance] = useState<Attendance[]>(MOCK_ATTENDANCE);
  const [races, setRaces] = useState<Race[]>(MOCK_RACES);
  const [raceCommitments, setRaceCommitments] = useState<RaceCommitment[]>(MOCK_RACE_COMMITMENTS);
  const [lineups, setLineups] = useState<Lineup[]>(MOCK_LINEUPS);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [demoRole, setDemoRole] = useState<ViewRole>("paddler");
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    (async () => {
      try {
        const [p, s, a, r, rc, l] = await Promise.all([
          fetchProfiles(),
          fetchSessions(),
          fetchAttendance(),
          fetchRaces(),
          fetchRaceCommitments(),
          fetchLineups(),
        ]);
        if (cancelled) return;
        if (p) setProfiles(p);
        if (s) setSessions(s);
        if (a) setAttendance(a);
        if (r) setRaces(r);
        if (rc) setRaceCommitments(rc);
        if (l) setLineups(l);
      } catch (err) {
        console.error("Failed to load live Supabase data, staying on mock state:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Real auth replaces the mock role toggle once Supabase is configured:
  // currentUserId comes from the Supabase session instead of a fixed mock ID.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;
    supabase.auth
      .getUser()
      .then(({ data }: { data: { user: { id: string } | null } }) =>
        setAuthUserId(data.user?.id ?? null)
      );
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event: string, session: SupabaseSession | null) => {
        setAuthUserId(session?.user?.id ?? null);
      }
    );
    return () => subscription.subscription.unsubscribe();
  }, []);

  const currentUserId = isSupabaseConfigured
    ? (authUserId ?? "")
    : demoRole === "coach"
      ? CURRENT_COACH_ID
      : CURRENT_USER_ID;
  const currentUser = useMemo(
    () => profiles.find((p) => p.id === currentUserId),
    [profiles, currentUserId]
  );
  const role: ViewRole = isSupabaseConfigured
    ? currentUser?.is_coach
      ? "coach"
      : "paddler"
    : demoRole;
  const setRole = useCallback((r: ViewRole) => {
    if (!isSupabaseConfigured) setDemoRole(r);
  }, []);

  const rsvpToSession = useCallback(
    (sessionId: string, status: AttendanceStatus, paddlerId: string = currentUserId) => {
      setAttendance((prev) => {
        const existing = prev.find(
          (a) => a.session_id === sessionId && a.paddler_id === paddlerId
        );
        if (existing) {
          return prev.map((a) =>
            a === existing ? { ...a, status, updated_at: nowIso() } : a
          );
        }
        return [
          ...prev,
          {
            id: `attendance-${sessionId}-${paddlerId}`,
            session_id: sessionId,
            paddler_id: paddlerId,
            status,
            paddler_notes: null,
            created_at: nowIso(),
            updated_at: nowIso(),
          },
        ];
      });
      if (isSupabaseConfigured) {
        upsertAttendance(sessionId, paddlerId, status).catch((err) =>
          console.error("Failed to sync attendance to Supabase:", err)
        );
      }
    },
    [currentUserId]
  );

  const updateProfile = useCallback((id: string, patch: Partial<Profile>) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch, updated_at: nowIso() } : p))
    );
    if (isSupabaseConfigured) {
      apiUpdateProfile(id, patch).catch((err) =>
        console.error("Failed to sync profile to Supabase:", err)
      );
    }
  }, []);

  const updateSession = useCallback((id: string, patch: Partial<Session>) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch, updated_at: nowIso() } : s))
    );
    if (isSupabaseConfigured) {
      apiUpdateSession(id, patch).catch((err) =>
        console.error("Failed to sync session to Supabase:", err)
      );
    }
  }, []);

  const createSession = useCallback(
    (session: Omit<Session, "id" | "created_at" | "updated_at">) => {
      const newSession: Session = {
        ...session,
        id: `session-${Date.now()}-${crypto.randomUUID()}`,
        created_at: nowIso(),
        updated_at: nowIso(),
      };
      setSessions((prev) => [...prev, newSession]);
      if (isSupabaseConfigured) {
        apiCreateSession(session).catch((err) =>
          console.error("Failed to sync session to Supabase:", err)
        );
      }
      return newSession;
    },
    []
  );

  const updateRaceCommitment = useCallback(
    (
      raceId: string,
      paddlerId: string,
      patch: { status?: AttendanceStatus; has_paid?: boolean; notes?: string | null }
    ) => {
      setRaceCommitments((prev) => {
        const existing = prev.find(
          (c) => c.race_id === raceId && c.paddler_id === paddlerId
        );
        if (existing) {
          return prev.map((c) =>
            c === existing ? { ...c, ...patch, updated_at: nowIso() } : c
          );
        }
        return [
          ...prev,
          {
            id: `commitment-${raceId}-${paddlerId}`,
            race_id: raceId,
            paddler_id: paddlerId,
            status: patch.status ?? "Unconfirmed",
            has_paid: patch.has_paid ?? false,
            notes: patch.notes ?? null,
            created_at: nowIso(),
            updated_at: nowIso(),
          },
        ];
      });
      if (isSupabaseConfigured) {
        upsertRaceCommitment(raceId, paddlerId, patch).catch((err) =>
          console.error("Failed to sync race commitment to Supabase:", err)
        );
      }
    },
    []
  );

  const createLineup = useCallback(
    (lineup: Omit<Lineup, "id" | "created_at" | "updated_at">) => {
      const newLineup: Lineup = {
        ...lineup,
        id: `lineup-${Date.now()}`,
        created_at: nowIso(),
        updated_at: nowIso(),
      };
      setLineups((prev) => [...prev, newLineup]);
      if (isSupabaseConfigured) {
        apiCreateLineup(lineup).catch((err) =>
          console.error("Failed to sync lineup to Supabase:", err)
        );
      }
      return newLineup;
    },
    []
  );

  const saveLineupSeating = useCallback((lineupId: string, seating: SeatingConfiguration) => {
    setLineups((prev) =>
      prev.map((l) =>
        l.id === lineupId
          ? { ...l, seating_configuration: seating, updated_at: nowIso() }
          : l
      )
    );
    if (isSupabaseConfigured) {
      apiUpdateLineupSeating(lineupId, seating).catch((err) =>
        console.error("Failed to sync lineup seating to Supabase:", err)
      );
    }
  }, []);

  const attendanceFor = useCallback(
    (sessionId: string) => attendance.filter((a) => a.session_id === sessionId),
    [attendance]
  );

  const attendanceStatusFor = useCallback(
    (sessionId: string, paddlerId: string): AttendanceStatus =>
      attendance.find((a) => a.session_id === sessionId && a.paddler_id === paddlerId)
        ?.status ?? "Unconfirmed",
    [attendance]
  );

  const value: AppDataValue = {
    profiles,
    sessions,
    attendance,
    races,
    raceCommitments,
    lineups,
    loading,
    usingLiveBackend: isSupabaseConfigured,
    role,
    setRole,
    currentUserId,
    currentUser,
    rsvpToSession,
    updateProfile,
    updateSession,
    createSession,
    updateRaceCommitment,
    createLineup,
    saveLineupSeating,
    attendanceFor,
    attendanceStatusFor,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
