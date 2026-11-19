"use client";

import { usePathname } from "next/navigation";
import Navbar from "./home/Navbar";


export default function ConditionalNavbar() {
  const pathname = usePathname();

  // Hide the public Navbar on all dashboard routes.
  const isDashboardRoute =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/");

  if (isDashboardRoute) {
    return null;
  }

  return <Navbar />;
}