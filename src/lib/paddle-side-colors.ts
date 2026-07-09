import type { PaddleSide } from "@/types";

export const PADDLE_SIDE_COLORS: Record<PaddleSide, { dot: string; border: string; label: string }> = {
  Left: { dot: "bg-rose-500", border: "border-l-rose-500", label: "Prefers Left" },
  Right: { dot: "bg-blue-500", border: "border-l-blue-500", label: "Prefers Right" },
  Ambi: { dot: "bg-violet-500", border: "border-l-violet-500", label: "Ambidextrous" },
};
