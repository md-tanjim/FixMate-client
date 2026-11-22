
"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { CreditCard, RefreshCw, Wrench } from "lucide-react";

import {
  getAdminTransactions,
  type AdminTransaction,
  type AdminTransactionRange,
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



const DATE_RANGES: {
  label: string;
  value: AdminTransactionRange;
}[] = [
  { label: "All Time", value: "all" },
  { label: "Today", value: "today" },
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 30 Days", value: "30d" },
];



//help functions
function formatCurrency(amount: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(Number(amount) || 0);
}

function formatPaymentDate(date: string | null) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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
      .toUpperCase() || "U"
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  if (status.toLowerCase() === "paid") {
    return (
      <span className="status-badge" data-status="paid">
        Paid
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
      {status}
    </span>
  );
}

// =============================================================================
// Customer and technician information
// =============================================================================

function PersonInfo({
  name,
  email,
  color = "primary",
}: {
  name: string;
  email: string;
  color?: "primary" | "secondary";
}) {
  return (
    <div className="flex min-w-[145px] items-center gap-2.5">
      <div
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border text-[10px] font-bold ${
          color === "primary"
            ? "bg-primary/10 text-primary"
            : "bg-secondary/10 text-foreground"
        }`}
      >
        {getInitials(name)}
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">
          {name}
        </p>

        <p className="truncate text-xs text-muted-foreground">
          {email}
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// Service information
// =============================================================================

function ServiceInfo({ title }: { title: string }) {
  return (
    <div className="flex min-w-[190px] items-center gap-2.5">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <Wrench className="h-4 w-4" />
      </div>

      <span className="text-sm font-semibold text-foreground">
        {title}
      </span>
    </div>
  );
}

// =============================================================================
// Loading and empty states — outside main component
// =============================================================================

function LoadingState() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 py-2">
          <Skeleton className="h-8 w-8 shrink-0 rounded-full" />

          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>

          <Skeleton className="hidden h-6 w-24 sm:block" />
          <Skeleton className="hidden h-6 w-28 md:block" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-muted">
        <CreditCard className="h-5 w-5 text-muted-foreground" />
      </div>

      <div>
        <h3 className="font-semibold text-foreground">
          No transactions found
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          No payments were found for the selected date range.
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// Main component
// =============================================================================

export default function TransactionsTable() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const [dateRange, setDateRange] =
    useState<AdminTransactionRange>("all");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Changing this value triggers a refresh.
  const [refreshKey, setRefreshKey] = useState(0);

  // ===========================================================================
  // Fetch transactions
  // ===========================================================================

  useEffect(() => {
    let cancelled = false;

    getAdminTransactions(dateRange)
      .then((result) => {
        if (cancelled) return;

        setTransactions(result.transactions);
        setTotalRevenue(result.totalRevenue);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Failed to retrieve transactions."
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
  }, [dateRange, refreshKey]);

  // ===========================================================================
  // Filter and refresh handlers
  // ===========================================================================

  function handleDateRangeChange(value: string | null) {
    if (!value || value === dateRange) return;

    setIsLoading(true);
    setError(null);
    setDateRange(value as AdminTransactionRange);
  }

  function handleRefresh() {
    setIsLoading(true);
    setError(null);
    setRefreshKey((previous) => previous + 1);
  }

  // Use the first transaction's currency. FixMate payments currently use USD.
  const currency = transactions[0]?.currency || "usd";

  // ===========================================================================
  // Render
  // ===========================================================================

  return (
    <div className="w-full space-y-6">
      {/* Page heading and controls */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Transactions
          </h1>

          <p className="text-sm text-muted-foreground">
            Monitor customer payments and review completed repair service transactions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={dateRange}
            onValueChange={handleDateRangeChange}
            disabled={isLoading}
          >
            <SelectTrigger className="h-9 w-[145px] border-border bg-card text-foreground">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>

            <SelectContent>
              {DATE_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={handleRefresh}
            disabled={isLoading}
            aria-label="Refresh transactions"
            title="Refresh transactions"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Total revenue */}
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <CreditCard className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Revenue
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Total revenue from successful repair service payments.
            </p>

            <div className="mt-3">
              {isLoading ? (
                <Skeleton className="h-10 w-48" />
              ) : (
                <p className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {formatCurrency(totalRevenue, currency)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transactions table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
            <p className="text-sm text-destructive">{error}</p>

            <Button variant="outline" size="sm" onClick={handleRefresh}>
              Try again
            </Button>
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead>Customer</TableHead>
                    <TableHead>Technician</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead className="text-right">
                      Payment Date
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction._id}>
                      <TableCell>
                        <PersonInfo
                          name={transaction.customerName}
                          email={transaction.customerEmail}
                        />
                      </TableCell>

                      <TableCell>
                        <PersonInfo
                          name={transaction.technicianName}
                          email={transaction.technicianEmail}
                          color="secondary"
                        />
                      </TableCell>

                      <TableCell>
                        <ServiceInfo title={transaction.serviceTitle} />
                      </TableCell>

                      <TableCell>
                        <div className="flex min-w-[120px] items-center gap-2">
                          <span className="whitespace-nowrap text-sm font-bold text-foreground">
                            {formatCurrency(
                              transaction.amount,
                              transaction.currency
                            )}
                          </span>

                          <PaymentStatusBadge
                            status={transaction.paymentStatus}
                          />
                        </div>
                      </TableCell>

                      <TableCell>
                        <span
                          title={transaction.transactionId}
                          className="block max-w-[180px] truncate rounded-md bg-muted px-2 py-1 font-mono text-xs text-muted-foreground"
                        >
                          {transaction.transactionId || "—"}
                        </span>
                      </TableCell>

                      <TableCell className="whitespace-nowrap text-right text-sm text-foreground">
                        {formatPaymentDate(transaction.paidAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile and tablet cards */}
            <div className="grid gap-3 p-3 lg:hidden">
              {transactions.map((transaction) => (
                <div
                  key={transaction._id}
                  className="space-y-3 rounded-lg border border-border p-3"
                >
                  <ServiceInfo title={transaction.serviceTitle} />

                  <div className="grid grid-cols-1 gap-3 border-t border-border pt-3 sm:grid-cols-2">
                    <div>
                      <p className="mb-2 text-xs text-muted-foreground">
                        Customer
                      </p>

                      <PersonInfo
                        name={transaction.customerName}
                        email={transaction.customerEmail}
                      />
                    </div>

                    <div>
                      <p className="mb-2 text-xs text-muted-foreground">
                        Technician
                      </p>

                      <PersonInfo
                        name={transaction.technicianName}
                        email={transaction.technicianEmail}
                        color="secondary"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">
                        {formatCurrency(
                          transaction.amount,
                          transaction.currency
                        )}
                      </span>

                      <PaymentStatusBadge
                        status={transaction.paymentStatus}
                      />
                    </div>

                    <span className="text-xs text-muted-foreground">
                      {formatPaymentDate(transaction.paidAt)}
                    </span>
                  </div>

                  <div className="border-t border-border pt-3">
                    <p className="mb-1 text-xs text-muted-foreground">
                      Transaction ID
                    </p>

                    <p className="break-all font-mono text-xs text-muted-foreground">
                      {transaction.transactionId || "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Result count */}
        {!isLoading && !error && transactions.length > 0 && (
          <div className="border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Showing {transactions.length}{" "}
              {transactions.length === 1 ? "transaction" : "transactions"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
