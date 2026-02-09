// services/contentService.ts - VERSION AMÉLIORÉE
import { Blog } from "@/types";
import { authService } from "./authService";

const API_BASE_URL = "/remote-api/api";

export interface BlogComment {
  comment_id: string;
  blog_id: string;
  user_id: string;
  username: string;
  content: string;
  created_at: string;
}

export interface PodcastComment {
  comment_id: string;
  podcast_id: string;
  user_id: string;
  username: string;
  content: string;
  created_at: string;
}

class ContentService {

  // Logger centralisé pour la liaison Backend/Frontend
  private async logTraffic(endpoint: string, method: string, payload: any, response: any, data: any) {
    const statusColor = 'color: #10b981';
    console.group(`📡 [BACKEND SIMULÉ] ${method} ${endpoint}`);
    console.log(`%cStatus: 200 OK (localStorage)`, statusColor);
    console.log("📤 Payload envoyé:", payload);
    console.log("📥 Données simulées:", data);
    console.groupEnd();
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Crée un blog (SIMULÉ avec localStorage)
   */
  async createBlog(data: {
    user_id: string;
    poi_id: string;
    title: string;
    cover_image_url: string;
    content: string;
  }) {
    console.log("🚀 [ContentService SIMULÉ] Création blog");

    // Nettoyage de l'URL pour éviter localhost
    let finalImageUrl = data.cover_image_url;
    if (finalImageUrl.includes('localhost:3000/media-api')) {
       finalImageUrl = finalImageUrl.replace(/http:\/\/localhost:3000\/media-api\/media\/proxy\//, 'https://media-service.pynfi.com/media/');
    }

    const newBlog = {
      blog_id: this.generateUUID(),
      user_id: data.user_id,
      poi_id: data.poi_id,
      title: data.title,
      cover_image_url: finalImageUrl,
      content: data.content,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      views: 0,
      likes: 0,
      liked_by: []
    };

    // Sauvegarder dans localStorage
    const blogs = this.getAllBlogs();
    blogs.push(newBlog);
    localStorage.setItem("navigoo_blogs", JSON.stringify(blogs));

    await this.logTraffic("/blogs", "POST", data, { ok: true }, newBlog);

    return newBlog;
  }

  /**
   * Crée un podcast (SIMULÉ avec localStorage)
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
    console.group("🎙️ [ContentService SIMULÉ] Création podcast");
    
    // Validation
    if (!data.user_id || !data.poi_id || !data.title || !data.audio_file_url || !data.duration_seconds) {
      console.error("❌ Données manquantes");
      console.groupEnd();
      throw new Error("Données du podcast incomplètes");
    }

    const newPodcast = {
      podcast_id: this.generateUUID(),
      user_id: data.user_id,
      poi_id: data.poi_id,
      title: data.title.trim(),
      description: data.description?.trim() || "",
      cover_image_url: data.cover_image_url || "",
      audio_file_url: data.audio_file_url,
      duration_seconds: Math.floor(data.duration_seconds),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      plays: 0,
      likes: 0,
      liked_by: []
    };

    // Sauvegarder dans localStorage
    const podcasts = this.getAllPodcasts();
    podcasts.push(newPodcast);
    localStorage.setItem("navigoo_podcasts", JSON.stringify(podcasts));

    console.log("✅ Podcast créé avec succès!");
    console.log("🎙️ Podcast ID:", newPodcast.podcast_id);
    console.groupEnd();

    await this.logTraffic("/podcasts", "POST", data, { ok: true }, newPodcast);

    return newPodcast;
  }

  /**
   * Récupère tous les blogs depuis localStorage
   */
  getAllBlogs(): any[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem("navigoo_blogs");
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  /**
   * Récupère les blogs d'un POI spécifique
   */
  async getBlogsByPoiId(poiId: string) {
    console.log("🔍 [ContentService SIMULÉ] Récupération blogs pour POI:", poiId);
    const allBlogs = this.getAllBlogs();
    return allBlogs.filter(blog => blog.poi_id === poiId);
  }

  /**
   * Récupère tous les podcasts depuis localStorage
   */
  getAllPodcasts(): any[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem("navigoo_podcasts");
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  /**
   * Récupère les podcasts d'un POI spécifique
   */
  async getPodcastsByPoiId(poiId: string) {
    console.log("🔍 [ContentService SIMULÉ] Récupération podcasts pour POI:", poiId);
    const allPodcasts = this.getAllPodcasts();
    return allPodcasts.filter(podcast => podcast.poi_id === poiId);
  }

  /**
   * Récupère les blogs d'un utilisateur
   */
  async getBlogsByUserId(userId: string) {
    console.log("🔍 [ContentService SIMULÉ] Récupération blogs pour utilisateur:", userId);
    const allBlogs = this.getAllBlogs();
    return allBlogs.filter(blog => blog.user_id === userId);
  }

  /**
   * Récupère les podcasts d'un utilisateur
   */
  async getPodcastsByUserId(userId: string) {
    console.log("🔍 [ContentService SIMULÉ] Récupération podcasts pour utilisateur:", userId);
    const allPodcasts = this.getAllPodcasts();
    return allPodcasts.filter(podcast => podcast.user_id === userId);
  }

  /**
   * Met à jour un blog
   */
  async updateBlog(blogId: string, data: Partial<any>) {
    const blogs = this.getAllBlogs();
    const index = blogs.findIndex(b => b.blog_id === blogId);
    
    if (index === -1) {
      throw new Error("Blog non trouvé");
    }

    blogs[index] = {
      ...blogs[index],
      ...data,
      updated_at: new Date().toISOString()
    };

    localStorage.setItem("navigoo_blogs", JSON.stringify(blogs));
    return blogs[index];
  }

  /**
   * Supprime un blog
   */
  async deleteBlog(blogId: string) {
    const blogs = this.getAllBlogs();
    const filtered = blogs.filter(b => b.blog_id !== blogId);
    localStorage.setItem("navigoo_blogs", JSON.stringify(filtered));
  }

  /**
   * Met à jour un podcast
   */
  async updatePodcast(podcastId: string, data: Partial<any>) {
    const podcasts = this.getAllPodcasts();
    const index = podcasts.findIndex(p => p.podcast_id === podcastId);
    
    if (index === -1) {
      throw new Error("Podcast non trouvé");
    }

    podcasts[index] = {
      ...podcasts[index],
      ...data,
      updated_at: new Date().toISOString()
    };

    localStorage.setItem("navigoo_podcasts", JSON.stringify(podcasts));
    return podcasts[index];
  }

  /**
   * Supprime un podcast
   */
  async deletePodcast(podcastId: string) {
    const podcasts = this.getAllPodcasts();
    const filtered = podcasts.filter(p => p.podcast_id !== podcastId);
    localStorage.setItem("navigoo_podcasts", JSON.stringify(filtered));
  }

  // ==========================================
  // LIKES & COMMENTAIRES
  // ==========================================

  /**
   * Like/Unlike un blog
   */
  async toggleBlogLike(blogId: string, userId: string): Promise<any> {
    const blogs = this.getAllBlogs();
    const index = blogs.findIndex(b => b.blog_id === blogId);
    
    if (index === -1) {
      throw new Error("Blog non trouvé");
    }

    const blog = blogs[index];
    const likedBy = blog.liked_by || [];
    const hasLiked = likedBy.includes(userId);

    if (hasLiked) {
      // Unlike
      blog.liked_by = likedBy.filter((id: string) => id !== userId);
      blog.likes = Math.max(0, (blog.likes || 0) - 1);
    } else {
      // Like
      blog.liked_by = [...likedBy, userId];
      blog.likes = (blog.likes || 0) + 1;
    }

    blogs[index] = blog;
    localStorage.setItem("navigoo_blogs", JSON.stringify(blogs));

    console.log(`👍 [ContentService] Blog ${hasLiked ? 'unliked' : 'liked'}: ${blogId}`);
    return blog;
  }

  /**
   * Like/Unlike un podcast
   */
  async togglePodcastLike(podcastId: string, userId: string): Promise<any> {
    const podcasts = this.getAllPodcasts();
    const index = podcasts.findIndex(p => p.podcast_id === podcastId);
    
    if (index === -1) {
      throw new Error("Podcast non trouvé");
    }

    const podcast = podcasts[index];
    const likedBy = podcast.liked_by || [];
    const hasLiked = likedBy.includes(userId);

    if (hasLiked) {
      // Unlike
      podcast.liked_by = likedBy.filter((id: string) => id !== userId);
      podcast.likes = Math.max(0, (podcast.likes || 0) - 1);
    } else {
      // Like
      podcast.liked_by = [...likedBy, userId];
      podcast.likes = (podcast.likes || 0) + 1;
    }

    podcasts[index] = podcast;
    localStorage.setItem("navigoo_podcasts", JSON.stringify(podcasts));

    console.log(`👍 [ContentService] Podcast ${hasLiked ? 'unliked' : 'liked'}: ${podcastId}`);
    return podcast;
  }

  /**
   * Ajouter un commentaire à un blog
   */
  async addBlogComment(blogId: string, userId: string, username: string, content: string): Promise<BlogComment> {
    const comment: BlogComment = {
      comment_id: this.generateUUID(),
      blog_id: blogId,
      user_id: userId,
      username,
      content,
      created_at: new Date().toISOString()
    };

    const comments = this.getBlogComments(blogId);
    comments.push(comment);
    localStorage.setItem(`navigoo_blog_comments_${blogId}`, JSON.stringify(comments));

    console.log(`💬 [ContentService] Commentaire ajouté au blog ${blogId}`);
    return comment;
  }

  /**
   * Récupérer les commentaires d'un blog
   */
  getBlogComments(blogId: string): BlogComment[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(`navigoo_blog_comments_${blogId}`);
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  /**
   * Ajouter un commentaire à un podcast
   */
  async addPodcastComment(podcastId: string, userId: string, username: string, content: string): Promise<PodcastComment> {
    const comment: PodcastComment = {
      comment_id: this.generateUUID(),
      podcast_id: podcastId,
      user_id: userId,
      username,
      content,
      created_at: new Date().toISOString()
    };

    const comments = this.getPodcastComments(podcastId);
    comments.push(comment);
    localStorage.setItem(`navigoo_podcast_comments_${podcastId}`, JSON.stringify(comments));

    console.log(`💬 [ContentService] Commentaire ajouté au podcast ${podcastId}`);
    return comment;
  }

  /**
   * Récupérer les commentaires d'un podcast
   */
  getPodcastComments(podcastId: string): PodcastComment[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(`navigoo_podcast_comments_${podcastId}`);
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  /**
   * Incrémenter les vues d'un blog
   */
  async incrementBlogViews(blogId: string): Promise<void> {
    const blogs = this.getAllBlogs();
    const index = blogs.findIndex(b => b.blog_id === blogId);
    
    if (index !== -1) {
      blogs[index].views = (blogs[index].views || 0) + 1;
      localStorage.setItem("navigoo_blogs", JSON.stringify(blogs));
    }
  }

  /**
   * Incrémenter les lectures d'un podcast
   */
  async incrementPodcastPlays(podcastId: string): Promise<void> {
    const podcasts = this.getAllPodcasts();
    const index = podcasts.findIndex(p => p.podcast_id === podcastId);
    
    if (index !== -1) {
      podcasts[index].plays = (podcasts[index].plays || 0) + 1;
      localStorage.setItem("navigoo_podcasts", JSON.stringify(podcasts));
    }
  }
}

export const contentService = new ContentService();