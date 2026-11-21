
import { authClient } from "@/lib/auth-client";

// ==================================================
// API CONFIGURATION
// ==================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
// ==================================================
// TYPES
// ==================================================

export type AdminDashboardRange = "all" | "7d" | "30d";

export type AdminDashboardStats = {
  totalUsers: number;
  totalTechnicians: number;
  pendingServices: number;
};

export type AdminBookingActivity = {
  totalBookings: number;
  averagePerDay: number;
  data: {
    date: string;
    bookings: number;
  }[];
};

export type AdminRevenueOverview = {
  totalRevenue: number;
  previousRevenue: number;
  percentageChange: number | null;
  data: {
    date: string;
    revenue: number;
  }[];
};

export type AdminDashboardOverview = {
  success: boolean;
  range: AdminDashboardRange;

  period: {
    start: string | null;
    end: string;
  };

  stats: AdminDashboardStats;

  bookingActivity: AdminBookingActivity;

  revenueOverview: AdminRevenueOverview;
};

// ==================================================
// GET ADMIN DASHBOARD OVERVIEW
// ==================================================

export async function getAdminDashboardOverview(
  range: AdminDashboardRange = "30d"
): Promise<AdminDashboardOverview> {
  // ----------------------------------------------
  // 1. GET AUTHENTICATION TOKEN
  // ----------------------------------------------

  const tokenResult = await authClient.token();
  const token = tokenResult.data?.token;

  if (!token) {
    throw new Error(
      "Authentication required. Please sign in again."
    );
  }

  // ----------------------------------------------
  // 2. BUILD REQUEST URL
  // ----------------------------------------------

  const params = new URLSearchParams({
    range,
  });

  const url =
    `${API_BASE_URL}/admin/dashboard/overview?${params.toString()}`;

  // ----------------------------------------------
  // 3. FETCH DASHBOARD DATA
  // ----------------------------------------------

  const response = await fetch(url, {
    method: "GET",

    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },

    cache: "no-store",
  });

  // ----------------------------------------------
  // 4. HANDLE RESPONSE
  // ----------------------------------------------

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "Failed to load admin dashboard statistics."
    );
  }

  if (!result?.success || !result.stats) {
    throw new Error(
      "Invalid admin dashboard response."
    );
  }

  return result as AdminDashboardOverview;
}
