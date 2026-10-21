import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { SettingsView } from "@/components/account/settings-view";

export const metadata: Metadata = {
  title: "Settings",
  description: "Your name, theme, chat privacy, and full control over your data.",
};

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        eyebrow="Settings"
        title={
          <>
            Your space, <span className="italic text-ember">your rules</span>
          </>
        }
        description="Change how EaseMind looks and what it keeps."
      />
      <SettingsView />
    </div>
  );
}
