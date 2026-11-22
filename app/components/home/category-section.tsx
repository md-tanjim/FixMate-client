
import Link from "next/link";
import {
  Smartphone,
  Laptop,
  Fan,
  Refrigerator,
  Tv,
  WashingMachine,
  Zap,
  ShieldCheck,
  ClipboardCheck,
  Wallet,
  type LucideIcon,
} from "lucide-react";

type Category = {
  name: string;
  value: string;
  Icon: LucideIcon;
};

const categories: Category[] = [
  {
    name: "Smartphone",
    value: "Smartphone",
    Icon: Smartphone,
  },
  {
    name: "Laptop & PC",
    value: "Laptop & PC",
    Icon: Laptop,
  },
  {
    name: "AC",
    value: "AC",
    Icon: Fan,
  },
  {
    name: "Refrigerator",
    value: "Refrigerator",
    Icon: Refrigerator,
  },
  {
    name: "TV",
    value: "TV",
    Icon: Tv,
  },
  {
    name: "Washing Machine",
    value: "Washing Machine",
    Icon: WashingMachine,
  },
  {
    name: "Electrical",
    value: "Electrical",
    Icon: Zap,
  },
];

const trustPoints = [
  {
    label: "Verified Technicians",
    Icon: ShieldCheck,
  },
  {
    label: "Track Your Repair",
    Icon: ClipboardCheck,
  },
  {
    label: "Pay After Completion",
    Icon: Wallet,
  },
];

export default function CategorySection() {
  return (
    <section className="bg-[var(--fm-background)] py-12 sm:py-14">
      <div className="fm-container">
        {/* Section heading */}
        <div className="mb-7 space-y-2">
          <p className="text-[0.6875rem] font-bold tracking-[0.08em] text-primary uppercase">
            Browse Ecosystem
          </p>

          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            What Needs Fixing Today?
          </h2>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
          {categories.map(({ name, value, Icon }) => (
            <Link
              key={value}
              href={`/services?category=${encodeURIComponent(value)}`}
              aria-label={`Browse ${name} repair services`}
              className="
                group flex min-h-[124px] flex-col
                items-center justify-center gap-3
                rounded-2xl border border-[var(--fm-border)]
                bg-[var(--fm-surface)] px-2 py-4
                text-center shadow-[var(--fm-shadow-card)]
                transition-all duration-200 ease-out
                hover:-translate-y-0.5
                hover:border-[var(--fm-primary)]
                hover:bg-[color-mix(in_srgb,var(--fm-primary)_7%,var(--fm-surface))]
                focus-visible:outline-none
                focus-visible:ring-2 focus-visible:ring-[var(--fm-ring)]
                focus-visible:ring-offset-2
              "
            >
              {/* Category icon */}
              <span
                className="
                  flex h-11 w-11 items-center justify-center
                  rounded-xl
                  bg-[color-mix(in_srgb,var(--fm-primary)_10%,var(--fm-surface))]
                  text-[var(--fm-primary)]
                  transition-all duration-200
                  group-hover:bg-[var(--fm-primary)]
                  group-hover:text-[var(--fm-on-primary)]
                "
              >
                <Icon
                  size={21}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </span>

              {/* Category name */}
              <span className="text-xs font-semibold text-foreground sm:text-sm">
                {name}
              </span>
            </Link>
          ))}
        </div>

    
      </div>
    </section>
  );
}
