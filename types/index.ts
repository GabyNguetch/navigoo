// Basé sur PointOfInterestDTO du Backend
export interface OperationTimePlan {
  [day: string]: { open: string; close: string; closed?: boolean };
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface POI {
  // Backend IDs sont des UUID
  poi_id: string; 
  organization_id?: string;
  town_id?: string;
  created_by_user_id?: string;
  
  // Infos Base
  poi_name: string;
  poi_description?: string;
  poi_amenities?: string[]; 
  
  // Le backend renvoie souvent des Enum (majuscules)
  poi_category: string; 
  poi_type?: string;

  // Géographie
  location: {
    latitude: number;
    longitude: number;
  };

  // Adresses
  address_informal?: string;
  address_city: string;
  address_street_name?: string; 
  address_country?: string;

  // Médias
  poi_images_urls: string[]; 
  poi_logo?: string;

  // Stats
  rating: number; 
  review_count: number;
  popularity_score: number;
  
  is_active?: boolean;
  
  // Contacts
  poi_contacts?: {
    phone?: string;
    website?: string;
    email?: string;
  };
  
  poi_keywords?: string[];
  operation_time_plan?: OperationTimePlan;
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