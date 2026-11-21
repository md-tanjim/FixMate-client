
import {
  SearchCheck,
  ClipboardList,
  Wrench,
  ShieldCheck,
} from "lucide-react";

const STEPS = [
  {
    number: "01",
    title: "Find a Service",
    description:
      "Browse available repair services and choose the right technician based on verified reviews and pricing.",
    icon: SearchCheck,
  },
  {
    number: "02",
    title: "Send a Request",
    description:
      "Describe your problem, select a convenient service date, and submit your repair request in minutes.",
    icon: ClipboardList,
  },
  {
    number: "03",
    title: "Technician Fixes It",
    description:
      "The technician accepts your request, completes the repair, and keeps you updated throughout the process.",
    icon: Wrench,
  },
  {
    number: "04",
    title: "Pay After Completion",
    description:
      "Once the repair is completed to your satisfaction, securely pay online. No upfront payment required.",
    icon: ShieldCheck,
    featured: true,
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 bg-muted/50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">

        {/* Section heading */}
        <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-14">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-primary">
            Seamless Operation
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How FixMate Works
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Getting your device repaired is simple. Follow four
            straightforward steps with zero financial upfront risk.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {STEPS.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className={`group relative flex min-h-[220px] flex-col rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                  step.featured
                    ? "border-secondary/50"
                    : "border-border"
                }`}
              >
                {/* Icon and number */}
                <div className="mb-5 flex items-center justify-between">
                  <div
                    className={`flex size-11 items-center justify-center rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-105 ${
                      step.featured
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <Icon className="size-5" />
                  </div>

                  <span
                    className={`text-3xl font-bold tracking-tight ${
                      step.featured
                        ? "text-secondary"
                        : "text-primary/25"
                    }`}
                  >
                    {step.number}
                  </span>
                </div>

                {/* Featured label */}
                {step.featured && (
                  <span className="mb-2 w-fit rounded-md bg-secondary/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-foreground">
                    FixMate Model
                  </span>
                )}

                {/* Content */}
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
