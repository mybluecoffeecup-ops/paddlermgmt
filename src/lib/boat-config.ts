import type { BoatType } from "@/types";

export type SeatSide = "Left" | "Right" | "Single";

export interface SeatDefinition {
  id: string;
  label: string;
  row: number;
  side: SeatSide;
  /** true for drummer / steersperson roles, excluded from paddling weight balance */
  isCrewRole?: boolean;
}

export interface BoatLayout {
  boat: BoatType;
  name: string;
  paddlerSeatCount: number;
  seats: SeatDefinition[];
}

function dragonBoatLayout(boat: "DB12" | "DB22", rows: number): BoatLayout {
  const seats: SeatDefinition[] = [
    { id: "drummer", label: "Drummer", row: 0, side: "Single", isCrewRole: true },
  ];
  for (let row = 1; row <= rows; row++) {
    seats.push({ id: `${row}L`, label: `${row}L`, row, side: "Left" });
    seats.push({ id: `${row}R`, label: `${row}R`, row, side: "Right" });
  }
  seats.push({
    id: "steer",
    label: "Steer",
    row: rows + 1,
    side: "Single",
    isCrewRole: true,
  });
  return {
    boat,
    name: boat === "DB12" ? "Small Dragon Boat (DB12)" : "Dragon Boat (DB22)",
    paddlerSeatCount: rows * 2,
    seats,
  };
}

function outriggerLayout(): BoatLayout {
  const labels = ["Stroke", "2", "3", "4", "5", "Steer"];
  const seats: SeatDefinition[] = labels.map((label, i) => ({
    id: `${i + 1}`,
    label: `${i + 1} · ${label}`,
    row: i + 1,
    side: "Single" as SeatSide,
    isCrewRole: label === "Steer",
  }));
  return {
    boat: "V6",
    name: "Outrigger Six (V6)",
    paddlerSeatCount: 6,
    seats,
  };
}

export const BOAT_LAYOUTS: Record<BoatType, BoatLayout> = {
  DB12: dragonBoatLayout("DB12", 6),
  DB22: dragonBoatLayout("DB22", 11),
  V6: outriggerLayout(),
};

export function getBoatLayout(boat: BoatType): BoatLayout {
  return BOAT_LAYOUTS[boat];
}

export const WEIGHT_IMBALANCE_WARNING_KG = 15;

export interface BalanceGroups {
  labelA: string;
  labelB: string;
  seatIdsA: string[];
  seatIdsB: string[];
}

/**
 * Splits paddling (non-crew-role) seats into two comparison groups for the
 * weight-balance telemetry widget: Left vs Right for dragon boats, and
 * Bow vs Stern for the single-file outrigger six.
 */
export function getBalanceGroups(layout: BoatLayout): BalanceGroups {
  if (layout.boat === "V6") {
    const paddlingSeats = layout.seats.filter((s) => !s.isCrewRole);
    const mid = Math.ceil(paddlingSeats.length / 2);
    return {
      labelA: "Bow",
      labelB: "Stern",
      seatIdsA: paddlingSeats.slice(0, mid).map((s) => s.id),
      seatIdsB: paddlingSeats.slice(mid).map((s) => s.id),
    };
  }
  return {
    labelA: "Left",
    labelB: "Right",
    seatIdsA: layout.seats.filter((s) => s.side === "Left").map((s) => s.id),
    seatIdsB: layout.seats.filter((s) => s.side === "Right").map((s) => s.id),
  };
}
