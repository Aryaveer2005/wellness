import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowSquareOut, Devices, Info, MapPin, SealCheck, Translate, Wallet } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Reveal3D } from "@/components/motion/reveal-3d";
import { SplitHeading } from "@/components/motion/split-heading";
import { formatFee, getPsychologist, modeLabel, psychologists } from "@/components/psychologists/data";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return psychologists.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = getPsychologist(id);
  return { title: p ? p.name : "Professional not found" };
}

export default async function PsychologistProfilePage({ params }: Props) {
  const { id } = await params;
  const p = getPsychologist(id);
  if (!p) notFound();

  const details = [
    { icon: MapPin, label: "City", value: p.city },
    { icon: Translate, label: "Languages", value: p.languages.join(", ") },
    { icon: Devices, label: "Sessions", value: p.modes.map((m) => modeLabel[m]).join(" · ") },
    {
      icon: Wallet,
      label: "Fee per session",
      value: p.placeholder ? `${formatFee(p)} — ${p.feeNote}` : formatFee(p),
    },
    { icon: SealCheck, label: "Qualifications", value: p.credentials },
    { icon: SealCheck, label: "Registration", value: p.registration },
  ];

  const initials = p.name
    .replace(/^(Dr\.?|Mr\.?|Ms\.?|Mrs\.?)\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-32 md:pb-12">
      <Link
        href="/psychologists"
        className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-foreground/70 px-4 text-sm font-medium transition-colors hover:bg-foreground/[0.05]"
      >
        <ArrowLeft className="size-4" weight="bold" aria-hidden />
        <span>All professionals</span>
      </Link>

      {p.placeholder && (
        <div role="note" className="band-blush flex items-start gap-3 rounded-2xl px-4 py-3.5 text-sm">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-card text-ember">
            <Info className="size-4" aria-hidden />
          </span>
          <p className="self-center leading-relaxed">
            <strong>Sample listing</strong> — owner will add verified professionals. This is a placeholder, not a real
            person.
          </p>
        </div>
      )}

      <Reveal3D immediate delay={0.1} tilt={6}>
        <div className="liquid-glass overflow-hidden rounded-[2rem]">
          <article className="flex flex-col">
            <header className="band-periwinkle flex flex-col items-center gap-5 px-6 pb-8 pt-10 text-center sm:px-10">
              <span
                aria-hidden
                className="grid size-32 shrink-0 place-items-center rounded-full border-[1.5px] border-foreground bg-card p-1.5"
              >
                <span className="grid size-full place-items-center rounded-full bg-[color-mix(in_oklab,var(--foreground)_8%,var(--card))] font-display text-5xl text-foreground">
                  {initials}
                </span>
              </span>
              <div className="flex min-w-0 flex-col items-center gap-2">
                <SplitHeading
                  as="h1"
                  immediate
                  className="text-[2.5rem] leading-[1.02] sm:text-6xl"
                >
                  {p.name}
                </SplitHeading>
                <p className="text-muted-foreground">{p.title}</p>
              </div>
            </header>

            <div className="flex flex-col gap-8 p-6 sm:p-10">
            <div className="flex flex-wrap gap-2">
              {p.specialties.map((s) => (
                <span key={s} className="rounded-full bg-accent px-3 py-1 text-[13px] font-medium text-accent-foreground">
                  {s}
                </span>
              ))}
            </div>

            <p className="text-[1.0625rem] leading-relaxed">{p.about}</p>

            <dl className="grid gap-3 sm:grid-cols-2">
              {details.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3 rounded-2xl bg-blush p-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-card text-ember">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 self-center">
                    <dt className="text-[12px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{label}</dt>
                    <dd className="mt-0.5 break-words text-sm">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>

            <div className="flex flex-col gap-3 border-t border-border pt-6">
              <Button asChild size="lg" className="w-full text-base sm:w-fit">
                <a href={p.bookingUrl} target="_blank" rel="noopener noreferrer">
                  Visit / Book <ArrowSquareOut aria-hidden />
                </a>
              </Button>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Opens their own website in a new tab. EaseMind doesn&apos;t handle bookings or payments.
                {p.placeholder && ` (${p.bookingNote})`}
              </p>
            </div>
            </div>
          </article>
        </div>
      </Reveal3D>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Listings aren&apos;t an endorsement by EaseMind. Always check credentials (e.g. RCI / NMC registration) before
        booking.
      </p>
    </div>
  );
}
