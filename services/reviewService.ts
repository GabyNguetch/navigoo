const API_BASE_URL = "https://poi-navigoo.pynfi.com";

export interface PoiReview {
  reviewId?: string;
  poiId: string;
  userId: string;
  organizationId: string;
  platformType: string;
  rating: number;
  reviewText?: string;
  createdAt?: string;
  likes: number;
  dislikes: number;
}

export interface ReviewStats {
  averageRating: number;
  reviewCount: number;
}

class ReviewService {
    // Ajout d'une petite fonction utilitaire pour vérifier si l'ID est un lieu système
  private isExternalId(id: string): boolean {
    return id.startsWith("external-") || id.startsWith("search-");
  }
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log(`📡 [ReviewService] Request: ${options.method || 'GET'} ${url}`);

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [ReviewService] Error ${response.status}:`, errorText);
      throw new Error(`Erreur API (${response.status}): ${errorText}`);
    }

    if (response.status === 204) {
      console.log(`✅ [ReviewService] Success (No Content)`);
      return {} as T;
    }

    const data = await response.json();
    console.log(`✅ [ReviewService] Success:`, data);
    return data;
  }
  async createReview(data: any) {
    const payload = {
      poiId: data.poiId,
      userId: data.userId,
      organizationId: data.organizationId,
      rating: data.rating,
      reviewText: data.reviewText,
      platformType: "WEB",
      likes: 0,
      dislikes: 0
    };

    console.group(`⭐ Liaison Review: POST /api-reviews`);
    const res = await fetch(API_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    console.log("Result:", result);
    console.groupEnd();
    return result;
  }
  // Obtenir tous les avis
  async getAllReviews(): Promise<PoiReview[]> {
    console.log("📋 [ReviewService] Récupération de tous les avis");
    return this.request<PoiReview[]>("/api-reviews");
  }

  // Obtenir un avis par ID
  async getReviewById(reviewId: string): Promise<PoiReview> {
    console.log(`🔍 [ReviewService] Récupération avis ID: ${reviewId}`);
    return this.request<PoiReview>(`/api-reviews/${reviewId}`);
  }

  // Obtenir les avis d'un utilisateur
  async getReviewsByUser(userId: string): Promise<PoiReview[]> {
    console.log(`👤 [ReviewService] Récupération avis utilisateur: ${userId}`);
    return this.request<PoiReview[]>(`/api-reviews/user/${userId}/reviews`);
  }

  // Obtenir les avis d'une organisation
  async getReviewsByOrganization(orgId: string): Promise<PoiReview[]> {
    console.log(`🏢 [ReviewService] Récupération avis organisation: ${orgId}`);
    return this.request<PoiReview[]>(`/api-reviews/organization/${orgId}/reviews`);
  }

  async getReviewsByPoi(poiId: string): Promise<PoiReview[]> {
    if (this.isExternalId(poiId)) return []; // Retourne une liste vide sans requête
    console.log(`📍 [ReviewService] Récupération avis POI: ${poiId}`);
    return this.request<PoiReview[]>(`/api-reviews/poi/${poiId}/reviews`);
  }

  async getPoiStats(poiId: string) {
    const res = await fetch(`${API_BASE_URL}/poi/${poiId}/stats`);
    if (!res.ok) return { averageRating: 0, reviewCount: 0 };
    return res.json();
  }

  // Obtenir la note moyenne d'un POI
  async getAverageRating(poiId: string): Promise<number> {
    console.log(`⭐ [ReviewService] Récupération note moyenne POI: ${poiId}`);
    return this.request<number>(`/api-reviews/poi/${poiId}/average-rating`);
  }

  // Obtenir le nombre d'avis d'un POI
  async getReviewCount(poiId: string): Promise<number> {
    console.log(`🔢 [ReviewService] Récupération nombre avis POI: ${poiId}`);
    return this.request<number>(`/api-reviews/poi/${poiId}/count`);
  }

  // Mettre à jour un avis
  async updateReview(reviewId: string, data: Partial<PoiReview>): Promise<PoiReview> {
    console.log(`✏️ [ReviewService] Mise à jour avis ${reviewId}:`, data);
    
    return this.request<PoiReview>(`/api-reviews/${reviewId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Supprimer un avis
  async deleteReview(reviewId: string): Promise<void> {
    console.log(`🗑️ [ReviewService] Suppression avis: ${reviewId}`);
    
    return this.request<void>(`/api-reviews/${reviewId}`, {
      method: "DELETE",
    });
  }

  // Liker un avis
  async likeReview(reviewId: string): Promise<PoiReview> {
    console.log(`👍 [ReviewService] Like avis: ${reviewId}`);
    
    return this.request<PoiReview>(`/api-reviews/${reviewId}/like`, {
      method: "PATCH",
    });
  }

  // Disliker un avis
  async dislikeReview(reviewId: string): Promise<PoiReview> {
    console.log(`👎 [ReviewService] Dislike avis: ${reviewId}`);
    
    return this.request<PoiReview>(`/api-reviews/${reviewId}/unlike`, {
      method: "PATCH",
    });
  }

  // Vérifier si un utilisateur a déjà laissé un avis sur un POI
  async hasUserReviewed(userId: string, poiId: string): Promise<boolean> {
    console.log(`🔍 [ReviewService] Vérification avis existant - User: ${userId}, POI: ${poiId}`);
    
    try {
      const userReviews = await this.getReviewsByUser(userId);
      const hasReviewed = userReviews.some(review => review.poiId === poiId);
      
      console.log(`✅ [ReviewService] Utilisateur a déjà reviewé: ${hasReviewed}`);
      return hasReviewed;
    } catch (error) {
      console.error("❌ [ReviewService] Erreur vérification:", error);
      return false;
    }
  }

  // Obtenir l'avis d'un utilisateur sur un POI spécifique
  async getUserReviewForPoi(userId: string, poiId: string): Promise<PoiReview | null> {
    console.log(`🔍 [ReviewService] Récupération avis spécifique - User: ${userId}, POI: ${poiId}`);
    
    try {
      const userReviews = await this.getReviewsByUser(userId);
      const review = userReviews.find(r => r.poiId === poiId);
      
      if (review) {
        console.log(`✅ [ReviewService] Avis trouvé:`, review);
      } else {
        console.log(`ℹ️ [ReviewService] Aucun avis trouvé`);
      }
      
      return review || null;
    } catch (error) {
      console.error("❌ [ReviewService] Erreur récupération:", error);
      return null;
    }
  }
}

export const reviewService = new ReviewService();