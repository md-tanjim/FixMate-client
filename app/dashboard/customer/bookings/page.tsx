"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Plus, RefreshCw } from "lucide-react";

import { useSession } from "@/lib/auth-client";
import { getCustomerBookings } from "@/lib/api/customer-dashboard";

import type { CustomerBooking } from "@/lib/api/customer-dashboard";


import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CustomerBookingsCard } from "./customer-bookings-card";

// -----------------------------------------------------------------------------
// My Bookings Page
// -----------------------------------------------------------------------------

export default function CustomerBookingsPage() {
  const router = useRouter();

  const {
    data: session,
    isPending: isSessionPending,
  } = useSession();

  const customerEmail = session?.user.email;

  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // ---------------------------------------------------------------------------
  // Fetch customer bookings
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (isSessionPending) return;

    if (!customerEmail) {
      router.replace(
        `/sign-in?callbackURL=${encodeURIComponent("/dashboard/customer/bookings")}`,
      );
      return;
    }

    let isCancelled = false;

    async function fetchBookings() {
      try {
        setIsLoading(true);
        setError(null);

        const result = await getCustomerBookings(customerEmail);

        if (isCancelled) return;

        setBookings(result);
      } catch (error) {
        console.error("My bookings fetch error:", error);

        if (!isCancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load your bookings.",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void fetchBookings();

    return () => {
      isCancelled = true;
    };
  }, [customerEmail, isSessionPending, retryCount, router]);

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------

  if (isSessionPending || (isLoading && !error)) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="h-8 w-44 animate-pulse rounded bg-muted" />
            <div className="h-4 w-64 animate-pulse rounded bg-muted" />
          </div>

          <div className="h-10 w-40 animate-pulse rounded-lg bg-muted" />
        </div>

        <Card className="overflow-hidden rounded-xl border-border p-5">
          <div className="flex justify-end">
            <div className="h-10 w-40 animate-pulse rounded-lg bg-muted" />
          </div>

          <div className="mt-6 space-y-5">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center gap-4">
                <div className="size-10 animate-pulse rounded-lg bg-muted" />

                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                </div>

                <div className="hidden h-8 w-24 animate-pulse rounded bg-muted sm:block" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Error state
  // ---------------------------------------------------------------------------

  if (error) {
    return (
      <div className="flex min-h-[350px] flex-col items-center justify-center text-center">
        <h2 className="text-lg font-semibold text-foreground">
          Unable to load your bookings
        </h2>

        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {error}
        </p>

        <Button
          type="button"
          variant="outline"
          onClick={() => setRetryCount((previous) => previous + 1)}
          className="mt-5 gap-2"
        >
          <RefreshCw className="size-4" />
          Try Again
        </Button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Page content
  // ---------------------------------------------------------------------------

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            My Bookings
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage your repair requests and track their progress.
          </p>
        </div>

          <Button
          onClick={() => router.push("/services")}
          className="w-full gap-2 rounded-lg bg-primary font-semibold text-primary-foreground hover:bg-brand-primary-hover sm:w-auto"
        >
          <Plus className="size-4" />
          Book New Repair
        </Button>
      </div>

      {/* Bookings table and status filter */}
      <CustomerBookingsCard bookings={bookings} />
    </div>
  );
}