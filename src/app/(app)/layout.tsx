import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { AppFooter } from "@/components/layout/app-footer";

// Shell for every app page (everything except the landing page "/").
// Warm Editorial: clean top bar, roomy content column, ink footer band, phone dock.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-8 sm:px-6 sm:pb-24 sm:pt-12">{children}</main>
      <AppFooter />
      <BottomNav />
    </div>
  );
}
