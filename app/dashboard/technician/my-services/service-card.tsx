
"use client";

import {
  CalendarDays,
  Pencil,
  Trash2,
  Wrench,
} from "lucide-react";

import { Switch } from "@/components/ui/switch";

import type { TechnicianService } from "@/lib/api/technician-dashboard";

type ServiceCardProps = {
  service: TechnicianService;
  onEdit: (service: TechnicianService) => void;
  onDelete: (service: TechnicianService) => void;
  onAvailabilityChange: (
    service: TechnicianService,
    nextAvailable: boolean
  ) => void;
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(price);
}

function formatDate(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ApprovalBadge({
  status,
}: {
  status: TechnicianService["approvalStatus"];
}) {
  const labels = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
  };

  return (
    <span
      className="approval-badge"
      data-approval-status={status}
    >
      {labels[status]}
    </span>
  );
}

function ServiceImage({ service }: { service: TechnicianService }) {
  if (!service.image) {
    return (
      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Wrench size={20} />
      </div>
    );
  }

  return (
    <div className="size-12 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={service.image}
        alt={service.title}
        className="size-full object-cover"
      />
    </div>
  );
}

function MarketplaceAvailability({
  service,
  onAvailabilityChange,
}: {
  service: TechnicianService;
  onAvailabilityChange: (
    service: TechnicianService,
    nextAvailable: boolean
  ) => void;
}) {
  const isRejected = service.approvalStatus === "rejected";

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <Switch
        checked={service.isAvailable}
        disabled={isRejected}
        onCheckedChange={(checked) =>
          onAvailabilityChange(service, checked)
        }
        aria-label={
          isRejected
            ? "Availability locked for rejected service"
            : `Make ${service.title} ${
                service.isAvailable ? "unavailable" : "available"
              }`
        }
      />

      <span
        className={`whitespace-nowrap text-xs font-medium ${
          isRejected
            ? "text-muted-foreground"
            : service.isAvailable
              ? "text-success"
              : "text-muted-foreground"
        }`}
      >
        {isRejected
          ? "Locked"
          : service.isAvailable
            ? "Available"
            : "Unavailable"}
      </span>
    </div>
  );
}

export default function ServiceCard({
  service,
  onEdit,
  onDelete,
  onAvailabilityChange,
}: ServiceCardProps) {
  return (
    <article className="border-b border-border bg-card transition-colors last:border-b-0 hover:bg-muted/20">

      {/* ==========================================
          DESKTOP TABLE ROW
      ========================================== */}

      <div className="hidden min-h-[88px] items-center gap-4 px-5 py-4 md:grid md:grid-cols-[minmax(0,2.3fr)_0.85fr_0.65fr_0.7fr_0.85fr_1fr_0.7fr]">

        {/* Service Details */}
        <div className="flex min-w-0 items-center gap-3">
          <ServiceImage service={service} />

          <div className="min-w-0">
            <h3
              className="truncate text-sm font-semibold text-foreground"
              title={service.title}
            >
              {service.title}
            </h3>

            <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
              <span>{service.estimatedDuration}</span>
              <span aria-hidden="true">·</span>

              <span className="inline-flex items-center gap-1">
                <CalendarDays size={12} />
                {formatDate(service.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Category */}
        <div className="min-w-0">
          <span className="inline-flex max-w-full rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            {service.category}
          </span>
        </div>

        {/* Base Price */}
        <p className="whitespace-nowrap text-sm font-semibold text-foreground">
          {formatPrice(service.basePrice)}
        </p>

        {/* Duration */}
        <p className="text-sm text-muted-foreground">
          {service.estimatedDuration}
        </p>

        {/* Approval Status */}
        <div className="min-w-0">
          <ApprovalBadge status={service.approvalStatus} />
        </div>

        {/* Marketplace — ONLY DESKTOP TOGGLE */}
        <MarketplaceAvailability
          service={service}
          onAvailabilityChange={onAvailabilityChange}
        />

        {/* Actions */}
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => onEdit(service)}
            title="Edit service"
            aria-label={`Edit ${service.title}`}
            className="rounded-lg p-2 text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
          >
            <Pencil size={16} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(service)}
            title="Delete service"
            aria-label={`Delete ${service.title}`}
            className="rounded-lg p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* ==========================================
          MOBILE SERVICE CARD
      ========================================== */}

      <div className="space-y-4 p-4 md:hidden">

        {/* Service title and image */}
        <div className="flex min-w-0 items-start gap-3">
          <ServiceImage service={service} />

          <div className="min-w-0 flex-1">
            <h3 className="break-words text-sm font-semibold leading-snug text-foreground">
              {service.title}
            </h3>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span>{service.estimatedDuration}</span>

              <span aria-hidden="true">·</span>

              <span>{formatDate(service.createdAt)}</span>
            </div>
          </div>

          <p className="shrink-0 text-sm font-bold text-foreground">
            {formatPrice(service.basePrice)}
          </p>
        </div>

        {/* Category and Approval */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="max-w-[65%] truncate rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            {service.category}
          </span>

          <ApprovalBadge status={service.approvalStatus} />
        </div>

        {/* Service information */}
        <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/40 p-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Duration
            </p>

            <p className="mt-1 break-words text-sm font-medium text-foreground">
              {service.estimatedDuration}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Service Mode
            </p>

            <p className="mt-1 break-words text-sm font-medium text-foreground">
              {service.serviceMode}
            </p>
          </div>

          <div className="col-span-2 min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Service Area
            </p>

            <p className="mt-1 break-words text-sm font-medium text-foreground">
              {service.serviceArea}
            </p>
          </div>
        </div>

        {/* Marketplace and Actions */}
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-t border-border pt-3">

          {/* ONLY MOBILE TOGGLE */}
          <MarketplaceAvailability
            service={service}
            onAvailabilityChange={onAvailabilityChange}
          />

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(service)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted"
            >
              <Pencil size={14} />
              Edit
            </button>

            <button
              type="button"
              onClick={() => onDelete(service)}
              aria-label={`Delete ${service.title}`}
              className="rounded-lg border border-border p-2 text-muted-foreground transition hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
