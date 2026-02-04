import { UserRole } from "@/types";

// services/userProfileService.ts
const API_BASE_URL = "https://poi-navigoo.pynfi.com";

export interface UserProfile {
  userId: string;
  username: string;
  email: string;
  phone?: string;
  organizationId: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface UserStats {
  totalPois: number;
  totalReviews: number;
  totalBlogs: number;
  totalPodcasts: number;
  recentViews: number;
}

class UserProfileService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur API (${response.status}): ${errorText}`);
    }

    if (response.status === 204) return {} as T;
    return response.json();
  }

  // ==========================================
  // PROFIL UTILISATEUR
  // ==========================================

  async getUserProfile(userId: string): Promise<UserProfile> {
    return this.request<UserProfile>(`/api/users/${userId}`);
  }

  async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    return this.request<UserProfile>(`/api/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // ==========================================
  // POIs DE L'UTILISATEUR
  // ==========================================

  async getUserPois(userId: string): Promise<any[]> {
    return this.request<any[]>(`/api/pois/user/${userId}`);
  }

  async getUserPoiCount(userId: string): Promise<number> {
    const pois = await this.getUserPois(userId);
    return pois.length;
  }

  // ==========================================
  // AVIS (REVIEWS) DE L'UTILISATEUR
  // ==========================================

  async getUserReviews(userId: string): Promise<any[]> {
    return this.request<any[]>(`/api-reviews/user/${userId}/reviews`);
  }

  async createReview(reviewData: {
    poiId: string;
    userId: string;
    organizationId: string;
    platformType: string;
    rating: number;
    reviewText?: string;
  }): Promise<any> {
    return this.request<any>("/api-reviews", {
      method: "POST",
      body: JSON.stringify(reviewData),
    });
  }

  async updateReview(reviewId: string, reviewData: Partial<any>): Promise<any> {
    return this.request<any>(`/api-reviews/${reviewId}`, {
      method: "PUT",
      body: JSON.stringify(reviewData),
    });
  }

  async deleteReview(reviewId: string): Promise<void> {
    return this.request<void>(`/api-reviews/${reviewId}`, {
      method: "DELETE",
    });
  }

  // ==========================================
  // BLOGS DE L'UTILISATEUR
  // ==========================================

  async getUserBlogs(userId: string): Promise<any[]> {
    return this.request<any[]>(`/api/blogs/user/${userId}`);
  }

  async createBlog(blogData: {
    user_id: string;
    poi_id: string;
    title: string;
    description?: string;
    cover_image_url?: string;
    content: string;
  }): Promise<any> {
    return this.request<any>("/api/blogs", {
      method: "POST",
      body: JSON.stringify(blogData),
    });
  }

  async updateBlog(blogId: string, blogData: Partial<any>): Promise<any> {
    return this.request<any>(`/api/blogs/${blogId}`, {
      method: "PUT",
      body: JSON.stringify(blogData),
    });
  }

  async deleteBlog(blogId: string): Promise<void> {
    return this.request<void>(`/api/blogs/${blogId}`, {
      method: "DELETE",
    });
  }

  // ==========================================
  // PODCASTS DE L'UTILISATEUR
  // ==========================================

  async getUserPodcasts(userId: string): Promise<any[]> {
    return this.request<any[]>(`/api/podcasts/user/${userId}`);
  }

  async createPodcast(podcastData: {
    user_id: string;
    poi_id: string;
    title: string;
    description?: string;
    cover_image_url?: string;
    audio_file_url: string;
    duration_seconds: number;
  }): Promise<any> {
    return this.request<any>("/api/podcasts", {
      method: "POST",
      body: JSON.stringify(podcastData),
    });
  }

  async updatePodcast(podcastId: string, podcastData: Partial<any>): Promise<any> {
    return this.request<any>(`/api/podcasts/${podcastId}`, {
      method: "PUT",
      body: JSON.stringify(podcastData),
    });
  }

  async deletePodcast(podcastId: string): Promise<void> {
    return this.request<void>(`/api/podcasts/${podcastId}`, {
      method: "DELETE",
    });
  }

  // ==========================================
  // LOGS D'ACCÈS (HISTORIQUE)
  // ==========================================

  async getUserAccessLogs(userId: string): Promise<any[]> {
    return this.request<any[]>(`/api/poi-access-logs/user/${userId}`);
  }

  async createAccessLog(logData: {
    poiId: string;
    userId: string;
    organizationId: string;
    platformType: string;
    accessType: string;
    metadata?: any;
  }): Promise<any> {
    return this.request<any>("/api/poi-access-logs", {
      method: "POST",
      body: JSON.stringify({
        ...logData,
        accessDatetime: new Date().toISOString(),
      }),
    });
  }

  // ==========================================
  // STATISTIQUES UTILISATEUR
  // ==========================================

  async getUserStats(userId: string): Promise<UserStats> {
    const [pois, reviews, blogs, podcasts, logs] = await Promise.all([
      this.getUserPois(userId),
      this.getUserReviews(userId),
      this.getUserBlogs(userId),
      this.getUserPodcasts(userId),
      this.getUserAccessLogs(userId),
    ]);

    // Calculer les vues des 7 derniers jours
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentViews = logs.filter(log => 
      new Date(log.accessDatetime) > sevenDaysAgo && 
      log.accessType === "VIEW"
    ).length;

    return {
      totalPois: pois.length,
      totalReviews: reviews.length,
      totalBlogs: blogs.length,
      totalPodcasts: podcasts.length,
      recentViews,
    };
  }

  // ==========================================
  // DONNÉES RÉCENTES POUR LA SIDEBAR
  // ==========================================

  async getRecentPois(userId: string, limit: number = 10): Promise<any[]> {
    const logs = await this.getUserAccessLogs(userId);
    
    // Filtrer les logs de type VIEW et prendre les plus récents
    const viewLogs = logs
      .filter(log => log.accessType === "VIEW")
      .sort((a, b) => new Date(b.accessDatetime).getTime() - new Date(a.accessDatetime).getTime())
      .slice(0, limit);

    // Récupérer les détails des POIs
    const poiIds = Array.from(new Set(viewLogs.map(log => log.poiId)));
    const poisPromises = poiIds.map(id => 
      this.request<any>(`/api/pois/${id}`).catch(() => null)
    );
    
    const pois = (await Promise.all(poisPromises)).filter(Boolean);
    
    return pois;
  }

  async getSavedPois(userId: string): Promise<any[]> {
    // Pour l'instant, on utilise les POIs avec reviews positives (rating >= 4)
    // À terme, créer une table favorites
    const reviews = await this.getUserReviews(userId);
    const favoritePoiIds = reviews
      .filter(r => r.rating >= 4)
      .map(r => r.poiId);

    const uniqueIds = Array.from(new Set(favoritePoiIds));
    const poisPromises = uniqueIds.map(id => 
      this.request<any>(`/api/pois/${id}`).catch(() => null)
    );

    return (await Promise.all(poisPromises)).filter(Boolean);
  }

  async getRecentTrips(userId: string, limit: number = 10): Promise<any[]> {
    const logs = await this.getUserAccessLogs(userId);
    
    // Filtrer les logs de type TRIP
    const tripLogs = logs
      .filter(log => log.accessType === "TRIP" && log.metadata)
      .sort((a, b) => new Date(b.accessDatetime).getTime() - new Date(a.accessDatetime).getTime())
      .slice(0, limit);

    return tripLogs.map(log => ({
      id: log.accessId,
      poiId: log.poiId,
      date: log.accessDatetime,
      ...log.metadata,
    }));
  }
}

export const userProfileService = new UserProfileService();