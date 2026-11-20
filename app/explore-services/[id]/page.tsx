import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ChevronRight,
  Clock3,
  House,
  Laptop,
  MapPin,
  Package,
  Smartphone,
  Store,
  Tv,
  WashingMachine,
  Wind,
  Wrench,
  Zap,
  DollarSign,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";
import { getPublicServiceDetails } from "@/lib/api/publicApi";
import ServiceBookingCard from "../service-booking-card";




type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

const CATEGORY_CONFIG = {
  Smartphone: {
    label: "Smartphone",
    icon: Smartphone,
  },
  "Laptop & PC": {
    label: "Laptop & PC",
    icon: Laptop,
  },
  AC: {
    label: "AC",
    icon: Wind,
  },
  Refrigerator: {
    label: "Refrigerator",
    icon: Package,
  },
  TV: {
    label: "TV",
    icon: Tv,
  },
  "Washing Machine": {
    label: "Washing Machine",
    icon: WashingMachine,
  },
  Electrical: {
    label: "Electrical",
    icon: Zap,
  },
  others: {
    label: "Others",
    icon: Wrench,
  },
} as const;

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function ServiceDetailsPage({params}: PageProps) {
    
    const { id } = await params;
    // console.log(id);
  const result = await getPublicServiceDetails(id);

  if (!result) {
    notFound();
  }

  const { service, technician } = result;

  const categoryConfig =
    CATEGORY_CONFIG[service.category] ?? CATEGORY_CONFIG.others;

  const CategoryIcon = categoryConfig.icon;

  const technicianName =
    technician.name || service.technicianName;

  return (
    <main className="min-h-screen bg-background">

      <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8">

            {/* breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 overflow-hidden"
        >
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm">

            <li>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
              >
                <House size={14} />
                Home
              </Link>
            </li>

            <li aria-hidden="true">
              <ChevronRight
                size={14}
                className="text-muted-foreground"
              />
            </li>

            <li>
              <Link
                href="/services"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                Services
              </Link>
            </li>

            <li aria-hidden="true">
              <ChevronRight
                size={14}
                className="text-muted-foreground"
              />
            </li>

            <li className="min-w-0">
              <Link
                href={`/services?category=${encodeURIComponent(service.category)}`}
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                {categoryConfig.label}
              </Link>
            </li>

            <li aria-hidden="true">
              <ChevronRight
                size={14}
                className="text-muted-foreground"
              />
            </li>

            <li
              aria-current="page"
              className="min-w-0 max-w-full break-words font-medium text-foreground"
            >
              {service.title}
            </li>

          </ol>
        </nav>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,0.95fr)] lg:gap-7">


          <div className="min-w-0 space-y-6">
            <div className="group relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-border bg-muted shadow-sm">

              {service.image ? (
                <>
                  
                  <img
                    src={service.image}
                    alt={service.title}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
                  />

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />
                </>
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-3 text-muted-foreground">
                  <Package size={42} />
                  <p className="text-sm font-medium">
                    No service image available
                  </p>
                </div>
              )}

            </div>



            <Card className="rounded-xl border-border bg-card shadow-sm">
              <CardContent className="p-5 sm:p-6">

                <Badge
                  variant="secondary"
                  className="mb-3 inline-flex items-center gap-1.5 border-0 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/10"
                >
                  <CategoryIcon size={13} />
                  {categoryConfig.label}
                </Badge>

                <h1 className="break-words text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
                  {service.title}
                </h1>

                <div className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="text-sm text-muted-foreground">
                    Starting from
                  </span>

                  <span className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                    {formatPrice(service.basePrice)}
                  </span>
                </div>

              </CardContent>
            </Card>



            <Card className="rounded-xl border-border bg-card shadow-sm">
              <CardContent className="p-5 sm:p-6">

                <h2 className="text-base font-bold text-foreground">
                  About This Service
                </h2>

                <Separator className="my-4" />

                <p className="whitespace-pre-line break-words text-sm leading-7 text-muted-foreground sm:text-[15px]">
                  {service.description}
                </p>

              </CardContent>
            </Card>


            <Card className="rounded-xl border-0 bg-primary/5 shadow-none dark:bg-primary/5">
              <CardContent className="grid grid-cols-2 gap-x-4 gap-y-5 p-5 sm:grid-cols-4 sm:gap-4 sm:p-5">


                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <DollarSign size={13} />

                    <p className="text-[11px] font-semibold uppercase tracking-wide">
                      Starting Price
                    </p>
                  </div>

                  <p className="break-words text-sm font-bold text-foreground">
                    {formatPrice(service.basePrice)}
                  </p>
                </div>

      
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock3 size={13} />

                    <p className="text-[11px] font-semibold uppercase tracking-wide">
                      Est. Duration
                    </p>
                  </div>

                  <p className="break-words text-sm font-bold text-foreground">
                    {service.estimatedDuration}
                  </p>
                </div>

                {/* Service mode */}
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Store size={13} />

                    <p className="text-[11px] font-semibold uppercase tracking-wide">
                      Service Mode
                    </p>
                  </div>

                  <p className="break-words text-sm font-bold text-foreground">
                    {service.serviceMode}
                  </p>
                </div>

                {/* Service area */}
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin size={13} />

                    <p className="text-[11px] font-semibold uppercase tracking-wide">
                      Service Area
                    </p>
                  </div>

                  <p className="break-words text-sm font-bold text-foreground">
                    {service.serviceArea}
                  </p>
                </div>

              </CardContent>
            </Card>



            <Card className="rounded-xl border-border bg-card shadow-sm">
              <CardContent className="p-5 sm:p-6">

                <h2 className="text-base font-bold text-foreground">
                  About Your Technician
                </h2>

                <Separator className="my-4" />

                <div className="flex items-start gap-4">

                  <Avatar className="size-14 shrink-0 border border-border sm:size-16">
                    <AvatarImage
                      src={technician.image || undefined}
                      alt={technicianName}
                    />

                    <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
                      {getInitials(technicianName) || "T"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">

                    <h3 className="break-words text-base font-bold text-foreground">
                      {technicianName}
                    </h3>


                    {technician.area?.trim() && (
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin size={13} className="shrink-0" />

                        <span className="break-words">
                          {technician.area}
                        </span>
                      </div>
                    )}

                    {technician.bio?.trim() && (
                      <p className="mt-2 break-words text-sm leading-relaxed text-muted-foreground">
                        {technician.bio}
                      </p>
                    )}

                  </div>
                </div>

              </CardContent>
            </Card>

          </div>

          <aside
            aria-label="Service booking panel"
            className="hidden min-w-0 lg:block"
          >
            <ServiceBookingCard service={service} />
          </aside>

        </div>
      </div>
    </main>
  );
}