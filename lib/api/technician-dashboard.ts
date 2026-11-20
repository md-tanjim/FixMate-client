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

//count service.
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

//techni dashboard data
export async function getTechnicianDashboardServices(email: string): Promise<TechnicianService[]> {

  return apiRequest<TechnicianService[]>(`/technician/dashboard/services/${encodeURIComponent(email)}`);
}

//techni dashboard cout
export async function getTechnicianServiceCounts(email: string): Promise<TechnicianServiceCounts> {
  return apiRequest<TechnicianServiceCounts>(`/technician/services/${encodeURIComponent(email)}/count`
  );
}











export type CreateTechnicianServiceInput = Omit<TechnicianService,
  | "_id"
  | "technicianName"
  | "technicianEmail"
  | "approvalStatus"
  | "createdAt"
>;

//imgbb
export async function uploadServiceImage(file: File): Promise<string> {
  const formData = new FormData();

  formData.append("image", file);

  const response = await fetch("/api/upload/profile-image", {
    method: "POST",
    body: formData,
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.success || !result?.imageUrl) {
    throw new Error(result?.message || "Image upload failed.");
  }

  return result.imageUrl as string;
}


//create techni servi
export async function createTechnicianService(serviceData: CreateTechnicianServiceInput) {
  const { data, error } = await authClient.token();

  if (error || !data?.token) {
    throw new Error("Authentication failed. Please sign in again.");
  }

  const response = await fetch(`${API_BASE_URL}/technician/services`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${data.token}`,
    },
    body: JSON.stringify(serviceData),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.message || "Failed to create service.");
  }

  return result;
}








// ==================================================
// TECHNICIAN — MY SERVICES API
// ==================================================

// Editable fields only.
// Technician identity, approval status, ID and creation date
// are controlled by the backend.
export type UpdateTechnicianServiceInput = Pick<
  TechnicianService,
  | "title"
  | "category"
  | "description"
  | "image"
  | "basePrice"
  | "estimatedDuration"
  | "serviceMode"
  | "serviceArea"
>;

type TechnicianServiceResponse = {
  success: boolean;
  message: string;
  service: TechnicianService;
};

type TechnicianServiceActionResponse = {
  success: boolean;
  message: string;
};



//helper for PATCH and DELETE requests
async function technicianMutationRequest<T>(endpoint: string,method: "PATCH" | "DELETE",body?: unknown): Promise<T> {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(body !== undefined
        ? { "Content-Type": "application/json" }
        : {}),
    },
    ...(body !== undefined
      ? { body: JSON.stringify(body) }
      : {}),

  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message || "Something went wrong. Please try again."
    );
  }

  return result as T;
}


//get all techni services
export async function getTechnicianMyServices(): Promise<TechnicianService[]> {

  return apiRequest<TechnicianService[]>("/technician/my-services");
}


//change service availability
export async function updateTechnicianServiceAvailability(serviceId: string,isAvailable: boolean): Promise<TechnicianServiceResponse> {
  
  return technicianMutationRequest<TechnicianServiceResponse>(
    `/technician/services/${encodeURIComponent(serviceId)}/availability`,"PATCH",{ isAvailable });
}


//edit service details
export async function updateTechnicianService(serviceId: string,serviceData: UpdateTechnicianServiceInput): Promise<TechnicianServiceResponse> {
  return technicianMutationRequest<TechnicianServiceResponse>(
    `/technician/services/update/${encodeURIComponent(serviceId)}`,
    "PATCH",
    serviceData
  );
}



//delete service
export async function deleteTechnicianService(serviceId: string): Promise<TechnicianServiceActionResponse> {
  
  return technicianMutationRequest<TechnicianServiceActionResponse>(
    `/technician/services/${encodeURIComponent(serviceId)}`,
    "DELETE"
  );
}

