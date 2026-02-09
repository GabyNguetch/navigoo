// services/contentService.ts
import { Blog } from "@/types";
import { authService } from "./authService";

const API_BASE_URL = "/remote-api/api";

class ContentService {

    // Logger centralisé pour la liaison Backend/Frontend
  private async logTraffic(endpoint: string, method: string, payload: any, response: Response, data: any) {
    const statusColor = response.ok ? 'color: #10b981' : 'color: #ef4444';
    console.group(`📡 [BACKEND LIAISON] ${method} ${endpoint}`);
    console.log(`%cStatus: ${response.status} ${response.statusText}`, statusColor);
    console.log("📤 Payload envoyé:", payload);
    console.log("📥 Données reçues:", data);
    console.groupEnd();
  }

  private async request<T>(endpoint: string, options: RequestInit): Promise<T> {
    const token = authService.getToken();
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    
    let result;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      result = await response.json();
    } else {
      result = { text: await response.text() };
    }

    // On logue systématiquement selon ton exigence
    this.logTraffic(endpoint, options.method || 'GET', options.body ? JSON.parse(options.body as string) : null, response, result);

    if (!response.ok) {
      throw new Error(result.message || `Erreur Serveur (${response.status})`);
    }
    return result;
  }

  /**
   * Validates UUID format
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Validates URL format
   */
  private isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Crée un blog
   */
  async createBlog(data: {
    user_id: string;
    poi_id: string;
    title: string;
    cover_image_url: string; // Doit être l'URL finale https://...
    content: string;
  }) {
    // CORRECTION : Nettoyage de l'URL pour éviter localhost
    let finalImageUrl = data.cover_image_url;
    if (finalImageUrl.includes('localhost:3000/media-api')) {
       // On convertit le lien proxy local en lien direct pour le backend
       finalImageUrl = finalImageUrl.replace(/http:\/\/localhost:3000\/media-api\/media\/proxy\//, 'https://media-service.pynfi.com/media/');
    }

    return this.request<any>("/blogs", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        cover_image_url: finalImageUrl,
        is_active: true
      }),
    });
  }

  /**
   * Crée un podcast
   */
  async createPodcast(data: {
    user_id: string;
    poi_id: string;
    title: string;
    description?: string;
    cover_image_url?: string;
    audio_file_url: string;
    duration_seconds: number;
  }) {
    const user = authService.getSession();
    
    // 🔍 Pre-flight validation
    console.group("🔍 [Pre-flight Validation - Podcast]");
    
    if (!user?.userId) {
      console.error("❌ User ID missing");
      throw new Error("Session utilisateur manquante");
    }
    
    if (!this.isValidUUID(user.userId)) {
      console.error("❌ Invalid user_id UUID:", user.userId);
      throw new Error("ID utilisateur invalide");
    }
    
    if (!data.poi_id || !this.isValidUUID(data.poi_id)) {
      console.error("❌ Invalid POI ID");
      throw new Error("POI invalide");
    }
    
    if (!data.title?.trim()) {
      console.error("❌ Title missing");
      throw new Error("Titre requis");
    }
    
    if (!data.audio_file_url) {
      console.error("❌ Audio file URL missing");
      throw new Error("Fichier audio requis");
    }
    
    if (!this.isValidURL(data.audio_file_url)) {
      console.error("❌ Invalid audio_file_url:", data.audio_file_url);
      throw new Error("URL du fichier audio invalide");
    }
    
    if (!data.duration_seconds || data.duration_seconds <= 0) {
      console.error("❌ Invalid duration");
      throw new Error("Durée invalide");
    }
    
    console.log("✅ All validations passed");
    console.groupEnd();

    const payload = {
      user_id: data.user_id,
      poi_id: data.poi_id,
      title: data.title.trim(),
      description: data.description?.trim() || "",
      cover_image_url: data.cover_image_url || "",
      audio_file_url: data.audio_file_url,
      duration_seconds: Math.floor(data.duration_seconds)
    };

    console.group("🚀 [Podcast Creation Request]");
    console.log("🎙️ Creating podcast:", JSON.stringify(payload, null, 2));

    const token = authService.getToken();
    
    if (!token) {
      console.error("❌ No auth token found");
      console.groupEnd();
      throw new Error("Token d'authentification manquant");
    }

    try {
      const res = await fetch(`${API_BASE_URL}/podcasts`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      console.log("📡 Response Status:", res.status, res.statusText);
      
      let result;
      const contentType = res.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        result = await res.json();
      } else {
        const text = await res.text();
        console.error("❌ Non-JSON response:", text);
        result = { error: text || "Invalid response format" };
      }

      console.log("📥 Response Body:", JSON.stringify(result, null, 2));
      
      if (!res.ok) {
        console.error("❌ Podcast creation failed with status:", res.status);
        console.groupEnd();
        
        const errorMessage = result.message || result.error || result.errors?.join(", ") || `Erreur ${res.status}: ${res.statusText}`;
        throw new Error(errorMessage);
      }

      console.log("✅ Podcast created successfully!");
      console.log("🎙️ Podcast ID:", result.podcast_id);
      console.groupEnd();
      
      return result;

    } catch (error: any) {
      console.error("💥 Exception during podcast creation:", error);
      console.groupEnd();
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error("Erreur de connexion au serveur. Vérifiez votre connexion internet.");
      }
      
      throw error;
    }
  }

  /**
   * Récupère tous les blogs
   */
  async getAllBlogs() {
    try {
      const res = await fetch(`${API_BASE_URL}/blogs`);
      if (!res.ok) throw new Error("Erreur lors de la récupération des blogs");
      return await res.json();
    } catch (error) {
      console.error("Erreur getAllBlogs:", error);
      throw error;
    }
  }

  /**
   * Récupère les blogs d'un POI spécifique
   */
  async getBlogsByPoiId(poiId: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/blogs/poi/${poiId}`);
      if (!res.ok) throw new Error("Erreur lors de la récupération des blogs");
      return await res.json();
    } catch (error) {
      console.error("Erreur getBlogsByPoiId:", error);
      throw error;
    }
  }

  /**
   * Récupère tous les podcasts
   */
  async getAllPodcasts() {
    try {
      const res = await fetch(`${API_BASE_URL}/podcasts`);
      if (!res.ok) throw new Error("Erreur lors de la récupération des podcasts");
      return await res.json();
    } catch (error) {
      console.error("Erreur getAllPodcasts:", error);
      throw error;
    }
  }

  /**
   * Récupère les podcasts d'un POI spécifique
   */
  async getPodcastsByPoiId(poiId: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/podcasts/poi/${poiId}`);
      if (!res.ok) throw new Error("Erreur lors de la récupération des podcasts");
      return await res.json();
    } catch (error) {
      console.error("Erreur getPodcastsByPoiId:", error);
      throw error;
    }
  }
}

export const contentService = new ContentService();