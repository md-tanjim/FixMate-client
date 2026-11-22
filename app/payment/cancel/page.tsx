
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  Home,
  ShieldCheck,
  Wrench,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export default function PaymentCancelPage() {
  return (
    <main className="relative grid min-h-[75vh] place-items-center overflow-hidden bg-[var(--fm-background)] px-4 py-14 sm:py-20">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[color-mix(in_srgb,var(--fm-secondary)_8%,transparent)] blur-3xl" />

      <div className="relative mx-auto w-full max-w-xl">
        <div className="overflow-hidden rounded-3xl border border-[var(--fm-border)] bg-[var(--fm-surface)] shadow-[var(--fm-shadow-card)]">
          {/* Top accent */}
          <div className="h-1.5 bg-[var(--fm-secondary)]" />

          <div className="px-6 py-10 text-center sm:px-10 sm:py-12">
            {/* Cancel icon */}
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--fm-secondary)_10%,var(--fm-surface))]">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--fm-secondary)_16%,var(--fm-surface))] text-[var(--fm-secondary)]">
                <XCircle size={37} strokeWidth={1.8} />
              </div>
            </div>

            {/* Status badge */}
            <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--fm-secondary)_25%,var(--fm-border))] bg-[color-mix(in_srgb,var(--fm-secondary)_8%,var(--fm-surface))] px-3 py-1.5 text-xs font-semibold text-[var(--fm-secondary)]">
              <CreditCard size={14} />
              PAYMENT NOT COMPLETED
            </div>

            {/* Heading */}
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-[var(--fm-foreground)] sm:text-4xl">
              Payment Cancelled
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--fm-muted)] sm:text-base">
              No worries! Your checkout was cancelled before
              the payment was completed. You can return to your
              bookings and try again whenever youre ready.
            </p>

            {/* Information card */}
            <div className="mt-8 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface-soft)] p-5 text-left">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--fm-secondary)_10%,var(--fm-surface))] text-[var(--fm-secondary)]">
                  <ShieldCheck size={20} />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-[var(--fm-foreground)]">
                    Your booking is safe
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-[var(--fm-muted)]">
                    Your repair booking has not been changed.
                    Its payment status remains unpaid, and you
                    can complete the payment later from My Bookings.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Button className="h-11 gap-2">
                <Link href="/dashboard/customer/bookings">
                  <CreditCard size={16} />
                  Try Again
                </Link>
              </Button>

              <Button

                variant="outline"
                className="h-11 gap-2"
              >
                <Link href="/">
                  <Home size={16} />
                  Back to Home
                </Link>
              </Button>
            </div>

            {/* Help text */}
            <p className="mt-7 text-xs leading-5 text-[var(--fm-muted)]">
              Changed your mind or need help? You can always
              return to FixMate and continue where you left off.
            </p>
          </div>

          {/* Brand footer */}
          <div className="flex items-center justify-center gap-2 border-t border-[var(--fm-border)] px-5 py-4">
            <Wrench size={15} className="text-[var(--fm-primary)]" />
            <span className="text-xs font-semibold text-[var(--fm-foreground)]">
              FixMate
            </span>
            <span className="text-xs text-[var(--fm-muted)]">
              · Repair with confidence.
            </span>
          </div>
        </div>

        {/* Return link */}
        <Link
          href="/dashboard/customer/bookings"
          className="mx-auto mt-6 flex w-fit items-center gap-2 text-sm font-medium text-[var(--fm-muted)] transition-colors hover:text-[var(--fm-primary)]"
        >
          <ArrowLeft size={15} />
          Return to My Bookings
        </Link>
      </div>
    </main>
  );
}
