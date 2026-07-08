import { AppDataProvider } from "@/hooks/app-data";
import { AppShell } from "@/components/nav/AppShell";

export default function AppGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppDataProvider>
      <AppShell>{children}</AppShell>
    </AppDataProvider>
  );
}
