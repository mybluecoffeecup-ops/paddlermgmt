import { RequireCoach } from "@/components/auth/RequireCoach";

export default function LineupsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireCoach>{children}</RequireCoach>;
}
