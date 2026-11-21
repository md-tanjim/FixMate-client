
import {
  Users,
  UserRoundCheck,
  ClipboardClock,
} from "lucide-react";

import type {
  AdminDashboardRange,
  AdminDashboardStats,
} from "@/lib/api/admin-dashboard";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Skeleton } from "@/components/ui/skeleton";

type OverviewStatsProps = {
  stats: AdminDashboardStats | null;
  range: AdminDashboardRange;
  isLoading: boolean;
};

const RANGE_LABELS: Record<AdminDashboardRange, string> = {
  all: "All Time",
  "7d": "Last 7 Days",
  "30d": "Last 30 Days",
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export default function OverviewStats({
  stats,
  range,
  isLoading,
}: OverviewStatsProps) {
  const rangeLabel = RANGE_LABELS[range];

  const cards = [
    {
      title: "Total Users",
      value: stats?.totalUsers,
      description:
        range === "all"
          ? "All registered users on FixMate"
          : `Users registered in the ${rangeLabel.toLowerCase()}`,
      icon: Users,
      iconStyle: "bg-primary/10 text-primary",
    },
    {
      title: "Total Technicians",
      value: stats?.totalTechnicians,
      description:
        range === "all"
          ? "All registered technicians"
          : `Technicians registered in the ${rangeLabel.toLowerCase()}`,
      icon: UserRoundCheck,
      iconStyle: "bg-primary/10 text-primary",
    },
    {
      title: "Pending Services",
      value: stats?.pendingServices,
      description:
        range === "all"
          ? "Services currently awaiting approval"
          : `Services submitted in the ${rangeLabel.toLowerCase()} still awaiting approval`,
      icon: ClipboardClock,
      iconStyle: "bg-secondary/20 text-foreground",
    },
  ];

  return (
    <section
      aria-label="Platform statistics"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
    >
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.title}
            className="rounded-2xl border-border bg-card shadow-sm"
          >
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`flex size-11 items-center justify-center rounded-xl ${card.iconStyle}`}
                >
                  <Icon className="size-5" />
                </div>

                <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
                  {rangeLabel}
                </span>
              </div>

              <div className="mt-5 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {card.title}
                </p>

                {isLoading ? (
                  <Skeleton className="mt-2 h-10 w-28" />
                ) : (
                  <p className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl tabular-nums">
                    {card.value !== undefined
                      ? formatNumber(card.value)
                      : "—"}
                  </p>
                )}

                <p className="max-w-xs pt-1 text-xs leading-relaxed text-muted-foreground">
                  {card.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
