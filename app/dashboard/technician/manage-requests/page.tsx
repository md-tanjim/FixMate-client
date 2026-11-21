
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, ClipboardList } from "lucide-react";
import { toast } from "react-toastify";



import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { BookingStatus } from "@/lib/api/customer-dashboard";
import { completeTechnicianRequest, getTechnicianRequests, TechnicianRequest, updateTechnicianRequestStatus } from "@/lib/api/technician-dashboard";
import RequestsTable from "./requests-table";

type RequestsFilter =
  | "all"
  | "requested"
  | "accepted"
  | "in-progress"
  | "completed"
  | "cancelled";

const FILTER_TABS: {
  value: RequestsFilter;
  label: string;
  countStatus?: BookingStatus;
}[] = [
  { value: "all", label: "All" },
  { value: "requested", label: "Requested", countStatus: "requested" },
  { value: "accepted", label: "Accepted", countStatus: "accepted" },
  {
    value: "in-progress",
    label: "In Progress",
    countStatus: "in-progress",
  },
  { value: "completed", label: "Completed", countStatus: "completed" },
  { value: "cancelled", label: "Cancelled", countStatus: "cancelled" },
];

export default function TechnicianRequestsPage() {
  const [requests, setRequests] = useState<TechnicianRequest[]>([]);
  const [activeTab, setActiveTab] = useState<RequestsFilter>("all");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [pageError, setPageError] = useState("");


  // GET REQUESTS


  const refreshRequests = useCallback(async () => {
    setIsRefreshing(true);
    setPageError("");

    try {
      const data = await getTechnicianRequests();
      setRequests(data);
      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load repair requests.";

      setPageError(message);
      toast.error(message);
      return false;
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, []);

  // Initial API call.
  useEffect(() => {
    let ignore = false;

    getTechnicianRequests()
      .then((data) => {
        if (!ignore) {
          setRequests(data);
          setPageError("");
        }
      })
      .catch((error: unknown) => {
        if (!ignore) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to load repair requests.";

          setPageError(message);
          toast.error(message);
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);


  // FILTER COUNTS


  const counts = useMemo(() => {
    return {
      all: requests.length,
      requested: requests.filter(
        (request) => request.status === "requested"
      ).length,
      accepted: requests.filter(
        (request) => request.status === "accepted"
      ).length,
      "in-progress": requests.filter(
        (request) => request.status === "in-progress"
      ).length,
      completed: requests.filter(
        (request) => request.status === "completed"
      ).length,
      cancelled: requests.filter(
        (request) => request.status === "cancelled"
      ).length,
    };
  }, [requests]);


  // FILTERED REQUESTS


  const filteredRequests = useMemo(() => {
    if (activeTab === "all") {
      return requests;
    }

    return requests.filter(
      (request) => request.status === activeTab
    );
  }, [requests, activeTab]);


  // STATUS UPDATE


  async function handleStatusUpdate(
    bookingId: string,
    status: "accepted" | "rejected" | "in-progress"
  ) {
    setUpdatingId(bookingId);

    try {
      await updateTechnicianRequestStatus(bookingId, status);

      const updatedRequests = await getTechnicianRequests();
      setRequests(updatedRequests);

      const messages = {
        accepted: "Repair request accepted.",
        rejected: "Repair request rejected.",
        "in-progress": "Repair work started.",
      };

      toast.success(messages[status]);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update request."
      );
      throw error;
    } finally {
      setUpdatingId(null);
    }
  }


  // COMPLETE REPAIR


  async function handleComplete(
    bookingId: string,
    finalAmount: number
  ) {
    setUpdatingId(bookingId);

    try {
      await completeTechnicianRequest(bookingId, finalAmount);

      const updatedRequests = await getTechnicianRequests();
      setRequests(updatedRequests);

      toast.success(
        "Repair completed. Waiting for customer payment."
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to complete repair."
      );
      throw error;
    } finally {
      setUpdatingId(null);
    }
  }


  // RENDER


  return (
    <main className="min-w-0 space-y-6">

      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Manage Requests
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Review customer repair requests and manage your ongoing repair jobs.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={refreshRequests}
          disabled={isRefreshing}
          aria-label="Refresh repair requests"
          title="Refresh requests"
          className="size-10 shrink-0 self-start sm:self-auto"
        >
          <RefreshCw
            className={`size-4 ${
              isRefreshing ? "animate-spin" : ""
            }`}
          />
        </Button>
      </div>

      

{/* Request Filters */}
<Tabs
  value={activeTab}
  onValueChange={(value) =>
    setActiveTab(value as RequestsFilter)
  }
  className="w-full"
>
  <div className="w-fit max-w-full overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
    <TabsList className="inline-flex h-12 w-max min-w-max items-center justify-start gap-1 rounded-xl border border-border bg-muted/70 p-1">
      {FILTER_TABS.map((tab) => {
        const isActive = activeTab === tab.value;

        return (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="h-9 flex-none gap-2 rounded-lg px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-background/70 hover:text-foreground data-[state=active]:shadow-sm"
            style={
              isActive
                ? {
                    backgroundColor: "var(--fm-primary)",
                    color: "var(--fm-on-primary)",
                  }
                : undefined
            }
          >
            <span>{tab.label}</span>

            <span
              className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
                isActive
                  ? "bg-white/20 text-white"
                  : "bg-background/70 text-muted-foreground"
              }`}
            >
              {counts[tab.value]}
            </span>
          </TabsTrigger>
        );
      })}
    </TabsList>
  </div>
</Tabs>



      {/* Requests table */}
      {isLoading ? (
        <div className="space-y-3 rounded-xl border border-border bg-card p-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-4"
            >
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-28" />
            </div>
          ))}
        </div>
      ) : pageError ? (
        <div className="flex min-h-[250px] flex-col items-center justify-center rounded-xl border border-border bg-card p-6 text-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-destructive/10">
            <ClipboardList className="size-5 text-destructive" />
          </div>

          <h2 className="font-semibold text-foreground">
            Unable to load requests
          </h2>

          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            {pageError}
          </p>

          <Button
            className="mt-4"
            onClick={refreshRequests}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`mr-2 size-4 ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
            Try Again
          </Button>
        </div>
      ) : (
        <RequestsTable
          requests={filteredRequests}
          updatingId={updatingId}
          onStatusUpdate={handleStatusUpdate}
          onComplete={handleComplete}
        />
      )}

    </main>
  );
}
