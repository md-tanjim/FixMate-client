
import { authClient } from "@/lib/auth-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL


//admin main dashboard types
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




//admin user management papge types
export type AdminUserRole = "customer" | "technician" | "admin";

export type AdminUsersFilter = "all" | AdminUserRole;

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: AdminUserRole;
  joinedAt: string | null;
  isCurrentUser: boolean;
};

export type AdminUsersResponse = {
  success: boolean;
  totalUsers: number;
  users: AdminUser[];
};

export type UpdateAdminUserRoleResponse = {
  success: boolean;
  message: string;
  role: AdminUserRole;
};



//jwt
async function getAuthToken(): Promise<string> {
  const tokenResult = await authClient.token();
  const token = tokenResult.data?.token;

  if (!token) {
    throw new Error("Authentication required. Please sign in again.");
  }

  return token;
}


//admin dashboard main
export async function getAdminDashboardOverview(range: AdminDashboardRange = "30d"): Promise<AdminDashboardOverview> {
    
    const token = await getAuthToken();

  const params = new URLSearchParams({ range });
  
  const url = `${API_BASE_URL}/admin/dashboard/overview?${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message || "Failed to load admin dashboard statistics."
    );
  }

  if (!result?.success || !result.stats) {
    throw new Error("Invalid admin dashboard response.");
  }

  return result as AdminDashboardOverview;
}


//get all users
export async function getAdminUsers(role: AdminUsersFilter = "all"): Promise<AdminUsersResponse> {
    
    const token = await getAuthToken();

  const params = new URLSearchParams({ role });

  const response = await fetch(
    `${API_BASE_URL}/admin/users?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.message || "Failed to retrieve users.");
  }

  if (!result?.success || !Array.isArray(result.users)) {
    throw new Error("Invalid admin users response.");
  }

  return result as AdminUsersResponse;
}


//update user role
export async function updateAdminUserRole(id: string,role: AdminUserRole): Promise<UpdateAdminUserRoleResponse> {
    
    const token = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}/admin/users/${encodeURIComponent(id)}/role`,
    {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    }
  );

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.message || "Failed to update user role.");
  }

  if (!result?.success) {
    throw new Error(result?.message || "Failed to update user role.");
  }

  return result as UpdateAdminUserRoleResponse;
}











// service approval page types
export type AdminServiceApprovalStatus =
  | "pending"
  | "approved"
  | "rejected";

export type AdminServiceStatusFilter =
  | "all"
  | AdminServiceApprovalStatus;

export type AdminService = {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  basePrice: number;
  estimatedDuration: string;
  serviceMode: "Home Visit" | "Shop Drop-off" | string;
  serviceArea: string;
  technicianName: string;
  technicianEmail: string;
  approvalStatus: AdminServiceApprovalStatus;
  isAvailable: boolean;
  createdAt: string | null;
  rejectionReason?: string | null;
};

export type AdminServiceCounts = {
  all: number;
  pending: number;
  approved: number;
  rejected: number;
};

export type AdminServicesResponse = {
  success: boolean;
  services: AdminService[];
  categories: string[];
  counts: AdminServiceCounts;
};

export type UpdateServiceApprovalResponse = {
  success: boolean;
  message: string;
  approvalStatus: AdminServiceApprovalStatus;
};



//servise approval page fetch func


export async function getAdminServices(status: AdminServiceStatusFilter = "all",category: string = "all"): Promise<AdminServicesResponse> {
    
    const token = await getAuthToken();

  const params = new URLSearchParams({status,category});

  const response = await fetch(`${API_BASE_URL}/admin/services?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.message || "Failed to retrieve services.");
  }

  if (
    !result?.success ||
    !Array.isArray(result.services) ||
    !Array.isArray(result.categories) ||
    !result.counts
  ) {
    throw new Error("Invalid admin services response.");
  }

  return result as AdminServicesResponse;
}


//status change
export async function updateAdminServiceApproval(id: string,approvalStatus: "approved" | "rejected",rejectionReason?: string): Promise<UpdateServiceApprovalResponse> {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}/admin/services/${encodeURIComponent(id)}/approval`,
    {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        approvalStatus,
        ...(approvalStatus === "rejected"
          ? { rejectionReason }
          : {}),
      }),
    }
  );

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message || "Failed to update service approval."
    );
  }

  if (!result?.success) {
    throw new Error(
      result?.message || "Failed to update service approval."
    );
  }

  return result as UpdateServiceApprovalResponse;
}





//admin allbooking types

export type AdminBookingStatus =
  | "requested"
  | "accepted"
  | "in-progress"
  | "completed"
  | "rejected"
  | "cancelled";

export type AdminBooking = {
  id: string;
  serviceId: string;
  serviceTitle: string;
  serviceImage: string | null;
  category: string;
  basePrice: number;
  technicianName: string;
  technicianEmail: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  preferredDate: string | null;
  problemDescription: string;
  status: AdminBookingStatus;
  finalAmount: number | null;
  paymentStatus: string;
};

export type AdminBookingsResponse = {
  success: boolean;
  totalBookings: number;
  bookings: AdminBooking[];
};


//all bookings 
export async function getAdminBookings(): Promise<AdminBookingsResponse> {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}/admin/bookings`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.message || "Failed to retrieve bookings.");
  }

  if (!result?.success || !Array.isArray(result.bookings)) {
    throw new Error("Invalid admin bookings response.");
  }

  return result as AdminBookingsResponse;
}











//all transections and total
export type AdminTransactionRange = "all" | "today" | "7d" | "30d";

export type AdminTransaction = {
  _id: string;
  bookingId: string;
  serviceTitle: string;
  customerName: string;
  customerEmail: string;
  technicianName: string;
  technicianEmail: string;
  amount: number;
  currency: string;
  transactionId: string;
  stripeSessionId: string;
  paymentStatus: string;
  paidAt: string | null;
};

export type AdminTransactionsResponse = {
  success: boolean;
  totalRevenue: number;
  transactions: AdminTransaction[];
};

//all tranactions and total
export async function getAdminTransactions(range: AdminTransactionRange = "all"): Promise<AdminTransactionsResponse> {
    
    const token = await getAuthToken();
    
  const params = new URLSearchParams({ range });

  const response = await fetch(
    `${API_BASE_URL}/admin/transactions?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message || "Failed to retrieve transactions."
    );
  }

  if (!result?.success || !Array.isArray(result.transactions)) {
    throw new Error("Invalid admin transactions response.");
  }

  return result as AdminTransactionsResponse;
}