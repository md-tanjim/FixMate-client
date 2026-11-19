import { authClient } from "@/lib/auth-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// services collection type.
export type TechnicianService = {
  _id: string;
  title: string;
  category:  
  |'Smartphone'
  | 'Laptop & PC'
  | 'AC'
  | 'Refrigerator'
  | 'TV'
  | 'Washing Machine'
  | 'Electrical'
  | 'others';
  description: string;
  image: string;
  basePrice: number;
  estimatedDuration: string;
  serviceMode: "Home Visit" | "Shop Drop-off";
  serviceArea: string;
  technicianName: string;
  technicianEmail: string;
  approvalStatus: "pending" | "approved" | "rejected";
  isAvailable: boolean;
  createdAt: string;
};

//count API response.
export type TechnicianServiceCounts = {
  total: number;
  approved: number;
  pending: number;
};

async function getAuthToken() {
  const { data, error } = await authClient.token();

  if (error || !data?.token) {
    throw new Error("Authentication failed. Please sign in again.");
  }

  return data.token;
}

async function apiRequest<T>(endpoint: string): Promise<T> {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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
      result?.message || "Something went wrong while fetching data."
    );
  }

  return result as T;
}

// dashboard data
export async function getTechnicianDashboardServices(
  email: string
): Promise<TechnicianService[]> {
  return apiRequest<TechnicianService[]>(
    `/technician/dashboard/services/${encodeURIComponent(email)}`
  );
}

// dashboard cout
export async function getTechnicianServiceCounts(email: string): Promise<TechnicianServiceCounts> {
  return apiRequest<TechnicianServiceCounts>(`/technician/services/${encodeURIComponent(email)}/count`
  );
}