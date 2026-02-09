import { UserRole } from "@/types";

// services/userProfileService.ts - VERSION SIMULÉE
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

  // ==========================================
  // PROFIL UTILISATEUR (SIMULÉ)
  // ==========================================

  async getUserProfile(userId: string): Promise<UserProfile> {
    console.log("👤 [UserProfileService SIMULÉ] Récupération profil:", userId);
    
    // Récupérer depuis localStorage
    const allUsers = this.getAllUsersFromStorage();
    const user = allUsers.find(u => u.userId === userId);
    
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    return {
      userId: user.userId,
      username: user.username,
      email: user.email,
      phone: user.phone,
      organizationId: user.organizationId,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt
    };
  }

  async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    console.log("✏️ [UserProfileService SIMULÉ] Mise à jour profil:", userId);
    
    const allUsers = this.getAllUsersFromStorage();
    const index = allUsers.findIndex(u => u.userId === userId);
    
    if (index === -1) {
      throw new Error("Utilisateur non trouvé");
    }

    allUsers[index] = {
      ...allUsers[index],
      ...data
    };

    localStorage.setItem("navigoo_all_users", JSON.stringify(allUsers));
    
    return this.getUserProfile(userId);
  }

  // ==========================================
  // POIs DE L'UTILISATEUR (SIMULÉ)
  // ==========================================

  async getUserPois(userId: string): Promise<any[]> {
    console.log("📍 [UserProfileService SIMULÉ] Récupération POIs utilisateur:", userId);
    
    const allPois = this.getAllPoisFromStorage();
    return allPois.filter(poi => poi.created_by === userId || poi.userId === userId);
  }

  async getUserPoiCount(userId: string): Promise<number> {
    const pois = await this.getUserPois(userId);
    return pois.length;
  }

  // ==========================================
  // AVIS (REVIEWS) DE L'UTILISATEUR (SIMULÉ)
  // ==========================================

  async getUserReviews(userId: string): Promise<any[]> {
    console.log("⭐ [UserProfileService SIMULÉ] Récupération reviews utilisateur:", userId);
    
    const allReviews = this.getAllReviewsFromStorage();
    return allReviews.filter(review => review.userId === userId);
  }

  async createReview(reviewData: {
    poiId: string;
    userId: string;
    organizationId: string;
    platformType: string;
    rating: number;
    reviewText?: string;
  }): Promise<any> {
    const newReview = {
      reviewId: this.generateUUID(),
      ...reviewData,
      likes: 0,
      dislikes: 0,
      createdAt: new Date().toISOString()
    };

    const reviews = this.getAllReviewsFromStorage();
    reviews.push(newReview);
    localStorage.setItem("navigoo_reviews", JSON.stringify(reviews));

    return newReview;
  }

  async updateReview(reviewId: string, reviewData: Partial<any>): Promise<any> {
    const reviews = this.getAllReviewsFromStorage();
    const index = reviews.findIndex(r => r.reviewId === reviewId);
    
    if (index === -1) {
      throw new Error("Avis non trouvé");
    }

    reviews[index] = {
      ...reviews[index],
      ...reviewData
    };

    localStorage.setItem("navigoo_reviews", JSON.stringify(reviews));
    return reviews[index];
  }

  async deleteReview(reviewId: string): Promise<void> {
    const reviews = this.getAllReviewsFromStorage();
    const filtered = reviews.filter(r => r.reviewId !== reviewId);
    localStorage.setItem("navigoo_reviews", JSON.stringify(filtered));
  }

  // ==========================================
  // BLOGS DE L'UTILISATEUR (SIMULÉ)
  // ==========================================

  async getUserBlogs(userId: string): Promise<any[]> {
    console.log("📝 [UserProfileService SIMULÉ] Récupération blogs utilisateur:", userId);
    
    const allBlogs = this.getAllBlogsFromStorage();
    return allBlogs.filter(blog => blog.user_id === userId);
  }

  async createBlog(blogData: {
    user_id: string;
    poi_id: string;
    title: string;
    description?: string;
    cover_image_url?: string;
    content: string;
  }): Promise<any> {
    const newBlog = {
      blog_id: this.generateUUID(),
      ...blogData,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      views: 0,
      likes: 0
    };

    const blogs = this.getAllBlogsFromStorage();
    blogs.push(newBlog);
    localStorage.setItem("navigoo_blogs", JSON.stringify(blogs));

    return newBlog;
  }

  async updateBlog(blogId: string, blogData: Partial<any>): Promise<any> {
    const blogs = this.getAllBlogsFromStorage();
    const index = blogs.findIndex(b => b.blog_id === blogId);
    
    if (index === -1) {
      throw new Error("Blog non trouvé");
    }

    blogs[index] = {
      ...blogs[index],
      ...blogData,
      updated_at: new Date().toISOString()
    };

    localStorage.setItem("navigoo_blogs", JSON.stringify(blogs));
    return blogs[index];
  }

  async deleteBlog(blogId: string): Promise<void> {
    const blogs = this.getAllBlogsFromStorage();
    const filtered = blogs.filter(b => b.blog_id !== blogId);
    localStorage.setItem("navigoo_blogs", JSON.stringify(filtered));
  }

  // ==========================================
  // PODCASTS DE L'UTILISATEUR (SIMULÉ)
  // ==========================================

  async getUserPodcasts(userId: string): Promise<any[]> {
    console.log("🎙️ [UserProfileService SIMULÉ] Récupération podcasts utilisateur:", userId);
    
    const allPodcasts = this.getAllPodcastsFromStorage();
    return allPodcasts.filter(podcast => podcast.user_id === userId);
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
    const newPodcast = {
      podcast_id: this.generateUUID(),
      ...podcastData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      plays: 0,
      likes: 0
    };

    const podcasts = this.getAllPodcastsFromStorage();
    podcasts.push(newPodcast);
    localStorage.setItem("navigoo_podcasts", JSON.stringify(podcasts));

    return newPodcast;
  }

  async updatePodcast(podcastId: string, podcastData: Partial<any>): Promise<any> {
    const podcasts = this.getAllPodcastsFromStorage();
    const index = podcasts.findIndex(p => p.podcast_id === podcastId);
    
    if (index === -1) {
      throw new Error("Podcast non trouvé");
    }

    podcasts[index] = {
      ...podcasts[index],
      ...podcastData,
      updated_at: new Date().toISOString()
    };

    localStorage.setItem("navigoo_podcasts", JSON.stringify(podcasts));
    return podcasts[index];
  }

  async deletePodcast(podcastId: string): Promise<void> {
    const podcasts = this.getAllPodcastsFromStorage();
    const filtered = podcasts.filter(p => p.podcast_id !== podcastId);
    localStorage.setItem("navigoo_podcasts", JSON.stringify(filtered));
  }

  // ==========================================
  // LOGS D'ACCÈS (HISTORIQUE) (SIMULÉ)
  // ==========================================

  async getUserAccessLogs(userId: string): Promise<any[]> {
    console.log("📊 [UserProfileService SIMULÉ] Récupération logs utilisateur:", userId);
    
    const allLogs = this.getAllLogsFromStorage();
    return allLogs.filter(log => log.userId === userId);
  }

  async createAccessLog(logData: {
    poiId: string;
    userId: string;
    organizationId: string;
    platformType: string;
    accessType: string;
    metadata?: any;
  }): Promise<any> {
    const newLog = {
      accessId: this.generateUUID(),
      ...logData,
      accessDatetime: new Date().toISOString()
    };

    const logs = this.getAllLogsFromStorage();
    logs.push(newLog);
    localStorage.setItem("navigoo_access_logs", JSON.stringify(logs));

    return newLog;
  }

  // ==========================================
  // STATISTIQUES UTILISATEUR (SIMULÉ)
  // ==========================================

  async getUserStats(userId: string): Promise<UserStats> {
    console.log("📈 [UserProfileService SIMULÉ] Calcul statistiques utilisateur:", userId);
    
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
  // DONNÉES RÉCENTES POUR LA SIDEBAR (SIMULÉ)
  // ==========================================

  async getRecentPois(userId: string, limit: number = 10): Promise<any[]> {
    console.log("🕒 [UserProfileService SIMULÉ] Récupération POIs récents:", userId);
    
    const logs = await this.getUserAccessLogs(userId);
    
    // Filtrer les logs de type VIEW et prendre les plus récents
    const viewLogs = logs
      .filter(log => log.accessType === "VIEW")
      .sort((a, b) => new Date(b.accessDatetime).getTime() - new Date(a.accessDatetime).getTime())
      .slice(0, limit);

    // Récupérer les détails des POIs
    const poiIds = Array.from(new Set(viewLogs.map(log => log.poiId)));
    const allPois = this.getAllPoisFromStorage();
    
    const pois = poiIds
      .map(id => allPois.find(p => p.poi_id === id))
      .filter(Boolean);
    
    return pois;
  }

  async getSavedPois(userId: string): Promise<any[]> {
    console.log("💾 [UserProfileService SIMULÉ] Récupération POIs sauvegardés:", userId);
    
    // Récupérer les POIs favoris depuis localStorage
    const favorites = this.getFavoritesFromStorage();
    const userFavorites = favorites.filter(f => f.userId === userId);
    
    const allPois = this.getAllPoisFromStorage();
    const savedPois = userFavorites
      .map(fav => allPois.find(p => p.poi_id === fav.poiId))
      .filter(Boolean);

    return savedPois;
  }

  async getRecentTrips(userId: string, limit: number = 10): Promise<any[]> {
    console.log("🚗 [UserProfileService SIMULÉ] Récupération trajets récents:", userId);
    
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

  // ==========================================
  // UTILITAIRES PRIVÉS
  // ==========================================

  private getAllUsersFromStorage(): any[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem("navigoo_all_users");
    return stored ? JSON.parse(stored) : [];
  }

  private getAllPoisFromStorage(): any[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem("navigoo_user_pois");
    return stored ? JSON.parse(stored) : [];
  }

  private getAllReviewsFromStorage(): any[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem("navigoo_reviews");
    return stored ? JSON.parse(stored) : [];
  }

  private getAllBlogsFromStorage(): any[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem("navigoo_blogs");
    return stored ? JSON.parse(stored) : [];
  }

  private getAllPodcastsFromStorage(): any[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem("navigoo_podcasts");
    return stored ? JSON.parse(stored) : [];
  }

  private getAllLogsFromStorage(): any[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem("navigoo_access_logs");
    return stored ? JSON.parse(stored) : [];
  }

  private getFavoritesFromStorage(): any[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem("navigoo_favorites");
    return stored ? JSON.parse(stored) : [];
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

export const userProfileService = new UserProfileService();