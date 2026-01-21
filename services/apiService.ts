import { POI, Location } from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export interface Blog {
  blogId: string;
  title: string;
  content: string;
  authorId: string;
  imageUrl?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Podcast {
  podcastId: string;
  title: string;
  description: string;
  audioUrl: string;
  duration?: number;
  authorId: string;
  imageUrl?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Adaptateur pour transformer un POI du Back-end vers le format Front-end
 */
const mapBackendToFrontendPoi = (backendPoi: any): POI => {
  return {
    poi_id: backendPoi.poiId,
    poi_name: backendPoi.poiName,
    poi_category: backendPoi.poiCategory,
    poi_description: backendPoi.poiDescription || "",
    poi_amenities: backendPoi.poiAmenities || [],
    location: {
      latitude: backendPoi.latitude,
      longitude: backendPoi.longitude,
    },
    address_informal: backendPoi.poiAddress?.informalAddress,
    address_city: backendPoi.poiAddress?.city || "Inconnue",
    address_country: backendPoi.poiAddress?.country || "Cameroun",
    rating: backendPoi.rating || 0,
    review_count: backendPoi.reviewCount || 0,
    poi_images_urls: backendPoi.poiImages || [],
    popularity_score: backendPoi.popularityScore || 0,
    poi_keywords: backendPoi.poiKeywords || [],
    poi_contacts: {
      phone: backendPoi.phoneNumber,
      website: backendPoi.websiteUrl,
    },
    operation_time_plan: backendPoi.operationTimePlan ? JSON.parse(backendPoi.operationTimePlan) : undefined
  };
};

/**
 * Adaptateur pour transformer un POI du Front-end vers le format Back-end
 */
const mapFrontendToBackendPoi = (frontendPoi: Partial<POI>, orgId: string, userId: string) => {
  return {
    orgId,
    createdByUserId: userId,
    poiName: frontendPoi.poi_name,
    poiType: "GENERAL",
    poiCategory: frontendPoi.poi_category,
    poiDescription: frontendPoi.poi_description,
    latitude: frontendPoi.location?.latitude,
    longitude: frontendPoi.location?.longitude,
    poiAddress: {
      city: frontendPoi.address_city,
      country: frontendPoi.address_country,
      informalAddress: frontendPoi.address_informal
    },
    phoneNumber: frontendPoi.poi_contacts?.phone,
    websiteUrl: frontendPoi.poi_contacts?.website,
    poiAmenities: frontendPoi.poi_amenities,
    poiKeywords: frontendPoi.poi_keywords,
    operationTimePlan: frontendPoi.operation_time_plan ? JSON.stringify(frontendPoi.operation_time_plan) : null,
    isActive: true
  };
};

export const apiService = {
  // Health check
  checkHealth: async () => {
    const url = `${API_BASE_URL}/health`;
    console.log(`Checking health: ${url}`);
    const response = await fetch(url);
    return response.json();
  },

  // POIs
  getAllPois: async (): Promise<POI[]> => {
    const url = `${API_BASE_URL}/pois`;
    console.log(`Calling API: ${url}`);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Status ${response.status}: ${response.statusText}`);
      const data = await response.json();
      return data.map(mapBackendToFrontendPoi);
    } catch (err) {
      console.error("Failed to fetch POIs", err);
      throw err;
    }
  },

  getPoiById: async (id: string): Promise<POI> => {
    const url = `${API_BASE_URL}/pois/${id}`;
    console.log(`Calling API: ${url}`);
    const response = await fetch(url);
    if (!response.ok) throw new Error("POI not found");
    const data = await response.json();
    return mapBackendToFrontendPoi(data);
  },

  createPoi: async (poi: Partial<POI>, orgId: string, userId: string): Promise<POI> => {
    const url = `${API_BASE_URL}/pois`;
    console.log(`Calling API: ${url}`);
    const backendData = mapFrontendToBackendPoi(poi, orgId, userId);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(backendData),
    });
    if (!response.ok) throw new Error("Failed to create POI");
    const data = await response.json();
    return mapBackendToFrontendPoi(data);
  },

  // Blogs
  getAllBlogs: async (): Promise<Blog[]> => {
    const url = `${API_BASE_URL}/blogs`;
    console.log(`Calling API: ${url}`);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch blogs: ${response.status} ${response.statusText} - ${errorText}`);
      }
      return response.json();
    } catch (error: any) {
      console.error("API Error (getAllBlogs):", error);
      throw error;
    }
  },

  createBlog: async (blog: Partial<Blog>): Promise<Blog> => {
    const url = `${API_BASE_URL}/blogs`;
    console.log(`Calling API: ${url}`);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(blog),
    });
    return response.json();
  },

  // Podcasts
  getAllPodcasts: async (): Promise<Podcast[]> => {
    const url = `${API_BASE_URL}/podcasts`;
    console.log(`Calling API: ${url}`);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch podcasts: ${response.status} ${response.statusText} - ${errorText}`);
      }
      return response.json();
    } catch (error: any) {
      console.error("API Error (getAllPodcasts):", error);
      throw error;
    }
  },

  createPodcast: async (podcast: Partial<Podcast>): Promise<Podcast> => {
    const url = `${API_BASE_URL}/podcasts`;
    console.log(`Calling API: ${url}`);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(podcast),
    });
    return response.json();
  },

  // Users
  getAllUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/users`);
    return response.json();
  },

  // Organizations
  getAllOrganizations: async () => {
    const response = await fetch(`${API_BASE_URL}/organizations`);
    return response.json();
  },

  // Reviews
  getReviewsByPoiId: async (poiId: string) => {
    const baseUrl = API_BASE_URL.replace("/v1", ""); // Go back to /api
    const response = await fetch(`${baseUrl}/reviews/poi/${poiId}`);
    if (!response.ok) throw new Error("Failed to fetch reviews");
    return response.json();
  }
};
