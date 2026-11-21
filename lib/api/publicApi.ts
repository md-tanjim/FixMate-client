import { API_BASE_URL } from "./customer-dashboard";
import { TechnicianService } from "./technician-dashboard";

export async function getFeaturedServices(): Promise<TechnicianService[]> {
  const response = await fetch(`${API_BASE_URL}/services/featured`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Unable to fetch featured services."
    );
  }

  if (!Array.isArray(result)) {
    throw new Error("Invalid featured services response.");
  }

  return result as TechnicianService[];
};










//service details 

export type ServiceTechnician = {
  name: string;
  image?: string;
  area?: string;
  bio?: string;
};

export type ServiceDetailsResponse = {
  service: TechnicianService;
  technician: ServiceTechnician;
};

export async function getPublicServiceDetails(serviceId: string): Promise<ServiceDetailsResponse | null> {
  const response = await fetch(`${API_BASE_URL}/services/${encodeURIComponent(serviceId)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  if (response.status === 404) {
    return null;
  }

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message || "Failed to load service details."
    );
  }

  return result as ServiceDetailsResponse;
};















//main explore-service page types
export type PublicServicesQuery = {
  search?: string;
  category?: TechnicianService["category"] | "";
  serviceMode?: TechnicianService["serviceMode"] | "";
  sort?: "price-asc" | "price-desc" | "newest";
};

export type PublicServicesResponse = {
  success: boolean;
  total: number;
  services: TechnicianService[];
};


//explore-servisce page fetch func
export async function getPublicServices(filters: PublicServicesQuery = {}): Promise<PublicServicesResponse> {
  try {
    const params = new URLSearchParams();


    if (filters.search?.trim()) {
      params.set("search", filters.search.trim());
    }

    if (filters.category) {
      params.set("category", filters.category);
    }

    if (filters.serviceMode) {
      params.set("serviceMode", filters.serviceMode);
    }

    if (filters.sort) {
      params.set("sort", filters.sort);
    }

    const queryString = params.toString();

    const url = queryString
      ? `${API_BASE_URL}/services?${queryString}`
      : `${API_BASE_URL}/services`;

    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch repair services.");
    }

    const result: PublicServicesResponse = await response.json();

    return result;
  } catch (error) {
    console.error("Get public services error:", error);
    throw error;
  }
}


