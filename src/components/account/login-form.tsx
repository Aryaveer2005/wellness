"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, CircleNotch, DeviceMobile, EnvelopeSimple, LockSimple, type AppIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Reveal3D } from "@/components/motion/reveal-3d";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

type Status = "idle" | "sending" | "sent" | "error";

/** Clean white editorial card used for every login state. */
function Panel({ children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Reveal3D immediate delay={0.2} tilt={6}>
      <div className="liquid-glass rounded-[2rem] p-6 sm:p-9" {...rest}>
        {children}
      </div>
    </Reveal3D>
  );
}

function IconChip({ icon: Icon }: { icon: AppIcon }) {
  return (
    <span className="band-peach grid size-14 place-items-center rounded-full">
      <Icon className="size-6 text-ink" aria-hidden />
    </span>
  );
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [signedInAs, setSignedInAs] = useState<string | null>(null);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("error")) {
      setStatus("error");
      setMessage("That sign-in link didn't work or has expired. Please try again.");
    }
    const supabase = getSupabaseBrowserClient();
    supabase?.auth.getUser().then(({ data }) => setSignedInAs(data.user?.email ?? null));
  }, []);

  if (!isSupabaseConfigured) {
    return (
      <Panel>
        <IconChip icon={DeviceMobile} />
        <h2 className="mt-5 text-[2rem] leading-[1.05] sm:text-[2.5rem]">Accounts are coming soon</h2>
        <p className="mt-2 leading-relaxed text-muted-foreground">
          Good news: everything in EaseMind already works without one. Your moods, sessions and reframes are saved
          privately on this device — nothing is sent anywhere.
        </p>
        <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/home">Go to Home</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/settings">
              Manage my data
            </Link>
          </Button>
        </div>
      </Panel>
    );
  }

  const redirectTo = () => `${window.location.origin}/auth/callback?next=/home`;

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !email.trim()) return;
    setStatus("sending");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo() },
    });
    if (error) {
      setStatus("error");
      setMessage("We couldn't send the link. Check the email address and try again.");
    } else {
      setStatus("sent");
    }
  }

  async function google() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirectTo() } });
    if (error) {
      setStatus("error");
      setMessage("Google sign-in isn't available right now. Try the email link instead.");
    }
  }

  if (signedInAs) {
    return (
      <Panel>
        <IconChip icon={CheckCircle} />
        <h2 className="mt-5 text-[2rem] leading-[1.05] sm:text-[2.5rem]">You&apos;re signed in</h2>
        <p className="mt-1.5 break-all text-muted-foreground">as {signedInAs}</p>
        <Button asChild size="lg" className="mt-7">
          <Link href="/home">Continue</Link>
        </Button>
      </Panel>
    );
  }

  if (status === "sent") {
    return (
      <Panel role="status">
        <IconChip icon={EnvelopeSimple} />
        <h2 className="mt-5 text-[2rem] leading-[1.05] sm:text-[2.5rem]">Check your email</h2>
        <p className="mt-2 leading-relaxed text-muted-foreground">
          We sent a sign-in link to <span className="break-all font-semibold text-foreground">{email}</span>. Open it on
          this device to continue. It may take a minute — check spam too.
        </p>
        <Button variant="ghost" className="mt-5 -ml-2" onClick={() => setStatus("idle")}>
          Use a different email
        </Button>
      </Panel>
    );
  }

  return (
    <Panel>
      <Button type="button" variant="outline" size="lg" onClick={google} className="w-full text-base">
        <span className="inline-flex items-center gap-2.5">
          <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.94l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.94 10.94 0 0 0 12 1 11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z" />
          </svg>
          Continue with Google
        </span>
      </Button>

      <div className="my-6 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        <span className="h-px flex-1 bg-[linear-gradient(90deg,transparent,var(--border))]" />
        or
        <span className="h-px flex-1 bg-[linear-gradient(90deg,var(--border),transparent)]" />
      </div>

      <form onSubmit={sendMagicLink} className="flex flex-col gap-3">
        <Label htmlFor="email" className="pl-1">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={status === "error" || undefined}
        />
        <Button type="submit" size="lg" disabled={status === "sending"} className="mt-1 text-base">
          {status === "sending" ? (
            <CircleNotch className="size-4 animate-spin" weight="bold" aria-hidden />
          ) : (
            <EnvelopeSimple className="size-5" aria-hidden />
          )}
          Email me a sign-in link
        </Button>
        {status === "error" && (
          <p role="alert" className="rounded-2xl bg-muted px-4 py-3 text-sm font-medium text-foreground">
            {message}
          </p>
        )}
      </form>

      <p className="mt-6 flex items-start gap-2.5 text-[13px] leading-relaxed text-muted-foreground">
        <LockSimple className="mt-0.5 size-4 shrink-0 text-ember" aria-hidden />
        No password needed. An account is optional — it only helps you keep your progress across devices.
      </p>
    </Panel>
  );
}
