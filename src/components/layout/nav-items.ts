import { House, Sparkle, Brain, ChatsCircle, Stethoscope, ChartLineUp, GearSix, Info } from "@/components/icons";

// Main navigation (docs/PROJECT_SPEC.md §3): Home, Confidence, Reframe, Chat, More.
export const primaryNav = [
  { href: "/home", label: "Home", icon: House },
  { href: "/confidence", label: "Confidence", icon: Sparkle },
  { href: "/reframe", label: "Reframe", icon: Brain },
  { href: "/chat", label: "Chat", icon: ChatsCircle },
] as const;

// "More" menu → Psychologists, Progress, Settings, About.
export const moreNav = [
  { href: "/psychologists", label: "Find a professional", icon: Stethoscope },
  { href: "/progress", label: "My progress", icon: ChartLineUp },
  { href: "/settings", label: "Settings", icon: GearSix },
  { href: "/about", label: "About", icon: Info },
] as const;
