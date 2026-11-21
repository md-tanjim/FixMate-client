
import Link from "next/link";
import {
  Search,
  Wrench,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

import {
  getPublicServices,
  type PublicServicesQuery,
} from "@/lib/api/publicApi";

import { Button } from "@/components/ui/button";
import ServiceFilters from "./service-filters";
import ServiceCard from "../components/home/serviceCard";
import { TechnicianService } from "@/lib/api/technician-dashboard";

type PageProps = {
  searchParams: Promise<{
    search?: string | string[];
    category?: string | string[];
    serviceMode?: string | string[];
    sort?: string | string[];
  }>;
};

// --------------------------------------------------
// FILTER VALIDATION
// --------------------------------------------------

const CATEGORIES = [
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Refrigerator",
  "TV",
  "Washing Machine",
  "Electrical",
  "others",
] as const;

const SERVICE_MODES = [
  "Home Visit",
  "Shop Drop-off",
] as const;

const SORT_OPTIONS = [
  "price-asc",
  "price-desc",
  "newest",
] as const;

function getQueryValue(value?: string | string[]) {
  return typeof value === "string" ? value.trim() : "";
}

function getValidatedFilters(
  params: Awaited<PageProps["searchParams"]>
): PublicServicesQuery {
  const search = getQueryValue(params.search);
  const category = getQueryValue(params.category);
  const serviceMode = getQueryValue(params.serviceMode);
  const sort = getQueryValue(params.sort);

  return {
    search: search.slice(0, 100) || undefined,

    category: CATEGORIES.includes(
      category as (typeof CATEGORIES)[number]
    )
      ? (category as (typeof CATEGORIES)[number])
      : "",

    serviceMode: SERVICE_MODES.includes(
      serviceMode as (typeof SERVICE_MODES)[number]
    )
      ? (serviceMode as (typeof SERVICE_MODES)[number])
      : "",

    sort: SORT_OPTIONS.includes(
      sort as (typeof SORT_OPTIONS)[number]
    )
      ? (sort as (typeof SORT_OPTIONS)[number])
      : "newest",
  };
}

// --------------------------------------------------
// PAGE
// --------------------------------------------------

export default async function ServicesPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  const filters = getValidatedFilters(params);

  let services: TechnicianService[];
  let total = 0;
  let fetchError = false;

  try {
    const result = await getPublicServices(filters);

    services = result.services;
    total = result.total;
  } catch (error) {
    console.error("Services page fetch error:", error);
    fetchError = true;
    services = [];
  }

  const hasActiveFilters =
    !!filters.search ||
    !!filters.category ||
    !!filters.serviceMode ||
    filters.sort !== "newest";

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-[1440px] space-y-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">

        {/* ==========================================
            PAGE HEADER
        ========================================== */}

        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-primary">
              Find Your Repair Solution
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Explore Repair Services
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Find the right repair service for your device or
              home appliance. Browse available services from
              technicians in your area.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wrench className="size-4 text-primary" />
            <span>Professional repair solutions</span>
          </div>

        </section>

        {/* ==========================================
            SEARCH AND FILTERS
        ========================================== */}

        <ServiceFilters initialFilters={filters} />

        {/* ==========================================
            SERVICE RESULTS
        ========================================== */}

        <section className="space-y-5">

          {/* Results heading */}
          <div className="flex flex-wrap items-center justify-between gap-3">

            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Available Repair Services
              </h2>

              {!fetchError && (
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {total} {total === 1 ? "service" : "services"}
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <p className="text-xs text-muted-foreground">
                Filtered results
              </p>
            )}

          </div>

          {/* API error state */}
          {fetchError ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-border bg-card px-5 text-center">

              <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-destructive/10">
                <RefreshCw className="size-6 text-destructive" />
              </div>

              <h3 className="text-lg font-semibold text-foreground">
                Unable to load services
              </h3>

              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                Something went wrong while fetching repair
                services. Please try again.
              </p>

              <Button  className="mt-5 gap-2">
                <Link href="/services">
                  <RefreshCw className="size-4" />
                  Try Again
                </Link>
              </Button>

            </div>
          ) : services.length > 0 ? (

            /* Service grid */
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {services.map((service) => (
                <ServiceCard
                  key={service._id}
                  service={service}
                  showServiceArea
                />
              ))}

            </div>

          ) : (

            /* Empty state */
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-5 text-center">

              <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
                <Search className="size-7 text-primary" />
              </div>

              <h3 className="text-lg font-semibold text-foreground">
                No services found
              </h3>

              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                We couldnt find any repair services matching
                your search or selected filters. Try changing
                your filters or searching for something else.
              </p>

              <Button className="mt-5 gap-2">
                <Link href="/services">
                  Clear All Filters
                  <ArrowRight className="size-4" />
                </Link>
              </Button>

            </div>

          )}

        </section>

      </div>
    </main>
  );
}
