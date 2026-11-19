"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Plus, RefreshCw } from "lucide-react";

import { useSession } from "@/lib/auth-client";

import {
  getCustomerBookingCounts,
  getCustomerRecentBookings,
  type CustomerBooking,
  type CustomerBookingCounts,
} from "@/lib/api/customer-dashboard";



import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CustomerDashboardLoading, CustomerDashboardStatsCards, RecentBookingsCard } from "./components/customer-dashboard-cards";

// -----------------------------------------------------------------------------
// Customer Dashboard
// -----------------------------------------------------------------------------

export default function CustomerDashboardPage() {
  const router = useRouter();

  const { data: session } = useSession();

  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [bookingCounts, setBookingCounts] =
    useState<CustomerBookingCounts | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [retryCount, setRetryCount] = useState(0);

  // Get the customer's first name for the welcome message.
  const firstName =
    session?.user.name?.trim().split(/\s+/)[0] || "there";

  // ---------------------------------------------------------------------------
  // Fetch dashboard data
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let isCancelled = false;

    async function fetchDashboardData() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch both endpoints simultaneously.
        const [recentBookings, counts] = await Promise.all([
          getCustomerRecentBookings(session?.user.email),
          getCustomerBookingCounts(session?.user.email),
        ]);

        // Avoid updating state if the component has unmounted.
        if (isCancelled) return;

        setBookings(recentBookings);
        setBookingCounts(counts);
      } catch (error) {
        console.error("Customer dashboard fetch error:", error);

        if (!isCancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load your dashboard.",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void fetchDashboardData();

    return () => {
      isCancelled = true;
    };
  }, [retryCount]);

  // ---------------------------------------------------------------------------
  // Prepare statistics
  // ---------------------------------------------------------------------------

  const stats = {
    // Prefer the total count if the backend returns it.
    // Otherwise, use the three counts currently provided by your API.
    totalRequests:
      bookingCounts?.totalRequests ??
      (bookingCounts
        ? bookingCounts.requested +
          bookingCounts.inProgress +
          bookingCounts.completed
        : 0),

    activeJobs: bookingCounts?.inProgress ?? 0,

    completedJobs: bookingCounts?.completed ?? 0,
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-7">
      {/* Welcome section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Welcome back, {firstName}!
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s an overview of your repair activities.
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

      {/* Loading state */}
      {isLoading ? (
        <CustomerDashboardLoading />
      ) : error ? (
        /* Error state */
        <Card className="rounded-xl border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="font-semibold text-foreground">
              Could not load your dashboard
            </p>

            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {error}
            </p>

            <Button
              variant="outline"
              onClick={() => setRetryCount((previous) => previous + 1)}
              className="mt-5 gap-2"
            >
              <RefreshCw className="size-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Statistics */}
          <CustomerDashboardStatsCards stats={stats} />

          {/* Recent bookings */}
          <RecentBookingsCard bookings={bookings} />
        </>
      )}
    </div>
  );
}