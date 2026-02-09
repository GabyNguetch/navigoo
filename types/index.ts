export interface OperationTimePlan {
  [day: string]: { open: string; close: string; closed?: boolean };
}

export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";

export interface Location {
  latitude: number;
  longitude: number;
}

export interface AppUser {
  id?: string; // UUID du Auth Service
  userId: string;
  organizationId: string;
  username: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  role: UserRole;
  service?: "LETS_GO" | "RIDE_AND_GO" | "FLEET_MANAGEMENT" | "SYNDICAT" | "NAVIGOO" | "PAYMENT" | "FARE_CALCULATOR";
  photoId?: string;
  photoUri?: string;
  roles?: string[];
  permissions?: string[];
  accessToken?: string; // Ajouté côté client pour la session
  isActive: boolean;
  createdAt?: string;
  
}

export interface POI {
  poi_id: string; 
  organization_id?: string;
  created_by_user_id?: string;
  created_by?: string;
  poi_name: string;
  poi_description?: string;
  poi_category: string; 
  poi_type?: string;
  
  // Champs additionnels requis par le compilateur
  poi_long_name?: string;
  poi_short_name?: string;
  poi_friendly_name?: string;
  poi_logo?: string;
  poi_type_tags?: string[];

  created_at?: string;
  updated_at?: string;
  
  location: {
    latitude: number;
    longitude: number;
  };
  latitude?: number;
  longitude?: number;

  address_city: string;
  address_informal?: string;
  address_country?: string;
  address_state_province?: string;
  address_street_number?: string;
  address_street_name?: string;
  address_postal_code?: string;

  poi_images_urls: string[]; 
  poi_amenities?: string[];
  poi_keywords?: string[];
  
  rating: number; 
  review_count: number;
  popularity_score: number;
  is_active?: boolean;
  approval_status?: string; // Ajouté pour le panel admin

  poi_contacts?: {
    phone?: string;
    website?: string;
    email?: string;
  };
  website_url?: string;
  operation_time_plan?: OperationTimePlan;
}

export interface CreatePoiDTO {
  poi_name: string;
  organization_id: string;
  created_by_user_id: string;
  poi_type: string;
  poi_category: string;
  poi_description?: string;
  latitude: number;
  longitude: number;
  address_city?: string;
  address_country: string;
  address_state_province?: string;
  is_active: boolean;
  poi_amenities?: string[];
  poi_keywords?: string[];
}

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
  poiId?: string; // AJOUTEZ CETTE LIGNE (le ? signifie qu'elle est optionnelle)
}

export type MapStyle = "streets-v2" | "hybrid";

export type PoiCategory = 
  | "FOOD_DRINK" 
  | "ACCOMMODATION" 
  | "SHOPPING_RETAIL" 
  | "TRANSPORTATION" 
  | "HEALTH_WELLNESS" 
  | "LEISURE_CULTURE" 
  | "PUBLIC_ADMIN_SERVICES" 
  | "FINANCE" 
  | "EDUCATION" 
  | "WORSHIP_SPIRITUALITY";

export interface Blog {
  blog_id?: string;
  user_id: string;
  poi_id: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  content: string;
  is_active: boolean;
  created_at?: string;
}

export interface Podcast {
  podcast_id?: string;
  user_id: string;
  poi_id: string;
  title: string;
  description?: string;
  audio_file_url: string;
  cover_image_url?: string;
  duration_seconds: number;
  is_active: boolean;
  created_at?: string;
}

// DTO Media Service
export interface MediaDto {
  id: string;
  name: string;
  real_name: string;
  service: string;
  mime: string;
  size: number;
  extension: string;
  path: string;
  uri: string;
  created_at?: string;
  updated_at?: string;
}


export interface OperationTimePlan {
  [day: string]: { open: string; close: string; closed?: boolean } | string; // Permettre string pour "Open": "08:00-18:00"
}
