
import Link from "next/link";
import {
  Wrench,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

import { FaFacebook, FaInstagram } from 'react-icons/fa';
// Replace these placeholders with your actual FixMate contact details.
const CONTACT_INFO = {
  email: "support@fixmate.com",
  phone: "+880 1XXXXXXXXX",
  address: "Sholokbarar Chattogram",
};

// Replace these placeholder URLs with your actual social profiles.
const SOCIAL_LINKS = {
  facebook: "https://facebook.com/your-page",
  instagram: "https://instagram.com/your-profile",
  x: "https://x.com/your-handle",
};

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "About Us", href: "/#how-it-works" },
];

const popularCategories = [
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Refrigerator",
  "TV",
  "Washing Machine",
  "Electrical",
];

function XLogo() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[17px] w-[17px]"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.847h-7.406l-5.8-7.584-6.633 7.584H.478l8.6-9.83L0 1.153h7.594l5.243 6.932zM17.61 20.655h2.039L6.486 3.246H4.298z" />
    </svg>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--fm-border)] bg-[var(--fm-surface-soft)]">
      <div className="fm-container">
        {/* Main footer */}
        <div className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.7fr_1.2fr_1fr] lg:gap-8 lg:py-14">
          {/* Brand */}
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex w-fit items-center gap-2.5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--fm-primary)] text-[var(--fm-on-primary)]">
                <Wrench size={21} strokeWidth={2} />
              </span>

              <span className="text-xl font-bold tracking-tight text-[var(--fm-foreground)]">
                FixMate
              </span>
            </Link>

            <p className="max-w-xs text-sm leading-6 text-[var(--fm-muted)]">
              Reliable repairs, trusted technicians, and a
              transparent repair experience. Pay only after
              your work is completed.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="FixMate on Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--fm-border)] bg-[var(--fm-surface)] text-[var(--fm-muted)] transition-colors hover:border-[var(--fm-primary)] hover:text-[var(--fm-primary)]"
              >
                <FaFacebook size={17} />
              </a>

              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="FixMate on Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--fm-border)] bg-[var(--fm-surface)] text-[var(--fm-muted)] transition-colors hover:border-[var(--fm-primary)] hover:text-[var(--fm-primary)]"
              >
                <FaInstagram size={17} />
              </a>

              <a
                href={SOCIAL_LINKS.x}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="FixMate on X"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--fm-border)] bg-[var(--fm-surface)] text-[var(--fm-muted)] transition-colors hover:border-[var(--fm-primary)] hover:text-[var(--fm-primary)]"
              >
                <XLogo />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-[var(--fm-foreground)]">
              Quick Links
            </h3>

            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--fm-muted)] transition-colors hover:text-[var(--fm-primary)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular categories */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-[var(--fm-foreground)]">
              Popular Categories
            </h3>

            <ul className="grid grid-cols-2 gap-x-4 gap-y-3">
              {popularCategories.map((category) => (
                <li key={category}>
                  <Link
                    href={`/services?category=${encodeURIComponent(category)}`}
                    className="text-sm text-[var(--fm-muted)] transition-colors hover:text-[var(--fm-primary)]"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact information */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-[var(--fm-foreground)]">
              Contact Us
            </h3>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail
                  size={17}
                  className="mt-0.5 shrink-0 text-[var(--fm-primary)]"
                />

                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="break-all text-sm text-[var(--fm-muted)] transition-colors hover:text-[var(--fm-primary)]"
                >
                  {CONTACT_INFO.email}
                </a>
              </li>

              <li className="flex items-start gap-3">
                <Phone
                  size={17}
                  className="mt-0.5 shrink-0 text-[var(--fm-primary)]"
                />

                <a
                  href={`tel:${CONTACT_INFO.phone}`}
                  className="text-sm text-[var(--fm-muted)] transition-colors hover:text-[var(--fm-primary)]"
                >
                  {CONTACT_INFO.phone}
                </a>
              </li>

              <li className="flex items-start gap-3">
                <MapPin
                  size={17}
                  className="mt-0.5 shrink-0 text-[var(--fm-primary)]"
                />

                <span className="text-sm leading-6 text-[var(--fm-muted)]">
                  {CONTACT_INFO.address}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-[var(--fm-border)] py-5 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-[var(--fm-muted)]">
            © {currentYear} FixMate. All rights reserved.
          </p>

          <p className="text-xs text-[var(--fm-muted)]">
            Making repairs simpler, one service at a time.
          </p>
        </div>
      </div>
    </footer>
  );
}
