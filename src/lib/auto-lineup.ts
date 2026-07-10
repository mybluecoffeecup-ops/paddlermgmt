import { getBalanceGroups, type BoatLayout } from "@/lib/boat-config";
import type { Profile, SeatingConfiguration } from "@/types";

/**
 * Bulk-fills every currently-empty seat with a bench paddler, never
 * disturbing a seat that's already occupied. Crew-role seats (drummer,
 * steer, pacer) are placed first using the same role-priority as
 * `autoAssignSeat` (the single-paddler bench-click heuristic in
 * `auto-assign-seat.ts`, left untouched). Remaining paddling seats are
 * filled by greedily assigning the heaviest remaining paddler to whichever
 * balance group (Left/Right, or Odd/Even for V6 — same groups
 * `getBalanceGroups` gives the Live Balance bar) currently has the lower
 * running weight, so the result tracks toward `WEIGHT_IMBALANCE_WARNING_KG`
 * rather than just matching role/side.
 */
export function autoFillLineup(
  benchPaddlers: Profile[],
  layout: BoatLayout,
  seating: SeatingConfiguration,
  profileById: Map<string, Profile>
): SeatingConfiguration {
  const next: SeatingConfiguration = { ...seating };
  const isEmpty = (seatId: string) => !next[seatId];
  let remainingBench = [...benchPaddlers];

  const assignRole = (
    seat: { id: string } | undefined,
    matches: (p: Profile) => boolean
  ) => {
    if (!seat || !isEmpty(seat.id)) return;
    const paddler = remainingBench.find(matches);
    if (!paddler) return;
    next[seat.id] = paddler.id;
    remainingBench = remainingBench.filter((p) => p.id !== paddler.id);
  };

  const crewSeats = layout.seats.filter((s) => s.isCrewRole);
  assignRole(
    crewSeats.find((s) => s.id === "drummer"),
    (p) => p.is_drummer
  );
  assignRole(
    crewSeats.find((s) => s.label.toLowerCase().includes("steer")),
    (p) => (layout.boat === "V6" ? p.is_oc_steer : p.is_db_steer)
  );
  if (layout.boat === "V6") {
    assignRole(
      layout.seats.find((s) => s.label.includes("Pacer")),
      (p) => p.is_pacer
    );
  }

  const paddlingSeats = layout.seats.filter((s) => !s.isCrewRole);
  const groups = getBalanceGroups(layout);
  const weight = (paddlerId: string | null) =>
    paddlerId ? profileById.get(paddlerId)?.weight_kg ?? 0 : 0;

  let sumA = groups.seatIdsA.reduce((sum, id) => sum + weight(next[id] ?? null), 0);
  let sumB = groups.seatIdsB.reduce((sum, id) => sum + weight(next[id] ?? null), 0);

  const sortedBench = [...remainingBench].sort(
    (a, b) => (b.weight_kg ?? 0) - (a.weight_kg ?? 0)
  );

  const sideOk = (seatId: string, paddler: Profile) => {
    if (layout.boat === "V6") return true;
    const seat = paddlingSeats.find((s) => s.id === seatId);
    return (
      !seat ||
      paddler.preferred_side === "Ambi" ||
      seat.side === "Single" ||
      seat.side === paddler.preferred_side
    );
  };

  for (const paddler of sortedBench) {
    const preferredGroup: "A" | "B" = sumA <= sumB ? "A" : "B";
    const groupSeatIds = preferredGroup === "A" ? groups.seatIdsA : groups.seatIdsB;
    const otherSeatIds = preferredGroup === "A" ? groups.seatIdsB : groups.seatIdsA;

    const candidateIn = (seatIds: string[]) =>
      seatIds.find((id) => isEmpty(id) && sideOk(id, paddler));

    const chosenSeatId =
      candidateIn(groupSeatIds) ??
      candidateIn(otherSeatIds) ??
      paddlingSeats.map((s) => s.id).find((id) => isEmpty(id));

    if (!chosenSeatId) continue;

    next[chosenSeatId] = paddler.id;
    const chosenInPreferredGroup = groupSeatIds.includes(chosenSeatId);
    const chosenGroup: "A" | "B" = chosenInPreferredGroup
      ? preferredGroup
      : preferredGroup === "A"
        ? "B"
        : "A";
    if (chosenGroup === "A") {
      sumA += paddler.weight_kg ?? 0;
    } else {
      sumB += paddler.weight_kg ?? 0;
    }
  }

  return next;
}
