import { CreatePoiDTO, POI } from "@/types";
import { authService } from "./authService";

const API_BASE_URL = "https://poi-navigoo.pynfi.com";

/**
 * Fonction utilitaire pour transformer le format à plat du Backend Java
 * vers le format imbriqué { location: { latitude, longitude } } attendu par le Frontend.
 */
const mapPoiFromBackend = (data: any): POI => {
  if (!data) return data;
  
  return {
    ...data,
    location: data.location || {
      latitude: data.latitude ?? 0,
      longitude: data.longitude ?? 0
    },
    poi_images_urls: data.poi_images_urls || [],
    poi_amenities: data.poi_amenities || [],
    poi_keywords: data.poi_keywords || [],
    poi_contacts: data.poi_contacts || { phone: "", website: "" },
    rating: data.rating ?? 0,
    review_count: data.review_count ?? 0,
    popularity_score: data.popularity_score ?? 0
  };
};

class PoiService {
  /**
   * Wrapper générique pour fetch avec gestion d'erreurs
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    if (process.env.NODE_ENV === "development") {
        console.log(`📡 Fetching: ${url}`);
    }

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      ...options,
    });

    if (!response.ok) {
        let errorMessage = response.statusText;
        try {
            const errorBody = await response.text();
            errorMessage = errorBody || response.statusText;
        } catch (e) {}
        
        throw new Error(`Erreur API (${response.status}): ${errorMessage}`);
    }

    if (response.status === 204) return {} as T;
    return response.json();
  }

  // ==========================================
  // LECTURE (GET)
  // ==========================================

  async getAllPois(): Promise<POI[]> {
    const data = await this.request<any[]>("/api/pois");
    return data.map(mapPoiFromBackend);
  }

  async getPoiById(poiId: string): Promise<POI> {
    const data = await this.request<any>(`/api/pois/${poiId}`);
    return mapPoiFromBackend(data);
  }

  async searchPoisByLocation(latitude: number, longitude: number, radiusKm: number = 10): Promise<POI[]> {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      radiusKm: radiusKm.toString(),
    });
    const data = await this.request<any[]>(`/api/pois/location?${params.toString()}`);
    return data.map(mapPoiFromBackend);
  }

  async getPoisByCategory(category: string): Promise<POI[]> {
    const data = await this.request<any[]>(`/api/pois/category/${category}`);
    return data.map(mapPoiFromBackend);
  }

  async getPoisByCity(city: string): Promise<POI[]> {
    const data = await this.request<any[]>(`/api/pois/city/${encodeURIComponent(city)}`);
    return data.map(mapPoiFromBackend);
  }

  async searchPoisByName(name: string): Promise<POI[]> {
    const data = await this.request<any[]>(`/api/pois/name/${encodeURIComponent(name)}`);
    return data.map(mapPoiFromBackend);
  }

  async getTopPopularPois(limit: number = 10): Promise<POI[]> {
    const data = await this.request<any[]>(`/api/pois/popular?limit=${limit}`);
    return data.map(mapPoiFromBackend);
  }

  async getPoisByType(type: string): Promise<POI[]> {
    const data = await this.request<any[]>(`/api/pois/type/${encodeURIComponent(type)}`);
    return data.map(mapPoiFromBackend);
  }

  async getPoisByUser(userId: string): Promise<POI[]> {
    const data = await this.request<any[]>(`/api/pois/user/${userId}`);
    return data.map(mapPoiFromBackend);
  }

  async getPoisByOrganization(orgId: string, type: 'active' | 'all' = 'active'): Promise<POI[]> {
    const suffix = type === 'all' ? '/all' : '';
    const data = await this.request<any[]>(`/api/pois/organization/${orgId}${suffix}`);
    return data.map(mapPoiFromBackend);
  }

  // ==========================================
  // ÉCRITURE (POST / PUT / DELETE)
  // ==========================================
  
  async createPoi(formData: any): Promise<POI> {
    const user = authService.getSession();
    if (!user) throw new Error("Session expirée.");

    // MAPPING des types POI selon catégorie
    const getValidPoiType = (category: string, type: string) => {
        if (type && type !== "OTHER") return type; 
        switch(category) {
            case "FOOD_DRINK": return "RESTAURANT";
            case "ACCOMMODATION": return "HOTEL";
            case "WORSHIP_SPIRITUALITY": return "AUTRE_LIEU_CULTE";
            case "LEISURE_CULTURE": return "SITE_TOURISTIQUE";
            case "PUBLIC_ADMIN_SERVICES": return "MAIRIE";
            default: return "SITE_TOURISTIQUE";
        }
    };

    // Convertir Base64 image en URL si nécessaire
    let imageUrl = "";
    if (formData.poi_images_urls && formData.poi_images_urls[0]) {
      const img = formData.poi_images_urls[0];
      // Si c'est une vraie URL, on la garde, sinon c'est du Base64 qu'on ignore pour l'instant
      if (img.startsWith("http")) {
        imageUrl = img;
      }
    }

    // Construction du payload MINIMAL VALIDE
    const payload = {
      organization_id: user.organizationId,
      town_id: null,
      created_by_user_id: user.userId,
      poi_name: formData.poi_name,
      poi_type: getValidPoiType(formData.poi_category, formData.poi_type),
      poi_category: formData.poi_category || "LEISURE_CULTURE",
      
      // Champs obligatoires
      poi_long_name: formData.poi_name,
      poi_short_name: formData.poi_name.substring(0, Math.min(15, formData.poi_name.length)),
      poi_friendly_name: formData.poi_name,
      poi_description: formData.poi_description || "",
      
      // Logo Base64 minimal valide (image 1x1 transparente)
      poi_logo: "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", 

      latitude: formData.location?.latitude ?? 3.86667,
      longitude: formData.location?.longitude ?? 11.51667,
      
      // Adresse
      address_street_number: "1",
      address_street_name: formData.address_informal || "",
      address_city: formData.address_city || "Yaoundé",
      address_state_province: formData.address_state_province || "Centre",
      address_postal_code: formData.postalCode || "0000",
      address_country: formData.address_country || "Cameroun",
      address_informal: formData.address_informal || "",
      
      website_url: formData.poi_contacts?.website || "",
      
      // Objets et Tableaux (DOIVENT être présents)
      operation_time_plan: {}, 
      poi_contacts: {
          phone: formData.poi_contacts?.phone || "",
          email: formData.poi_contacts?.email || ""
      },
      poi_images_urls: imageUrl ? [imageUrl] : [],
      poi_amenities: formData.poi_amenities || [],
      poi_keywords: formData.poi_keywords || [],
      poi_type_tags: [],
      
      popularity_score: 0.0,
      is_active: true
    };

    console.log("🚀 Envoi au Backend (Payload Complet) :", payload);

    const result = await this.request<any>("/api/pois", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return mapPoiFromBackend(result);
  }

  async updatePoi(poiId: string, poiData: Partial<POI>): Promise<POI> {
    const result = await this.request<any>(`/api/pois/${poiId}`, {
      method: "PUT",
      body: JSON.stringify(poiData),
    });
    return mapPoiFromBackend(result);
  }

  async deletePoi(poiId: string): Promise<void> {
    return this.request<void>(`/api/pois/${poiId}`, { method: "DELETE" });
  }

  // ==========================================
  // AUTRES ACTIONS
  // ==========================================

  async checkPoiNameExists(name: string, organizationId: string, excludeId?: string): Promise<boolean> {
    const params = new URLSearchParams({ name, organizationId });
    if (excludeId) params.append("excludeId", excludeId);
    return this.request<boolean>(`/api/pois/check-name?${params.toString()}`);
  }

  async activatePoi(poiId: string): Promise<void> {
    return this.request<void>(`/api/pois/${poiId}/activate`, { method: "PATCH" });
  }

  async deactivatePoi(poiId: string): Promise<void> {
    return this.request<void>(`/api/pois/${poiId}/desactivate`, { method: "PATCH" });
  }

  async updatePopularityScore(poiId: string, score: number): Promise<void> {
    return this.request<void>(`/api/pois/${poiId}/popularity?score=${score}`, { method: "PATCH" });
  }

  // Ajoute cette méthode pour une recherche globale
  async searchGlobal(query: string): Promise<POI[]> {
    // Cette méthode tente de chercher par nom, puis par ville, puis fusionne les tags
    // Idéalement, le backend devrait avoir un endpoint /search?q=...
    const [byName, byCity] = await Promise.all([
      this.searchPoisByName(query),
      this.getPoisByCity(query)
    ]);
    
    // Fusion unique par ID
    const combined = [...byName, ...byCity];
    return Array.from(new Map(combined.map(item => [item.poi_id, item])).values());
  }

}

export const poiService = new PoiService();