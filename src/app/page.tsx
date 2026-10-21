import { LandingTopBar } from "@/components/landing/landing-top-bar";
import { LandingHero } from "@/components/landing/landing-hero";
import { ToolCards } from "@/components/landing/tool-cards";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Different } from "@/components/landing/different";
import { SupportBand } from "@/components/landing/support-band";
import { LandingFooter } from "@/components/landing/landing-footer";

// Landing page (PROJECT_SPEC.md §3) — "Warm Editorial" bands (docs/DESIGN.md §4):
// peach hero + thoughts rail → tools → periwinkle how-it-works → different → blush support → disclaimer → ink footer.
export default function LandingPage() {
  return (
    <div className="relative min-h-dvh overflow-x-clip">
      <LandingTopBar />
      <main>
        <LandingHero />
        <ToolCards />
        <HowItWorks />
        <Different />
        <SupportBand />
      </main>
      <LandingFooter />
    </div>
  );
}
