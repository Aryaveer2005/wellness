import type { Metadata } from "next";
import { HomeDashboard } from "@/components/tools/home-dashboard";

export const metadata: Metadata = {
  title: "Home",
  description: "Your daily check-in and quick tools for confidence and calm.",
};

export default function HomePage() {
  return <HomeDashboard />;
}
