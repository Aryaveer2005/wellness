import type { Metadata } from "next";
import { ConfidenceBuilder } from "@/components/tools/confidence-builder";

export const metadata: Metadata = {
  title: "60-Second Confidence Builder",
  description: "Breathe, stand tall and steady yourself before a date, interview or meeting.",
};

export default function ConfidencePage() {
  return <ConfidenceBuilder />;
}
