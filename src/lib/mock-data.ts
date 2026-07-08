import type {
  Attendance,
  Lineup,
  Profile,
  Race,
  RaceCommitment,
  Session,
} from "@/types";

const now = new Date().toISOString();

const FIRST_NAMES = [
  "Mia", "Liam", "Ava", "Noah", "Zoe", "Ethan", "Grace", "Kai", "Luna", "Owen",
  "Nora", "Finn", "Lena", "Theo", "Ruby", "Jack", "Isla", "Sam", "Priya", "Marco",
  "Yuki", "Alex", "Tess", "Reid", "Nadia", "Cole", "Ivy", "Dario", "Wren", "Hana",
];
const LAST_INITIALS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function makeProfile(i: number): Profile {
  const name = `${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_INITIALS[i % LAST_INITIALS.length]}.`;
  const sides = ["Left", "Right", "Ambi"] as const;
  const disciplines = ["DB", "OC", "Both"] as const;
  const crewTagPool = ["Premier Mixed", "Women", "Men", "Masters"];
  return {
    id: `paddler-${i}`,
    full_name: name,
    weight_kg: 58 + ((i * 7) % 40),
    is_pr_or_citizen: i % 4 !== 0,
    primary_discipline: disciplines[i % disciplines.length],
    preferred_side: sides[i % sides.length],
    is_coach: i === 0,
    is_stroke: i % 9 === 0,
    is_steer: i % 11 === 0,
    is_drummer: i % 13 === 0,
    benchmarks: {
      erg_2k_seconds: 420 + (i % 60),
      erg_500m_seconds: 95 + (i % 20),
    },
    coaching_feedback:
      i % 3 === 0
        ? "Focus on early catch and vertical paddle angle — great power phase last session."
        : i % 3 === 1
          ? "Keep hips square through the rotation, watch for over-reaching on the catch."
          : "Excellent stroke rate consistency. Work on relaxing grip during recovery.",
    crew_tags: [crewTagPool[i % crewTagPool.length]],
    created_at: now,
    updated_at: now,
  };
}

export const MOCK_PROFILES: Profile[] = Array.from({ length: 28 }, (_, i) => makeProfile(i));

export const CURRENT_USER_ID = "paddler-3";
export const CURRENT_COACH_ID = "paddler-0";

function toDateString(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

export const MOCK_SESSIONS: Session[] = [
  {
    id: "session-1",
    title: "AM Sprint Technique",
    description: "Focus on high-cadence starts and race-pace intervals.",
    session_date: toDateString(1),
    start_time: "06:00",
    discipline: "DB",
    type: "Practice",
    capacity_limit: 22,
    workout_program:
      "## Warm-up\n- 15 min easy paddle\n\n## Main Set\n- 6x250m @ race pace, 2 min rest\n\n## Cool-down\n- 10 min easy paddle + stretch",
    created_by: CURRENT_COACH_ID,
    created_at: now,
    updated_at: now,
  },
  {
    id: "session-2",
    title: "OC Endurance Paddle",
    description: "Long steady-state paddle for aerobic base.",
    session_date: toDateString(2),
    start_time: "17:30",
    discipline: "OC",
    type: "Practice",
    capacity_limit: 6,
    workout_program:
      "## Main Set\n- 90 min continuous paddle, HR zone 2\n- Rotate steer every 20 min",
    created_by: CURRENT_COACH_ID,
    created_at: now,
    updated_at: now,
  },
  {
    id: "session-3",
    title: "Race Simulation",
    description: "Full 500m race simulation with lineup testing.",
    session_date: toDateString(4),
    start_time: "07:00",
    discipline: "Both",
    type: "Race Prep",
    capacity_limit: 22,
    workout_program:
      "## Main Set\n- 3x500m full race simulation\n- Lineup rotations between reps",
    created_by: CURRENT_COACH_ID,
    created_at: now,
    updated_at: now,
  },
  {
    id: "session-4",
    title: "Recovery & Mobility",
    description: "Light technical paddle plus mobility circuit.",
    session_date: toDateString(6),
    start_time: "09:00",
    discipline: "DB",
    type: "Recovery",
    capacity_limit: 22,
    workout_program: "## Main Set\n- 40 min easy technical paddle\n- 20 min mobility circuit",
    created_by: CURRENT_COACH_ID,
    created_at: now,
    updated_at: now,
  },
];

const STATUS_CYCLE: Attendance["status"][] = ["Attending", "Attending", "Attending", "Unconfirmed", "Absent", "Waitlist"];

export const MOCK_ATTENDANCE: Attendance[] = MOCK_SESSIONS.flatMap((session, sIdx) =>
  MOCK_PROFILES.map((paddler, pIdx) => ({
    id: `attendance-${session.id}-${paddler.id}`,
    session_id: session.id,
    paddler_id: paddler.id,
    status: STATUS_CYCLE[(pIdx + sIdx) % STATUS_CYCLE.length],
    paddler_notes: pIdx % 7 === 0 ? "Running 10 min late." : null,
    created_at: now,
    updated_at: now,
  }))
);

export const MOCK_RACES: Race[] = [
  {
    id: "race-1",
    name: "Summer Dragon Boat Regatta",
    location: "Lake Union",
    description: "Premier Mixed & Women's divisions, 500m sprint format.",
    discipline: "DB",
    race_date: toDateString(18),
    registration_deadline: toDateString(10),
    created_by: CURRENT_COACH_ID,
    created_at: now,
    updated_at: now,
  },
  {
    id: "race-2",
    name: "Coastal OC6 Distance Cup",
    location: "Harbor Point",
    description: "12km distance race, open division.",
    discipline: "OC",
    race_date: toDateString(35),
    registration_deadline: toDateString(21),
    created_by: CURRENT_COACH_ID,
    created_at: now,
    updated_at: now,
  },
];

export const MOCK_RACE_COMMITMENTS: RaceCommitment[] = MOCK_RACES.flatMap((race, rIdx) =>
  MOCK_PROFILES.map((paddler, pIdx) => ({
    id: `commitment-${race.id}-${paddler.id}`,
    race_id: race.id,
    paddler_id: paddler.id,
    status: STATUS_CYCLE[(pIdx + rIdx) % STATUS_CYCLE.length],
    has_paid: (pIdx + rIdx) % 3 === 0,
    notes: null,
    created_at: now,
    updated_at: now,
  }))
);

export const MOCK_LINEUPS: Lineup[] = [
  {
    id: "lineup-1",
    session_id: "session-3",
    title: "Race Sim A Crew",
    boat: "DB22",
    seating_configuration: {},
    created_by: CURRENT_COACH_ID,
    created_at: now,
    updated_at: now,
  },
];
