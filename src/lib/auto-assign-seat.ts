import type { BoatLayout } from "@/lib/boat-config";
import type { Profile, SeatingConfiguration } from "@/types";

/**
 * Picks the best-fit empty seat for a bench paddler: their crew role seat
 * first, then their preferred side, then any open paddling seat as a
 * fallback so a click always does something rather than silently no-op.
 * Returns null only when the boat is completely full.
 */
export function autoAssignSeat(
  paddler: Profile,
  layout: BoatLayout,
  seating: SeatingConfiguration
): string | null {
  const isEmpty = (seatId: string) => !seating[seatId];

  const crewSeats = layout.seats.filter((s) => s.isCrewRole);

  const drummerSeat = crewSeats.find((s) => s.id === "drummer");
  if (drummerSeat && paddler.is_drummer && isEmpty(drummerSeat.id)) {
    return drummerSeat.id;
  }

  const steerSeat = crewSeats.find((s) => s.label.toLowerCase().includes("steer"));
  const isSteerForBoat = layout.boat === "V6" ? paddler.is_oc_steer : paddler.is_db_steer;
  if (steerSeat && isSteerForBoat && isEmpty(steerSeat.id)) {
    return steerSeat.id;
  }

  if (layout.boat === "V6" && paddler.is_pacer) {
    const pacerSeat = layout.seats.find((s) => s.label.includes("Pacer"));
    if (pacerSeat && isEmpty(pacerSeat.id)) {
      return pacerSeat.id;
    }
  }

  const paddlingSeats = layout.seats.filter((s) => !s.isCrewRole).sort((a, b) => a.row - b.row);

  const sideMatch = paddlingSeats.find(
    (s) =>
      isEmpty(s.id) &&
      (paddler.preferred_side === "Ambi" || s.side === "Single" || s.side === paddler.preferred_side)
  );
  if (sideMatch) return sideMatch.id;

  const anyEmpty = paddlingSeats.find((s) => isEmpty(s.id));
  return anyEmpty ? anyEmpty.id : null;
}
