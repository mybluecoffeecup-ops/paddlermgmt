"use client";

import { useEffect, useState } from "react";
import { getCountdown, type Countdown } from "@/lib/utils";

export function useCountdown(targetDateStr: string): Countdown {
  const [countdown, setCountdown] = useState<Countdown>(() => getCountdown(targetDateStr));

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getCountdown(targetDateStr));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDateStr]);

  return countdown;
}
