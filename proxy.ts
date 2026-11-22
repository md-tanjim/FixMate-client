import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";

const ROLE_DASHBOARDS = {
  customer: "/dashboard/customer",
  technician: "/dashboard/technician",
  admin: "/dashboard/admin",
} as const;

export async function proxy(request: NextRequest) {
  // Get the authenticated session.
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect logged-out users to sign in.
  if (!session?.user) {
    const signInUrl = new URL("/signin", request.url);

    signInUrl.searchParams.set(
      "callbackUrl",
      request.nextUrl.pathname + request.nextUrl.search
    );

    return NextResponse.redirect(signInUrl);
  }

  const role = session.user.role;
  const pathname = request.nextUrl.pathname;

  // Get the user's own dashboard.
  const ownDashboard =
    role === "customer"
      ? ROLE_DASHBOARDS.customer
      : role === "technician"
        ? ROLE_DASHBOARDS.technician
        : role === "admin"
          ? ROLE_DASHBOARDS.admin
          : null;

  // Reject users with an invalid or unrecognized role.
  if (!ownDashboard) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect /dashboard to the user's own dashboard.
  if (pathname === "/dashboard") {
    return NextResponse.redirect(
      new URL(ownDashboard, request.url)
    );
  }

  // Determine which role owns the requested dashboard.
  const requestedRole =
    pathname === "/dashboard/customer" ||
    pathname.startsWith("/dashboard/customer/")
      ? "customer"
      : pathname === "/dashboard/technician" ||
          pathname.startsWith("/dashboard/technician/")
        ? "technician"
        : pathname === "/dashboard/admin" ||
            pathname.startsWith("/dashboard/admin/")
          ? "admin"
          : null;

  // Redirect users attempting to access another role's dashboard.
  if (requestedRole && requestedRole !== role) {
    return NextResponse.redirect(
      new URL(ownDashboard, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};