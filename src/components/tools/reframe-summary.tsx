import { ArrowDown, ArrowRight } from "@/components/icons";
import { GlassSurface } from "@/components/motion/glass-surface";
import { trapLabel } from "@/components/tools/thinking-traps";
import type { ReframeRecord } from "@/lib/local-store";
import { cn } from "@/lib/utils";

/** Read-only "before → after" view of a saved thought record (used after saving and in history). */
export function ReframeSummary({ record, className }: { record: Omit<ReframeRecord, "id" | "date">; className?: string }) {
  return (
    <GlassSurface interactive={false} className={cn("overflow-hidden rounded-[2rem] p-5 sm:p-8", className)}>
      <div className="space-y-6">
        {/* Before */}
        <div className="space-y-2">
          <Label>Before</Label>
          <p className="font-heading text-2xl leading-snug text-muted-foreground">
            <span className="italic">“{record.thought}”</span>
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span>{record.emotion}</span>
            <span className="font-heading text-2xl tabular-nums text-foreground">{record.intensityBefore}</span>
          </div>
        </div>

        {/* connector */}
        <div className="flex items-center gap-3" aria-hidden>
          <span className="h-px flex-1 bg-border" />
          <span className="grid size-9 place-items-center rounded-full bg-accent text-ember">
            <ArrowDown className="size-4" weight="bold" />
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>

        {/* After */}
        <div className="relative overflow-hidden rounded-[1.6rem] bg-accent p-5 sm:p-7">
          <Label className="text-ember">After · balanced thought</Label>
          <p className="mt-2 font-heading text-[1.75rem] italic leading-snug text-foreground sm:text-[2.25rem]">
            {record.balancedThought}
          </p>
          <div className="mt-4 flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">{record.emotion}</span>
            <span className="font-heading text-2xl tabular-nums text-muted-foreground">{record.intensityBefore}</span>
            <ArrowRight className="size-4 text-muted-foreground" weight="bold" aria-label="to" />
            <span className="font-heading text-4xl leading-none tabular-nums text-ember">{record.intensityAfter}</span>
          </div>
        </div>

        {/* Working */}
        <div className="grid gap-5 border-t border-border pt-6 sm:grid-cols-2">
          <Row label="Situation" className="sm:col-span-2">
            {record.situation}
          </Row>
          {record.traps.length > 0 && (
            <Row label="Thinking traps" className="sm:col-span-2">
              <span className="flex flex-wrap gap-1.5">
                {record.traps.map((t) => (
                  <span key={t} className="rounded-full border border-border bg-blush px-3 py-1 text-[13px] font-medium">
                    {trapLabel(t)}
                  </span>
                ))}
              </span>
            </Row>
          )}
          {record.evidenceFor && <Row label="Evidence for">{record.evidenceFor}</Row>}
          {record.evidenceAgainst && <Row label="Evidence against">{record.evidenceAgainst}</Row>}
        </div>
      </div>
    </GlassSurface>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground", className)}>{children}</p>
  );
}

function Row({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label>{label}</Label>
      <div className="whitespace-pre-wrap text-[0.9375rem] leading-relaxed">{children}</div>
    </div>
  );
}
