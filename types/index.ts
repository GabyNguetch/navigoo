// Basé sur PointOfInterestDTO du Backend
export interface OperationTimePlan {
  [day: string]: { open: string; close: string; closed?: boolean };
}

export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";

export interface Location {
  latitude: number;
  longitude: number;
}

// Basé sur AppUserDTO
export interface AppUser {
  userId: string; // UUID
  organizationId: string; // UUID (Obligatoire)
  username: string;
  email: string;
  phone?: string;
  password?: string; // Write-only en général
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
}

// types/index.ts

export interface POI {
  poi_id: string; 
  organization_id?: string;
  created_by_user_id?: string;
  poi_name: string;
  poi_description?: string;
  poi_category: string; 
  poi_type?: string;
  
  location: {
    latitude: number;
    longitude: number;
  };

  address_city: string;
  address_informal?: string;
  address_country?: string;

  poi_images_urls: string[]; 
  
  // Rendons ces champs optionnels avec des valeurs par défaut pour éviter les plantages
  rating: number; 
  review_count: number;
  popularity_score: number;
  is_active?: boolean;

  poi_contacts?: {
    phone?: string;
    website?: string;
    email?: string;
  };
}

// Routes
export interface RouteStats {
  distance: number; 
  duration: number;
  geometry: any;
}

export type TransportMode = "driving" | "walking" | "cycling"; 

export interface Trip {
  id: string;
  departName: string;
  arriveName: string;
  date: string; 
  distance: number;
  duration: number;
}

export type MapStyle = "streets-v2" | "hybrid";

export interface CreatePoiDTO {
  poi_name: string;
  organization_id: string;
  created_by_user_id: string;
  poi_type: string;     // Ex: "RESTAURANT"
  poi_category: string; // Ex: "FOOD_DRINK"
  poi_description?: string;
  latitude: number;
  longitude: number;
  address_city?: string;
  address_country: string;
  is_active: boolean;
  // Pas de listes complexes ici pour la création
}

export interface POI extends CreatePoiDTO {
  poi_id: string;
  poi_images_urls: string[]; 
  poi_amenities?: string[]; 
  rating: number;
  review_count: number;
  popularity_score: number;
  poi_contacts?: { phone?: string; website?: string };
}

export type PoiCategory = "FOOD_DRINK" | "ACCOMMODATION" | "SHOPPING_RETAIL" | "TRANSPORTATION" | "HEALTH_WELLNESS" | "LEISURE_CULTURE" | "PUBLIC_ADMIN_SERVICES" | "FINANCE" | "EDUCATION" | "WORSHIP_SPIRITUALITY";
