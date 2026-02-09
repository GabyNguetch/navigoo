import { CreatePoiDTO, POI } from "@/types";
import { authService } from "./authService";

// Utilise le proxy POI unifié
const API_BASE_URL = typeof window !== 'undefined' ? "/remote-api" : "https://poi-navigoo.pynfi.com";

/**
 * Transforme le format Backend Java vers le format Frontend
 */
const mapPoiFromBackend = (data: any): POI => {
  if (!data) return data;
  
  return {
    ...data,
    poi_id: data.poi_id || data.id,
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
    popularity_score: data.popularity_score ?? 0,
    address_city: data.address_city || "Non spécifié",
    poi_name: data.poi_name || "POI sans nom"
  };
};

class PoiService {
  /**
   * ✅ Wrapper générique avec authentification JWT
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const method = (options.method || 'GET').toUpperCase();

    // ✅ Headers avec authentification
    const headers: Record<string, string> = {
      "Accept": "application/json",
    };

    // Ajouter le token JWT si disponible
    const token = authService.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Content-Type pour les requêtes avec body
    if (method !== "GET" && method !== "DELETE" && options.body) {
      headers["Content-Type"] = "application/json";
    }

    options.headers = { ...headers, ...options.headers };

    try {
      const response = await fetch(url, options);
      
      console.log(`📡 POI Service: ${method} ${url}`, {
        status: response.status,
        authenticated: !!token
      });

      // Gestion 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      // Vérifier le Content-Type
      const contentType = response.headers.get("content-type");
      
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text();
        
        if (!response.ok) {
          console.error("❌ Erreur non-JSON:", textResponse);
          throw new Error(`Erreur ${response.status}: ${textResponse || response.statusText}`);
        }
        
        return {} as T;
      }

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = 
          data.message || 
          data.error || 
          data.details || 
          `Erreur ${response.status}`;
        
        console.error("❌ Erreur Backend:", {
          status: response.status,
          url,
          error: errorMessage,
          fullResponse: data
        });
        
        // ✅ Si 401/403, déconnecter l'utilisateur
        if (response.status === 401 || response.status === 403) {
          console.warn("🚪 Session expirée, redirection...");
          authService.logout();
        }
        
        throw new Error(errorMessage);
      }

      return data;
    } catch (error: any) {
      console.error(`❌ Erreur réseau sur ${url}:`, error.message);
      
      if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        throw new Error("Impossible de contacter le serveur. Vérifiez votre connexion.");
      }
      
      throw error;
    }
  }

  // ==========================================
  // LECTURE (GET) - AVEC FALLBACK
  // ==========================================

  /**
   * ✅ Récupère tous les POIs avec stratégie de repli
   */
  async getAllPois(): Promise<POI[]> {
    try {
      console.log("🔄 [POI] Récupération de tous les POIs...");
      const data = await this.request<any[]>("/api/pois");
      return Array.isArray(data) ? data.map(mapPoiFromBackend) : [];
    } catch (error: any) {
      console.warn("⚠️ Erreur /api/pois, tentative de repli sur /approved");
      
      try {
        const approvedData = await this.request<any[]>("/api/pois/approved");
        console.log("✅ Repli réussi avec POIs approuvés");
        return Array.isArray(approvedData) ? approvedData.map(mapPoiFromBackend) : [];
      } catch (fallbackError) {
        console.error("❌ Échec complet, retour tableau vide");
        return [];
      }
    }
  }

  async getPoiById(poiId: string): Promise<POI> {
    const data = await this.request<any>(`/api/pois/${poiId}`);
    return mapPoiFromBackend(data);
  }

  async searchPoisByLocation(latitude: number, longitude: number, radiusKm: number = 10): Promise<POI[]> {
    try {
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        radiusKm: radiusKm.toString(),
      });
      const data = await this.request<any[]>(`/api/pois/nearby?${params.toString()}`);
      return Array.isArray(data) ? data.map(mapPoiFromBackend) : [];
    } catch (error) {
      console.warn("Erreur recherche locale");
      return [];
    }
  }

  async getPoisByCategory(category: string): Promise<POI[]> {
    try {
      const data = await this.request<any[]>(`/api/pois/category/${category}`);
      return Array.isArray(data) ? data.map(mapPoiFromBackend) : [];
    } catch (error) {
      return [];
    }
  }

  async getPoisByCity(city: string): Promise<POI[]> {
    try {
      const data = await this.request<any[]>(`/api/pois/city/${encodeURIComponent(city)}`);
      return Array.isArray(data) ? data.map(mapPoiFromBackend) : [];
    } catch (error) {
      return [];
    }
  }

  async searchPoisByName(name: string): Promise<POI[]> {
    try {
      const data = await this.request<any[]>(`/api/pois/name/${encodeURIComponent(name)}`);
      return Array.isArray(data) ? data.map(mapPoiFromBackend) : [];
    } catch (error) {
      return [];
    }
  }

  async getTopPopularPois(limit: number = 10): Promise<POI[]> {
    try {
      const data = await this.request<any[]>(`/api/pois/popular?limit=${limit}`);
      return Array.isArray(data) ? data.map(mapPoiFromBackend) : [];
    } catch (error) {
      return [];
    }
  }

  async getPoisByType(type: string): Promise<POI[]> {
    try {
      const data = await this.request<any[]>(`/api/pois/type/${encodeURIComponent(type)}`);
      return Array.isArray(data) ? data.map(mapPoiFromBackend) : [];
    } catch (error) {
      return [];
    }
  }

  async getPoisByUser(userId: string): Promise<POI[]> {
    try {
      const data = await this.request<any[]>(`/api/pois/user/${userId}`);
      return Array.isArray(data) ? data.map(mapPoiFromBackend) : [];
    } catch (error) {
      return [];
    }
  }

  async getPoisByOrganization(orgId: string, type: 'active' | 'all' = 'active'): Promise<POI[]> {
    try {
      const suffix = type === 'all' ? '/all' : '';
      const data = await this.request<any[]>(`/api/pois/organization/${orgId}${suffix}`);
      return Array.isArray(data) ? data.map(mapPoiFromBackend) : [];
    } catch (error) {
      return [];
    }
  }

  // ==========================================
  // ÉCRITURE (POST / PUT / DELETE)
  // ==========================================

  async createPoi(formData: any): Promise<any> {
    const session = authService.getSession();
    if (!session?.userId || !session?.organizationId) {
      throw new Error("Vous devez être connecté pour créer un POI.");
    }

    const payload = {
      organization_id: session.organizationId,
      created_by_user_id: session.userId,
      
      poi_name: formData.poi_name,
      poi_type: formData.poi_type || "OTHER",
      poi_category: formData.poi_category,
      poi_long_name: formData.poi_name,
      poi_short_name: formData.poi_name.substring(0, 20),
      poi_friendly_name: formData.poi_name,
      
      poi_description: formData.poi_description || "",
      poi_logo: "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      
      latitude: Number(formData.location?.latitude) || 0,
      longitude: Number(formData.location?.longitude) || 0,
      
      address_street_number: "1",
      address_street_name: formData.address_informal || "Avenue principale",
      address_city: formData.address_city || "Ngaoundéré",
      address_state_province: formData.address_state_province || "Adamaoua",
      address_postal_code: formData.postalCode || "0000",
      address_country: "Cameroon",
      address_informal: formData.address_informal || "",
      
      website_url: formData.poi_contacts?.website || "",
      
      operation_time_plan: {
        "Open": "08:00-18:00"
      },
      
      poi_contacts: {
        phone: formData.poi_contacts?.phone || "",
        email: session.email || ""
      },
      
      poi_images_urls: Array.isArray(formData.poi_images_urls) ? formData.poi_images_urls : [],
      poi_amenities: Array.isArray(formData.poi_amenities) ? formData.poi_amenities : [],
      poi_keywords: Array.isArray(formData.poi_keywords) ? formData.poi_keywords : [],
      poi_type_tags: [formData.poi_category],
      
      popularity_score: 0.0,
      is_active: false
    };

    console.group("🔍 [CREATE POI] Payload");
    console.log(payload);
    console.groupEnd();

    const result = await this.request<any>("/api/pois", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    console.log("✅ POI créé:", result);
    return result;
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
  // ACTIONS SPÉCIFIQUES
  // ==========================================

  async checkPoiNameExists(name: string, organizationId: string, excludeId?: string): Promise<boolean> {
    try {
      const params = new URLSearchParams({ name, organizationId });
      if (excludeId) params.append("excludeId", excludeId);
      return this.request<boolean>(`/api/pois/check-name?${params.toString()}`);
    } catch (error) {
      return false;
    }
  }

  async activatePoi(poiId: string): Promise<void> {
    return this.request<void>(`/api/pois/${poiId}/activate`, { method: "PATCH" });
  }

  async deactivatePoi(poiId: string): Promise<void> {
    return this.request<void>(`/api/pois/${poiId}/desactivate`, { method: "PATCH" });
  }

  async approvePoi(poiId: string, approverId: string): Promise<void> {
    return this.request<void>(`/api/pois/${poiId}/approve?approverId=${approverId}`, { 
      method: "PATCH" 
    });
  }

  async rejectPoi(poiId: string, rejecterId: string): Promise<void> {
    return this.request<void>(`/api/pois/${poiId}/reject?rejecterId=${rejecterId}`, { 
      method: "PATCH" 
    });
  }

  async updatePopularityScore(poiId: string, score: number): Promise<void> {
    return this.request<void>(`/api/pois/${poiId}/popularity?score=${score}`, { 
      method: "PATCH" 
    });
  }

  async searchGlobal(query: string): Promise<POI[]> {
    const [byName, byCity] = await Promise.all([
      this.searchPoisByName(query),
      this.getPoisByCity(query)
    ]);
    
    const combined = [...byName, ...byCity];
    return Array.from(new Map(combined.map(item => [item.poi_id, item])).values());
  }

  /**
   * ✅ Statistiques POI
   */
  async getPoiCount(): Promise<number> {
    try {
      return await this.request<number>("/api/pois/count");
    } catch (error) {
      return 0;
    }
  }

  /**
   * ✅ POIs récents
   */
  async getRecentPois(limit: number = 10): Promise<POI[]> {
    try {
      const data = await this.request<any[]>(`/api/pois/recent?limit=${limit}`);
      return Array.isArray(data) ? data.map(mapPoiFromBackend) : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * ✅ POIs soumis (status SUBMITTED)
   */
  async getSubmittedPois(): Promise<POI[]> {
    try {
      const data = await this.request<any[]>("/api/pois/submitted");
      return Array.isArray(data) ? data.map(mapPoiFromBackend) : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * ✅ POIs approuvés (status APPROVED)
   */
  async getApprovedPois(): Promise<POI[]> {
    try {
      const data = await this.request<any[]>("/api/pois/approved");
      return Array.isArray(data) ? data.map(mapPoiFromBackend) : [];
    } catch (error) {
      return [];
    }
  }
}

export const poiService = new PoiService();