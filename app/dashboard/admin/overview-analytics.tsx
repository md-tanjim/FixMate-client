
"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
} from "recharts";

import type {
  AdminBookingActivity,
  AdminDashboardRange,
  AdminRevenueOverview,
} from "@/lib/api/admin-dashboard";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarCheck,
  ChartColumn,
} from "lucide-react";

// --------------------------------------------------
// CHART CONFIGURATIONS
// --------------------------------------------------

const bookingChartConfig = {
  bookings: {
    label: "Bookings",
    color: "var(--fm-primary)",
  },
} satisfies ChartConfig;

const revenueChartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--fm-primary)",
  },
} satisfies ChartConfig;

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function formatChartDate(
  value: string,
  range: AdminDashboardRange
) {
  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  if (range === "all") {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      year: "2-digit",
      timeZone: "UTC",
    }).format(date);
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// --------------------------------------------------
// BOOKING ACTIVITY
// --------------------------------------------------

type OverviewAnalyticsProps = {
  bookingActivity: AdminBookingActivity | undefined;
  revenueOverview: AdminRevenueOverview | undefined;
  range: AdminDashboardRange;
  isLoading: boolean;
};

function BookingActivity({
  bookingActivity,
  range,
  isLoading,
}: Pick<OverviewAnalyticsProps, "bookingActivity" | "range" | "isLoading">) {
  const rangeDescription =
    range === "all"
      ? "Monthly repair bookings across FixMate."
      : `Daily repair bookings over the last ${
          range === "7d" ? "7" : "30"
        } days.`;

  return (
    <Card className="min-w-0 rounded-2xl border-border bg-card shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
        <div className="min-w-0 space-y-1">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <CalendarCheck className="size-4 text-primary" />
            Booking Activity
          </CardTitle>

          <CardDescription className="max-w-xs text-xs leading-relaxed">
            {rangeDescription}
          </CardDescription>
        </div>

        <div className="shrink-0 text-right">
          {isLoading ? (
            <>
              <Skeleton className="ml-auto h-7 w-20" />
              <Skeleton className="ml-auto mt-1 h-3 w-24" />
            </>
          ) : (
            <>
              <p className="text-xl font-bold tracking-tight text-primary tabular-nums sm:text-2xl">
                {bookingActivity?.totalBookings.toLocaleString("en-US") ?? 0}{" "}
                <span className="text-xs font-semibold">Bookings</span>
              </p>

              <p className="mt-1 text-[11px] text-muted-foreground">
                Avg. {bookingActivity?.averagePerDay.toFixed(1) ?? "0.0"} / day
              </p>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-2 pb-4 pt-4 sm:px-5">
        {isLoading ? (
          <Skeleton className="h-[190px] w-full rounded-lg" />
        ) : bookingActivity && bookingActivity.data.length > 0 ? (
          <ChartContainer
            config={bookingChartConfig}
            className="h-[190px] w-full"
          >
            <AreaChart
              accessibilityLayer
              data={bookingActivity.data}
              margin={{
                left: 8,
                right: 8,
                top: 10,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient
                  id="bookingActivityFill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--color-bookings)"
                    stopOpacity={0.4}
                  />

                  <stop
                    offset="95%"
                    stopColor="var(--color-bookings)"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                vertical={false}
                strokeDasharray="3 4"
                className="stroke-border"
              />

              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                minTickGap={28}
                tick={{ fontSize: 10 }}
                tickFormatter={(value: string) =>
                  formatChartDate(value, range)
                }
                className="fill-muted-foreground"
              />

              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    labelFormatter={(value) =>
                      formatChartDate(String(value), range)
                    }
                  />
                }
              />

              <Area
                dataKey="bookings"
                name="Bookings"
                type="natural"
                stroke="var(--color-bookings)"
                strokeWidth={2.5}
                fill="url(#bookingActivityFill)"
                dot={false}
                activeDot={{
                  r: 4,
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[190px] flex-col items-center justify-center gap-2 text-center">
            <CalendarCheck className="size-8 text-muted-foreground/60" />

            <p className="text-sm font-medium text-foreground">
              No booking activity yet
            </p>

            <p className="text-xs text-muted-foreground">
              Booking activity will appear here when customers submit requests.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// --------------------------------------------------
// REVENUE OVERVIEW
// --------------------------------------------------

function RevenueOverview({
  revenueOverview,
  range,
  isLoading,
}: Pick<OverviewAnalyticsProps, "revenueOverview" | "range" | "isLoading">) {
  const rangeDescription =
    range === "all"
      ? "Completed customer payments recorded through Stripe."
      : `Completed customer payments over the last ${
          range === "7d" ? "7" : "30"
        } days.`;

  const hasRevenue =
    !!revenueOverview &&
    revenueOverview.totalRevenue > 0;

  const percentageChange =
    revenueOverview?.percentageChange;

  const comparisonLabel =
    percentageChange === null || percentageChange === undefined
      ? range === "all"
        ? "All-time revenue"
        : revenueOverview?.totalRevenue
          ? "No previous-period revenue"
          : "No revenue comparison"
      : `${percentageChange > 0 ? "+" : ""}${percentageChange.toFixed(1)}% vs. previous period`;

  const comparisonColor =
    percentageChange === null || percentageChange === undefined
      ? "text-muted-foreground"
      : percentageChange > 0
        ? "text-success"
        : percentageChange < 0
          ? "text-destructive"
          : "text-muted-foreground";

  return (
    <Card className="min-w-0 rounded-2xl border-border bg-card shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
        <div className="min-w-0 space-y-1">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <ChartColumn className="size-4 text-primary" />
            Revenue Overview
          </CardTitle>

          <CardDescription className="max-w-xs text-xs leading-relaxed">
            {rangeDescription}
          </CardDescription>
        </div>

        <div className="shrink-0 text-right">
          {isLoading ? (
            <>
              <Skeleton className="ml-auto h-7 w-28" />
              <Skeleton className="ml-auto mt-1 h-3 w-24" />
            </>
          ) : (
            <>
              <p className="text-xl font-bold tracking-tight text-primary tabular-nums sm:text-2xl">
                {formatCurrency(revenueOverview?.totalRevenue ?? 0)}
              </p>

              <p className={`mt-1 text-[10px] font-medium ${comparisonColor}`}>
                {comparisonLabel}
              </p>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-2 pb-4 pt-4 sm:px-5">
        {isLoading ? (
          <Skeleton className="h-[190px] w-full rounded-lg" />
        ) : hasRevenue ? (
          <ChartContainer
            config={revenueChartConfig}
            className="h-[190px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={revenueOverview.data}
              margin={{
                left: 8,
                right: 8,
                top: 10,
                bottom: 0,
              }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 4"
                className="stroke-border"
              />

              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                minTickGap={28}
                tick={{ fontSize: 10 }}
                tickFormatter={(value: string) =>
                  formatChartDate(value, range)
                }
                className="fill-muted-foreground"
              />

              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    labelFormatter={(value) =>
                      formatChartDate(String(value), range)
                    }
                    formatter={(value) =>
                      formatCurrency(Number(value))
                    }
                  />
                }
              />

              <Bar
                dataKey="revenue"
                name="Revenue"
                fill="var(--color-revenue)"
                radius={[3, 3, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[190px] flex-col items-center justify-center gap-2 text-center">
            <ChartColumn className="size-8 text-muted-foreground/60" />

            <p className="text-sm font-medium text-foreground">
              No paid transactions
            </p>

            <p className="text-xs text-muted-foreground">
              Revenue will appear here after customers complete payments.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// --------------------------------------------------
// MAIN ANALYTICS SECTION
// --------------------------------------------------

export default function OverviewAnalytics({
  bookingActivity,
  revenueOverview,
  range,
  isLoading,
}: OverviewAnalyticsProps) {
  return (
    <section
      aria-label="Dashboard analytics"
      className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2"
    >
      <BookingActivity
        bookingActivity={bookingActivity}
        range={range}
        isLoading={isLoading}
      />

      <RevenueOverview
        revenueOverview={revenueOverview}
        range={range}
        isLoading={isLoading}
      />
    </section>
  );
}
