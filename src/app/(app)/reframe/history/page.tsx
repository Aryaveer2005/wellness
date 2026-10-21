import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { ReframeHistory } from "@/components/tools/reframe-history";

export const metadata: Metadata = {
  title: "My reframes",
  description: "Your saved thought records.",
};

export default function ReframeHistoryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Thought Reframer"
        title={
          <>
            My <span className="italic text-ember">reframes</span>
          </>
        }
        description="Every one of these is a time you questioned a harsh thought instead of just believing it."
        className="mx-auto w-full max-w-2xl"
      >
        <div>
          <Button asChild size="lg">
            <Link href="/reframe">
              <Plus weight="bold" /> New reframe
            </Link>
          </Button>
        </div>
      </PageHeader>
      <ReframeHistory />
    </>
  );
}
