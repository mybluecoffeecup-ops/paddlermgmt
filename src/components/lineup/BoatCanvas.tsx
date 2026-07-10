"use client";

import { Ship } from "lucide-react";

import { SeatSlot } from "@/components/lineup/SeatSlot";
import { Card, CardHeader } from "@/components/ui/Card";
import type { BoatLayout } from "@/lib/boat-config";
import type { Profile, SeatingConfiguration } from "@/types";

export function BoatCanvas({
  layout,
  seating,
  profileById,
  onSeatClick,
}: {
  layout: BoatLayout;
  seating: SeatingConfiguration;
  profileById: Map<string, Profile>;
  onSeatClick?: (seatId: string) => void;
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
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader title="The Boat" subtitle={layout.name} icon={<Ship size={16} />} />

      <div className="flex-1 overflow-y-auto p-4">
        {isDragonBoat ? (
          <div className="mx-auto flex max-w-sm flex-col gap-1.5">
            <div className="grid grid-cols-[1.5rem_1fr_1fr] items-center gap-1.5">
              <span />
              <div className="col-span-2 mx-auto w-1/2">
                <SeatSlot
                  seat={layout.seats.find((s) => s.id === "drummer")!}
                  occupant={occupantFor("drummer")}
                  onOccupantClick={() => onSeatClick?.("drummer")}
                />
              </div>
            </div>
            {Array.from({ length: rows }, (_, i) => i + 1).map((row) => (
              <div key={row} className="grid grid-cols-[1.5rem_1fr_1fr] items-center gap-1.5">
                <span className="text-center font-display text-sm font-bold tabular-nums text-slate-600 dark:text-slate-300">
                  {row}
                </span>
                <SeatSlot
                  seat={layout.seats.find((s) => s.id === `${row}L`)!}
                  occupant={occupantFor(`${row}L`)}
                  onOccupantClick={() => onSeatClick?.(`${row}L`)}
                />
                <SeatSlot
                  seat={layout.seats.find((s) => s.id === `${row}R`)!}
                  occupant={occupantFor(`${row}R`)}
                  onOccupantClick={() => onSeatClick?.(`${row}R`)}
                />
              </div>
            ))}
            <div className="grid grid-cols-[1.5rem_1fr_1fr] items-center gap-1.5">
              <span />
              <div className="col-span-2 mx-auto w-1/2">
                <SeatSlot
                  seat={layout.seats.find((s) => s.id === "steer")!}
                  occupant={occupantFor("steer")}
                  onOccupantClick={() => onSeatClick?.("steer")}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-xs flex-col gap-1.5">
            {layout.seats.map((seat) => (
              <SeatSlot
                key={seat.id}
                seat={seat}
                occupant={occupantFor(seat.id)}
                onOccupantClick={() => onSeatClick?.(seat.id)}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
