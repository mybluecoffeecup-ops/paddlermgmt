"use client";

import { Ship } from "lucide-react";

import { SeatSlot } from "@/components/lineup/SeatSlot";
import type { BoatLayout } from "@/lib/boat-config";
import type { Profile, SeatingConfiguration } from "@/types";

export function BoatCanvas({
  layout,
  seating,
  profileById,
}: {
  layout: BoatLayout;
  seating: SeatingConfiguration;
  profileById: Map<string, Profile>;
}) {
  const occupantFor = (seatId: string): Profile | null => {
    const paddlerId = seating[seatId];
    return paddlerId ? profileById.get(paddlerId) ?? null : null;
  };

  const isDragonBoat = layout.boat !== "V6";
  const rows = isDragonBoat
    ? Math.max(...layout.seats.filter((s) => !s.isCrewRole).map((s) => s.row))
    : 0;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 dark:border-white/10">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300">
          <Ship size={16} />
        </div>
        <div>
          <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
            The Boat
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{layout.name}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isDragonBoat ? (
          <div className="mx-auto flex max-w-sm flex-col gap-1.5">
            <SeatSlot
              seat={layout.seats.find((s) => s.id === "drummer")!}
              occupant={occupantFor("drummer")}
            />
            {Array.from({ length: rows }, (_, i) => i + 1).map((row) => (
              <div key={row} className="grid grid-cols-[1.5rem_1fr_1fr] items-center gap-1.5">
                <span className="text-center text-[10px] font-bold text-slate-300 dark:text-white/20">
                  {row}
                </span>
                <SeatSlot seat={layout.seats.find((s) => s.id === `${row}L`)!} occupant={occupantFor(`${row}L`)} />
                <SeatSlot seat={layout.seats.find((s) => s.id === `${row}R`)!} occupant={occupantFor(`${row}R`)} />
              </div>
            ))}
            <SeatSlot
              seat={layout.seats.find((s) => s.id === "steer")!}
              occupant={occupantFor("steer")}
            />
          </div>
        ) : (
          <div className="mx-auto flex max-w-xs flex-col gap-1.5">
            {layout.seats.map((seat) => (
              <SeatSlot key={seat.id} seat={seat} occupant={occupantFor(seat.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
