import type { Metadata } from "next";
import { StartFlow } from "@/components/tools/start-flow";

export const metadata: Metadata = {
  title: "Quick start",
  description: "Get set up in under a minute — private and judgement-free.",
};

export default function StartPage() {
  return <StartFlow />;
}
