"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAppData } from "@/hooks/app-data";

export function RequireCoach({ children }: { children: React.ReactNode }) {
  const { role, loading, currentUser } = useAppData();
  const router = useRouter();
  const resolved = !loading && currentUser !== undefined;

  useEffect(() => {
    if (resolved && role !== "coach") {
      router.replace("/");
    }
  }, [resolved, role, router]);

  if (!resolved || role !== "coach") return null;

  return <>{children}</>;
}
