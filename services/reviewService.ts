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
  // Vérifier si l'ID est un lieu système
  private isExternalId(id: string): boolean {
    return id.startsWith("external-") || id.startsWith("search-");
  }

  /**
   * Récupère toutes les reviews depuis localStorage
   */
  private getAllReviewsFromStorage(): PoiReview[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem("navigoo_reviews");
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  /**
   * Sauvegarde toutes les reviews dans localStorage
   */
  private saveAllReviews(reviews: PoiReview[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem("navigoo_reviews", JSON.stringify(reviews));
  }

  /**
   * Crée une review (SIMULÉ)
   */
  async createReview(data: any) {
    const payload: PoiReview = {
      reviewId: this.generateUUID(),
      poiId: data.poiId,
      userId: data.userId,
      organizationId: data.organizationId,
      rating: data.rating,
      reviewText: data.reviewText || "",
      platformType: "WEB",
      likes: 0,
      dislikes: 0,
      createdAt: new Date().toISOString()
    };

    console.group(`⭐ [ReviewService SIMULÉ] POST /api-reviews`);
    console.log("Payload:", payload);
    
    const reviews = this.getAllReviewsFromStorage();
    reviews.push(payload);
    this.saveAllReviews(reviews);
    
    console.log("✅ Review créée avec succès");
    console.groupEnd();
    
    return payload;
  }

  /**
   * Obtenir tous les avis (SIMULÉ)
   */
  async getAllReviews(): Promise<PoiReview[]> {
    console.log("📋 [ReviewService SIMULÉ] Récupération de tous les avis");
    return this.getAllReviewsFromStorage();
  }

  /**
   * Obtenir un avis par ID (SIMULÉ)
   */
  async getReviewById(reviewId: string): Promise<PoiReview> {
    console.log(`🔍 [ReviewService SIMULÉ] Récupération avis ID: ${reviewId}`);
    const reviews = this.getAllReviewsFromStorage();
    const review = reviews.find(r => r.reviewId === reviewId);
    
    if (!review) {
      throw new Error("Avis non trouvé");
    }
    
    return review;
  }

  /**
   * Obtenir les avis d'un utilisateur (SIMULÉ)
   */
  async getReviewsByUser(userId: string): Promise<PoiReview[]> {
    console.log(`👤 [ReviewService SIMULÉ] Récupération avis utilisateur: ${userId}`);
    const reviews = this.getAllReviewsFromStorage();
    return reviews.filter(r => r.userId === userId);
  }

  /**
   * Obtenir les avis d'une organisation (SIMULÉ)
   */
  async getReviewsByOrganization(orgId: string): Promise<PoiReview[]> {
    console.log(`🏢 [ReviewService SIMULÉ] Récupération avis organisation: ${orgId}`);
    const reviews = this.getAllReviewsFromStorage();
    return reviews.filter(r => r.organizationId === orgId);
  }

  /**
   * Obtenir les avis d'un POI (SIMULÉ)
   */
  async getReviewsByPoi(poiId: string): Promise<PoiReview[]> {
    if (this.isExternalId(poiId)) return [];
    
    console.log(`📍 [ReviewService SIMULÉ] Récupération avis POI: ${poiId}`);
    const reviews = this.getAllReviewsFromStorage();
    return reviews.filter(r => r.poiId === poiId);
  }

  /**
   * Obtenir les statistiques d'un POI (SIMULÉ)
   */
  async getPoiStats(poiId: string): Promise<ReviewStats> {
    const reviews = await this.getReviewsByPoi(poiId);
    
    if (reviews.length === 0) {
      return { averageRating: 0, reviewCount: 0 };
    }

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / reviews.length;

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount: reviews.length
    };
  }

  /**
   * Obtenir la note moyenne d'un POI (SIMULÉ)
   */
  async getAverageRating(poiId: string): Promise<number> {
    console.log(`⭐ [ReviewService SIMULÉ] Récupération note moyenne POI: ${poiId}`);
    const stats = await this.getPoiStats(poiId);
    return stats.averageRating;
  }

  /**
   * Obtenir le nombre d'avis d'un POI (SIMULÉ)
   */
  async getReviewCount(poiId: string): Promise<number> {
    console.log(`🔢 [ReviewService SIMULÉ] Récupération nombre avis POI: ${poiId}`);
    const stats = await this.getPoiStats(poiId);
    return stats.reviewCount;
  }

  /**
   * Mettre à jour un avis (SIMULÉ)
   */
  async updateReview(reviewId: string, data: Partial<PoiReview>): Promise<PoiReview> {
    console.log(`✏️ [ReviewService SIMULÉ] Mise à jour avis ${reviewId}:`, data);
    
    const reviews = this.getAllReviewsFromStorage();
    const index = reviews.findIndex(r => r.reviewId === reviewId);
    
    if (index === -1) {
      throw new Error("Avis non trouvé");
    }

    reviews[index] = {
      ...reviews[index],
      ...data
    };

    this.saveAllReviews(reviews);
    return reviews[index];
  }

  /**
   * Supprimer un avis (SIMULÉ)
   */
  async deleteReview(reviewId: string): Promise<void> {
    console.log(`🗑️ [ReviewService SIMULÉ] Suppression avis: ${reviewId}`);
    
    const reviews = this.getAllReviewsFromStorage();
    const filtered = reviews.filter(r => r.reviewId !== reviewId);
    this.saveAllReviews(filtered);
  }

  /**
   * Liker un avis (SIMULÉ)
   */
  async likeReview(reviewId: string): Promise<PoiReview> {
    console.log(`👍 [ReviewService SIMULÉ] Like avis: ${reviewId}`);
    
    const reviews = this.getAllReviewsFromStorage();
    const index = reviews.findIndex(r => r.reviewId === reviewId);
    
    if (index === -1) {
      throw new Error("Avis non trouvé");
    }

    reviews[index].likes += 1;
    this.saveAllReviews(reviews);
    
    return reviews[index];
  }

  /**
   * Disliker un avis (SIMULÉ)
   */
  async dislikeReview(reviewId: string): Promise<PoiReview> {
    console.log(`👎 [ReviewService SIMULÉ] Dislike avis: ${reviewId}`);
    
    const reviews = this.getAllReviewsFromStorage();
    const index = reviews.findIndex(r => r.reviewId === reviewId);
    
    if (index === -1) {
      throw new Error("Avis non trouvé");
    }

    reviews[index].dislikes += 1;
    this.saveAllReviews(reviews);
    
    return reviews[index];
  }

  /**
   * Vérifier si un utilisateur a déjà laissé un avis sur un POI (SIMULÉ)
   */
  async hasUserReviewed(userId: string, poiId: string): Promise<boolean> {
    console.log(`🔍 [ReviewService SIMULÉ] Vérification avis existant - User: ${userId}, POI: ${poiId}`);
    
    try {
      const userReviews = await this.getReviewsByUser(userId);
      const hasReviewed = userReviews.some(review => review.poiId === poiId);
      
      console.log(`✅ [ReviewService SIMULÉ] Utilisateur a déjà reviewé: ${hasReviewed}`);
      return hasReviewed;
    } catch (error) {
      console.error("❌ [ReviewService SIMULÉ] Erreur vérification:", error);
      return false;
    }
  }

  /**
   * Obtenir l'avis d'un utilisateur sur un POI spécifique (SIMULÉ)
   */
  async getUserReviewForPoi(userId: string, poiId: string): Promise<PoiReview | null> {
    console.log(`🔍 [ReviewService SIMULÉ] Récupération avis spécifique - User: ${userId}, POI: ${poiId}`);
    
    try {
      const userReviews = await this.getReviewsByUser(userId);
      const review = userReviews.find(r => r.poiId === poiId);
      
      if (review) {
        console.log(`✅ [ReviewService SIMULÉ] Avis trouvé:`, review);
      } else {
        console.log(`ℹ️ [ReviewService SIMULÉ] Aucun avis trouvé`);
      }
      
      return review || null;
    } catch (error) {
      console.error("❌ [ReviewService SIMULÉ] Erreur récupération:", error);
      return null;
    }
  }

  /**
   * Utilitaire privé
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

export const reviewService = new ReviewService();