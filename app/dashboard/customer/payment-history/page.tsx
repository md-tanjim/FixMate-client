"use client";

import { useEffect, useMemo, useState } from "react";

import {
  ArrowDownWideNarrow,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Copy,
  Download,
  FileText,
  ReceiptText,
  RefreshCw,
  Wallet,
} from "lucide-react";




import { generatePaymentReceipt } from "@/lib/utils/generate-payment-receipt";
import { CustomerPayment, getCustomerPayments } from "@/lib/api/customer-dashboard";
import { toast } from "react-toastify";

type SortOrder = "newest" | "oldest";

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}

function formatPaymentDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getTechnicianInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export default function CustomerPaymentHistoryPage() {
  const [payments, setPayments] = useState<CustomerPayment[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadPayments() {
    try {
      setLoading(true);
      setError("");

      const data = await getCustomerPayments();

      setPayments(data);
    } catch (error) {
      console.error("Payment history error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while loading payments."
      );
    } finally {
      setLoading(false);
    }
  }

 useEffect(() => {
  let ignore = false;

  getCustomerPayments()
    .then((data) => {
      if (!ignore) {
        setPayments(data);
      }
    })
    .catch((error: unknown) => {
      if (ignore) return;

      console.error("Payment history error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while loading payments."
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
}, []);

  // Sort all payments using paidAt.
  const sortedPayments = useMemo(() => {
    return [...payments].sort((a, b) => {
      const dateA = new Date(a.paidAt).getTime();
      const dateB = new Date(b.paidAt).getTime();

      return sortOrder === "newest"
        ? dateB - dateA
        : dateA - dateB;
    });
  }, [payments, sortOrder]);

  // Calculate total payments grouped by currency.
  const totalByCurrency = useMemo(() => {
    return payments.reduce<Record<string, number>>((totals, payment) => {
      const currency = payment.currency.toUpperCase();

      totals[currency] = (totals[currency] || 0) + payment.amount;

      return totals;
    }, {});
  }, [payments]);

  const totalPaidLabel = Object.entries(totalByCurrency)
    .map(([currency, amount]) => formatCurrency(amount, currency))
    .join(" / ");

  async function handleCopyTransaction(transactionId: string) {
    try {
      await navigator.clipboard.writeText(transactionId);
      toast.success("Transaction ID copied.");
    } catch {
      toast.error("Could not copy transaction ID.");
    }
  }

  function handleDownloadReceipt(payment: CustomerPayment) {
    try {
      generatePaymentReceipt(payment);
      toast.success("Payment receipt downloaded.");
    } catch (error) {
      console.error("Receipt generation error:", error);
      toast.error("Could not generate the payment receipt.");
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-7 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-72 max-w-full animate-pulse rounded bg-muted" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-xl border border-border bg-card"
            />
          ))}
        </div>

        <div className="h-72 animate-pulse rounded-xl border border-border bg-card" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-border bg-card p-8 text-center">
        <div className="mb-4 rounded-full bg-red-100 p-4 text-red-600 dark:bg-red-950 dark:text-red-400">
          <RefreshCw size={26} />
        </div>

        <h2 className="text-lg font-semibold text-foreground">
          Unable to load payment history
        </h2>

        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {error}
        </p>

        <button
          onClick={() => void loadPayments()}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Payment History
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Review your payments for completed repair services.
          </p>
        </div>

        {/* Sort control */}
        {payments.length > 0 && (
          <div className="flex items-center gap-2 self-start rounded-lg border border-border bg-card px-3">
            <ArrowDownWideNarrow
              size={17}
              className="text-muted-foreground"
            />

            <select
              aria-label="Sort payments"
              value={sortOrder}
              onChange={(event) =>
                setSortOrder(event.target.value as SortOrder)
              }
              className="h-10 cursor-pointer bg-transparent text-sm font-medium text-foreground outline-none"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Total Payments
              </p>

              <h2 className="mt-2 text-2xl font-bold text-foreground">
                {payments.length}
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Successful transactions
              </p>
            </div>

            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <Wallet size={23} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Total Amount Paid
              </p>

              <h2 className="mt-2 text-2xl font-bold text-foreground">
                {totalPaidLabel || "$0.00"}
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Across all successful payments
              </p>
            </div>

            <div className="rounded-xl bg-orange-500/10 p-3 text-orange-500">
              <CircleDollarSign size={23} />
            </div>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {payments.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-12 text-center">
          <div className="mb-4 rounded-full bg-muted p-5">
            <ReceiptText
              size={32}
              className="text-muted-foreground"
            />
          </div>

          <h2 className="text-lg font-semibold text-foreground">
            No payments yet
          </h2>

          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Your successful repair service payments will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] table-fixed text-left">
                <colgroup>
                  <col className="w-[22%]" />
                  <col className="w-[14%]" />
                  <col className="w-[12%]" />
                  <col className="w-[22%]" />
                  <col className="w-[15%]" />
                  <col className="w-[15%]" />
                </colgroup>

                <thead className="border-b border-border bg-muted/50">
                  <tr className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-4">Service</th>
                    <th className="px-4 py-4">Technician</th>
                    <th className="px-4 py-4">Amount</th>
                    <th className="px-4 py-4">Transaction ID</th>
                    <th className="px-4 py-4">Payment Date</th>
                    <th className="px-4 py-4 text-center">Receipt</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {sortedPayments.map((payment) => (
                    <tr
                      key={payment._id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      {/* Service */}
                      <td className="px-5 py-5">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <FileText size={19} />
                          </div>

                          <div className="min-w-0">
                            <p
                              className="truncate text-sm font-semibold text-foreground"
                              title={payment.serviceTitle}
                            >
                              {payment.serviceTitle}
                            </p>

                            <p className="mt-1 truncate text-xs text-muted-foreground">
                              Booking #{payment.bookingId}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Technician */}
                      <td className="px-4 py-5">
                        <div className="flex min-w-0 items-center gap-2">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                            {getTechnicianInitials(payment.technicianName)}
                          </div>

                          <span className="truncate text-sm font-medium text-foreground">
                            {payment.technicianName}
                          </span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-5">
                        <p className="whitespace-nowrap text-sm font-bold text-foreground">
                          {formatCurrency(payment.amount, payment.currency)}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {payment.currency.toUpperCase()}
                        </p>
                      </td>

                      {/* Transaction ID */}
                      <td className="px-4 py-5">
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className="min-w-0 flex-1 truncate rounded-md bg-muted px-2 py-1.5 font-mono text-xs text-muted-foreground"
                            title={payment.transactionId}
                          >
                            {payment.transactionId}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              void handleCopyTransaction(payment.transactionId)
                            }
                            title="Copy transaction ID"
                            aria-label="Copy transaction ID"
                            className="shrink-0 rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                          >
                            <Copy size={15} />
                          </button>
                        </div>
                      </td>

                      {/* Payment date */}
                      <td className="px-4 py-5">
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <CalendarDays
                            size={15}
                            className="shrink-0 text-muted-foreground"
                          />

                          <span className="whitespace-nowrap">
                            {formatPaymentDate(payment.paidAt)}
                          </span>
                        </div>

                        <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 size={12} />
                          Paid
                        </div>
                      </td>

                      {/* Receipt */}
                      <td className="px-4 py-5 text-center">
                        <button
                          type="button"
                          onClick={() => handleDownloadReceipt(payment)}
                          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-brand-secondary px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-secondary-hover"
                        >
                          <Download size={14} />
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-border bg-muted/20 px-5 py-3">
              <p className="text-xs text-muted-foreground">
                Showing all {payments.length} payment
                {payments.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Mobile payment cards */}
          <div className="space-y-4 md:hidden">
            {sortedPayments.map((payment) => (
              <div
                key={payment._id}
                className="rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText size={19} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-foreground">
                        {payment.serviceTitle}
                      </h3>

                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        Booking #{payment.bookingId}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                    <CheckCircle2 size={12} />
                    Paid
                  </span>
                </div>

                <div className="my-4 grid grid-cols-2 gap-4 border-y border-border py-4">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Technician
                    </p>

                    <p className="mt-1 text-sm font-medium text-foreground">
                      {payment.technicianName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Amount
                    </p>

                    <p className="mt-1 text-sm font-bold text-foreground">
                      {formatCurrency(payment.amount, payment.currency)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Payment Date
                    </p>

                    <p className="mt-1 text-sm font-medium text-foreground">
                      {formatPaymentDate(payment.paidAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Transaction ID
                    </p>

                    <div className="mt-1 flex min-w-0 items-center gap-1">
                      <span
                        className="truncate font-mono text-xs text-foreground"
                        title={payment.transactionId}
                      >
                        {payment.transactionId}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          void handleCopyTransaction(payment.transactionId)
                        }
                        aria-label="Copy transaction ID"
                        className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownloadReceipt(payment)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-secondary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-secondary-hover"
                >
                  <Download size={16} />
                  Download Receipt
                </button>
              </div>
            ))}

            <p className="pt-1 text-center text-xs text-muted-foreground">
              Showing all {payments.length} payment
              {payments.length !== 1 ? "s" : ""}
            </p>
          </div>
        </>
      )}
    </div>
  );
}