
import Link from "next/link";

import {
  ArrowRight,
  House,
  MapPin,
  Store,
  Wrench,
} from "lucide-react";
import { TechnicianService } from "@/lib/api/technician-dashboard";
import Image from "next/image";




// Props
type ServiceCardProps = {
  service: TechnicianService;

  // Enable this on the Browse Services page.
  showServiceArea?: boolean;
};

// Helper func
function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

function getTechnicianInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}


export default function ServiceCard({service,showServiceArea = false}: ServiceCardProps) {
  const isHomeVisit = service.serviceMode === "Home Visit";

  return (
    <article
      className="
        group flex h-full min-w-0 flex-col overflow-hidden
        rounded-2xl border border-[var(--fm-border)]
        bg-[var(--fm-surface)]
        shadow-[0_2px_8px_rgba(15,23,42,0.03)]
        transition-all duration-300
        hover:-translate-y-1
        hover:border-[var(--fm-primary)]/30
        hover:shadow-[0_14px_30px_rgba(15,23,42,0.09)]
      "
    >
      
      <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-[var(--fm-surface-soft)]">

        {service.image ? (
          <Image
            src={service.image}
            alt={service.title}
            width={100}
            height={2000}
            loading="lazy"
            decoding="async"
            className="
              size-full object-cover
              transition-transform duration-500
              group-hover:scale-105
            "
          />
        ) : (
          <div className="flex size-full items-center justify-center text-[var(--fm-muted)]">
            <Wrench size={36} />
          </div>
        )}

        {/* Category badge */}
        <div className="absolute left-3 top-3">
          <span className="
  inline-flex items-center gap-1.5
  rounded-full border border-border
  bg-card/95 px-3 py-1
  text-[11px] font-semibold text-foreground
  shadow-sm backdrop-blur-sm
">
            <Wrench size={12} className="text-primary" />
            {service.category}
          </span>
        </div>

        {/* Service mode badge */}
        <div className="absolute right-3 top-3">
          <span
            className={`
              inline-flex items-center gap-1.5
              rounded-full px-3 py-1
              text-[11px] font-semibold shadow-sm
              ${
                isHomeVisit
                  ? "bg-[#0F766E] text-white"
                  : "bg-[#DBEAFE] text-[#1D4ED8]"
              }
            `}
          >
            {isHomeVisit ? (
              <House size={12} className="bg-primary text-primary-foreground" />
            ) : (
              <Store size={12} className="bg-secondary/20 text-foreground"/>
            )}

            {service.serviceMode}
          </span>
        </div>
      </div>

    
      <div className="flex flex-1 flex-col p-4 sm:p-[18px]">

        {/* Title */}
        <h3
          className="
            line-clamp-2 min-h-[3rem]
            text-base font-bold leading-6
            text-[var(--fm-foreground)]
            transition-colors group-hover:text-[var(--fm-primary)]
          "
          title={service.title}
        >
          {service.title}
        </h3>

        {/* Description */}
        <p className="
          mt-1.5 line-clamp-2 min-h-[2.6rem]
          text-xs leading-5 text-[var(--fm-muted)]
        ">
          {service.description}
        </p>

        {/* Optional service area */}
        {showServiceArea && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-[var(--fm-muted)]">
            <MapPin size={14} className="shrink-0 text-[var(--fm-primary)]" />
            <span className="truncate">{service.serviceArea}</span>
          </div>
        )}

        {/* Technician and price */}
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--fm-border)] pt-4">

          {/* Technician */}
          <div className="flex min-w-0 items-center gap-2">
            <div className="
              flex size-8 shrink-0 items-center justify-center
              rounded-full bg-[var(--fm-surface-soft)]
              text-[10px] font-bold text-[var(--fm-primary)]
            ">
              {getTechnicianInitials(service.technicianName)}
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-[var(--fm-foreground)]">
                {service.technicianName}
              </p>
              <p className="text-[10px] text-[var(--fm-muted)]">
                Technician
              </p>
            </div>
          </div>

          {/* Starting price */}
          <div className="shrink-0 text-right">
            <p className="text-[10px] text-[var(--fm-muted)]">
              Starts at
            </p>

            <p className="text-xl font-bold tracking-tight text-[var(--fm-foreground)]">
              {formatPrice(service.basePrice)}
            </p>
          </div>
        </div>

        {/* Estimated duration */}
        <p className="mt-2 text-[11px] text-[var(--fm-muted)]">
          Estimated duration: {service.estimatedDuration}
        </p>

        {/* View Details */}
        <Link
          href={`/services/${service._id}`}
          className="
            mt-auto flex h-10 w-full items-center
            justify-center gap-2 rounded-lg
            bg-[var(--fm-surface-soft)]
            text-xs font-semibold text-[var(--fm-foreground)]
            transition-all duration-200
            hover:bg-[var(--fm-primary)]
            hover:text-white
            focus-visible:outline-2
            focus-visible:outline-offset-2
            focus-visible:outline-[var(--fm-ring)]
          "
        >
          View Details
          <ArrowRight
            size={14}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>
    </article>
  );
}
