import { cn } from "@/lib/utils";
import { SplitHeading } from "@/components/motion/split-heading";
import { Reveal3D } from "@/components/motion/reveal-3d";

/** Editorial page title: ember eyebrow with a hairline, big airy serif headline (word reveal), calm intro. */
export function PageHeader({
  eyebrow,
  title,
  description,
  className,
  children,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("mb-12 flex flex-col gap-5 sm:mb-16", className)}>
      {eyebrow && (
        <Reveal3D immediate tilt={0}>
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-ember">
            <span aria-hidden className="h-px w-8 bg-ember" />
            {eyebrow}
          </p>
        </Reveal3D>
      )}
      <SplitHeading as="h1" immediate className="max-w-4xl text-[2.75rem] leading-[1.02] sm:text-6xl lg:text-7xl">
        {title}
      </SplitHeading>
      {description && (
        <Reveal3D immediate delay={0.25} tilt={0}>
          <p className="max-w-2xl text-[1.0625rem] leading-relaxed text-muted-foreground sm:text-xl sm:leading-relaxed">{description}</p>
        </Reveal3D>
      )}
      {children}
    </div>
  );
}
