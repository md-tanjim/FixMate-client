// components/dashboard/customer/customer-dashboard-cards.tsx

import Link from "next/link";

import {
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Laptop,
  Smartphone,
  Snowflake,
  Wrench,
} from "lucide-react";

import {
  type CustomerBooking,
  type BookingStatus,
  cancelCustomerBooking,
} from "@/lib/api/customer-dashboard";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type CustomerDashboardStats = {
  totalRequests: number;
  activeJobs: number;
  completedJobs: number;
};

// -----------------------------------------------------------------------------
// Statistics cards
// -----------------------------------------------------------------------------

type CustomerDashboardStatsCardsProps = {stats: CustomerDashboardStats};

export function CustomerDashboardStatsCards({stats}: CustomerDashboardStatsCardsProps) {
  const statCards = [
    {
      title: "Total Requests",
      value: stats.totalRequests,
      description: "Total requests submitted",
      icon: ClipboardList,
      iconStyle: "bg-primary/10 text-primary",
    },
    {
      title: "Active Jobs",
      value: stats.activeJobs,
      description: "Currently in progress",
      icon: Wrench,
      iconStyle: "bg-secondary/10 text-secondary",
    },
    {
      title: "Completed Jobs",
      value: stats.completedJobs,
      description: "Successfully resolved",
      icon: CheckCircle2,
      iconStyle: "bg-success-muted text-success",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {statCards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.title}
            className="rounded-xl border-border bg-card shadow-sm"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </p>

                <div
                  className={`flex size-10 items-center justify-center rounded-lg ${card.iconStyle}`}
                >
                  <Icon className="size-5" />
                </div>
              </div>

              <p className="mt-4 text-4xl font-bold tracking-tight text-card-foreground">
                {card.value}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Service category icon
// -----------------------------------------------------------------------------

function getServiceIcon(category?: string) {
  const normalizedCategory = category?.toLowerCase() || "";

  if (
    normalizedCategory.includes("smartphone") ||
    normalizedCategory.includes("phone") ||
    normalizedCategory.includes("mobile")
  ) {
    return Smartphone;
  }

  if (
    normalizedCategory.includes("laptop") ||
    normalizedCategory.includes("computer") ||
    normalizedCategory.includes("pc")
  ) {
    return Laptop;
  }

  if (
    normalizedCategory.includes("ac") ||
    normalizedCategory.includes("air")
  ) {
    return Snowflake;
  }

  return Wrench;
}

// -----------------------------------------------------------------------------
// Date formatter
// -----------------------------------------------------------------------------

function formatPreferredDate(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);

  const today = new Date();

  if (date.toDateString() === today.toDateString()) {
    return `Today, ${formattedDate}`;
  }

  return formattedDate;
}

// -----------------------------------------------------------------------------
// Booking status
// -----------------------------------------------------------------------------

const STATUS_LABELS: Record<BookingStatus, string> = {
  requested: "Requested",
  accepted: "Accepted",
  "in-progress": "In Progress",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

function getStatusLabel(status: string) {
  if (status in STATUS_LABELS) {
    return STATUS_LABELS[status as BookingStatus];
  }

  return status
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// -----------------------------------------------------------------------------
// Recent bookings card
// -----------------------------------------------------------------------------

type RecentBookingsCardProps = {
  bookings: CustomerBooking[];
};

export function RecentBookingsCard({
  bookings,
}: RecentBookingsCardProps) {
  const [localBookings, setLocalBookings] = useState(bookings);

  const [selectedBooking, setSelectedBooking] =
    useState<CustomerBooking | null>(null);

  const [isCancelling, setIsCancelling] = useState(false);

  // Keep local data synchronized if the parent fetches new bookings.
  useEffect(() => {
    setLocalBookings(bookings);
  }, [bookings]);

  // ---------------------------------------------------------------------------
  // Cancel booking handler
  // ---------------------------------------------------------------------------

  const handleCancelBooking = async () => {
    if (!selectedBooking || isCancelling) return;

    try {
      setIsCancelling(true);

      await cancelCustomerBooking(selectedBooking._id);

      // Update the booking in the UI immediately.
      setLocalBookings((previousBookings) =>
        previousBookings.map((booking) =>
          booking._id === selectedBooking._id
            ? { ...booking, status: "cancelled" }
            : booking
        )
      );

      toast.success("Booking cancelled successfully!");

      setSelectedBooking(null);
    } catch (error) {
      console.error("Cancel booking error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to cancel this booking."
      );
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      <Card className="rounded-xl border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-border px-6 py-5">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">
              Recent Bookings
            </CardTitle>

            <CardDescription>
              Quick summary of your latest service requests
            </CardDescription>
          </div>

          <Link
            href="/dashboard/customer/bookings"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-brand-primary-hover"
          >
            View All
            <ChevronRight className="size-4" />
          </Link>
        </CardHeader>

        <CardContent className="px-6 py-0">
          {localBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ClipboardList className="size-6" />
              </div>

              <h3 className="font-semibold text-card-foreground">
                No bookings yet
              </h3>

              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Your repair requests will appear here once you book a service.
              </p>

              <Link
                href="/services"
                className="mt-4 text-sm font-semibold text-primary hover:underline"
              >
                Explore Services
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {localBookings.map((booking) => {
                const ServiceIcon = getServiceIcon(booking.category);

                const bookingReference = booking._id
                  .slice(-6)
                  .toUpperCase();

                return (
                  <div
                    key={booking._id}
                    className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center"
                  >
                    {/* Service icon */}
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <ServiceIcon className="size-5" />
                    </div>

                    {/* Booking information */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-card-foreground">
                        {booking.serviceTitle}
                      </p>

                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        Booking #{bookingReference}
                        <span className="mx-2 text-border">•</span>
                        Tech: {booking.technicianName || "Not assigned"}
                      </p>
                    </div>

                    {/* Date, status and cancel button */}
                    <div className="
                    grid w-full
                    grid-cols-[minmax(0,1fr)_82px_72px]
                    items-center gap-2
                    sm:w-auto
                    sm:min-w-[340px]
                    sm:grid-cols-[145px_100px_80px]
                    ">
                    {/* Preferred date */}
                    <div className="min-w-0 text-right">
                        <p className="text-xs font-medium leading-4 text-muted-foreground">
                        Preferred Date
                        </p>

                        <p className="text-[13px] font-semibold leading-5 text-card-foreground">
                        {formatPreferredDate(booking.preferredDate)}
                        </p>
                    </div>

                    {/* Booking status */}
                    <div className="flex justify-center">
                        <span
                        data-status={booking.status}
                        className="status-badge justify-center px-2 text-[11px]"
                        >
                        {getStatusLabel(booking.status)}
                        </span>
                    </div>

                    {/* Cancel action */}
                    <div className="flex justify-center">
                        {booking.status === "requested" ? (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedBooking(booking)}
                            className="
                            h-8 w-[72px]
                            border-destructive/30
                            px-2 text-xs text-destructive
                            hover:bg-destructive/10
                            hover:text-destructive
                            "
                        >
                            Cancel
                        </Button>
                        ) : (
                       
                        <span className="block w-[72px]" aria-hidden="true" />
                        )}
                    </div>
                    </div>


                    
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* Cancellation confirmation dialog                                  */}
      {/* ------------------------------------------------------------------ */}

      {selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close confirmation dialog"
            disabled={isCancelling}
            onClick={() => setSelectedBooking(null)}
            className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-[2px]"
          />

          {/* Dialog content */}
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="cancel-booking-title"
            aria-describedby="cancel-booking-description"
            className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"
          >
            <div className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <Wrench className="size-5" />
            </div>

            <h2
              id="cancel-booking-title"
              className="mt-4 text-lg font-semibold text-foreground"
            >
              Cancel this booking?
            </h2>

            <p
              id="cancel-booking-description"
              className="mt-2 text-sm leading-relaxed text-muted-foreground"
            >
              Are you sure you want to cancel{" "}
              <span className="font-semibold text-foreground">
                {selectedBooking.serviceTitle}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={isCancelling}
                onClick={() => setSelectedBooking(null)}
              >
                Keep Booking
              </Button>

              <Button
                type="button"
                variant="destructive"
                disabled={isCancelling}
                onClick={() => void handleCancelBooking()}
              >
                {isCancelling ? "Cancelling..." : "Yes, Cancel"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// -----------------------------------------------------------------------------
// Loading skeletons
// -----------------------------------------------------------------------------

export function CustomerDashboardLoading() {
  return (
    <div className="space-y-7">
      {/* Statistics skeletons */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-40 animate-pulse rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 rounded bg-muted" />
              <div className="size-10 rounded-lg bg-muted" />
            </div>

            <div className="mt-5 h-9 w-16 rounded bg-muted" />
            <div className="mt-2 h-3 w-36 rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* Recent bookings skeleton */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="h-5 w-36 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-muted" />

        <div className="mt-6 space-y-5">
          {[1, 2, 3].map((item) => (
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
      </div>
    </div>
  );
}