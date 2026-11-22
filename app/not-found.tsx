
import Link from "next/link";
import {
  ArrowLeft,
  Home,
  Wrench,
  Hammer,
  Settings,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative grid min-h-[85vh] place-items-center overflow-hidden bg-[var(--fm-background)] px-4 py-16">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[color-mix(in_srgb,var(--fm-primary)_8%,transparent)] blur-3xl" />

      <div className="relative mx-auto w-full max-w-xl text-center">

        {/* Repair tools illustration */}
        <div className="relative mx-auto mb-8 flex h-48 w-56 items-center justify-center">

          {/* Main illustration background */}
          <div className="absolute h-40 w-40 rotate-45 rounded-[2rem] border border-[var(--fm-border)] bg-[var(--fm-surface)] shadow-[var(--fm-shadow-card)]" />

          {/* Main wrench icon */}
          <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-3xl bg-[var(--fm-primary)] text-[var(--fm-on-primary)] shadow-xl shadow-teal-900/20">
            <Wrench size={48} strokeWidth={1.5} />
          </div>

          {/* Floating hammer */}
          <div className="absolute right-2 top-3 flex h-12 w-12 rotate-12 items-center justify-center rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface)] text-[var(--fm-secondary)] shadow-md">
            <Hammer size={25} />
          </div>

          {/* Floating settings */}
          <div className="absolute bottom-2 left-3 flex h-11 w-11 -rotate-12 items-center justify-center rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface)] text-[var(--fm-primary)] shadow-md">
            <Settings size={23} />
          </div>

          {/* Small search icon */}
          <div className="absolute left-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--fm-surface-soft)] text-[var(--fm-muted)]">
            <Search size={17} />
          </div>
        </div>

        {/* Error code */}
        <p className="text-[clamp(6rem,20vw,9rem)] font-extrabold leading-none tracking-tighter text-[var(--fm-primary)]">
          404
        </p>

        {/* Heading */}
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-[var(--fm-foreground)] sm:text-3xl">
          Oops! This Page Is Missing
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--fm-muted)] sm:text-base">
          Looks like this repair went a little too far!
          The page youre looking for doesnt exist or may
          have been moved.
        </p>

        {/* Back home button */}
        <div className="mt-8 flex justify-center">
          <Button className="h-11 gap-2 px-6">
            <Link href="/">
              <ArrowLeft size={17} />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Brand */}
        <div className="mt-12 flex items-center justify-center gap-2 border-t border-[var(--fm-border)] pt-6">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--fm-primary)] text-[var(--fm-on-primary)]">
            <Wrench size={16} />
          </span>

          <span className="font-bold text-[var(--fm-foreground)]">
            FixMate
          </span>

          <span className="text-xs text-[var(--fm-muted)]">
            · Repair with confidence.
          </span>
        </div>
      </div>
    </main>
  );
}
