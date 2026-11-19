"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  CalendarDays,
  ChevronDown,
  CircleX,
  CreditCard,
  Laptop,
  Smartphone,
  Snowflake,
  Wrench,
} from "lucide-react";

import type {
  BookingStatus,
  CustomerBooking,
} from "@/lib/api/customer-dashboard";

import {
  cancelCustomerBooking,
} from "@/lib/api/customer-dashboard";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { toast } from "react-toastify";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type CustomerBookingsCardProps = {
  bookings: CustomerBooking[];
};

// -----------------------------------------------------------------------------
// Status configuration
// -----------------------------------------------------------------------------

const STATUS_OPTIONS: {
  label: string;
  value: BookingStatus | "all";
}[] = [
  { label: "All Statuses", value: "all" },
  { label: "Requested", value: "requested" },
  { label: "Accepted", value: "accepted" },
  { label: "In Progress", value: "in-progress" },
  { label: "Completed", value: "completed" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
];

const STATUS_LABELS: Record<BookingStatus, string> = {
  requested: "Requested",
  accepted: "Accepted",
  "in-progress": "In Progress",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

function getStatusLabel(status: BookingStatus) {
  return STATUS_LABELS[status];
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function getServiceIcon(category?: string) {
  const value = category?.toLowerCase() || "";

  if (
    value.includes("smartphone") ||
    value.includes("phone") ||
    value.includes("mobile")
  ) {
    return Smartphone;
  }

  if (
    value.includes("laptop") ||
    value.includes("computer") ||
    value.includes("pc")
  ) {
    return Laptop;
  }

  if (value.includes("ac") || value.includes("air")) {
    return Snowflake;
  }

  return Wrench;
}

function getInitials(name?: string) {
  if (!name?.trim()) return "T";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatBookingDate(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  const datePart = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);

  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

  return `${datePart} · ${timePart}`;
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

// -----------------------------------------------------------------------------
// Booking action
// -----------------------------------------------------------------------------

type BookingActionProps = {
  booking: CustomerBooking;
  onCancel: (booking: CustomerBooking) => void;
};

function BookingAction({ booking, onCancel }: BookingActionProps) {
  // Pay Now is intentionally not connected to Stripe yet.
  if (
  booking.status === "completed" &&
  booking.paymentStatus === "unpaid"
) {
  return (
    <Button
      type="button"
      variant="default"
      size="sm"
      className="
        h-9 min-w-[88px] gap-1.5
        rounded-lg border
        !border-[#F97316]
        !bg-[#F97316]
        !text-white
        px-3 text-xs font-semibold
        shadow-sm
        transition-all duration-200
        hover:!border-[#EA580C]
        hover:!bg-[#EA580C]
        hover:shadow-md
        active:scale-[0.97]
      "
    >
      <CreditCard className="size-3.5 text-white" />
      <span>Pay Now</span>
    </Button>
  );
}

  // Only requested bookings can be cancelled.
  if (booking.status === "requested") {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onCancel(booking)}
        className="h-9 rounded-lg border-destructive/20 bg-destructive/30 px-3 text-xs font-semibold text-destructive hover:bg-destructive/15 hover:text-destructive"
      >
        <CircleX className="size-3.5" />
        Cancel
      </Button>
    );
  }

  return (
    <span className="text-sm text-muted-foreground">—</span>
  );
}

// -----------------------------------------------------------------------------
// Customer bookings
// -----------------------------------------------------------------------------

export function CustomerBookingsCard({
  bookings,
}: CustomerBookingsCardProps) {
  const [localBookings, setLocalBookings] = useState(bookings);

  const [statusFilter, setStatusFilter] = useState<
    BookingStatus | "all"
  >("all");

  const [selectedBooking, setSelectedBooking] =
    useState<CustomerBooking | null>(null);

  const [isCancelling, setIsCancelling] = useState(false);

  // Keep the internal booking list synchronized with fetched data.
  useEffect(() => {
    setLocalBookings(bookings);
  }, [bookings]);

  // Filter bookings by the selected status.
  const filteredBookings = useMemo(() => {
    if (statusFilter === "all") {
      return localBookings;
    }

    return localBookings.filter(
      (booking) => booking.status === statusFilter,
    );
  }, [localBookings, statusFilter]);

  // ---------------------------------------------------------------------------
  // Cancel booking
  // ---------------------------------------------------------------------------

  const handleCancelBooking = async () => {
    if (!selectedBooking || isCancelling) return;

    try {
      setIsCancelling(true);

      await cancelCustomerBooking(selectedBooking._id);

      setLocalBookings((previous) =>
        previous.map((booking) =>
          booking._id === selectedBooking._id
            ? { ...booking, status: "cancelled" }
            : booking,
        ),
      );

      toast.success("Booking cancelled successfully!");
      setSelectedBooking(null);
    } catch (error) {
      console.error("Cancel booking error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to cancel this booking.",
      );
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
        {/* Filter bar */}
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {filteredBookings.length}{" "}
              {filteredBookings.length === 1 ? "Booking" : "Bookings"}
            </p>
            <p className="text-xs text-muted-foreground">
              Filter your repair requests by status
            </p>
          </div>

          <div className="relative w-full sm:w-40">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as BookingStatus | "all",
                )
              }
              aria-label="Filter bookings by status"
              className="
                h-10 w-full appearance-none
                rounded-lg border border-input
                bg-background px-3 pr-9
                text-sm text-foreground
                outline-none transition-colors
                focus:border-ring focus:ring-2 focus:ring-ring/20
              "
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </CardContent>

        {/* Desktop bookings table */}
        <div className="hidden overflow-x-auto md:block">
          <div className="min-w-[940px]">
            {/* Table header */}
            <div
              className="
                grid grid-cols-[minmax(220px,1.7fr)_minmax(120px,1fr)_minmax(145px,1fr)_90px_90px_75px_75px]
                items-center gap-3
                bg-muted/70 px-5 py-3
                text-[10px] font-semibold uppercase
                tracking-wider text-muted-foreground
              "
            >
              <span>Service</span>
              <span>Technician</span>
              <span>Preferred Date</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Payment</span>
              <span className="text-center">Action</span>
            </div>

            {/* Table rows */}
            {filteredBookings.length > 0 ? (
              <div className="divide-y divide-border">
                {filteredBookings.map((booking) => {
                  const ServiceIcon = getServiceIcon(booking.category);

                  const amount =
                    booking.finalAmount ?? booking.basePrice;

                  return (
                    <div
                      key={booking._id}
                      className="
                        grid grid-cols-[minmax(220px,1.7fr)_minmax(120px,1fr)_minmax(145px,1fr)_90px_90px_75px_75px]
                        items-center gap-3
                        px-5 py-4 transition-colors
                        hover:bg-muted/30
                      "
                    >
                      {/* Service */}
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <ServiceIcon className="size-5" />
                        </div>

                        <div className="min-w-0">
                          <p className="line-clamp-2 text-xs font-semibold leading-5 text-card-foreground">
                            {booking.serviceTitle}
                          </p>

                          <p className="mt-0.5 text-[10px] text-muted-foreground">
                            {booking.category}
                          </p>
                        </div>
                      </div>

                      {/* Technician */}
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-info-muted text-[9px] font-semibold text-info-foreground">
                          {getInitials(booking.technicianName)}
                        </div>

                        <span className="truncate text-xs font-medium text-card-foreground">
                          {booking.technicianName || "Not assigned"}
                        </span>
                      </div>

                      {/* Preferred date */}
                      <div className="flex min-w-0 items-start gap-1.5">
                        <CalendarDays className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />

                        <span className="text-xs leading-5 text-card-foreground">
                          {formatBookingDate(booking.preferredDate)}
                        </span>
                      </div>

                      {/* Amount */}
                      <span className="text-xs font-semibold text-card-foreground">
                        {formatAmount(amount)}
                      </span>

                      {/* Booking status */}
                      <div>
                        <span
                          data-status={booking.status}
                          className="status-badge px-2 py-1 text-[10px]"
                        >
                          {getStatusLabel(booking.status)}
                        </span>
                      </div>

                      {/* Payment status */}
                      <div>
                        <span
                          data-status={booking.paymentStatus}
                          className="status-badge px-2 py-1 text-[10px]"
                        >
                          {booking.paymentStatus === "paid"
                            ? "Paid"
                            : "Unpaid"}
                        </span>
                      </div>

                      {/* Action */}
                      <div className="flex justify-center">
                        <BookingAction
                          booking={booking}
                          onCancel={setSelectedBooking}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyBookingsState
                isFiltered={statusFilter !== "all"}
              />
            )}
          </div>
        </div>

        {/* Mobile booking cards */}
        <div className="space-y-3 p-3 md:hidden">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => {
              const ServiceIcon = getServiceIcon(booking.category);

              const amount =
                booking.finalAmount ?? booking.basePrice;

              return (
                <div
                  key={booking._id}
                  className="space-y-3 rounded-lg border border-border p-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <ServiceIcon className="size-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">
                        {booking.serviceTitle}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {booking.category}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
                    <div>
                      <p className="text-[11px] text-muted-foreground">
                        Technician
                      </p>
                      <p className="mt-1 text-xs font-medium text-foreground">
                        {booking.technicianName || "Not assigned"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] text-muted-foreground">
                        Preferred Date
                      </p>
                      <p className="mt-1 text-xs font-medium text-foreground">
                        {formatBookingDate(booking.preferredDate)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] text-muted-foreground">
                        Amount
                      </p>
                      <p className="mt-1 text-xs font-semibold text-foreground">
                        {formatAmount(amount)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] text-muted-foreground">
                        Payment
                      </p>
                      <span
                        data-status={booking.paymentStatus}
                        className="status-badge mt-1 px-2 py-1 text-[10px]"
                      >
                        {booking.paymentStatus === "paid"
                          ? "Paid"
                          : "Unpaid"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                    <span
                      data-status={booking.status}
                      className="status-badge px-2 py-1 text-[10px]"
                    >
                      {getStatusLabel(booking.status)}
                    </span>

                    <BookingAction
                      booking={booking}
                      onCancel={setSelectedBooking}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyBookingsState isFiltered={statusFilter !== "all"} />
          )}
        </div>
      </Card>

      {/* Cancellation confirmation */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close confirmation dialog"
            disabled={isCancelling}
            onClick={() => setSelectedBooking(null)}
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
          />

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
              ?
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
// Empty state
// -----------------------------------------------------------------------------

function EmptyBookingsState({
  isFiltered,
}: {
  isFiltered: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <CalendarDays className="size-6" />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-foreground">
        {isFiltered ? "No bookings found" : "No bookings yet"}
      </h3>

      <p className="mt-1 max-w-sm text-xs text-muted-foreground">
        {isFiltered
          ? "There are no bookings with this status. Try selecting another status."
          : "You haven't requested a repair yet. Browse our services to get started."}
      </p>

      {!isFiltered && (
        <Button size="sm" className="mt-4">
          <Link href="/services">Explore Services</Link>
        </Button>
      )}
    </div>
  );
}