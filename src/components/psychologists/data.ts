import raw from "@/data/psychologists.json";

export type Mode = "online" | "in-person";

export type Psychologist = {
  id: string;
  placeholder: boolean;
  name: string;
  title: string;
  credentials: string;
  registration: string;
  city: string;
  languages: string[];
  modes: Mode[];
  feeMin: number;
  feeMax: number;
  feeNote: string;
  specialties: string[];
  about: string;
  bookingUrl: string;
  bookingNote: string;
};

export const psychologists = raw as Psychologist[];

export function getPsychologist(id: string): Psychologist | undefined {
  return psychologists.find((p) => p.id === id);
}

export const modeLabel: Record<Mode, string> = { online: "Online", "in-person": "In person" };

export function formatFee(p: Psychologist): string {
  const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  return p.feeMin === p.feeMax ? inr(p.feeMin) : `${inr(p.feeMin)}–${inr(p.feeMax)}`;
}
