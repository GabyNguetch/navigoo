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
  // UTILITAIRES LOCALSTORAGE
  // ==========================================

  private getAllPoisFromStorage(): POI[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem("navigoo_user_pois");
    return stored ? JSON.parse(stored) : [];
  }

  private saveAllPoisToStorage(pois: POI[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem("navigoo_user_pois", JSON.stringify(pois));
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // ==========================================
  // LECTURE (GET)
  // ==========================================

  /**
   * ✅ Récupère tous les POIs - GARDE LE BACKEND RÉEL
   */
  async getAllPois(): Promise<POI[]> {
    try {
      console.log("🔄 [POI] Récupération de tous les POIs depuis le backend...");
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

  /**
   * ✅ Récupère un POI par ID - SIMULÉ localStorage avec fallback gracieux
   */
  async getPoiById(poiId: string): Promise<POI> {
    console.log(`🔍 [POI SIMULÉ] Récupération POI: ${poiId}`);
    
    // Chercher d'abord dans localStorage
    const localPois = this.getAllPoisFromStorage();
    const localPoi = localPois.find(p => p.poi_id === poiId);
    
    if (localPoi) {
      console.log("✅ POI trouvé dans localStorage");
      return localPoi;
    }

    // Sinon tenter le backend (pour les POIs publics)
    try {
      const data = await this.request<any>(`/api/pois/${poiId}`);
      return mapPoiFromBackend(data);
    } catch (error: any) {
      console.warn(`⚠️ POI ${poiId} non trouvé dans le backend:`, error.message);
      
      // Retourner un POI placeholder au lieu de throw error
      return {
        poi_id: poiId,
        poi_name: "Lieu non disponible",
        poi_category: "OTHER",
        poi_type: "OTHER",
        poi_description: "Ce lieu n'est plus disponible",
        location: { latitude: 0, longitude: 0 },
        latitude: 0,
        longitude: 0,
        address_city: "Non spécifié",
        address_country: "Cameroun",
        poi_images_urls: [],
        poi_amenities: [],
        poi_keywords: [],
        poi_contacts: { phone: "", website: "" },
        rating: 0,
        review_count: 0,
        popularity_score: 0,
        is_active: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as POI;
    }
  }

  /**
   * ✅ Recherche par localisation - SIMULÉ localStorage
   */
  async searchPoisByLocation(latitude: number, longitude: number, radiusKm: number = 10): Promise<POI[]> {
    console.log(`📍 [POI SIMULÉ] Recherche locale: ${latitude}, ${longitude} (rayon: ${radiusKm}km)`);
    
    const localPois = this.getAllPoisFromStorage();
    
    // Filtrer par distance (formule simple)
    const filtered = localPois.filter(poi => {
      if (!poi.location) return false;
      
      const dx = poi.location.latitude - latitude;
      const dy = poi.location.longitude - longitude;
      const distance = Math.sqrt(dx * dx + dy * dy) * 111; // Approximation km
      
      return distance <= radiusKm;
    });

    return filtered;
  }

  /**
   * ✅ Recherche par catégorie - SIMULÉ localStorage
   */
  async getPoisByCategory(category: string): Promise<POI[]> {
    console.log(`🏷️ [POI SIMULÉ] Recherche par catégorie: ${category}`);
    const localPois = this.getAllPoisFromStorage();
    return localPois.filter(poi => poi.poi_category === category);
  }

  /**
   * ✅ Recherche par ville - SIMULÉ localStorage
   */
  async getPoisByCity(city: string): Promise<POI[]> {
    console.log(`🏙️ [POI SIMULÉ] Recherche par ville: ${city}`);
    const localPois = this.getAllPoisFromStorage();
    return localPois.filter(poi => 
      poi.address_city?.toLowerCase().includes(city.toLowerCase())
    );
  }

  /**
   * ✅ Recherche par nom - SIMULÉ localStorage
   */
  async searchPoisByName(name: string): Promise<POI[]> {
    console.log(`🔍 [POI SIMULÉ] Recherche par nom: ${name}`);
    const localPois = this.getAllPoisFromStorage();
    return localPois.filter(poi => 
      poi.poi_name?.toLowerCase().includes(name.toLowerCase())
    );
  }

  /**
   * ✅ POIs populaires - SIMULÉ localStorage
   */
  async getTopPopularPois(limit: number = 10): Promise<POI[]> {
    console.log(`⭐ [POI SIMULÉ] Top ${limit} POIs populaires`);
    const localPois = this.getAllPoisFromStorage();
    return localPois
      .sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0))
      .slice(0, limit);
  }

  /**
   * ✅ Recherche par type - SIMULÉ localStorage
   */
  async getPoisByType(type: string): Promise<POI[]> {
    console.log(`🎯 [POI SIMULÉ] Recherche par type: ${type}`);
    const localPois = this.getAllPoisFromStorage();
    return localPois.filter(poi => poi.poi_type === type);
  }

  /**
   * ✅ POIs d'un utilisateur - SIMULÉ localStorage
   */
  async getPoisByUser(userId: string): Promise<POI[]> {
    console.log(`👤 [POI SIMULÉ] POIs de l'utilisateur: ${userId}`);
    const localPois = this.getAllPoisFromStorage();
    return localPois.filter(poi => 
  (poi.created_by === userId) || (poi.created_by_user_id === userId)
);
  }

  /**
   * ✅ POIs d'une organisation - SIMULÉ localStorage
   */
  async getPoisByOrganization(orgId: string, type: 'active' | 'all' = 'active'): Promise<POI[]> {
    console.log(`🏢 [POI SIMULÉ] POIs de l'organisation: ${orgId}`);
    const localPois = this.getAllPoisFromStorage();
    const orgPois = localPois.filter(poi => poi.organization_id === orgId);
    
    if (type === 'active') {
      return orgPois.filter(poi => poi.is_active);
    }
    
    return orgPois;
  }

  // ==========================================
  // ÉCRITURE (POST / PUT / DELETE) - SIMULÉ
  // ==========================================

  /**
   * ✅ Créer un POI - SIMULÉ localStorage
   */
  async createPoi(formData: any): Promise<any> {
    console.group("🚀 [POI SIMULÉ] Création POI");
    
    const session = authService.getSession();
    if (!session?.userId || !session?.organizationId) {
      throw new Error("Vous devez être connecté pour créer un POI.");
    }

    const newPoi: POI = {
      poi_id: this.generateUUID(),
      organization_id: session.organizationId,
      created_by: session.userId,
      created_by_user_id: session.userId,
      
      poi_name: formData.poi_name,
      poi_type: formData.poi_type || "OTHER",
      poi_category: formData.poi_category,
      poi_long_name: formData.poi_name,
      poi_short_name: formData.poi_name.substring(0, 20),
      poi_friendly_name: formData.poi_name,
      
      poi_description: formData.poi_description || "",
      poi_logo: "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      
      location: {
        latitude: Number(formData.location?.latitude) || 0,
        longitude: Number(formData.location?.longitude) || 0
      },
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
      
// Ligne 366 environ, dans la fonction createPoi :
operation_time_plan: {
  "Lundi": { open: "08:00", close: "18:00" }, // Format conforme à votre interface
  "Mardi": { open: "08:00", close: "18:00" },
  "Mercredi": { open: "08:00", close: "18:00" },
  "Jeudi": { open: "08:00", close: "18:00" },
  "Vendredi": { open: "08:00", close: "18:00" }
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
      rating: 0,
      review_count: 0,
      is_active: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log("📝 Nouveau POI:", newPoi);

    // Sauvegarder dans localStorage
    const existingPois = this.getAllPoisFromStorage();
    existingPois.push(newPoi);
    this.saveAllPoisToStorage(existingPois);

    console.log("✅ POI créé avec succès dans localStorage");
    console.groupEnd();

    return newPoi;
  }

  /**
   * ✅ Mettre à jour un POI - SIMULÉ localStorage
   */
  async updatePoi(poiId: string, poiData: Partial<POI>): Promise<POI> {
    console.log(`✏️ [POI SIMULÉ] Mise à jour POI: ${poiId}`);
    
    const existingPois = this.getAllPoisFromStorage();
    const index = existingPois.findIndex(p => p.poi_id === poiId);
    
    if (index === -1) {
      throw new Error("POI non trouvé");
    }

    existingPois[index] = {
      ...existingPois[index],
      ...poiData,
      updated_at: new Date().toISOString()
    };

    this.saveAllPoisToStorage(existingPois);
    
    console.log("✅ POI mis à jour avec succès");
    return existingPois[index];
  }

  /**
   * ✅ Supprimer un POI - SIMULÉ localStorage
   */
  async deletePoi(poiId: string): Promise<void> {
    console.log(`🗑️ [POI SIMULÉ] Suppression POI: ${poiId}`);
    
    const existingPois = this.getAllPoisFromStorage();
    const filtered = existingPois.filter(p => p.poi_id !== poiId);
    
    this.saveAllPoisToStorage(filtered);
    
    console.log("✅ POI supprimé avec succès");
  }

  // ==========================================
  // ACTIONS SPÉCIFIQUES - SIMULÉ
  // ==========================================

  /**
   * ✅ Vérifier si un nom existe - SIMULÉ localStorage
   */
  async checkPoiNameExists(name: string, organizationId: string, excludeId?: string): Promise<boolean> {
    const localPois = this.getAllPoisFromStorage();
    return localPois.some(poi => 
      poi.poi_name?.toLowerCase() === name.toLowerCase() &&
      poi.organization_id === organizationId &&
      poi.poi_id !== excludeId
    );
  }

  /**
   * ✅ Activer un POI - SIMULÉ localStorage
   */
  async activatePoi(poiId: string): Promise<void> {
    console.log(`✅ [POI SIMULÉ] Activation POI: ${poiId}`);
    await this.updatePoi(poiId, { is_active: true });
  }

  /**
   * ✅ Désactiver un POI - SIMULÉ localStorage
   */
  async deactivatePoi(poiId: string): Promise<void> {
    console.log(`❌ [POI SIMULÉ] Désactivation POI: ${poiId}`);
    await this.updatePoi(poiId, { is_active: false });
  }

  /**
   * ✅ Approuver un POI - SIMULÉ localStorage
   */
  async approvePoi(poiId: string, approverId: string): Promise<void> {
    console.log(`👍 [POI SIMULÉ] Approbation POI: ${poiId} par ${approverId}`);
    await this.updatePoi(poiId, { 
      is_active: true,
      approval_status: 'APPROVED',
      approved_by: approverId,
      approved_at: new Date().toISOString()
    } as any);
  }

  /**
   * ✅ Rejeter un POI - SIMULÉ localStorage
   */
  async rejectPoi(poiId: string, rejecterId: string): Promise<void> {
    console.log(`👎 [POI SIMULÉ] Rejet POI: ${poiId} par ${rejecterId}`);
    await this.updatePoi(poiId, { 
      is_active: false,
      approval_status: 'REJECTED',
      rejected_by: rejecterId,
      rejected_at: new Date().toISOString()
    } as any);
  }

  /**
   * ✅ Mettre à jour le score de popularité - SIMULÉ localStorage
   */
  async updatePopularityScore(poiId: string, score: number): Promise<void> {
    console.log(`⭐ [POI SIMULÉ] Mise à jour score popularité: ${poiId} = ${score}`);
    await this.updatePoi(poiId, { popularity_score: score });
  }

  /**
   * ✅ Recherche globale - SIMULÉ localStorage
   */
  async searchGlobal(query: string): Promise<POI[]> {
    console.log(`🔍 [POI SIMULÉ] Recherche globale: ${query}`);
    
    const [byName, byCity] = await Promise.all([
      this.searchPoisByName(query),
      this.getPoisByCity(query)
    ]);
    
    const combined = [...byName, ...byCity];
    return Array.from(new Map(combined.map(item => [item.poi_id, item])).values());
  }

  /**
   * ✅ Nombre de POIs - SIMULÉ localStorage
   */
  async getPoiCount(): Promise<number> {
    const pois = this.getAllPoisFromStorage();
    return pois.length;
  }

  /**
   * ✅ POIs récents - SIMULÉ localStorage
   */
  async getRecentPois(limit: number = 10): Promise<POI[]> {
    console.log(`🕒 [POI SIMULÉ] ${limit} POIs récents`);
    const localPois = this.getAllPoisFromStorage();
    return localPois
      .sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, limit);
  }

  /**
   * ✅ POIs soumis - SIMULÉ localStorage
   */
  async getSubmittedPois(): Promise<POI[]> {
    console.log(`📋 [POI SIMULÉ] POIs soumis`);
    const localPois = this.getAllPoisFromStorage();
    return localPois.filter(poi => !poi.is_active);
  }

  /**
   * ✅ POIs approuvés - SIMULÉ localStorage
   */
  async getApprovedPois(): Promise<POI[]> {
    console.log(`✅ [POI SIMULÉ] POIs approuvés`);
    const localPois = this.getAllPoisFromStorage();
    return localPois.filter(poi => poi.is_active);
  }
}

export const poiService = new PoiService();