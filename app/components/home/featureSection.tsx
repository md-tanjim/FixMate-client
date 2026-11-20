
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  ArrowRight,
  RefreshCw,
  Wrench,
} from "lucide-react";
import { TechnicianService } from "@/lib/api/technician-dashboard";
import { getFeaturedServices } from "@/lib/api/publicApi";
import ServiceCard from "./serviceCard";





// -----------------------------------------------------------------------------
// Skeleton Card
// -----------------------------------------------------------------------------

function FeaturedServiceSkeleton() {
  return (
    <div className="
      flex h-full flex-col overflow-hidden
      rounded-2xl border border-[var(--fm-border)]
      bg-[var(--fm-surface)]
    ">
      {/* Image skeleton */}
      <div className="aspect-[16/9] w-full animate-pulse bg-[var(--fm-surface-soft)]" />

      {/* Content skeleton */}
      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-[18px]">

        <div className="space-y-2">
          <div className="h-5 w-4/5 animate-pulse rounded bg-[var(--fm-surface-soft)]" />
          <div className="h-4 w-3/5 animate-pulse rounded bg-[var(--fm-surface-soft)]" />
        </div>

        <div className="h-10 animate-pulse rounded bg-[var(--fm-surface-soft)]" />

        <div className="mt-auto flex items-center justify-between">
          <div className="h-8 w-28 animate-pulse rounded bg-[var(--fm-surface-soft)]" />
          <div className="h-7 w-16 animate-pulse rounded bg-[var(--fm-surface-soft)]" />
        </div>

        <div className="h-10 animate-pulse rounded-lg bg-[var(--fm-surface-soft)]" />
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Featured Services Section
// -----------------------------------------------------------------------------

export default function FeaturedServicesSection() {
  const [services, setServices] = useState<TechnicianService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // ---------------------------------------------------------------------------
  // Fetch featured services
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let isCancelled = false;

    async function fetchServices() {
      try {
        setIsLoading(true);
        setError(null);

        const result = await getFeaturedServices();

        if (!isCancelled) {
          setServices(result);
        }
      } catch (error) {
        console.error("Featured services fetch error:", error);

        if (!isCancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load featured services."
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void fetchServices();

    return () => {
      isCancelled = true;
    };
  }, [retryCount]);

  // ---------------------------------------------------------------------------
  // Section
  // ---------------------------------------------------------------------------

  return (
    <section
      className="
        bg-[var(--fm-background)]
        py-12 sm:py-14 lg:py-16
      "
    >
      <div className="fm-container">

        {/* --------------------------------------------------------------- */}
        {/* Section Heading                                                  */}
        {/* --------------------------------------------------------------- */}

        <div className="
          mb-8 flex flex-col gap-4
          sm:mb-9 sm:flex-row
          sm:items-end sm:justify-between
        ">
          <div>
            <p className="
              mb-2 text-[11px] font-bold
              uppercase tracking-[0.12em]
              text-[var(--fm-primary)]
            ">
              Curated Quality
            </p>

            <h2 className="
              text-2xl font-bold tracking-tight
              text-[var(--fm-foreground)]
              sm:text-3xl
            ">
              Featured Repair Services
            </h2>

            <p className="
              mt-2 max-w-xl text-sm
              leading-6 text-[var(--fm-muted)]
              sm:text-base
            ">
              Discover trusted repair services from skilled
              technicians ready to assist you.
            </p>
          </div>

          {/* View All Services */}
          <Link
            href="/services"
            className="
              inline-flex w-fit shrink-0
              items-center gap-2
              text-sm font-semibold
              text-[var(--fm-primary)]
              transition-colors
              hover:text-[var(--fm-primary-hover)]
            "
          >
            View All Services

            <ArrowRight
              size={17}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* --------------------------------------------------------------- */}
        {/* Loading State                                                    */}
        {/* --------------------------------------------------------------- */}

        {isLoading && (
          <div className="
            grid grid-cols-1 gap-5
            sm:grid-cols-2
            lg:grid-cols-3
          ">
            {Array.from({ length: 6 }).map((_, index) => (
              <FeaturedServiceSkeleton key={index} />
            ))}
          </div>
        )}

        {/* --------------------------------------------------------------- */}
        {/* Error State                                                      */}
        {/* --------------------------------------------------------------- */}

        {!isLoading && error && (
          <div className="
            flex min-h-[260px] flex-col
            items-center justify-center
            rounded-2xl border border-[var(--fm-border)]
            bg-[var(--fm-surface)] p-6 text-center
          ">
            <div className="
              mb-4 flex size-12 items-center justify-center
              rounded-full bg-[var(--fm-surface-soft)]
              text-[var(--fm-muted)]
            ">
              <RefreshCw size={23} />
            </div>

            <h3 className="
              text-lg font-semibold
              text-[var(--fm-foreground)]
            ">
              Unable to load services
            </h3>

            <p className="
              mt-2 max-w-sm text-sm
              text-[var(--fm-muted)]
            ">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                setRetryCount((previous) => previous + 1)
              }
              className="
                mt-5 inline-flex h-10
                items-center gap-2 rounded-lg
                bg-[var(--fm-primary)] px-5
                text-sm font-semibold text-white
                transition hover:bg-[var(--fm-primary-hover)]
              "
            >
              <RefreshCw size={15} />
              Try Again
            </button>
          </div>
        )}

        {/* --------------------------------------------------------------- */}
        {/* Empty State                                                      */}
        {/* --------------------------------------------------------------- */}

        {!isLoading && !error && services.length === 0 && (
          <div className="
            flex min-h-[260px] flex-col
            items-center justify-center
            rounded-2xl border border-dashed
            border-[var(--fm-border-strong)]
            bg-[var(--fm-surface)] p-6 text-center
          ">
            <div className="
              mb-4 flex size-14 items-center justify-center
              rounded-full bg-[var(--fm-surface-soft)]
              text-[var(--fm-primary)]
            ">
              <Wrench size={26} />
            </div>

            <h3 className="
              text-lg font-semibold
              text-[var(--fm-foreground)]
            ">
              No featured services yet
            </h3>

            <p className="
              mt-2 max-w-sm text-sm
              text-[var(--fm-muted)]
            ">
              Our technicians are preparing their services.
              Check back soon or explore all available services.
            </p>

            <Link
              href="/services"
              className="
                mt-5 inline-flex items-center gap-2
                text-sm font-semibold
                text-[var(--fm-primary)]
                hover:underline
              "
            >
              Explore Services
              <ArrowRight size={15} />
            </Link>
          </div>
        )}

        {/* --------------------------------------------------------------- */}
        {/* Featured Services Grid                                           */}
        {/* --------------------------------------------------------------- */}

        {!isLoading && !error && services.length > 0 && (
          <div className="
            grid grid-cols-1 gap-5
            sm:grid-cols-2
            lg:grid-cols-3
            items-stretch
          ">
            {services.map((service) => (
              <ServiceCard
                key={service._id}
                service={service}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
