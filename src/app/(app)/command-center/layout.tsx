import { RequireCoach } from "@/components/auth/RequireCoach";

export default function CommandCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireCoach>{children}</RequireCoach>;
}
