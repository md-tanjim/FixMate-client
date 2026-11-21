
"use client";

import { useState, type FormEvent } from "react";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  Info,
  MapPin,
  Play,
  ShieldCheck,
  XCircle,
} from "lucide-react";



import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TechnicianRequest } from "@/lib/api/technician-dashboard";
import { BookingStatus } from "@/lib/api/customer-dashboard";

// --------------------------------------------------
// PROPS
// --------------------------------------------------

type RequestsTableProps = {
  requests: TechnicianRequest[];
  updatingId: string | null;
  onStatusUpdate: (
    bookingId: string,
    status: "accepted" | "rejected" | "in-progress"
  ) => Promise<void>;
  onComplete: (
    bookingId: string,
    finalAmount: number
  ) => Promise<void>;
};

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatPreferredDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function getStatusLabel(status: BookingStatus) {
  const labels: Record<BookingStatus, string> = {
    requested: "Requested",
    accepted: "Accepted",
    rejected: "Rejected",
    "in-progress": "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return labels[status];
}

// --------------------------------------------------
// STATUS BADGE
// Kept in this file intentionally.
// --------------------------------------------------

function RequestStatusBadge({
  status,
}: {
  status: BookingStatus;
}) {
  const styles: Record<BookingStatus, string> = {
    requested:
      "border-transparent bg-info/15 text-info",
    accepted:
      "border-transparent bg-primary/15 text-primary",
    "in-progress":
      "border-transparent bg-warning/20 text-warning",
    completed:
      "border-transparent bg-success/15 text-success",
    rejected:
      "border-transparent bg-destructive/15 text-destructive",
    cancelled:
      "border-transparent bg-muted text-muted-foreground",
  };

  const dotStyles: Record<BookingStatus, string> = {
    requested: "bg-info",
    accepted: "bg-primary",
    "in-progress": "bg-warning",
    completed: "bg-success",
    rejected: "bg-destructive",
    cancelled: "bg-muted-foreground",
  };

  return (
    <span
      className={`inline-flex w-fit items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium ${styles[status]}`}
    >
      <span className={`size-1.5 rounded-full ${dotStyles[status]}`} />
      {getStatusLabel(status)}
    </span>
  );
}

// --------------------------------------------------
// REQUEST DETAILS DIALOG
// Shows address, phone and problem description.
// --------------------------------------------------

function RequestDetailsDialog({
  request,
  open,
  onOpenChange,
}: {
  request: TechnicianRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Repair Request Details</DialogTitle>
          <DialogDescription>
            Customer information and reported problem.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="rounded-xl bg-muted/60 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Customer
            </p>

            <p className="mt-1 font-semibold text-foreground">
              {request.customerName}
            </p>

            <p className="text-sm text-muted-foreground">
              {request.customerEmail}
            </p>

            <p className="mt-1 text-sm text-foreground">
              {request.customerPhone}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <MapPin className="size-4 text-muted-foreground" />
              Service Address
            </div>

            <p className="rounded-lg border border-border p-3 text-sm leading-relaxed text-muted-foreground">
              {request.address}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">
              Problem Description
            </p>

            <p className="whitespace-pre-wrap rounded-lg border border-border p-3 text-sm leading-relaxed text-muted-foreground">
              {request.problemDescription}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">
              Preferred Date
            </span>

            <span className="font-medium text-foreground">
              {formatPreferredDate(request.preferredDate)}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------
// COMPLETE REPAIR DIALOG
// --------------------------------------------------

function CompleteRepairDialog({
  request,
  open,
  onOpenChange,
  onConfirm,
}: {
  request: TechnicianRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (finalAmount: number) => Promise<void>;
}) {
  const [finalAmount, setFinalAmount] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset the amount whenever a different booking is selected.
  const selectedId = request?._id;

  // The page component controls which booking is selected.
  // Initial amount is set in handleOpenComplete below.
  if (!request) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const amount = Number(finalAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Final amount must be greater than zero.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      await onConfirm(amount);
      onOpenChange(false);
      setFinalAmount("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to complete this repair."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isSubmitting) {
          onOpenChange(nextOpen);
          if (!nextOpen) {
            setError("");
          }
        }
      }}
    >
      <DialogContent className="overflow-hidden p-0 sm:max-w-[500px]">
        <div className="border-b border-border bg-primary/5 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <CheckCircle2 className="size-5" />
            </div>

            <div>
              <DialogTitle className="text-lg font-bold">
                Complete Repair Job
              </DialogTitle>

              <DialogDescription className="mt-1">
                Confirm repair details and verify final amount.
              </DialogDescription>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 p-5">
            {/* Service summary */}
            <div className="rounded-xl bg-muted/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Service Completed
              </p>

              <h3 className="mt-2 text-sm font-semibold text-foreground">
                {request.serviceTitle}
              </h3>

              <p className="mt-1 text-xs text-muted-foreground">
                Base Booking Price:{" "}
                <span className="font-semibold text-foreground">
                  {formatPrice(request.basePrice)}
                </span>
              </p>
            </div>

            {/* Final amount */}
            <div className="space-y-2">
              <Label htmlFor="finalAmount">
                Final Service Amount (USD)
              </Label>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                  $
                </span>

                <Input
                  id="finalAmount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={finalAmount}
                  onChange={(event) => {
                    setFinalAmount(event.target.value);
                    setError("");
                  }}
                  className="h-12 pl-8 text-base font-semibold"
                  placeholder="Enter final amount"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}
            </div>

            <div className="flex gap-2 rounded-lg border border-info/20 bg-info/10 p-3">
              <Info className="mt-0.5 size-4 shrink-0 text-info" />

              <p className="text-xs leading-relaxed text-muted-foreground">
                This will become the final amount payable by the customer.
                The customer will be able to pay after the job is marked
                completed.
              </p>
            </div>

            <div className="flex gap-2 rounded-lg border border-success/20 bg-success/10 p-3">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />

              <p className="text-xs leading-relaxed text-muted-foreground">
                Confirm only after the repair work has been completed.
              </p>
            </div>
          </div>

          <DialogFooter className="border-t border-border bg-muted/30 p-4 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              <Check className="mr-2 size-4" />
              {isSubmitting ? "Confirming..." : "Confirm Completion"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------
// MAIN REQUESTS TABLE
// --------------------------------------------------

export default function RequestsTable({
  requests,
  updatingId,
  onStatusUpdate,
  onComplete,
}: RequestsTableProps) {
  const [selectedForCompletion, setSelectedForCompletion] =
    useState<TechnicianRequest | null>(null);

  const [selectedForDetails, setSelectedForDetails] =
    useState<TechnicianRequest | null>(null);

  const [isCompletionOpen, setIsCompletionOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  function handleOpenCompletion(request: TechnicianRequest) {
    setSelectedForCompletion(request);
    setIsCompletionOpen(true);
  }

  function handleOpenDetails(request: TechnicianRequest) {
    setSelectedForDetails(request);
    setIsDetailsOpen(true);
  }

  async function handleComplete(finalAmount: number) {
    if (!selectedForCompletion) return;

    await onComplete(
      selectedForCompletion._id,
      finalAmount
    );

    setSelectedForCompletion(null);
  }

  function renderActions(request: TechnicianRequest) {
    const isUpdating = updatingId === request._id;

    switch (request.status) {
      case "requested":
        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              size="sm"
              onClick={() =>
                onStatusUpdate(request._id, "accepted")
              }
              disabled={isUpdating}
            >
              <Check className="mr-1 size-3.5" />
              Accept
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() =>
                onStatusUpdate(request._id, "rejected")
              }
              disabled={isUpdating}
            >
              <XCircle className="mr-1 size-3.5" />
              Reject
            </Button>
          </div>
        );

      case "accepted":
        return (
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() =>
                onStatusUpdate(request._id, "in-progress")
              }
              disabled={isUpdating}
            >
              <Play className="mr-1 size-3.5" />
              Start Work
            </Button>
          </div>
        );

      case "in-progress":
        return (
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => handleOpenCompletion(request)}
              disabled={isUpdating}
            >
              <CheckCircle2 className="mr-1 size-3.5" />
              Mark Completed
            </Button>
          </div>
        );

      case "completed":
        return (
          <div className="flex justify-end">
            {request.paymentStatus === "paid" ? (
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-success/10 px-3 py-2 text-xs font-semibold text-success">
                <CreditCard className="size-3.5" />
                Paid · {formatPrice(request.finalAmount ?? 0)}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-info/10 px-3 py-2 text-xs font-semibold text-info">
                <Clock3 className="size-3.5" />
                Waiting for Payment
              </span>
            )}
          </div>
        );

      case "rejected":
        return (
          <div className="flex justify-end">
            <span className="whitespace-nowrap rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
              Request Rejected
            </span>
          </div>
        );

      case "cancelled":
        return (
          <div className="flex justify-end">
            <span className="whitespace-nowrap rounded-lg bg-muted px-3 py-2 text-xs font-medium text-muted-foreground">
              Cancelled by Customer
            </span>
          </div>
        );

      default:
        return null;
    }
  }

  if (requests.length === 0) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-5 text-center">
        <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
          <CalendarDays className="size-5 text-muted-foreground" />
        </div>

        <h3 className="font-semibold text-foreground">
          No requests found
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          There are no repair requests in this category yet.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table className="min-w-[1000px]">
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="h-12 pl-5 text-xs font-semibold uppercase tracking-wide">
                  Customer
                </TableHead>

                <TableHead className="text-xs font-semibold uppercase tracking-wide">
                  Service
                </TableHead>

                <TableHead className="text-xs font-semibold uppercase tracking-wide">
                  Preferred Date
                </TableHead>

                <TableHead className="text-xs font-semibold uppercase tracking-wide">
                  Status
                </TableHead>

                <TableHead className="pr-5 text-right text-xs font-semibold uppercase tracking-wide">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {requests.map((request) => {
                const isTerminal =
                  request.status === "rejected" ||
                  request.status === "cancelled";

                return (
                  <TableRow
                    key={request._id}
                    className={
                      isTerminal
                        ? "bg-muted/30 opacity-60"
                        : "transition-colors"
                    }
                  >
                    {/* Customer */}
                    <TableCell className="py-4 pl-5">
                      <div className="min-w-[160px]">
                        <p className="font-semibold text-foreground">
                          {request.customerName}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {request.customerPhone}
                        </p>

                        <Button
                          variant="link"
                          size="sm"
                          className="mt-1 h-auto p-0 text-xs"
                          onClick={() => handleOpenDetails(request)}
                        >
                          View request details
                        </Button>
                      </div>
                    </TableCell>

                    {/* Service */}
                    <TableCell className="max-w-[260px]">
                      <p
                        className="truncate text-sm font-medium text-foreground"
                        title={request.serviceTitle}
                      >
                        {request.serviceTitle}
                      </p>

                      {request.category && (
                        <span className="mt-1 inline-flex rounded-md bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">
                          {request.category}
                        </span>
                      )}
                    </TableCell>

                    {/* Preferred date */}
                    <TableCell>
                      <div className="flex items-center gap-2 whitespace-nowrap text-sm text-foreground">
                        <CalendarDays className="size-4 text-muted-foreground" />
                        {formatPreferredDate(request.preferredDate)}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <RequestStatusBadge status={request.status} />
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="pr-5">
                      {renderActions(request)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="border-t border-border bg-muted/20 px-5 py-3">
          <p className="text-xs text-muted-foreground">
            Showing {requests.length} repair{" "}
            {requests.length === 1 ? "request" : "requests"}
          </p>
        </div>
      </div>

      {/* Request details dialog */}
      <RequestDetailsDialog
        request={selectedForDetails}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />

      {/* Complete repair dialog */}
      <CompleteRepairDialog
        request={selectedForCompletion}
        open={isCompletionOpen}
        onOpenChange={(open) => {
          setIsCompletionOpen(open);

          if (!open) {
            setSelectedForCompletion(null);
          }
        }}
        onConfirm={handleComplete}
      />
    </>
  );
}
