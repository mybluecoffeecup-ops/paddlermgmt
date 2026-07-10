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
import {
  createCalendarEvent as apiCreateCalendarEvent,
  deleteCalendarEvent as apiDeleteCalendarEvent,
  fetchCalendarEvents,
  updateCalendarEvent as apiUpdateCalendarEvent,
} from "@/lib/api/calendar-events";
import { createComment as apiCreateComment, deleteComment as apiDeleteComment, fetchComments } from "@/lib/api/comments";
import {
  createLineup as apiCreateLineup,
  fetchLineups,
  updateLineupBoat as apiUpdateLineupBoat,
  updateLineupSeating as apiUpdateLineupSeating,
} from "@/lib/api/lineups";
import { getBoatLayout } from "@/lib/boat-config";
import {
  createNotification as apiCreateNotification,
  fetchNotifications,
  markNotificationRead as apiMarkNotificationRead,
} from "@/lib/api/notifications";
import { fetchProfiles, updateProfile as apiUpdateProfile } from "@/lib/api/profiles";
import {
  createRace as apiCreateRace,
  fetchRaceCommitments,
  fetchRaces,
  updateRace as apiUpdateRace,
  upsertRaceCommitment,
} from "@/lib/api/races";
import { createSession as apiCreateSession, fetchSessions, updateSession as apiUpdateSession } from "@/lib/api/sessions";
import {
  acceptShopOrder as apiAcceptShopOrder,
  createShopOrder as apiCreateShopOrder,
  createShopSizeChart as apiCreateShopSizeChart,
  createShopStyle as apiCreateShopStyle,
  createShopStyleSize as apiCreateShopStyleSize,
  deleteShopStyleSize as apiDeleteShopStyleSize,
  fetchShopOrderItems,
  fetchShopOrders,
  fetchShopSizeCharts,
  fetchShopStyleSizes,
  fetchShopStyles,
  replaceShopOrderItems as apiReplaceShopOrderItems,
  updateShopOrder as apiUpdateShopOrder,
  updateShopStyle as apiUpdateShopStyle,
  updateShopStyleSize as apiUpdateShopStyleSize,
} from "@/lib/api/shop";
import {
  createTeamDocument as apiCreateTeamDocument,
  deleteTeamDocument as apiDeleteTeamDocument,
  fetchTeamDocuments,
  updateTeamDocument as apiUpdateTeamDocument,
} from "@/lib/api/team-documents";
import { fetchWorkoutProgram, upsertWorkoutProgram as apiUpsertWorkoutProgram } from "@/lib/api/workout-program";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Session as SupabaseSession } from "@supabase/supabase-js";
import {
  CURRENT_COACH_ID,
  CURRENT_USER_ID,
  MOCK_ATTENDANCE,
  MOCK_CALENDAR_EVENTS,
  MOCK_COMMENTS,
  MOCK_LINEUPS,
  MOCK_NOTIFICATIONS,
  MOCK_PROFILES,
  MOCK_RACES,
  MOCK_RACE_COMMITMENTS,
  MOCK_SESSIONS,
  MOCK_SHOP_ORDER_ITEMS,
  MOCK_SHOP_ORDERS,
  MOCK_SHOP_SIZE_CHARTS,
  MOCK_SHOP_STYLE_SIZES,
  MOCK_SHOP_STYLES,
  MOCK_TEAM_DOCUMENTS,
  MOCK_WORKOUT_PROGRAM,
} from "@/lib/mock-data";
import type {
  Attendance,
  AttendanceStatus,
  BoatType,
  CalendarEvent,
  CartLine,
  Comment,
  Lineup,
  Notification,
  NotificationAudience,
  Profile,
  Race,
  RaceCommitment,
  SeatingConfiguration,
  Session,
  ShopOrder,
  ShopOrderItem,
  ShopSizeChart,
  ShopStyle,
  ShopStyleSize,
  TeamDocument,
  WorkoutProgram,
} from "@/types";

export type ViewRole = "paddler" | "coach";

interface AppDataValue {
  profiles: Profile[];
  sessions: Session[];
  attendance: Attendance[];
  races: Race[];
  raceCommitments: RaceCommitment[];
  calendarEvents: CalendarEvent[];
  lineups: Lineup[];
  comments: Comment[];
  notifications: Notification[];
  teamDocuments: TeamDocument[];
  shopStyles: ShopStyle[];
  shopStyleSizes: ShopStyleSize[];
  shopSizeCharts: ShopSizeChart[];
  shopOrders: ShopOrder[];
  shopOrderItems: ShopOrderItem[];
  workoutProgram: WorkoutProgram | null;
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
  createRace: (race: Omit<Race, "id" | "created_at" | "updated_at">) => Race;
  updateRace: (id: string, patch: Partial<Race>) => void;
  createCalendarEvent: (
    event: Omit<CalendarEvent, "id" | "created_at" | "updated_at">
  ) => CalendarEvent;
  updateCalendarEvent: (id: string, patch: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;
  updateRaceCommitment: (
    raceId: string,
    paddlerId: string,
    patch: { status?: AttendanceStatus; has_paid?: boolean; notes?: string | null }
  ) => void;
  createLineup: (lineup: Omit<Lineup, "id" | "created_at" | "updated_at">) => Lineup;
  saveLineupSeating: (lineupId: string, seating: SeatingConfiguration) => void;
  updateLineupBoat: (lineupId: string, boat: BoatType) => void;
  attendanceFor: (sessionId: string) => Attendance[];
  attendanceStatusFor: (sessionId: string, paddlerId: string) => AttendanceStatus;
  lineupsFor: (params: { sessionId?: string; raceId?: string }) => Lineup[];
  commentsFor: (params: { sessionId?: string; raceId?: string }) => Comment[];
  createComment: (comment: Omit<Comment, "id" | "created_at">) => void;
  deleteComment: (id: string) => void;
  createTeamDocument: (
    document: Omit<TeamDocument, "id" | "created_at" | "updated_at">
  ) => TeamDocument;
  updateTeamDocument: (id: string, patch: Partial<TeamDocument>) => void;
  deleteTeamDocument: (id: string) => void;
  createShopStyle: (style: Omit<ShopStyle, "id" | "created_at" | "updated_at">) => ShopStyle;
  updateShopStyle: (id: string, patch: Partial<ShopStyle>) => void;
  createShopStyleSize: (
    entry: Omit<ShopStyleSize, "id" | "created_at" | "updated_at">
  ) => ShopStyleSize;
  updateShopStyleSize: (id: string, patch: Partial<ShopStyleSize>) => void;
  deleteShopStyleSize: (id: string) => void;
  createShopSizeChart: (chart: Omit<ShopSizeChart, "id" | "created_at">) => ShopSizeChart;
  shopOrderItemsFor: (orderId: string) => ShopOrderItem[];
  submitShopOrder: (lines: CartLine[]) => Promise<ShopOrder>;
  updateShopOrderItems: (orderId: string, lines: CartLine[]) => void;
  cancelShopOrder: (id: string) => void;
  rejectShopOrder: (id: string) => void;
  acceptShopOrder: (
    orderId: string
  ) => Promise<{ ok: true; order: ShopOrder } | { ok: false; error: string }>;
  notifyAll: (
    title: string,
    body: string,
    target: { sessionId?: string; raceId?: string; orderId?: string }
  ) => void;
  markNotificationRead: (id: string) => void;
  updateWorkoutProgram: (content: string) => void;
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
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(MOCK_CALENDAR_EVENTS);
  const [lineups, setLineups] = useState<Lineup[]>(MOCK_LINEUPS);
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [teamDocuments, setTeamDocuments] = useState<TeamDocument[]>(MOCK_TEAM_DOCUMENTS);
  const [shopStyles, setShopStyles] = useState<ShopStyle[]>(MOCK_SHOP_STYLES);
  const [shopStyleSizes, setShopStyleSizes] = useState<ShopStyleSize[]>(MOCK_SHOP_STYLE_SIZES);
  const [shopSizeCharts, setShopSizeCharts] = useState<ShopSizeChart[]>(MOCK_SHOP_SIZE_CHARTS);
  const [shopOrders, setShopOrders] = useState<ShopOrder[]>(MOCK_SHOP_ORDERS);
  const [shopOrderItems, setShopOrderItems] = useState<ShopOrderItem[]>(MOCK_SHOP_ORDER_ITEMS);
  const [workoutProgram, setWorkoutProgram] = useState<WorkoutProgram | null>(
    MOCK_WORKOUT_PROGRAM
  );
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [demoRole, setDemoRole] = useState<ViewRole>("paddler");
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    (async () => {
      try {
        const [p, s, a, r, rc, ce, l, cm, n, wp, td, ss, ssz, ssc, so, soi] = await Promise.all([
          fetchProfiles(),
          fetchSessions(),
          fetchAttendance(),
          fetchRaces(),
          fetchRaceCommitments(),
          fetchCalendarEvents(),
          fetchLineups(),
          fetchComments(),
          fetchNotifications(),
          fetchWorkoutProgram(),
          fetchTeamDocuments(),
          fetchShopStyles(),
          fetchShopStyleSizes(),
          fetchShopSizeCharts(),
          fetchShopOrders(),
          fetchShopOrderItems(),
        ]);
        if (cancelled) return;
        if (p) setProfiles(p);
        if (s) setSessions(s);
        if (a) setAttendance(a);
        if (r) setRaces(r);
        if (rc) setRaceCommitments(rc);
        if (ce) setCalendarEvents(ce);
        if (l) setLineups(l);
        if (cm) setComments(cm);
        if (n) setNotifications(n);
        if (wp) setWorkoutProgram(wp);
        if (td) setTeamDocuments(td);
        if (ss) setShopStyles(ss);
        if (ssz) setShopStyleSizes(ssz);
        if (ssc) setShopSizeCharts(ssc);
        if (so) setShopOrders(so);
        if (soi) setShopOrderItems(soi);
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

  const createRace = useCallback(
    (race: Omit<Race, "id" | "created_at" | "updated_at">) => {
      const newRace: Race = {
        ...race,
        id: `race-${Date.now()}-${crypto.randomUUID()}`,
        created_at: nowIso(),
        updated_at: nowIso(),
      };
      setRaces((prev) => [...prev, newRace]);
      if (isSupabaseConfigured) {
        apiCreateRace(race).catch((err) =>
          console.error("Failed to sync race to Supabase:", err)
        );
      }
      return newRace;
    },
    []
  );

  const updateRace = useCallback((id: string, patch: Partial<Race>) => {
    setRaces((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch, updated_at: nowIso() } : r))
    );
    if (isSupabaseConfigured) {
      apiUpdateRace(id, patch).catch((err) =>
        console.error("Failed to sync race to Supabase:", err)
      );
    }
  }, []);

  const createCalendarEvent = useCallback(
    (event: Omit<CalendarEvent, "id" | "created_at" | "updated_at">) => {
      const newEvent: CalendarEvent = {
        ...event,
        id: `calendar-event-${Date.now()}-${crypto.randomUUID()}`,
        created_at: nowIso(),
        updated_at: nowIso(),
      };
      setCalendarEvents((prev) => [...prev, newEvent]);
      if (isSupabaseConfigured) {
        apiCreateCalendarEvent(event).catch((err) =>
          console.error("Failed to sync calendar event to Supabase:", err)
        );
      }
      return newEvent;
    },
    []
  );

  const updateCalendarEvent = useCallback((id: string, patch: Partial<CalendarEvent>) => {
    setCalendarEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...patch, updated_at: nowIso() } : e))
    );
    if (isSupabaseConfigured) {
      apiUpdateCalendarEvent(id, patch).catch((err) =>
        console.error("Failed to sync calendar event to Supabase:", err)
      );
    }
  }, []);

  const deleteCalendarEvent = useCallback((id: string) => {
    setCalendarEvents((prev) => prev.filter((e) => e.id !== id));
    if (isSupabaseConfigured) {
      apiDeleteCalendarEvent(id).catch((err) =>
        console.error("Failed to sync calendar event deletion to Supabase:", err)
      );
    }
  }, []);

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
            status: patch.status ?? "Maybe",
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

  const updateLineupBoat = useCallback(
    (lineupId: string, boat: BoatType) => {
      setLineups((prev) =>
        prev.map((l) => {
          if (l.id !== lineupId) return l;
          const validSeatIds = new Set(getBoatLayout(boat).seats.map((s) => s.id));
          const prunedSeating: SeatingConfiguration = Object.fromEntries(
            Object.entries(l.seating_configuration).filter(([seatId]) => validSeatIds.has(seatId))
          );
          if (isSupabaseConfigured) {
            apiUpdateLineupBoat(lineupId, boat, prunedSeating).catch((err) =>
              console.error("Failed to sync lineup boat change to Supabase:", err)
            );
          }
          return { ...l, boat, seating_configuration: prunedSeating, updated_at: nowIso() };
        })
      );
    },
    []
  );

  const attendanceFor = useCallback(
    (sessionId: string) => attendance.filter((a) => a.session_id === sessionId),
    [attendance]
  );

  const attendanceStatusFor = useCallback(
    (sessionId: string, paddlerId: string): AttendanceStatus =>
      attendance.find((a) => a.session_id === sessionId && a.paddler_id === paddlerId)
        ?.status ?? "Maybe",
    [attendance]
  );

  const lineupsFor = useCallback(
    ({ sessionId, raceId }: { sessionId?: string; raceId?: string }) =>
      lineups.filter((l) =>
        sessionId ? l.session_id === sessionId : raceId ? l.race_id === raceId : false
      ),
    [lineups]
  );

  const commentsFor = useCallback(
    ({ sessionId, raceId }: { sessionId?: string; raceId?: string }) =>
      comments.filter((c) =>
        sessionId ? c.session_id === sessionId : raceId ? c.race_id === raceId : false
      ),
    [comments]
  );

  const createComment = useCallback(
    (comment: Omit<Comment, "id" | "created_at">) => {
      const newComment: Comment = {
        ...comment,
        id: `comment-${Date.now()}-${crypto.randomUUID()}`,
        created_at: nowIso(),
      };
      setComments((prev) => [...prev, newComment]);
      if (isSupabaseConfigured) {
        apiCreateComment(comment).catch((err) =>
          console.error("Failed to sync comment to Supabase:", err)
        );
      }
    },
    []
  );

  const deleteComment = useCallback((id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
    if (isSupabaseConfigured) {
      apiDeleteComment(id).catch((err) =>
        console.error("Failed to sync comment deletion to Supabase:", err)
      );
    }
  }, []);

  const createTeamDocument = useCallback(
    (document: Omit<TeamDocument, "id" | "created_at" | "updated_at">) => {
      const newDocument: TeamDocument = {
        ...document,
        id: `team-document-${Date.now()}-${crypto.randomUUID()}`,
        created_at: nowIso(),
        updated_at: nowIso(),
      };
      setTeamDocuments((prev) => [...prev, newDocument]);
      if (isSupabaseConfigured) {
        apiCreateTeamDocument(document).catch((err) =>
          console.error("Failed to sync team document to Supabase:", err)
        );
      }
      return newDocument;
    },
    []
  );

  const updateTeamDocument = useCallback((id: string, patch: Partial<TeamDocument>) => {
    setTeamDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...patch, updated_at: nowIso() } : d))
    );
    if (isSupabaseConfigured) {
      apiUpdateTeamDocument(id, patch).catch((err) =>
        console.error("Failed to sync team document to Supabase:", err)
      );
    }
  }, []);

  const deleteTeamDocument = useCallback((id: string) => {
    setTeamDocuments((prev) => prev.filter((d) => d.id !== id));
    if (isSupabaseConfigured) {
      apiDeleteTeamDocument(id).catch((err) =>
        console.error("Failed to sync team document deletion to Supabase:", err)
      );
    }
  }, []);

  const notifyAll = useCallback(
    (
      title: string,
      body: string,
      target: { sessionId?: string; raceId?: string; orderId?: string }
    ) => {
      const audience: NotificationAudience = target.orderId ? "coach" : "all";
      const notification: Omit<Notification, "id" | "created_at" | "read_by"> = {
        title,
        body,
        session_id: target.sessionId ?? null,
        race_id: target.raceId ?? null,
        order_id: target.orderId ?? null,
        audience,
        created_by: currentUserId,
      };
      const newNotification: Notification = {
        ...notification,
        id: `notification-${Date.now()}-${crypto.randomUUID()}`,
        read_by: [],
        created_at: nowIso(),
      };
      setNotifications((prev) => [newNotification, ...prev]);
      if (isSupabaseConfigured) {
        apiCreateNotification(notification).catch((err) =>
          console.error("Failed to sync notification to Supabase:", err)
        );
      }
    },
    [currentUserId]
  );

  const markNotificationRead = useCallback(
    (id: string) => {
      setNotifications((prev) =>
        prev.map((n) => {
          if (n.id !== id || n.read_by.includes(currentUserId)) return n;
          const readBy = [...n.read_by, currentUserId];
          if (isSupabaseConfigured) {
            apiMarkNotificationRead(id, readBy).catch((err) =>
              console.error("Failed to sync notification read state to Supabase:", err)
            );
          }
          return { ...n, read_by: readBy };
        })
      );
    },
    [currentUserId]
  );

  const updateWorkoutProgram = useCallback(
    (content: string) => {
      setWorkoutProgram((prev) => ({
        id: prev?.id ?? "00000000-0000-0000-0000-000000000001",
        content,
        updated_by: currentUserId,
        updated_at: nowIso(),
      }));
      if (isSupabaseConfigured) {
        apiUpsertWorkoutProgram(content, currentUserId).catch((err) =>
          console.error("Failed to sync workout program to Supabase:", err)
        );
      }
    },
    [currentUserId]
  );

  const createShopStyle = useCallback(
    (style: Omit<ShopStyle, "id" | "created_at" | "updated_at">) => {
      const newStyle: ShopStyle = {
        ...style,
        id: `shop-style-${Date.now()}-${crypto.randomUUID()}`,
        created_at: nowIso(),
        updated_at: nowIso(),
      };
      setShopStyles((prev) => [...prev, newStyle]);
      if (isSupabaseConfigured) {
        apiCreateShopStyle(style).catch((err) =>
          console.error("Failed to sync shop style to Supabase:", err)
        );
      }
      return newStyle;
    },
    []
  );

  const updateShopStyle = useCallback((id: string, patch: Partial<ShopStyle>) => {
    setShopStyles((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch, updated_at: nowIso() } : s))
    );
    if (isSupabaseConfigured) {
      apiUpdateShopStyle(id, patch).catch((err) =>
        console.error("Failed to sync shop style to Supabase:", err)
      );
    }
  }, []);

  const createShopStyleSize = useCallback(
    (entry: Omit<ShopStyleSize, "id" | "created_at" | "updated_at">) => {
      const newSize: ShopStyleSize = {
        ...entry,
        id: `shop-size-${Date.now()}-${crypto.randomUUID()}`,
        created_at: nowIso(),
        updated_at: nowIso(),
      };
      setShopStyleSizes((prev) => [...prev, newSize]);
      if (isSupabaseConfigured) {
        apiCreateShopStyleSize(entry).catch((err) =>
          console.error("Failed to sync shop style size to Supabase:", err)
        );
      }
      return newSize;
    },
    []
  );

  const updateShopStyleSize = useCallback((id: string, patch: Partial<ShopStyleSize>) => {
    setShopStyleSizes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch, updated_at: nowIso() } : s))
    );
    if (isSupabaseConfigured) {
      apiUpdateShopStyleSize(id, patch).catch((err) =>
        console.error("Failed to sync shop style size to Supabase:", err)
      );
    }
  }, []);

  const deleteShopStyleSize = useCallback((id: string) => {
    setShopStyleSizes((prev) => prev.filter((s) => s.id !== id));
    if (isSupabaseConfigured) {
      apiDeleteShopStyleSize(id).catch((err) =>
        console.error("Failed to sync shop style size deletion to Supabase:", err)
      );
    }
  }, []);

  const createShopSizeChart = useCallback((chart: Omit<ShopSizeChart, "id" | "created_at">) => {
    const newChart: ShopSizeChart = {
      ...chart,
      id: `shop-size-chart-${Date.now()}-${crypto.randomUUID()}`,
      created_at: nowIso(),
    };
    setShopSizeCharts((prev) => [...prev, newChart]);
    if (isSupabaseConfigured) {
      apiCreateShopSizeChart(chart).catch((err) =>
        console.error("Failed to sync size chart to Supabase:", err)
      );
    }
    return newChart;
  }, []);

  const shopOrderItemsFor = useCallback(
    (orderId: string) => shopOrderItems.filter((i) => i.order_id === orderId),
    [shopOrderItems]
  );

  // Deviation from this file's usual optimistic-then-fire-and-forget
  // pattern: the coach notification can only be inserted once the order
  // row is actually committed (the RLS insert policy on notifications
  // requires the referenced order to already exist and belong to the
  // caller), so this awaits the Supabase insert before notifying.
  const submitShopOrder = useCallback(
    async (lines: CartLine[]) => {
      const newOrder: ShopOrder = {
        id: `shop-order-${Date.now()}-${crypto.randomUUID()}`,
        paddler_id: currentUserId,
        status: "pending",
        created_at: nowIso(),
        updated_at: nowIso(),
        decided_at: null,
        decided_by: null,
      };
      const newItems: ShopOrderItem[] = lines.map((l) => ({
        id: `shop-order-item-${Date.now()}-${crypto.randomUUID()}`,
        order_id: newOrder.id,
        style_id: l.styleId,
        size: l.size,
        quantity: l.quantity,
        style_name_snapshot: l.styleName,
        size_snapshot: l.size,
        created_at: nowIso(),
      }));
      setShopOrders((prev) => [newOrder, ...prev]);
      setShopOrderItems((prev) => [...prev, ...newItems]);

      const notifyBody = `${currentUser?.full_name ?? "A paddler"} submitted an order (${
        lines.length
      } item${lines.length === 1 ? "" : "s"}).`;

      if (isSupabaseConfigured) {
        try {
          const created = await apiCreateShopOrder(
            { paddler_id: currentUserId, status: "pending" },
            newItems.map(
              ({ style_id, size, quantity, style_name_snapshot, size_snapshot }) => ({
                style_id,
                size,
                quantity,
                style_name_snapshot,
                size_snapshot,
              })
            )
          );
          if (created) notifyAll("New shop order", notifyBody, { orderId: created.id });
        } catch (err) {
          console.error("Failed to sync shop order to Supabase:", err);
        }
      } else {
        notifyAll("New shop order", notifyBody, { orderId: newOrder.id });
      }
      return newOrder;
    },
    [currentUserId, currentUser, notifyAll]
  );

  const updateShopOrderItems = useCallback((orderId: string, lines: CartLine[]) => {
    const newItems: ShopOrderItem[] = lines.map((l) => ({
      id: `shop-order-item-${Date.now()}-${crypto.randomUUID()}`,
      order_id: orderId,
      style_id: l.styleId,
      size: l.size,
      quantity: l.quantity,
      style_name_snapshot: l.styleName,
      size_snapshot: l.size,
      created_at: nowIso(),
    }));
    setShopOrderItems((prev) => [...prev.filter((i) => i.order_id !== orderId), ...newItems]);
    if (isSupabaseConfigured) {
      apiReplaceShopOrderItems(
        orderId,
        newItems.map(({ style_id, size, quantity, style_name_snapshot, size_snapshot }) => ({
          style_id,
          size,
          quantity,
          style_name_snapshot,
          size_snapshot,
        }))
      ).catch((err) => console.error("Failed to sync shop order item edits to Supabase:", err));
    }
  }, []);

  const cancelShopOrder = useCallback(
    (id: string) => {
      setShopOrders((prev) =>
        prev.map((o) =>
          o.id === id
            ? {
                ...o,
                status: "cancelled",
                decided_by: currentUserId,
                decided_at: nowIso(),
                updated_at: nowIso(),
              }
            : o
        )
      );
      if (isSupabaseConfigured) {
        apiUpdateShopOrder(id, {
          status: "cancelled",
          decided_by: currentUserId,
          decided_at: nowIso(),
        }).catch((err) => console.error("Failed to sync order cancellation to Supabase:", err));
      }
    },
    [currentUserId]
  );

  const rejectShopOrder = useCallback(
    (id: string) => {
      setShopOrders((prev) =>
        prev.map((o) =>
          o.id === id
            ? {
                ...o,
                status: "rejected",
                decided_by: currentUserId,
                decided_at: nowIso(),
                updated_at: nowIso(),
              }
            : o
        )
      );
      if (isSupabaseConfigured) {
        apiUpdateShopOrder(id, {
          status: "rejected",
          decided_by: currentUserId,
          decided_at: nowIso(),
        }).catch((err) => console.error("Failed to sync order rejection to Supabase:", err));
      }
    },
    [currentUserId]
  );

  // Deviation from this file's usual optimistic pattern: accepting is a
  // genuinely fallible operation (insufficient stock) the coach needs to
  // see fail, so this is awaited and non-optimistic rather than
  // fire-and-forget. The mock-mode branch replicates the accept_shop_order
  // RPC's exact all-or-nothing stock check so behavior matches whether or
  // not Supabase is configured.
  const acceptShopOrder = useCallback(
    async (
      orderId: string
    ): Promise<{ ok: true; order: ShopOrder } | { ok: false; error: string }> => {
      if (isSupabaseConfigured) {
        const { order, error } = await apiAcceptShopOrder(orderId);
        if (error || !order) {
          return { ok: false, error: error ?? "Failed to accept order" };
        }
        setShopOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
        const sizes = await fetchShopStyleSizes();
        if (sizes) setShopStyleSizes(sizes);
        return { ok: true, order };
      }

      const order = shopOrders.find((o) => o.id === orderId);
      if (!order) return { ok: false, error: "Order not found" };
      if (order.status !== "pending") {
        return { ok: false, error: `Order is not pending (current status: ${order.status})` };
      }
      const items = shopOrderItems.filter((i) => i.order_id === orderId);
      for (const item of items) {
        if (!item.style_id) continue;
        const sizeRow = shopStyleSizes.find(
          (s) => s.style_id === item.style_id && s.size === item.size
        );
        if (!sizeRow || sizeRow.stock_count < item.quantity) {
          return {
            ok: false,
            error: `Insufficient stock for ${item.style_name_snapshot} (size ${item.size})`,
          };
        }
      }
      setShopStyleSizes((prev) =>
        prev.map((s) => {
          const item = items.find((i) => i.style_id === s.style_id && i.size === s.size);
          return item
            ? { ...s, stock_count: s.stock_count - item.quantity, updated_at: nowIso() }
            : s;
        })
      );
      const updated: ShopOrder = {
        ...order,
        status: "accepted",
        decided_by: currentUserId,
        decided_at: nowIso(),
        updated_at: nowIso(),
      };
      setShopOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      return { ok: true, order: updated };
    },
    [shopOrders, shopOrderItems, shopStyleSizes, currentUserId]
  );

  const value: AppDataValue = {
    profiles,
    sessions,
    attendance,
    races,
    raceCommitments,
    calendarEvents,
    lineups,
    comments,
    notifications,
    teamDocuments,
    shopStyles,
    shopStyleSizes,
    shopSizeCharts,
    shopOrders,
    shopOrderItems,
    workoutProgram,
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
    createRace,
    updateRace,
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    updateRaceCommitment,
    createLineup,
    saveLineupSeating,
    updateLineupBoat,
    attendanceFor,
    attendanceStatusFor,
    lineupsFor,
    commentsFor,
    createComment,
    deleteComment,
    createTeamDocument,
    updateTeamDocument,
    deleteTeamDocument,
    createShopStyle,
    updateShopStyle,
    createShopStyleSize,
    updateShopStyleSize,
    deleteShopStyleSize,
    createShopSizeChart,
    shopOrderItemsFor,
    submitShopOrder,
    updateShopOrderItems,
    cancelShopOrder,
    rejectShopOrder,
    acceptShopOrder,
    notifyAll,
    markNotificationRead,
    updateWorkoutProgram,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
