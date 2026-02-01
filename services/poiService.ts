import { CreatePoiDTO, POI } from "@/types";
import { authService } from "./authService";

// Utilisation de la variable d'env, avec fallback sur localhost:8080
const API_BASE_URL = "https://poi-navigoo.pynfi.com";

class PoiService {
  /**
   * Wrapper générique pour fetch avec gestion d'erreurs
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Debug en dev pour voir les URL appelées
    if (process.env.NODE_ENV === "development") {
        console.log(`📡 Fetching: ${url}`);
    }

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        // Si tu as de l'auth JWT plus tard: 
        // "Authorization": `Bearer ${token}` 
      },
      ...options,
    });

    if (!response.ok) {
        // Tente de lire le message d'erreur du backend
        let errorMessage = response.statusText;
        try {
            const errorBody = await response.text();
            errorMessage = errorBody || response.statusText;
        } catch (e) {}
        
        throw new Error(`Erreur API (${response.status}): ${errorMessage}`);
    }

    // Gestion du 204 No Content (ex: delete success)
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // ==========================================
  // READ (GET)
  // ==========================================

  async getAllPois(): Promise<POI[]> {
    return this.request<POI[]>("/api/pois");
  }

  async getPoiById(poiId: string): Promise<POI> {
    return this.request<POI>(`/api/pois/${poiId}`);
  }

  /**
   * Recherche par géolocalisation
   */
  async searchPoisByLocation(latitude: number, longitude: number, radiusKm: number = 10): Promise<POI[]> {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      radiusKm: radiusKm.toString(),
    });
    return this.request<POI[]>(`/api/pois/location?${params.toString()}`);
  }

  async getPoisByCategory(category: string): Promise<POI[]> {
    return this.request<POI[]>(`/api/pois/category/${category}`);
  }

  async getPoisByCity(city: string): Promise<POI[]> {
    return this.request<POI[]>(`/api/pois/city/${encodeURIComponent(city)}`);
  }

  async searchPoisByName(name: string): Promise<POI[]> {
    return this.request<POI[]>(`/api/pois/name/${encodeURIComponent(name)}`);
  }

  async getTopPopularPois(limit: number = 10): Promise<POI[]> {
    return this.request<POI[]>(`/api/pois/popular?limit=${limit}`);
  }

  async getPoisByType(type: string): Promise<POI[]> {
    return this.request<POI[]>(`/api/pois/type/${encodeURIComponent(type)}`);
  }

  async getPoisByUser(userId: string): Promise<POI[]> {
    return this.request<POI[]>(`/api/pois/user/${userId}`);
  }

  async checkPoiNameExists(name: string, organizationId: string, excludeId?: string): Promise<boolean> {
    const params = new URLSearchParams({ name, organizationId });
    if (excludeId) params.append("excludeId", excludeId);
    return this.request<boolean>(`/api/pois/check-name?${params.toString()}`);
  }

  // Gestion Organisation
  async getPoisByOrganization(orgId: string, type: 'active' | 'all' = 'active'): Promise<POI[]> {
    const suffix = type === 'all' ? '/all' : '';
    return this.request<POI[]>(`/api/pois/organization/${orgId}${suffix}`);
  }



  // ==========================================
  // WRITE (POST / PUT / DELETE)
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
      "Eglise": { cat: "WORSHIP_SPIRITUALITY", type: "MOSQUEE" }, // Corrigé : MOSQUEE au lieu de EGLISE
      "Marche": { cat: "SHOPPING_RETAIL", type: "MARCHE" },
      "Ferme": { cat: "LEISURE_CULTURE", type: "SITE_TOURISTIQUE" },
      "Soya": { cat: "FOOD_DRINK", type: "SNACK_FAST_FOOD" },
    };

    const mapping = categoryMapping[formData.poi_category] || { cat: "FOOD_DRINK", type: "RESTAURANT" };

    // Construction du payload MINIMAL (strict minimum pour éviter erreurs de parsing)
    const payload = {
      organization_id: user.organizationId,
      created_by_user_id: user.userId,
      
      poi_name: formData.poi_name,
      poi_type: mapping.type,
      poi_category: mapping.cat,
      
      // Localisation
      latitude: formData.location.latitude,
      longitude: formData.location.longitude,
      address_city: formData.address_city || "Yaoundé",
      address_country: formData.address_country || "Cameroun",
      
      // Champs simples
      poi_description: formData.poi_description || "",
      is_active: true,
      
      // Champs optionnels (uniquement si présents et non vides)
      ...(formData.address_informal && { address_street_name: formData.address_informal }),
      
      // IMPORTANT : On retire temporairement ces champs qui causent des erreurs de parsing
      // poi_amenities: formData.poi_amenities || [],
      // poi_images_urls: formData.poi_images_urls || [],
      // poi_contacts: {...}
    };

    console.log("🚀 Envoi au Backend (MINIMAL) :", payload);

    return this.request<POI>("/api/pois", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async updatePoi(poiId: string, poiData: Partial<POI>): Promise<POI> {
    return this.request<POI>(`/api/pois/${poiId}`, {
      method: "PUT",
      body: JSON.stringify(poiData),
    });
  }

  async deletePoi(poiId: string): Promise<void> {
    return this.request<void>(`/api/pois/${poiId}`, {
      method: "DELETE",
    });
  }

  // ==========================================
  // ACTIONS (PATCH)
  // ==========================================

  async activatePoi(poiId: string): Promise<void> {
    return this.request<void>(`/api/pois/${poiId}/activate`, { method: "PATCH" });
  }

  async deactivatePoi(poiId: string): Promise<void> {
    return this.request<void>(`/api/pois/${poiId}/desactivate`, { method: "PATCH" });
  }

  async updatePopularityScore(poiId: string, score: number): Promise<void> {
    // Note: Swagger spec indique 'score' en query param
    return this.request<void>(`/api/pois/${poiId}/popularity?score=${score}`, { method: "PATCH" });
  }
}

export const poiService = new PoiService();