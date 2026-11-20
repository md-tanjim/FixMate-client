"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  AlertCircle,
  ArrowDownWideNarrow,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Wrench,
} from "lucide-react";

import { toast } from "react-toastify";

import { authClient } from "@/lib/auth-client";

import {
  deleteTechnicianService,
  getTechnicianMyServices,
  getTechnicianServiceCounts,
  updateTechnicianService,
  updateTechnicianServiceAvailability,
  type TechnicianService,
  type TechnicianServiceCounts,
  type UpdateTechnicianServiceInput,
} from "@/lib/api/technician-dashboard";
import ServiceCard from "./service-card";
import EditServiceDialog from "./edit-service-dialog";



type SortOrder = "newest" | "oldest";

const INITIAL_COUNTS: TechnicianServiceCounts = {
  total: 0,
  approved: 0,
  pending: 0,
};

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor,
  iconBackground,
}: {
  title: string;
  value: number;
  description: string;
  icon: typeof Wrench;
  iconColor: string;
  iconBackground: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>

          <h3 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            {value}
          </h3>
        </div>

        <div
          className={`flex size-10 items-center justify-center rounded-xl ${iconBackground} ${iconColor}`}
        >
          <Icon size={20} />
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-16 rounded-xl bg-muted" />

      <div className="flex items-center justify-between">
        <div className="h-8 w-40 rounded bg-muted" />
        <div className="h-10 w-32 rounded bg-muted" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-28 rounded-xl border border-border bg-card"
          />
        ))}
      </div>

      <div className="h-80 rounded-xl border border-border bg-card" />
    </div>
  );
}

export default function MyServicesPage() {
  const { data: session, isPending: sessionPending } =
    authClient.useSession();

  const technicianEmail = session?.user?.email;


  // Page data
  const [services, setServices] = useState<TechnicianService[]>([]);
  const [counts, setCounts] =
    useState<TechnicianServiceCounts>(INITIAL_COUNTS);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [reloadKey, setReloadKey] = useState(0);

  
  // Dialog states
  const [editingService, setEditingService] =
    useState<TechnicianService | null>(null);

  const [selectedAvailability, setSelectedAvailability] =
    useState<{
      service: TechnicianService;
      nextAvailable: boolean;
    } | null>(null);

  const [selectedServiceForDelete, setSelectedServiceForDelete] =
    useState<TechnicianService | null>(null);

  const [isUpdatingAvailability, setIsUpdatingAvailability] =
    useState(false);

  const [isDeleting, setIsDeleting] = useState(false);

  
  // fetch services and counts
  useEffect(() => {
    if (sessionPending || !technicianEmail) return;

    let ignore = false;

    Promise.all([
      getTechnicianMyServices(),
      getTechnicianServiceCounts(technicianEmail),
    ])
      .then(([serviceData, countData]) => {
        if (ignore) return;

        setServices(serviceData);
        setCounts(countData);
        setError("");
      })
      .catch((error: unknown) => {
        if (ignore) return;

        console.error("My Services loading error:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load your services."
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
  }, [technicianEmail, sessionPending, reloadKey]);

  
  //sorting
  const sortedServices = useMemo(() => {
    return [...services].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();

      return sortOrder === "newest"
        ? dateB - dateA
        : dateA - dateB;
    });
  }, [services, sortOrder]);

  //calcu rejected count from the counts api.
  const rejectedCount = Math.max(
    0,
    counts.total - counts.approved - counts.pending
  );

  
  //refresh counts after changes
  async function refreshCounts() {
    if (!technicianEmail) return;

    try {
      const updatedCounts =
        await getTechnicianServiceCounts(technicianEmail);

      setCounts(updatedCounts);
    } catch (error) {
 
      console.error("Could not refresh service counts:", error);
    }
  }

  
  //retry loading
  function handleRetry() {
    setError("");
    setLoading(true);
    setReloadKey((current) => current + 1);
  }


  //availability
  function handleRequestAvailabilityChange(
    service: TechnicianService,
    nextAvailable: boolean
  ) {
    if (service.approvalStatus === "rejected") {
      return;
    }

    setSelectedAvailability({
      service,
      nextAvailable,
    });
  }

  async function handleConfirmAvailability() {
    if (!selectedAvailability) return;

    const { service, nextAvailable } = selectedAvailability;

    try {
      setIsUpdatingAvailability(true);

      const result = await updateTechnicianServiceAvailability(
        service._id,
        nextAvailable
      );

      setServices((current) =>
        current.map((item) =>
          item._id === service._id
            ? result.service
            : item
        )
      );

      toast.success(
        nextAvailable
          ? "Service is now available on the marketplace."
          : "Service has been made unavailable."
      );

      setSelectedAvailability(null);

    } catch (error) {
      console.error("Availability update error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update service availability."
      );
    } finally {
      setIsUpdatingAvailability(false);
    }
  }


  //EDIT SERVICE
  function handleOpenEdit(service: TechnicianService) {
    setEditingService(service);
  }

  async function handleSaveEdit(
    serviceId: string,
    data: UpdateTechnicianServiceInput
  ) {
    const result = await updateTechnicianService(serviceId, data);

    setServices((current) =>
      current.map((service) =>
        service._id === serviceId
          ? result.service
          : service
      )
    );

    await refreshCounts();
  }


  // DELETE SERVICE
  async function handleConfirmDelete() {
    if (!selectedServiceForDelete) return;

    const service = selectedServiceForDelete;

    try {
      setIsDeleting(true);

      await deleteTechnicianService(service._id);

      setServices((current) =>
        current.filter((item) => item._id !== service._id)
      );

      setSelectedServiceForDelete(null);

      toast.success("Service deleted successfully.");

      await refreshCounts();

    } catch (error) {
      console.error("Delete service error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete service."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  
  // Session loading
  if (sessionPending || loading) {
    return <PageSkeleton />;
  }

  if (!technicianEmail) {
    return (
      <div className="flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-border bg-card p-8 text-center">
        <ShieldCheck size={32} className="text-muted-foreground" />

        <h2 className="mt-4 text-lg font-semibold text-foreground">
          Sign in required
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Please sign in with your technician account to manage your services.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-border bg-card p-8 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle size={23} />
        </div>

        <h2 className="mt-4 text-lg font-semibold text-foreground">
          Unable to load your services
        </h2>

        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {error}
        </p>

        <button
          type="button"
          onClick={handleRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-7 pb-8">

      <div className="flex items-start gap-3 rounded-xl border border-info/20 bg-info/5 p-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-info/10 text-info">
          <ShieldCheck size={19} />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Quality Compliance Protocol
          </h2>

          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">
              Important Business Rule:
            </span>{" "}
            Editing an approved or live service will reset its status to{" "}
            <span className="font-semibold text-warning">
              Pending
            </span>{" "}
            for administrator re-verification before updates are published
            to customers.
          </p>
        </div>
      </div>

   {/* heading */}

      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              My Services
            </h1>

            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
              {counts.total} TOTAL
            </span>
          </div>

          <p className="mt-1.5 text-sm text-muted-foreground">
            Manage your repair catalog, approval status, and marketplace visibility.
          </p>
        </div>

        <Link
          href="/dashboard/technician/add-service"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          <Plus size={17} />
          Add a Service
        </Link>
      </section>

      {/* summary cards */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Total Services"
          value={counts.total}
          description="All your created service listings."
          icon={Wrench}
          iconColor="text-primary"
          iconBackground="bg-primary/10"
        />

        <StatCard
          title="Approved"
          value={counts.approved}
          description="Services approved by the administrator."
          icon={CheckCircle2}
          iconColor="text-success"
          iconBackground="bg-success/10"
        />

        <StatCard
          title="Pending Review"
          value={counts.pending}
          description="Services waiting for admin approval."
          icon={Clock3}
          iconColor="text-warning"
          iconBackground="bg-warning/10"
        />

        <StatCard
          title="Rejected"
          value={rejectedCount}
          description="Services that need corrections."
          icon={AlertCircle}
          iconColor="text-destructive"
          iconBackground="bg-destructive/10"
        />

      </section>

      {/* service list header */}

      <section className="space-y-4">

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Your Service Listings
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              View and manage all the services youve created.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-lg border border-border bg-card px-3">
            <ArrowDownWideNarrow
              size={16}
              className="text-muted-foreground"
            />

            <select
              aria-label="Sort services by creation date"
              value={sortOrder}
              onChange={(event) =>
                setSortOrder(event.target.value as SortOrder)
              }
              className="h-10 cursor-pointer bg-transparent text-sm font-medium text-foreground outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

       {/* empty */}

        {services.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Wrench size={26} />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-foreground">
              No services found
            </h3>

            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              You havent created any repair services yet. Add your first
              service to start building your catalog.
            </p>

            <Link
              href="/dashboard/technician/add-service"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              <Plus size={16} />
              Add Your First Service
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">

            {/* desktop column headings */}
            <div className="hidden items-center gap-4 border-b border-border bg-muted/50 px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground md:grid md:grid-cols-[minmax(0,2.3fr)_0.85fr_0.65fr_0.7fr_0.85fr_1fr_0.7fr]">
              <span>Service Details</span>
              <span>Category</span>
              <span>Base Price</span>
              <span>Duration</span>
              <span>Review Status</span>
              <span>Marketplace</span>
              <span className="text-right">Actions</span>
            </div>

            {/* all service cards */}
            {sortedServices.map((service) => (
              <ServiceCard
                key={service._id}
                service={service}
                onEdit={handleOpenEdit}
                onDelete={setSelectedServiceForDelete}
                onAvailabilityChange={handleRequestAvailabilityChange}
              />
            ))}

            <div className="border-t border-border bg-muted/20 px-5 py-3">
              <p className="text-xs text-muted-foreground">
                Showing all {services.length} service
                {services.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}

      </section>

   
{/* edit moal */}
      {editingService && (
        <EditServiceDialog
          key={editingService._id}
          service={editingService}
          onClose={() => setEditingService(null)}
          onSave={handleSaveEdit}
        />
      )}

    

      {selectedAvailability && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

          <button
            type="button"
            aria-label="Close availability confirmation"
            disabled={isUpdatingAvailability}
            onClick={() => setSelectedAvailability(null)}
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
          />

          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="availability-title"
            aria-describedby="availability-description"
            className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"
          >
            <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Wrench size={21} />
            </div>

            <h2
              id="availability-title"
              className="mt-4 text-lg font-semibold text-foreground"
            >
              {selectedAvailability.nextAvailable
                ? "Make this service available?"
                : "Make this service unavailable?"}
            </h2>

            <p
              id="availability-description"
              className="mt-2 text-sm leading-relaxed text-muted-foreground"
            >
              Are you sure you want to{" "}
              {selectedAvailability.nextAvailable
                ? "make"
                : "make"}{" "}
              <span className="font-semibold text-foreground">
                {selectedAvailability.service.title}
              </span>{" "}
              {selectedAvailability.nextAvailable
                ? "available"
                : "unavailable"}{" "}
              on the customer marketplace?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={isUpdatingAvailability}
                onClick={() => setSelectedAvailability(null)}
                className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isUpdatingAvailability}
                onClick={() => void handleConfirmAvailability()}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUpdatingAvailability ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Yes, Confirm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

     
      {/* delete confirm */}
      {selectedServiceForDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

          <button
            type="button"
            aria-label="Close delete confirmation"
            disabled={isDeleting}
            onClick={() => setSelectedServiceForDelete(null)}
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
          />

          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-service-title"
            aria-describedby="delete-service-description"
            className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"
          >
            <div className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <Trash2 size={21} />
            </div>

            <h2
              id="delete-service-title"
              className="mt-4 text-lg font-semibold text-foreground"
            >
              Delete this service?
            </h2>

            <p
              id="delete-service-description"
              className="mt-2 text-sm leading-relaxed text-muted-foreground"
            >
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-foreground">
                {selectedServiceForDelete.title}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setSelectedServiceForDelete(null)}
                className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-50"
              >
                Keep Service
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={() => void handleConfirmDelete()}
                className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    Yes, Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}