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
    // On s'assure que location existe, soit via le backend, soit en le créant 
    // à partir de latitude/longitude à la racine.
    location: data.location || {
      latitude: data.latitude ?? 0,
      longitude: data.longitude ?? 0
    },
    // Sécurité : initialise les listes si le backend renvoie null
    poi_images_urls: data.poi_images_urls || [],
    poi_amenities: data.poi_amenities || [],
    poi_keywords: data.poi_keywords || [],
    poi_contacts: data.poi_contacts || { phone: "", website: "" }
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
  // LECTURE (GET) - Toutes corrigées avec mapPoiFromBackend
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
    if (!user) throw new Error("Session expirée. Veuillez vous reconnecter.");

    // Mapping pour transformer les catégories UI en Enums Backend
    const categoryMapping: Record<string, { cat: string; type: string }> = {
      "Restaurant": { cat: "FOOD_DRINK", type: "RESTAURANT" },
      "Hotel": { cat: "ACCOMMODATION", type: "HOTEL" },
      "Transport": { cat: "TRANSPORTATION", type: "GARE_ROUTIERE" },
      "Culture": { cat: "LEISURE_CULTURE", type: "MUSEE" },
      "Eglise": { cat: "WORSHIP_SPIRITUALITY", type: "MOSQUEE" },
      "Marche": { cat: "SHOPPING_RETAIL", type: "MARCHE" },
      "Ferme": { cat: "LEISURE_CULTURE", type: "SITE_TOURISTIQUE" },
      "Soya": { cat: "FOOD_DRINK", type: "SNACK_FAST_FOOD" },
    };

    const mapping = categoryMapping[formData.poi_category] || { cat: "FOOD_DRINK", type: "RESTAURANT" };

    const payload = {
      organization_id: user.organizationId,
      created_by_user_id: user.userId,
      poi_name: formData.poi_name,
      poi_type: mapping.type,
      poi_category: mapping.cat,
      latitude: formData.location.latitude,
      longitude: formData.location.longitude,
      address_city: formData.address_city || "Yaoundé",
      address_country: formData.address_country || "Cameroun",
      poi_description: formData.poi_description || "",
      is_active: true,
      ...(formData.address_informal && { address_street_name: formData.address_informal }),
    };

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
}

export const poiService = new PoiService();