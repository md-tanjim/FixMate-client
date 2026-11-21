
"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  Search,
  ShieldCheck,
  Wrench,
  CircleHelp,
  ClipboardCheck,
  CreditCard,
} from "lucide-react";

export default function HeroBanner() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const query = search.trim();

    router.push(
      query
        ? `/services?search=${encodeURIComponent(query)}`
        : "/services"
    );
  };

  return (
    <section
      className="
        relative flex min-h-[calc(100svh-4.5rem)]
        items-center overflow-hidden
        bg-[var(--fm-background)]
      "
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-teal-100/40 blur-3xl dark:bg-teal-900/10" />

      {/* Main container */}
      <div
        className="
          fm-container relative
          grid w-full grid-cols-1
          items-center gap-6
          py-5
          md:grid-cols-2 md:gap-8
          lg:gap-12
          lg:py-6
        "
      >
        {/* LEFT CONTENT */}
        <div className="relative z-10 flex flex-col items-start">

          {/* Trust badge */}
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--fm-primary)]/15 bg-[var(--fm-primary)]/[0.07] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--fm-primary)] sm:mb-4">
            <ShieldCheck size={13} />
            Your Trusted Repair Partner
          </div>

          {/* Heading */}
          <h1
            className="
              max-w-[650px]
              text-[clamp(2rem,4vw,3.4rem)]
              font-bold leading-[1.12]
              tracking-tight
              text-[var(--fm-foreground)]
            "
          >
            Broken Device?
            <br />
            Get It Fixed by{" "}
            <span className="text-[var(--fm-primary)]">
              Trusted Technicians.
            </span>
          </h1>

          {/* Description */}
          <p className="mt-3 max-w-[480px] text-sm leading-6 text-[var(--fm-muted)] sm:mt-4 sm:text-base sm:leading-7">
            Find skilled technicians for your devices and home appliances.
            Request a repair, track its real-time progress, and pay only
            after the job is successfully completed.
          </p>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="
              mt-4 flex h-12 w-full max-w-[510px]
              items-center gap-2 rounded-xl
              border border-[var(--fm-border)]
              bg-[var(--fm-surface)] p-1.5
              shadow-sm transition
              focus-within:border-[var(--fm-primary)]
              focus-within:ring-2
              focus-within:ring-[var(--fm-primary)]/10
              sm:mt-5
            "
          >
            <Search
              size={18}
              className="ml-2 shrink-0 text-[var(--fm-muted)]"
            />

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="What needs fixing today? (e.g. iPhone screen, AC gas leak)"
              aria-label="Search repair services"
              className="
                h-full min-w-0 flex-1
                bg-transparent px-1
                text-sm text-[var(--fm-foreground)]
                outline-none
                placeholder:text-[var(--fm-muted)]
              "
            />

            <button
              type="submit"
              className="
                inline-flex h-9 shrink-0
                items-center gap-1.5
                rounded-lg bg-[var(--fm-primary)]
                px-3 text-xs font-semibold text-white
                transition hover:bg-[var(--fm-primary-hover)]
                sm:px-4 sm:text-sm
              "
            >
              <span className="hidden sm:inline">Find Repair</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* CTA buttons */}
          <div className="mt-4 flex flex-wrap items-center gap-4 sm:mt-5 sm:gap-5">

            <Link
              href="/services"
              className="
                inline-flex h-10 items-center gap-2
                rounded-lg bg-[var(--fm-primary)]
                px-4 text-sm font-semibold text-white
                transition hover:bg-[var(--fm-primary-hover)]
              "
            >
              Explore Services
              <Wrench size={15} />
            </Link>

            <Link
              href="#how-it-works"
              className="
                inline-flex items-center gap-2
                text-sm font-semibold
                text-[var(--fm-foreground)]
                transition hover:text-[var(--fm-primary)]
              "
            >
              How It Works
              <CircleHelp
                size={15}
                className="text-[var(--fm-primary)]"
              />
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-medium text-[var(--fm-muted)] sm:mt-6 sm:gap-x-5 sm:text-xs">

            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[var(--fm-primary)]" />
              Verified Technicians
            </div>

            <span className="text-[var(--fm-border-strong)]">•</span>

            <div className="flex items-center gap-1.5">
              <ClipboardCheck size={14} className="text-[var(--fm-primary)]" />
              Track Every Repair
            </div>

            <span className="text-[var(--fm-border-strong)]">•</span>

            <div className="flex items-center gap-1.5">
              <CreditCard size={14} className="text-[var(--fm-primary)]" />
              Pay After Completion
            </div>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="relative mx-auto w-full max-w-[540px] md:max-w-none">

          {/* Image decoration */}
          <div className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-teal-100/50 via-transparent to-orange-100/40 blur-xl dark:from-teal-900/20 dark:to-orange-900/10" />

          {/* Image container */}
          <div
            className="
              relative w-full overflow-hidden
              rounded-2xl border border-[var(--fm-border)]
              bg-[var(--fm-surface)]
              h-[clamp(150px,23svh,210px)]
              md:h-[clamp(280px,65svh,540px)]
              shadow-[0_20px_45px_rgba(15,23,42,0.12)]
            "
          >
            <Image
              src="/assets/banner.jpg"
              alt="Professional technician repairing an electronic device"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
