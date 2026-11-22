
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, CalendarDays, Users } from "lucide-react";

import {
  getAdminBookings,
  type AdminBooking,
  type AdminBookingStatus,
} from "@/lib/api/admin-dashboard";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";



const STATUS_FILTERS: {
  label: string;
  value: "all" | AdminBookingStatus;
}[] = [
  { label: "All", value: "all" },
  { label: "Requested", value: "requested" },
  { label: "Accepted", value: "accepted" },
  { label: "In Progress", value: "in-progress" },
  { label: "Completed", value: "completed" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
];

//hellpppeer
function getInitials(name: string) {
  return (
    name
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U"
  );
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount) || 0);
}

function formatDate(date: string | null) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(parsedDate);
}

function formatStatus(status: string) {
  return status
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}


// Booking and payment badges
function BookingStatusBadge({ status }: { status: string }) {
  return (
    <span className="status-badge" data-status={status}>
      {formatStatus(status)}
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus === "paid" || normalizedStatus === "unpaid") {
    return (
      <span className="status-badge" data-status={normalizedStatus}>
        {formatStatus(normalizedStatus)}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
      {formatStatus(status || "unknown")}
    </span>
  );
}

// =============================================================================
// Service information
// =============================================================================

function ServiceInfo({ booking }: { booking: AdminBooking }) {
  return (
    <div className="flex min-w-[210px] items-center gap-3">
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
        {booking.serviceImage ? (
          <Image
            src={booking.serviceImage}
            alt={booking.serviceTitle}
            fill
            sizes="44px"
            unoptimized
            className="object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center text-xs text-muted-foreground">
            Service
          </div>
        )}
      </div>

      <div className="min-w-0">
        <p className="line-clamp-2 text-sm font-semibold text-foreground">
          {booking.serviceTitle}
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          {booking.category}
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// Customer information
// =============================================================================

function CustomerInfo({ booking }: { booking: AdminBooking }) {
  return (
    <div className="min-w-[130px]">
      <p className="text-sm font-semibold text-foreground">
        {booking.customerName}
      </p>

      <p className="mt-1 break-all text-xs text-muted-foreground">
        {booking.customerEmail}
      </p>
    </div>
  );
}

// =============================================================================
// Technician information
// =============================================================================

function TechnicianInfo({ booking }: { booking: AdminBooking }) {
  return (
    <div className="flex min-w-[140px] items-center gap-2">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border bg-primary/10 text-[10px] font-bold text-primary">
        {getInitials(booking.technicianName)}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">
          {booking.technicianName}
        </p>

        <p className="mt-1 break-all text-xs text-muted-foreground">
          {booking.technicianEmail}
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// Preferred date
// =============================================================================

function PreferredDate({ date }: { date: string | null }) {
  return (
    <div className="flex min-w-[120px] items-center gap-2 text-sm text-foreground">
      <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
      {formatDate(date)}
    </div>
  );
}

// =============================================================================
// Loading and empty states — outside the main component
// =============================================================================

function LoadingState() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 py-2">
          <Skeleton className="h-11 w-11 shrink-0 rounded-lg" />

          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40 max-w-full" />
            <Skeleton className="h-3 w-28 max-w-full" />
          </div>

          <Skeleton className="hidden h-7 w-24 sm:block" />
          <Skeleton className="hidden h-7 w-20 md:block" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-muted">
        <Users className="h-5 w-5 text-muted-foreground" />
      </div>

      <div>
        <h3 className="font-semibold text-foreground">
          No bookings found
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          There are no bookings under this status.
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// Main component
// =============================================================================

export default function BookingsTable() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [totalBookings, setTotalBookings] = useState(0);

  const [statusFilter, setStatusFilter] = useState<
    "all" | AdminBookingStatus
  >("all");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Used to retry the request.
  const [refreshKey, setRefreshKey] = useState(0);

  // ===========================================================================
  // Fetch bookings
  // ===========================================================================

  useEffect(() => {
    let cancelled = false;

    getAdminBookings()
      .then((result) => {
        if (cancelled) return;

        setBookings(result.bookings);
        setTotalBookings(result.totalBookings);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Failed to retrieve bookings."
        );
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  // ===========================================================================
  // Filter bookings on the client
  // ===========================================================================

  const filteredBookings =
    statusFilter === "all"
      ? bookings
      : bookings.filter((booking) => booking.status === statusFilter);

  // Calculate counts for the filter tabs.
  const statusCounts = {
    all: bookings.length,
    requested: bookings.filter((b) => b.status === "requested").length,
    accepted: bookings.filter((b) => b.status === "accepted").length,
    "in-progress": bookings.filter((b) => b.status === "in-progress").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    rejected: bookings.filter((b) => b.status === "rejected").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  // ===========================================================================
  // Retry
  // ===========================================================================

  function handleRetry() {
    setIsLoading(true);
    setError(null);
    setRefreshKey((previous) => previous + 1);
  }

  // ===========================================================================
  // Render
  // ===========================================================================

  return (
    <div className="w-full space-y-5">
      {/* Page heading */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            All Bookings
          </h1>

          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Total Bookings: {totalBookings.toLocaleString()}
          </span>
        </div>

        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Monitor and review all repair bookings across the FixMate
          platform.
        </p>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-card p-2">
        {STATUS_FILTERS.map((filter) => {
          const isActive = statusFilter === filter.value;

          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
              aria-pressed={isActive}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {filter.label}

              <span
                className={`text-[10px] ${
                  isActive
                    ? "text-primary-foreground/80"
                    : "text-muted-foreground"
                }`}
              >
                {statusCounts[filter.value]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bookings list */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
            <p className="text-sm text-destructive">{error}</p>

            <Button variant="outline" size="sm" onClick={handleRetry}>
              Try again
            </Button>
          </div>
        ) : filteredBookings.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="min-w-[210px]">
                      Service
                    </TableHead>

                    <TableHead>Customer</TableHead>
                    <TableHead>Technician</TableHead>
                    <TableHead>Preferred Date</TableHead>
                    <TableHead>Booking Status</TableHead>
                    <TableHead>Payment Status</TableHead>

                    <TableHead className="text-right">
                      Amount
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <ServiceInfo booking={booking} />
                      </TableCell>

                      <TableCell>
                        <CustomerInfo booking={booking} />
                      </TableCell>

                      <TableCell>
                        <TechnicianInfo booking={booking} />
                      </TableCell>

                      <TableCell>
                        <PreferredDate date={booking.preferredDate} />
                      </TableCell>

                      <TableCell>
                        <BookingStatusBadge status={booking.status} />
                      </TableCell>

                      <TableCell>
                        <PaymentStatusBadge status={booking.paymentStatus} />
                      </TableCell>

                      <TableCell className="whitespace-nowrap text-right text-sm font-semibold text-foreground">
                        {formatCurrency(
                          booking.finalAmount ?? booking.basePrice
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile and tablet cards */}
            <div className="grid gap-3 p-3 lg:hidden">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="space-y-3 rounded-lg border border-border p-3"
                >
                  <ServiceInfo booking={booking} />

                  <div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Customer
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {booking.customerName}
                      </p>
                      <p className="mt-1 break-all text-xs text-muted-foreground">
                        {booking.customerEmail}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Technician
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {booking.technicianName}
                      </p>
                      <p className="mt-1 break-all text-xs text-muted-foreground">
                        {booking.technicianEmail}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                    <PreferredDate date={booking.preferredDate} />

                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(
                        booking.finalAmount ?? booking.basePrice
                      )}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <BookingStatusBadge status={booking.status} />
                    <PaymentStatusBadge status={booking.paymentStatus} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Result count */}
        {!isLoading && !error && filteredBookings.length > 0 && (
          <div className="border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Showing {filteredBookings.length}{" "}
              {filteredBookings.length === 1 ? "booking" : "bookings"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
