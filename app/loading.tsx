
import { LoaderCircle, Wrench } from "lucide-react";

export default function Loading() {
  return (
    <main
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="fixed inset-0 z-[100] grid min-h-screen place-items-center overflow-hidden bg-[var(--fm-background)] px-4"
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[color-mix(in_srgb,var(--fm-primary)_8%,transparent)] blur-3xl" />

      <div className="relative flex w-full max-w-sm flex-col items-center text-center">
        {/* FixMate branding */}
        <div className="mb-10 flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--fm-primary)] text-[var(--fm-on-primary)]">
            <Wrench size={21} />
          </span>

          <span className="text-2xl font-bold tracking-tight text-[var(--fm-foreground)]">
            FixMate
          </span>
        </div>

        {/* Animated loader */}
        <div className="relative mb-7 flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-[3px] border-[var(--fm-border)]" />

          <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-[var(--fm-primary)]" />

          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--fm-primary)_10%,var(--fm-surface))] text-[var(--fm-primary)]">
            <Wrench size={25} strokeWidth={1.8} />
          </div>
        </div>

        {/* Loading message */}
        <h1 className="text-lg font-semibold tracking-tight text-[var(--fm-foreground)]">
          Getting things ready
        </h1>

        <p className="mt-2 max-w-xs text-sm leading-6 text-[var(--fm-muted)]">
          Please wait while we prepare your FixMate experience.
        </p>

        {/* Loading indicator */}
        <div className="mt-7 flex items-center gap-2">
          <LoaderCircle
            size={15}
            className="animate-spin text-[var(--fm-primary)]"
          />

          <span className="text-xs font-medium text-[var(--fm-muted)]">
            Loading...
          </span>
        </div>

        {/* Loading bars */}
        <div className="mt-10 flex w-full flex-col gap-2.5">
          <div className="h-2 w-full animate-pulse rounded-full bg-[var(--fm-surface-soft)]" />
          <div className="h-2 w-4/5 animate-pulse rounded-full bg-[var(--fm-surface-soft)]" />
          <div className="h-2 w-3/5 animate-pulse rounded-full bg-[var(--fm-surface-soft)]" />
        </div>
      </div>

      {/* Bottom text */}
      <p className="absolute bottom-6 text-xs text-[var(--fm-muted)]">
        FixMate · Repair with confidence.
      </p>
    </main>
  );
}
