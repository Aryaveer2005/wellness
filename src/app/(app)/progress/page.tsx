import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ProgressView } from "@/components/tools/progress-view";

export const metadata: Metadata = {
  title: "My progress",
  description: "Your mood trend, confidence change and reframes over time.",
};

export default function ProgressPage() {
  return (
    <>
      <PageHeader
        eyebrow="Progress"
        title={<>My <span className="italic text-ember">progress</span></>}
        description="Not a scoreboard — just a quiet look at how you've been showing up."
      />
      <ProgressView />
    </>
  );
}
