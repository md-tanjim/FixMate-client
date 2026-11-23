"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Plus,
  RefreshCw,
  ShieldCheck,
  Wrench,
  XCircle,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

import {
  getTechnicianDashboardServices,
  getTechnicianServiceCounts,
  type TechnicianService,
  type TechnicianServiceCounts,
} from "@/lib/api/technician-dashboard";

const INITIAL_COUNTS: TechnicianServiceCounts = {
  total: 0,
  approved: 0,
  pending: 0,
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

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

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

function AvailabilityBadge({ isAvailable }: { isAvailable: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${
        isAvailable ? "text-success" : "text-muted-foreground"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${
          isAvailable ? "bg-success" : "bg-muted-foreground"
        }`}
      />
      {isAvailable ? "Available" : "Unavailable"}
    </span>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClass,
  iconBackground,
}: {
  title: string;
  value: number;
  description: string;
  icon: typeof Wrench;
  iconClass: string;
  iconBackground: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {value}
          </h2>
        </div>

        <div
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${iconBackground} ${iconClass}`}
        >
          <Icon size={22} />
        </div>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function ServiceImage({ service }: { service: TechnicianService }) {
  if (!service.image) {
    return (
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Wrench size={20} />
      </div>
    );
  }

  return (
    <div className="size-11 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={service.image}
        alt={service.title}
        className="size-full object-cover"
      />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-7 animate-pulse">
      <div className="space-y-2">
        <div className="h-3 w-36 rounded bg-muted" />
        <div className="h-8 w-64 rounded bg-muted" />
        <div className="h-4 w-80 max-w-full rounded bg-muted" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-40 rounded-2xl border border-border bg-card"
          />
        ))}
      </div>

      <div className="h-80 rounded-2xl border border-border bg-card" />
    </div>
  );
}

export default function TechnicianDashboardPage() {
  const { data: session, isPending: sessionPending } =
    authClient.useSession();

  const email = session?.user?.email;
  const fullName = session?.user?.name?.trim() || "Technician";
  const firstName = fullName.split(/\s+/)[0];

  const [services, setServices] = useState<TechnicianService[]>([]);
  const [counts, setCounts] =
    useState<TechnicianServiceCounts>(INITIAL_COUNTS);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  // Fetch both dashboard APIs when the authenticated technician is available.
  useEffect(() => {
    if (sessionPending || !email) return;

    let ignore = false;

    Promise.all([
      getTechnicianDashboardServices(email),
      getTechnicianServiceCounts(email),
    ])
      .then(([serviceData, countData]) => {
        if (ignore) return;

        setServices(serviceData);
        setCounts(countData);
      })
      .catch((error: unknown) => {
        if (ignore) return;

        console.error("Technician dashboard error:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load your dashboard."
        );
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [email, sessionPending, retryKey]);

  function handleRetry() {
    setError("");
    setLoading(true);
    setRetryKey((current) => current + 1);
  }

  if (sessionPending || loading) {
    return <DashboardSkeleton />;
  }

  if (!email) {
    return (
      <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 text-center">
        <ShieldCheck size={32} className="text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold text-foreground">
          Authentication required
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Please sign in with your technician account to view this dashboard.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <RefreshCw size={22} />
        </div>

        <h2 className="mt-4 text-lg font-semibold text-foreground">
          Could not load dashboard
        </h2>

        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {error}
        </p>

        <button
          type="button"
          onClick={handleRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-brand-primary-hover"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-primary">
            Technician workspace
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Welcome back, {firstName}!
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Here&apos;s an overview of your repair services and their approval status.
          </p>
        </div>

        <Link
          href="/dashboard/technician/add-service"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-brand-primary-hover"
        >
          <Plus size={17} />
          Add a Service
        </Link>
      </section>

      {/* Service statistics */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total Services"
          value={counts.total}
          description="All repair services you've created."
          icon={Wrench}
          iconClass="text-primary"
          iconBackground="bg-primary/10"
        />

        <StatCard
          title="Approved Services"
          value={counts.approved}
          description="Services approved by the admin."
          icon={ShieldCheck}
          iconClass="text-success"
          iconBackground="bg-success-muted"
        />

        <StatCard
          title="Pending Approval"
          value={counts.pending}
          description="Services waiting for admin review."
          icon={Clock3}
          iconClass="text-warning"
          iconBackground="bg-warning-muted"
        />
      </section>

      {/* Recent services */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground sm:text-xl">
              Recent Services
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Your five most recently created service listings.
            </p>
          </div>

          <Link
            href="/dashboard/technician/my-services"
            className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-primary transition hover:text-brand-primary-hover"
          >
            View All Services
            <ArrowRight size={16} />
          </Link>
        </div>

        {services.length === 0 ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Wrench size={26} />
            </div>

            <h3 className="mt-4 text-base font-semibold text-foreground">
              No services yet
            </h3>

            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Add your first repair service to start building your service catalog.
            </p>

            <Link
              href="/dashboard/technician/add-service"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-brand-primary-hover"
            >
              <Plus size={16} />
              Add Your First Service
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-2xl border border-border bg-card shadow-sm md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                  <thead className="border-b border-border bg-muted/50">
                    <tr className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <th className="px-5 py-4">Service</th>
                      <th className="px-4 py-4">Service Mode</th>
                      <th className="px-4 py-4">Starting Price</th>
                      <th className="px-4 py-4">Availability</th>
                      <th className="px-4 py-4">Approval Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">
                    {services.map((service) => (
                      <tr
                        key={service._id}
                        className="transition-colors hover:bg-muted/30"
                      >
                        <td className="px-5 py-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <ServiceImage service={service} />

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground">
                                {service.title}
                              </p>

                              <p className="mt-1 truncate text-xs text-muted-foreground">
                                {service.category} · {formatDate(service.createdAt)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-sm text-muted-foreground">
                          {service.serviceMode}
                        </td>

                        <td className="px-4 py-4 text-sm font-semibold text-foreground">
                          {formatPrice(service.basePrice)}
                        </td>

                        <td className="px-4 py-4">
                          <AvailabilityBadge
                            isAvailable={service.isAvailable}
                          />
                        </td>

                        <td className="px-4 py-4">
                          <ApprovalBadge status={service.approvalStatus} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-border bg-muted/20 px-5 py-3">
                <p className="text-xs text-muted-foreground">
                  Showing {services.length} most recent services
                </p>
              </div>
            </div>

            {/* Mobile service cards */}
            <div className="space-y-3 md:hidden">
              {services.map((service) => (
                <article
                  key={service._id}
                  className="rounded-2xl border border-border bg-card p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <ServiceImage service={service} />

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-foreground">
                        {service.title}
                      </h3>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {service.category}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Created {formatDate(service.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Starting Price
                      </p>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {formatPrice(service.basePrice)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Service Mode
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {service.serviceMode}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Availability
                      </p>
                      <div className="mt-1">
                        <AvailabilityBadge
                          isAvailable={service.isAvailable}
                        />
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Approval Status
                      </p>
                      <div className="mt-1">
                        <ApprovalBadge status={service.approvalStatus} />
                      </div>
                    </div>
                  </div>
                </article>
              ))}

              <p className="pt-1 text-center text-xs text-muted-foreground">
                Showing {services.length} most recent services
              </p>
            </div>
          </>
        )}
      </section>
    </div>
  );
}