
import {
  UserRoundCheck,
  Workflow,
  Shapes,
  BadgeCheck,
  type LucideIcon,
} from "lucide-react";

type Feature = {
  title: string;
  description: string;
  Icon: LucideIcon;
  accent?: "primary" | "secondary";
};

const features: Feature[] = [
  {
    title: "Skilled Technicians",
    description:
      "Connect with skilled technicians offering repair services across their service areas.",
    Icon: UserRoundCheck,
  },
  {
    title: "Transparent Repair Process",
    description:
      "Follow your repair request through clear stages: Requested, Accepted, In Progress, and Completed.",
    Icon: Workflow,
  },
  {
    title: "Convenient Discovery",
    description:
      "Explore approved repair services across seven major device and appliance categories in one place.",
    Icon: Shapes,
  },
  {
    title: "Pay After Service",
    description:
      "Your payment is available only after the technician marks your repair job as completed.",
    Icon: BadgeCheck,
    accent: "secondary",
  },
];

export default function WhyChooseSection() {
  return (
    <section className="bg-[var(--fm-background)] py-12 sm:py-14">
      <div className="fm-container">
        {/* Section heading */}
        <div className="mb-7 space-y-2">
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-primary">
            The FixMate Standard
          </p>

          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Why Choose FixMate?
          </h2>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ title, description, Icon, accent }) => (
            <div
              key={title}
              className="
                group flex min-h-[210px] flex-col
                rounded-2xl border border-[var(--fm-border)]
                bg-[var(--fm-surface)] p-5
                shadow-[var(--fm-shadow-card)]
                transition-all duration-200
                hover:-translate-y-1
                hover:border-[var(--fm-border-strong)]
              "
            >
              {/* Icon */}
              <div
                className={`
                  flex h-9 w-9 items-center justify-center
                  rounded-xl transition-colors duration-200
                  ${
                    accent === "secondary"
                      ? "bg-[color-mix(in_srgb,var(--fm-secondary)_10%,var(--fm-surface))] text-[var(--fm-secondary)]"
                      : "bg-[color-mix(in_srgb,var(--fm-primary)_10%,var(--fm-surface))] text-[var(--fm-primary)]"
                  }
                `}
              >
                <Icon size={19} strokeWidth={1.8} />
              </div>

              {/* Content */}
              <h3 className="mt-3 text-base font-semibold leading-snug text-foreground">
                {title}
              </h3>

              <p className="mt-3 text-xs leading-[1.75] text-[var(--fm-muted)] sm:text-[0.8125rem]">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
