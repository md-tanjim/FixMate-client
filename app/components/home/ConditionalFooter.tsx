"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";


export default function ConditionalFooter() {
  const pathname = usePathname();

  // Hide the public Footer on all dashboard routes.
  const isDashboardRoute =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/");

  if (isDashboardRoute) {
    return null;
  }

  return <Footer />;
}