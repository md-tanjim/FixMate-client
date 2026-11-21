
"use client";

import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  Download,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  getAdminDashboardOverview,
  type AdminDashboardOverview,
  type AdminDashboardRange,
} from "@/lib/api/admin-dashboard";



import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import OverviewStats from "./overview-stats";
import OverviewAnalytics from "./overview-analytics";

// --------------------------------------------------
// DATE RANGE CONFIGURATION
// --------------------------------------------------

const RANGE_LABELS: Record<AdminDashboardRange, string> = {
  all: "All Time",
  "7d": "Last 7 Days",
  "30d": "Last 30 Days",
};

// --------------------------------------------------
// CSV HELPER
// --------------------------------------------------

function escapeCsv(value: string | number) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function downloadCsv(
  overview: AdminDashboardOverview,
  range: AdminDashboardRange
) {
  const rangeLabel = RANGE_LABELS[range];
  const generatedAt = new Date().toISOString();

  const rows: (string | number)[][] = [
    ["FixMate Admin Dashboard Statistics"],
    ["Selected Period", rangeLabel],
    ["Generated At", generatedAt],
    [],
    ["Metric", "Value"],
    ["Total Users", overview.stats.totalUsers],
    ["Total Technicians", overview.stats.totalTechnicians],
    ["Pending Services", overview.stats.pendingServices],
  ];

  const csvContent =
    "\uFEFF" +
    rows
      .map((row) => row.map(escapeCsv).join(","))
      .join("\r\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = `fixmate-admin-stats-${range}-${generatedAt.slice(0, 10)}.csv`;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.URL.revokeObjectURL(url);
}

// --------------------------------------------------
// PAGE
// --------------------------------------------------

export default function AdminDashboardPage() {
  const [range, setRange] =
    useState<AdminDashboardRange>("30d");

  const [overview, setOverview] =
    useState<AdminDashboardOverview | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const requestIdRef = useRef(0);

  // --------------------------------------------------
  // INITIAL DATA FETCH
  // --------------------------------------------------

  useEffect(() => {
    let ignore = false;
    const requestId = ++requestIdRef.current;

    getAdminDashboardOverview("30d")
      .then((result) => {
        if (!ignore && requestId === requestIdRef.current) {
          setOverview(result);
          setError("");
        }
      })
      .catch((err: unknown) => {
        if (!ignore && requestId === requestIdRef.current) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to load dashboard statistics.";

          setError(message);
          toast.error(message);
        }
      })
      .finally(() => {
        if (!ignore && requestId === requestIdRef.current) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  // --------------------------------------------------
  // CHANGE DATE RANGE
  // --------------------------------------------------

  async function handleRangeChange(value: string) {
    const nextRange = value as AdminDashboardRange;

    if (
      nextRange !== "all" &&
      nextRange !== "7d" &&
      nextRange !== "30d"
    ) {
      return;
    }

    if (nextRange === range) return;

    const requestId = ++requestIdRef.current;

    const previousRange = range;
    setRange(nextRange);
    setIsLoading(true);
    setError("");

    try {
      const result = await getAdminDashboardOverview(nextRange);

      if (requestId === requestIdRef.current) {
        setOverview(result);
      }
    } catch (err) {
        setRange(previousRange);
      if (requestId === requestIdRef.current) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to update dashboard statistics.";

        setError(message);
        toast.error(message);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }

  // --------------------------------------------------
  // RETRY
  // --------------------------------------------------

  async function handleRetry() {
    const requestId = ++requestIdRef.current;

    setIsLoading(true);
    setError("");

    try {
      const result = await getAdminDashboardOverview(range);

      if (requestId === requestIdRef.current) {
        setOverview(result);
      }
    } catch (err) {
      if (requestId === requestIdRef.current) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load dashboard statistics.";

        setError(message);
        toast.error(message);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }

  // --------------------------------------------------
  // EXPORT CSV
  // --------------------------------------------------

  function handleExport() {
    if (!overview || isLoading) return;

    downloadCsv(overview, range);

    toast.success("Dashboard statistics exported successfully.");
  }

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <main className="min-w-0 space-y-6">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Admin Overview
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Monitor your platform activity and manage FixMate operations.
          </p>
        </div>

        {/* Header actions */}
        <div className="flex flex-wrap items-center gap-2">

          {/* DATE RANGE DROPDOWN */}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                type="button"
                variant="outline"
                className="h-10 gap-2"
                disabled={isLoading && !overview}
              >
                <CalendarDays className="size-4 text-primary" />

                {RANGE_LABELS[range]}

                <ChevronDown className="size-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  Date Range
                </DropdownMenuLabel>

                <DropdownMenuRadioGroup
                  value={range}
                  onValueChange={handleRangeChange}
                >
                  <DropdownMenuRadioItem value="all">
                    All Time
                  </DropdownMenuRadioItem>

                  <DropdownMenuRadioItem value="7d">
                    Last 7 Days
                  </DropdownMenuRadioItem>

                  <DropdownMenuRadioItem value="30d">
                    Last 30 Days
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* EXPORT CSV */}
          <Button
            type="button"
            variant="outline"
            className="h-10 gap-2"
            onClick={handleExport}
            disabled={!overview || isLoading}
          >
            <Download className="size-4" />
            Export Stats
          </Button>

        </div>
      </div>

      {/* ==========================================
          ERROR MESSAGE
      ========================================== */}

      {error && (
        <div className="flex flex-col gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />

            <div>
              <p className="text-sm font-semibold text-foreground">
                Unable to load dashboard data
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {error}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRetry}
            disabled={isLoading}
          >
            Try Again
          </Button>
        </div>
      )}

      {/* ==========================================
          STATISTICS CARDS
      ========================================== */}

      <OverviewStats
        stats={overview?.stats ?? null}
        range={range}
        isLoading={isLoading}
      />

      {/* Booking Activity graph and Revenue Overview
          will be added in Phase 2. */}


         <OverviewAnalytics
  bookingActivity={overview?.bookingActivity}
  revenueOverview={overview?.revenueOverview}
  range={range}
  isLoading={isLoading}
/>

    </main>
  );
}
