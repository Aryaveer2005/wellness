import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { NearbyPsychiatrists } from "@/components/psychologists/nearby-psychiatrists";
import { Directory } from "@/components/psychologists/directory";

export const metadata: Metadata = {
  title: "Find a professional",
  description: "Find a psychiatrist near you or browse psychologists who can help.",
};

export default function PsychologistsPage() {
  return (
    <div className="flex flex-col gap-16 pb-32 sm:gap-24 md:pb-12">
      {/* The page title sits inside the periwinkle search band (hero). */}
      <NearbyPsychiatrists
        header={
          <PageHeader
            eyebrow="Find a professional"
            title={
              <>
                Real support, <span className="italic text-ember">when you want it</span>
              </>
            }
            description="Find a well-reviewed psychiatrist nearby, or browse psychologists you can talk to online or in person."
            className="mb-0 sm:mb-0"
          />
        }
      />
      <Directory />
    </div>
  );
}
