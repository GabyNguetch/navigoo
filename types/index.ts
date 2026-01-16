// Basé sur le schéma SQL "point_of_interest"
export interface OperationTimePlan {
  [day: string]: { open: string; close: string; closed?: boolean };
}
export interface Location {
  latitude: number;
  longitude: number;
}

export interface POI {
  // Mapping direct avec la DB
  poi_id: string; // UUID
  poi_name: string;
  poi_category: string; // Ex: "Tourne-dos", "Kiosque"
  poi_description: string;
  poi_amenities: string[]; // split from TEXT
  
  // Géographie (GEOGRAPHY Point)
  location: {
    latitude: number;
    longitude: number;
  };

  // Adresses
  address_informal?: string; // Ex: "Mvog-Betsi, face station"
  address_city: string;

  // Stats & Infos
  rating: number; // vient de la table aggrégée review ou calculé
  review_count: number;
  poi_images_urls: string[]; // split from TEXT
  popularity_score: number;
  
  // Contact JSON
  poi_contacts?: {
    phone?: string;
    website?: string;
    email?: string;
  };

  // Operation Time Plan JSON
  operation_time_plan?: OperationTimePlan;
}

export interface RouteStats {
  distance: number; // en mètres
  duration: number; // en secondes
  geometry: any; // GeoJSON geometry
}

export type TransportMode = "driving" | "walking" | "cycling"; // MapTiler modes

export interface Trip {
  id: string;
  departName: string;
  arriveName: string;
  date: string; // ISO String
  distance: number;
  duration: number;
}

export type MapStyle = "streets-v2" | "satellite-hybrid";




