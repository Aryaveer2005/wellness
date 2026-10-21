import { LockSimple } from "@/components/icons";
import { cn } from "@/lib/utils";

/** Accounts are optional — data lives on-device until login/sync exists. */
export function DeviceNote({ className }: { className?: string }) {
  return (
    <p className={cn("flex items-center gap-2 text-[13px] text-muted-foreground", className)}>
      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent text-ember">
        <LockSimple className="size-3.5" aria-hidden />
      </span>
      Saved on this device. Log in to sync (coming soon).
    </p>
  );
}
