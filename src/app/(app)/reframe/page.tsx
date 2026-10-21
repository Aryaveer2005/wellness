import type { Metadata } from "next";
import { Reframer } from "@/components/tools/reframer";

export const metadata: Metadata = {
  title: "Thought Reframer",
  description: "A step-by-step CBT thought record to untangle a harsh thought.",
};

export default function ReframePage() {
  return <Reframer />;
}
