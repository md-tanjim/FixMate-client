
"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

import {
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  CircleAlert,
  Copy,
  CreditCard,
  Home,
  LoaderCircle,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

type Payment = {
  serviceTitle: string;
  technicianName: string;
  amount: number;
  currency: string;
  transactionId: string;
  stripeSessionId: string;
  paymentStatus: string;
  paidAt: string;
};

type VerifyResponse = {
  success: boolean;
  message?: string;
  payment?: Payment;
};

type PageState =
  | { status: "loading" }
  | { status: "success"; payment: Payment }
  | { status: "error"; message: string };

// Set NEXT_PUBLIC_API_URL in your frontend environment.
const API_URL = process.env.NEXT_PUBLIC_API_URL;

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsedDate);
}

function LoadingState() {
  return (
    <main className="grid min-h-[70vh] place-items-center bg-[var(--fm-background)] px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-8 text-center shadow-[var(--fm-shadow-card)]">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--fm-primary)_10%,var(--fm-surface))]">
          <LoaderCircle
            className="h-8 w-8 animate-spin text-[var(--fm-primary)]"
            aria-hidden="true"
          />
        </div>

        <h1 className="text-xl font-bold text-[var(--fm-foreground)]">
          Confirming your payment
        </h1>

        <p className="mt-2 text-sm leading-6 text-[var(--fm-muted)]">
          Were securely verifying your Stripe payment and updating
          your repair booking. Please dont close this page.
        </p>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-[var(--fm-primary)]">
          <ShieldCheck size={15} />
          Secure payment verification
        </div>
      </div>
    </main>
  );
}

export default function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sessionId = searchParams.get("session_id");

  const { data: session, isPending } = useSession();

  const [pageState, setPageState] = useState<PageState>({
    status: "loading",
  });

  const [retryCount, setRetryCount] = useState(0);

  // ---------------------------------------------------------------------------
  // Verify the payment with the backend.
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      const callbackUrl = sessionId
        ? `/payment/success?session_id=${encodeURIComponent(sessionId)}`
        : "/payment/success";

      router.replace(
        `/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`
      );

      return;
    }

    if (!sessionId) return;

    let active = true;

    async function verifyPayment() {
      try {
        if (!API_URL) {
          throw new Error(
            "Payment API URL is not configured. Please contact support."
          );
        }

        // Get the JWT used by the protected Express API.
        const { data: tokenData, error: tokenError } =
          await authClient.token();

        if (tokenError || !tokenData?.token) {
          throw new Error(
            "Unable to verify your session. Please sign in again."
          );
        }

        const response = await fetch(
          `${API_URL.replace(/\/$/, "")}/api/payments/verify?session_id=${encodeURIComponent(sessionId!)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${tokenData.token}`,
            },
            cache: "no-store",
          }
        );

        const result = (await response.json()) as VerifyResponse;

        if (!response.ok || !result.success || !result.payment) {
          throw new Error(
            result.message || "We couldn't confirm your payment."
          );
        }

        if (active) {
          setPageState({
            status: "success",
            payment: result.payment,
          });
        }
      } catch (error) {
        console.error("Payment verification error:", error);

        if (active) {
          setPageState({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "Something went wrong while verifying your payment.",
          });
        }
      }
    }

    void verifyPayment();

    return () => {
      active = false;
    };
  }, [
    isPending,
    session?.user?.id,
    sessionId,
    retryCount,
    router,
  ]);

  // ---------------------------------------------------------------------------
  // Copy transaction ID.
  // ---------------------------------------------------------------------------

  async function handleCopyTransactionId(transactionId: string) {
    try {
      await navigator.clipboard.writeText(transactionId);
      toast.success("Transaction ID copied.");
    } catch {
      toast.error("Unable to copy transaction ID.");
    }
  }

  // ---------------------------------------------------------------------------
  // Missing session ID.
  // ---------------------------------------------------------------------------

  if (!sessionId) {
    return (
      <VerificationError
        message="The payment session ID is missing. Please open the success page from your Stripe checkout."
      />
    );
  }

  if (isPending || !session) {
    return <LoadingState />;
  }

  // ---------------------------------------------------------------------------
  // Loading state.
  // ---------------------------------------------------------------------------

  if (pageState.status === "loading") {
    return <LoadingState />;
  }

  // ---------------------------------------------------------------------------
  // Error state.
  // ---------------------------------------------------------------------------

  if (pageState.status === "error") {
    return (
      <VerificationError
        message={pageState.message}
        onRetry={() => {
          setPageState({ status: "loading" });
          setRetryCount((previous) => previous + 1);
        }}
      />
    );
  }

  // ---------------------------------------------------------------------------
  // Success state.
  // ---------------------------------------------------------------------------

  const { payment } = pageState;

  return (
    <main className="relative overflow-hidden bg-[var(--fm-background)] px-4 py-12 sm:py-16">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[color-mix(in_srgb,var(--fm-success)_10%,transparent)] blur-3xl" />

      <div className="relative mx-auto w-full max-w-2xl">
        {/* Success icon */}
        <div className="mb-6 flex justify-center">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--fm-success)_20%,var(--fm-border))] bg-[color-mix(in_srgb,var(--fm-success)_10%,var(--fm-surface))]">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--fm-success)] text-white shadow-lg shadow-emerald-500/20">
              <Check size={34} strokeWidth={2.8} />
            </div>

            <span className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-[var(--fm-background)] bg-[var(--fm-surface)] text-[var(--fm-success)]">
              <BadgeCheck size={20} />
            </span>
          </div>
        </div>

        {/* Heading */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--fm-success)_25%,var(--fm-border))] bg-[color-mix(in_srgb,var(--fm-success)_8%,var(--fm-surface))] px-3 py-1.5 text-xs font-semibold text-[var(--fm-success)]">
            <CheckCircle2 size={14} />
            PAYMENT CONFIRMED
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[var(--fm-foreground)] sm:text-4xl">
            Payment successful!
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--fm-muted)] sm:text-base">
            Your repair payment has been received. Thank you for
            choosing FixMate!
          </p>
        </div>

        {/* Payment receipt card */}
        <div className="overflow-hidden rounded-3xl border border-[var(--fm-border)] bg-[var(--fm-surface)] shadow-[var(--fm-shadow-card)]">
          <div className="h-1.5 bg-[var(--fm-success)]" />

          <div className="p-5 sm:p-8">
            {/* Amount */}
            <div className="rounded-2xl bg-[var(--fm-surface-soft)] p-5 text-center sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--fm-muted)]">
                Amount Paid
              </p>

              <p className="mt-2 text-4xl font-bold tracking-tight text-[var(--fm-foreground)] sm:text-5xl">
                {formatCurrency(payment.amount, payment.currency)}
              </p>

              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--fm-success)_12%,var(--fm-surface))] px-3 py-1 text-xs font-semibold text-[var(--fm-success)]">
                <CheckCircle2 size={13} />
                Paid
              </span>
            </div>

            {/* Repair details */}
            <div className="mt-7">
              <h2 className="text-sm font-semibold text-[var(--fm-foreground)]">
                Payment Details
              </h2>

              <div className="mt-4 divide-y divide-[var(--fm-border)]">
                <DetailRow
                  label="Service"
                  value={payment.serviceTitle}
                />

                <DetailRow
                  label="Technician"
                  value={payment.technicianName}
                />

                <DetailRow
                  label="Payment Date"
                  value={formatDate(payment.paidAt)}
                />

                <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-xs text-[var(--fm-muted)]">
                    Transaction ID
                  </span>

                  <div className="flex min-w-0 items-center gap-2">
                    <span className="min-w-0 break-all font-mono text-xs font-medium text-[var(--fm-foreground)]">
                      {payment.transactionId}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        void handleCopyTransactionId(payment.transactionId)
                      }
                      aria-label="Copy transaction ID"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--fm-border)] text-[var(--fm-muted)] transition-colors hover:border-[var(--fm-primary)] hover:text-[var(--fm-primary)]"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Security note */}
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--fm-success)]" />

              <div>
                <p className="text-xs font-semibold text-[var(--fm-foreground)]">
                  Secure payment completed
                </p>

                <p className="mt-1 text-xs leading-5 text-[var(--fm-muted)]">
                  Your payment has been verified and your repair
                  booking has been marked as paid.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Button className="h-11 gap-2">
                <Link href="/dashboard/customer/bookings">
                  View My Bookings
                  <ArrowRight size={16} />
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
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-[var(--fm-muted)]">
          <Wrench size={14} />
          FixMate — Repair with confidence.
        </p>
      </div>
    </main>
  );
}

// -----------------------------------------------------------------------------
// Small reusable detail row
// -----------------------------------------------------------------------------

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <span className="shrink-0 text-xs text-[var(--fm-muted)]">
        {label}
      </span>

      <span className="text-right text-xs font-semibold text-[var(--fm-foreground)]">
        {value || "—"}
      </span>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Verification error
// -----------------------------------------------------------------------------

function VerificationError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <main className="grid min-h-[70vh] place-items-center bg-[var(--fm-background)] px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-7 text-center shadow-[var(--fm-shadow-card)] sm:p-9">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--fm-danger)_10%,var(--fm-surface))] text-[var(--fm-danger)]">
          <CircleAlert size={32} />
        </div>

        <h1 className="text-xl font-bold text-[var(--fm-foreground)]">
          Payment confirmation unavailable
        </h1>

        <p className="mt-3 text-sm leading-6 text-[var(--fm-muted)]">
          {message}
        </p>

        <div className="mt-7 grid gap-3">
          {onRetry && (
            <Button onClick={onRetry} className="h-11 gap-2">
              <CreditCard size={16} />
              Try Again
            </Button>
          )}

          <Button variant="outline" className="h-11">
            <Link href="/dashboard/customer/bookings">
              Go to My Bookings
            </Link>
          </Button>
        </div>

        <p className="mt-5 text-xs leading-5 text-[var(--fm-muted)]">
          Please dont make another payment until you check your
          bookings payment status.
        </p>
      </div>
    </main>
  );
}
