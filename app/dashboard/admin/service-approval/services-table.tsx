
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  Check,
  Home,
  Loader2,
  SlidersHorizontal,
  Store,
  Wrench,
  X,
} from "lucide-react";

import {
  getAdminServices,
  updateAdminServiceApproval,
  type AdminService,
  type AdminServiceApprovalStatus,
  type AdminServiceCounts,
  type AdminServiceStatusFilter,
} from "@/lib/api/admin-dashboard";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// =============================================================================
// Constants
// =============================================================================

const STATUS_FILTERS: {
  label: string;
  value: AdminServiceStatusFilter;
}[] = [
  { label: "Pending", value: "pending" },
  { label: "All Services", value: "all" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const EMPTY_COUNTS: AdminServiceCounts = {
  all: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
};

// =============================================================================
// Helper functions
// =============================================================================

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

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "T"
  );
}

// =============================================================================
// Service status badge
// =============================================================================

function ServiceStatusBadge({
  status,
}: {
  status: AdminServiceApprovalStatus;
}) {
  const styles = {
    pending:
      "border-warning/30 bg-warning-muted text-warning-foreground",
    approved:
      "border-success/30 bg-success-muted text-success-foreground",
    rejected:
      "border-destructive/20 bg-destructive/10 text-destructive",
  };

  const dots = {
    pending: "bg-warning",
    approved: "bg-success",
    rejected: "bg-destructive",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dots[status]}`} />

      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// =============================================================================
// Service information
// =============================================================================

function ServiceOffering({ service }: { service: AdminService }) {
  return (
    <div className="flex min-w-[230px] items-start gap-3">
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
        {service.image ? (
          <Image
            src={service.image}
            alt={service.title}
            fill
            sizes="48px"
            unoptimized
            className="object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center">
            <Wrench className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="min-w-0 space-y-1">
        <p className="line-clamp-2 text-sm font-semibold text-foreground">
          {service.title}
        </p>

        <p className="line-clamp-1 text-xs text-muted-foreground">
          {service.estimatedDuration || "Duration not specified"}
          {service.serviceArea ? ` · ${service.serviceArea}` : ""}
        </p>

        <Link
          href={`/services/${service.id}`}
          target="_blank"
          className="text-xs font-medium text-primary hover:underline"
        >
          View details
        </Link>

        {service.approvalStatus === "rejected" &&
          service.rejectionReason && (
            <p className="line-clamp-2 text-xs text-destructive">
              Reason: {service.rejectionReason}
            </p>
          )}
      </div>
    </div>
  );
}

// =============================================================================
// Technician information
// =============================================================================

function TechnicianInfo({ service }: { service: AdminService }) {
  return (
    <div className="flex min-w-[150px] items-center gap-2.5">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border bg-primary/10 text-[10px] font-bold text-primary">
        {getInitials(service.technicianName)}
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">
          {service.technicianName}
        </p>

        <p className="truncate text-xs text-muted-foreground">
          {service.technicianEmail}
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// Service mode
// =============================================================================

function ServiceMode({ mode }: { mode: string }) {
  const isHomeVisit = mode === "Home Visit";

  return (
    <div className="flex min-w-[120px] items-center gap-2 text-sm text-muted-foreground">
      {isHomeVisit ? (
        <Home className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <Store className="h-3.5 w-3.5 shrink-0" />
      )}

      <span>{mode || "Not specified"}</span>
    </div>
  );
}

// =============================================================================
// Review actions
// =============================================================================

function ReviewActions({
  service,
  isUpdating,
  isBusy,
  onApprove,
  onReject,
}: {
  service: AdminService;
  isUpdating: boolean;
  isBusy: boolean;
  onApprove: (service: AdminService) => void;
  onReject: (service: AdminService) => void;
}) {
  if (service.approvalStatus === "approved") {
    return (
      <span className="whitespace-nowrap text-xs font-medium text-success">
        {service.isAvailable
          ? "Live on marketplace"
          : "Approved · Unavailable"}
      </span>
    );
  }

  if (service.approvalStatus === "rejected") {
    return (
      <span className="whitespace-nowrap text-xs font-medium text-destructive">
        Rejected by Admin
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        className="h-8 gap-1.5 px-3 text-xs"
        disabled={isBusy}
        onClick={() => onApprove(service)}
      >
        {isUpdating ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Check className="h-3.5 w-3.5" />
        )}
        Approve
      </Button>

      <Button
        size="sm"
        variant="outline"
        className="h-8 gap-1.5 border-destructive/30 px-3 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
        disabled={isBusy}
        onClick={() => onReject(service)}
      >
        <X className="h-3.5 w-3.5" />
        Reject
      </Button>
    </div>
  );
}

// =============================================================================
// Loading state (outside main component)
// =============================================================================

function LoadingState() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 py-2">
          <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />

          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48 max-w-full" />
            <Skeleton className="h-3 w-32 max-w-full" />
          </div>

          <Skeleton className="hidden h-7 w-24 sm:block" />
          <Skeleton className="hidden h-7 w-20 md:block" />
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// Empty state (outside main component)
// =============================================================================

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-muted">
        <Wrench className="h-5 w-5 text-muted-foreground" />
      </div>

      <div>
        <h3 className="font-semibold text-foreground">
          No services found
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          No services match the selected filters.
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// Main component
// =============================================================================

export default function ServicesTable() {
  // Data
  const [services, setServices] = useState<AdminService[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [counts, setCounts] = useState<AdminServiceCounts>(EMPTY_COUNTS);

  // Filters
  const [statusFilter, setStatusFilter] =
    useState<AdminServiceStatusFilter>("all");

  const [categoryFilter, setCategoryFilter] = useState("all");

  // Loading and error
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Approval action
  const [updatingServiceId, setUpdatingServiceId] = useState<string | null>(
    null
  );

  // Rejection modal
  const [rejectingService, setRejectingService] =
    useState<AdminService | null>(null);

  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  // Changing this value triggers a fresh fetch.
  const [refreshKey, setRefreshKey] = useState(0);

  // ===========================================================================
  // Fetch services
  // ===========================================================================

  useEffect(() => {
    let cancelled = false;

    getAdminServices(statusFilter, categoryFilter)
      .then((result) => {
        if (cancelled) return;

        setServices(result.services);
        setCategories(result.categories);
        setCounts(result.counts);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Failed to retrieve services."
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
  }, [statusFilter, categoryFilter, refreshKey]);

  // ===========================================================================
  // Filter handlers
  // ===========================================================================

  function handleStatusFilterChange(
    status: AdminServiceStatusFilter
  ) {
    setIsLoading(true);
    setError(null);
    setStatusFilter(status);
  }

  function handleCategoryFilterChange(category: string | null) {
    setIsLoading(true);
    setError(null);
    setCategoryFilter(category ?? "all");
  }

  // ===========================================================================
  // Approve service
  // ===========================================================================

  async function handleApprove(service: AdminService) {
    setUpdatingServiceId(service.id);

    try {
      await updateAdminServiceApproval(service.id, "approved");

      toast.success("Service approved successfully.");

      setIsLoading(true);
      setRefreshKey((previous) => previous + 1);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to approve service."
      );
    } finally {
      setUpdatingServiceId(null);
    }
  }

  // ===========================================================================
  // Rejection modal
  // ===========================================================================

  function openRejectModal(service: AdminService) {
    setRejectingService(service);
    setRejectionReason("");
  }

  function closeRejectModal() {
    if (isRejecting) return;

    setRejectingService(null);
    setRejectionReason("");
  }

  // ===========================================================================
  // Reject service
  // ===========================================================================

  async function handleReject() {
    if (!rejectingService) return;

    const reason = rejectionReason.trim();

    if (!reason) {
      toast.error("Please provide a rejection reason.");
      return;
    }

    setIsRejecting(true);
    setUpdatingServiceId(rejectingService.id);

    try {
      await updateAdminServiceApproval(
        rejectingService.id,
        "rejected",
        reason
      );

      toast.success("Service rejected successfully.");

      setRejectingService(null);
      setRejectionReason("");

      setIsLoading(true);
      setRefreshKey((previous) => previous + 1);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to reject service."
      );
    } finally {
      setIsRejecting(false);
      setUpdatingServiceId(null);
    }
  }

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
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Service Approval
        </h1>

        <p className="max-w-2xl text-sm text-muted-foreground">
          Review technician-submitted repair offerings, verify service
          information, and authorize marketplace availability.
        </p>
      </div>

      {/* Status filters and category filter */}
      <div className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-muted p-1">
          {STATUS_FILTERS.map((filter) => {
            const isActive = statusFilter === filter.value;

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => handleStatusFilterChange(filter.value)}
                disabled={updatingServiceId !== null}
                aria-pressed={isActive}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background hover:text-foreground"
                }`}
              >
                {filter.label}

                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                    isActive
                      ? "bg-primary-foreground/15 text-primary-foreground"
                      : "bg-background text-muted-foreground"
                  }`}
                >
                  {counts[filter.value].toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Category filter on the right */}
        <div className="flex items-center gap-2 sm:ml-auto">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />

          <Select
            value={categoryFilter}
            onValueChange={handleCategoryFilterChange}
            disabled={updatingServiceId !== null}
          >
            <SelectTrigger className="h-9 w-full border-border bg-background text-foreground sm:w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>

              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Services list */}
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
        ) : services.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="min-w-[260px]">
                      Service Offering
                    </TableHead>

                    <TableHead>Category</TableHead>
                    <TableHead>Technician</TableHead>
                    <TableHead>Base Rate</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Status</TableHead>

                    <TableHead className="text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <ServiceOffering service={service} />
                      </TableCell>

                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                          <Wrench className="h-3 w-3 text-primary" />
                          {service.category}
                        </span>
                      </TableCell>

                      <TableCell>
                        <TechnicianInfo service={service} />
                      </TableCell>

                      <TableCell className="whitespace-nowrap text-sm font-semibold text-foreground">
                        {formatCurrency(service.basePrice)}
                      </TableCell>

                      <TableCell>
                        <ServiceMode mode={service.serviceMode} />
                      </TableCell>

                      <TableCell>
                        <ServiceStatusBadge
                          status={service.approvalStatus}
                        />
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <ReviewActions
                            service={service}
                            isUpdating={updatingServiceId === service.id}
                            isBusy={updatingServiceId !== null}
                            onApprove={handleApprove}
                            onReject={openRejectModal}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile and tablet cards */}
            <div className="grid gap-3 p-3 lg:hidden">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="space-y-3 rounded-lg border border-border p-3"
                >
                  <ServiceOffering service={service} />

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                      {service.category}
                    </span>

                    <ServiceStatusBadge
                      status={service.approvalStatus}
                    />
                  </div>

                  <TechnicianInfo service={service} />

                  <div className="grid grid-cols-2 gap-3 border-t border-border pt-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Base Rate
                      </p>

                      <p className="font-semibold text-foreground">
                        {formatCurrency(service.basePrice)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Service Mode
                      </p>

                      <ServiceMode mode={service.serviceMode} />
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Submitted
                      </p>

                      <p className="text-foreground">
                        {formatDate(service.createdAt)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Duration
                      </p>

                      <p className="text-foreground">
                        {service.estimatedDuration || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-border pt-3">
                    <ReviewActions
                      service={service}
                      isUpdating={updatingServiceId === service.id}
                      isBusy={updatingServiceId !== null}
                      onApprove={handleApprove}
                      onReject={openRejectModal}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Result count */}
        {!isLoading && !error && services.length > 0 && (
          <div className="border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Showing {services.length}{" "}
              {services.length === 1 ? "service" : "services"}
            </p>
          </div>
        )}
      </div>

      {/* Rejection modal */}
      <Dialog
        open={Boolean(rejectingService)}
        onOpenChange={(open) => {
          if (!open) closeRejectModal();
        }}
      >
        <DialogContent className="bg-background text-foreground sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Reject service</DialogTitle>

            <DialogDescription>
              Provide a reason for rejecting this service. The reason
              will be saved with the service record.
            </DialogDescription>
          </DialogHeader>

          {rejectingService && (
            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-muted/50 p-3">
                <p className="text-sm font-semibold text-foreground">
                  {rejectingService.title}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Submitted by {rejectingService.technicianName}
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="rejection-reason"
                  className="text-sm font-medium text-foreground"
                >
                  Rejection reason
                </label>

                <Textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(event) =>
                    setRejectionReason(event.target.value.slice(0, 500))
                  }
                  placeholder="Explain why this service is being rejected..."
                  rows={4}
                  disabled={isRejecting}
                  className="resize-none bg-background"
                />

                <p className="text-right text-xs text-muted-foreground">
                  {rejectionReason.length}/500
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeRejectModal}
              disabled={isRejecting}
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || isRejecting}
            >
              {isRejecting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Reject Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
