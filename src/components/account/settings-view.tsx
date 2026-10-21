"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  CaretRight,
  ChatCircleDots,
  DownloadSimple,
  Monitor,
  Moon,
  Palette,
  SignIn,
  SignOut,
  SpeakerHigh,
  Sun,
  Trash,
  UserCircle,
  type AppIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Reveal3D } from "@/components/motion/reveal-3d";
import { store } from "@/lib/local-store";
import { isSoundOn, setSoundOn, sound } from "@/lib/sound";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { clearSavedChat, getSavedChat } from "@/components/chat/chat-storage";
import { cn } from "@/lib/utils";

/** iOS-settings style group: small caps title, a white card of rows, optional footnote. */
function Group({ title, footer, children }: { title: string; footer?: string; children: React.ReactNode }) {
  return (
    <section data-reveal aria-label={title}>
      <h2 className="mb-3 px-5 font-sans text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{title}</h2>
      <div className="liquid-glass overflow-hidden rounded-3xl">
        <div className="divide-y divide-border">
          {children}
        </div>
      </div>
      {footer && <p className="mt-2.5 px-5 text-[13px] leading-relaxed text-muted-foreground">{footer}</p>}
    </section>
  );
}

/** A coloured icon chip like iOS Settings, in calm EaseMind tones. */
function Chip({ icon: Icon, tone = "primary" }: { icon: AppIcon; tone?: "primary" | "amber" | "neutral" }) {
  return (
    <span
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-full",
        tone === "primary" && "bg-accent text-ember",
        tone === "amber" && "bg-ember text-amber-foreground",
        tone === "neutral" && "bg-muted text-foreground"
      )}
    >
      <Icon className="size-5" weight="duotone" aria-hidden />
    </span>
  );
}

const rowBase = "flex min-h-16 items-center gap-4 px-4 py-3.5 sm:px-5";

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function SettingsView() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [saveChat, setSaveChat] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [soundsOn, setSoundsOn] = useState(true);

  function toggleSounds(on: boolean) {
    setSoundsOn(on);
    setSoundOn(on);
    if (on) sound.complete(); // a little preview of what you'll hear
  }

  useEffect(() => {
    const p = store.getProfile();
    setName(p.name ?? "");
    setSaveChat(!!p.saveChatHistory);
    setSoundsOn(isSoundOn());
    setMounted(true);
    getSupabaseBrowserClient()
      ?.auth.getUser()
      .then(({ data }) => setUserEmail(data.user?.email ?? null));
  }, []);

  function saveName(e: React.FormEvent) {
    e.preventDefault();
    store.setProfile({ name: name.trim() || undefined });
    toast.success("Name saved");
  }

  function toggleSaveChat(on: boolean) {
    setSaveChat(on);
    store.setProfile({ saveChatHistory: on });
    if (!on) clearSavedChat();
    toast.success(on ? "Chats will be saved on this device" : "Saved chats removed from this device");
  }

  function downloadData() {
    const data = { ...store.exportAll(), chatHistory: getSavedChat() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `show-up-data-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function deleteData() {
    store.clearAll();
    clearSavedChat({ includeSession: true });
    setName("");
    setSaveChat(false);
    setConfirmDelete(false);
    toast.success("Your data has been deleted from this device");
  }

  async function logOut() {
    await getSupabaseBrowserClient()?.auth.signOut();
    setUserEmail(null);
    toast.success("You're logged out");
  }

  const themeIndex = mounted ? THEMES.findIndex((t) => t.value === theme) : -1;

  return (
    <Reveal3D className="flex flex-col gap-10" stagger={0.09} tilt={6}>
      {/* Profile */}
      <Group title="Profile" footer="Used only to greet you. Stays on this device.">
        <form onSubmit={saveName} className={cn(rowBase, "flex-wrap sm:flex-nowrap")}>
          <Chip icon={UserCircle} />
          <div className="flex min-w-[12rem] flex-1 flex-col gap-1">
            <Label htmlFor="name" className="text-[0.9375rem] font-medium">
              Your name
            </Label>
            <Input
              id="name"
              value={name}
              maxLength={40}
              autoComplete="given-name"
              placeholder="What should we call you?"
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 h-11"
            />
          </div>
          <Button type="submit" className="ml-14 self-end sm:ml-0">
            Save
          </Button>
        </form>
      </Group>

      {/* Appearance */}
      <Group title="Appearance">
        <div className={cn(rowBase, "flex-col items-stretch gap-3.5 sm:flex-row sm:items-center")}>
          <div className="flex items-center gap-4">
            <Chip icon={Palette} />
            <span id="theme-label" className="text-[0.9375rem] font-medium">
              Theme
            </span>
          </div>
          <div
            role="radiogroup"
            aria-labelledby="theme-label"
            className="relative grid grid-cols-3 rounded-full bg-muted p-1 sm:ml-auto sm:w-80"
          >
            <span
              aria-hidden
              className={cn(
                "pointer-events-none absolute top-1 bottom-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-full bg-card shadow-[0_2px_8px_-3px_rgba(0,0,0,0.2)] transition-[transform,opacity] duration-700 ease-[var(--ease-glass)]",
                mounted && themeIndex >= 0 ? "opacity-100" : "opacity-0"
              )}
              style={{ transform: `translateX(${Math.max(themeIndex, 0) * 100}%)` }}
            />
            {THEMES.map(({ value, label, icon: Icon }) => {
              const active = mounted && theme === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setTheme(value)}
                  className={cn(
                    "relative z-[1] flex min-h-11 items-center justify-center gap-1.5 rounded-full px-2 text-sm font-medium transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-ring",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className={cn("size-[1.1rem]", active && "text-ember")} weight={active ? "fill" : "duotone"} aria-hidden />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </Group>

      {/* Sound */}
      <Group title="Sound" footer="Soft ticks while numbers count up and gentle tones as progress bars fill. Stored on this device.">
        <div className={rowBase}>
          <Chip icon={SpeakerHigh} />
          <Label htmlFor="sounds" className="flex-1 text-[0.9375rem] font-medium leading-snug">
            Sound effects
          </Label>
          <Switch id="sounds" checked={soundsOn} onCheckedChange={toggleSounds} disabled={!mounted} />
        </div>
      </Group>

      {/* Privacy */}
      <Group title="Privacy" footer="Off: chats disappear when you close the tab. On: chats are kept on this device only.">
        <div className={rowBase}>
          <Chip icon={ChatCircleDots} />
          <Label htmlFor="save-chat" className="flex-1 text-[0.9375rem] font-medium leading-snug">
            Save chat history
          </Label>
          <Switch id="save-chat" checked={saveChat} onCheckedChange={toggleSaveChat} disabled={!mounted} />
        </div>
      </Group>

      {/* Your data */}
      <Group title="Your data" footer="Everything EaseMind stores lives on this device. You're in control.">
        <button
          type="button"
          onClick={downloadData}
          className={cn(rowBase, "w-full text-left transition-colors duration-300 hover:bg-muted/60 focus-visible:bg-muted focus-visible:outline-none")}
        >
          <Chip icon={DownloadSimple} />
          <span className="flex-1 text-[0.9375rem] font-medium">Download my data (JSON)</span>
          <CaretRight className="size-4 text-muted-foreground" weight="bold" aria-hidden />
        </button>

        {!confirmDelete ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className={cn(rowBase, "w-full text-left transition-colors duration-300 hover:bg-muted/60 focus-visible:bg-muted focus-visible:outline-none")}
          >
            <Chip icon={Trash} tone="neutral" />
            <span className="flex-1 text-[0.9375rem] font-medium">Delete my data</span>
            <CaretRight className="size-4 text-muted-foreground" weight="bold" aria-hidden />
          </button>
        ) : (
          <div role="alert" className="flex gap-4 bg-blush px-4 py-4 sm:px-5">
            <Chip icon={Trash} tone="neutral" />
            <div className="flex-1">
              <p className="font-medium">Delete everything on this device?</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                This removes your name, moods, confidence sessions, reframes and saved chats. It can&apos;t be undone.
                You may want to download your data first.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={deleteData}>
                  Yes, delete my data
                </Button>
                <Button variant="ghost" onClick={() => setConfirmDelete(false)} autoFocus>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </Group>

      {/* Account */}
      <Group title="Account">
        {userEmail ? (
          <div className={cn(rowBase, "flex-wrap")}>
            <Chip icon={UserCircle} />
            <p className="min-w-0 flex-1 text-[0.9375rem]">
              <span className="block text-muted-foreground">Signed in as</span>
              <span className="block truncate font-medium">{userEmail}</span>
            </p>
            <Button variant="outline" onClick={logOut}>
              <span className="inline-flex items-center gap-2">
                <SignOut className="size-4" aria-hidden /> Log out
              </span>
            </Button>
          </div>
        ) : isSupabaseConfigured ? (
          <Link
            href="/login"
            className={cn(rowBase, "transition-colors duration-300 hover:bg-muted/60 focus-visible:bg-muted focus-visible:outline-none")}
          >
            <Chip icon={SignIn} />
            <span className="flex-1">
              <span className="block text-[0.9375rem] font-medium">Log in</span>
              <span className="block text-sm text-muted-foreground">You&apos;re using EaseMind without an account.</span>
            </span>
            <CaretRight className="size-4 text-muted-foreground" weight="bold" aria-hidden />
          </Link>
        ) : (
          <div className={rowBase}>
            <Chip icon={SignIn} />
            <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
              Accounts are coming soon. Everything works without one.
            </p>
          </div>
        )}
      </Group>
    </Reveal3D>
  );
}
