// hooks/useUserProfile.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { userProfileService, UserProfile, UserStats } from "@/services/userProfileService";
import { authService } from "@/services/authService";

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [myPois, setMyPois] = useState<any[]>([]);
  const [myReviews, setMyReviews] = useState<any[]>([]);
  const [myBlogs, setMyBlogs] = useState<any[]>([]);
  const [myPodcasts, setMyPodcasts] = useState<any[]>([]);
  const [recentPois, setRecentPois] = useState<any[]>([]);
  const [savedPois, setSavedPois] = useState<any[]>([]);
  const [recentTrips, setRecentTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUser = authService.getSession();

  // ==========================================
  // CHARGEMENT INITIAL
  // ==========================================

  const loadUserData = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const [
        profileData,
        statsData,
        poisData,
        reviewsData,
        blogsData,
        podcastsData,
        recentPoisData,
        savedPoisData,
        tripsData,
      ] = await Promise.all([
        userProfileService.getUserProfile(userId),
        userProfileService.getUserStats(userId),
        userProfileService.getUserPois(userId),
        userProfileService.getUserReviews(userId),
        userProfileService.getUserBlogs(userId),
        userProfileService.getUserPodcasts(userId),
        userProfileService.getRecentPois(userId, 10),
        userProfileService.getSavedPois(userId),
        userProfileService.getRecentTrips(userId, 10),
      ]);

      setProfile(profileData);
      setStats(statsData);
      setMyPois(poisData);
      setMyReviews(reviewsData);
      setMyBlogs(blogsData);
      setMyPodcasts(podcastsData);
      setRecentPois(recentPoisData);
      setSavedPois(savedPoisData);
      setRecentTrips(tripsData);
    } catch (err: any) {
      console.error("Erreur chargement profil:", err);
      setError(err.message || "Erreur de chargement");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Chargement automatique au montage
  useEffect(() => {
    if (currentUser?.userId) {
      loadUserData(currentUser.userId);
    }
  }, [currentUser?.userId, loadUserData]);

  // ==========================================
  // ACTIONS PROFIL
  // ==========================================

  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    if (!currentUser?.userId) throw new Error("Non connecté");
    
    try {
      const updated = await userProfileService.updateUserProfile(currentUser.userId, data);
      setProfile(updated);
      
      // Mettre à jour la session
      authService.saveSession({ ...currentUser, ...updated });
      
      return updated;
    } catch (err: any) {
      console.error("Erreur mise à jour profil:", err);
      throw err;
    }
  }, [currentUser]);

  // ==========================================
  // ACTIONS REVIEWS
  // ==========================================

  const createReview = useCallback(async (poiId: string, rating: number, reviewText?: string) => {
    if (!currentUser) throw new Error("Non connecté");

    try {
      const review = await userProfileService.createReview({
        poiId,
        userId: currentUser.userId,
        organizationId: currentUser.organizationId,
        platformType: "WEB",
        rating,
        reviewText,
      });

      setMyReviews(prev => [review, ...prev]);
      
      // Mettre à jour les stats
      if (stats) {
        setStats({ ...stats, totalReviews: stats.totalReviews + 1 });
      }

      return review;
    } catch (err: any) {
      console.error("Erreur création avis:", err);
      throw err;
    }
  }, [currentUser, stats]);

  const updateReview = useCallback(async (reviewId: string, data: Partial<any>) => {
    try {
      const updated = await userProfileService.updateReview(reviewId, data);
      setMyReviews(prev => prev.map(r => r.reviewId === reviewId ? updated : r));
      return updated;
    } catch (err: any) {
      console.error("Erreur mise à jour avis:", err);
      throw err;
    }
  }, []);

  const deleteReview = useCallback(async (reviewId: string) => {
    try {
      await userProfileService.deleteReview(reviewId);
      setMyReviews(prev => prev.filter(r => r.reviewId !== reviewId));
      
      if (stats) {
        setStats({ ...stats, totalReviews: Math.max(0, stats.totalReviews - 1) });
      }
    } catch (err: any) {
      console.error("Erreur suppression avis:", err);
      throw err;
    }
  }, [stats]);

  // ==========================================
  // ACTIONS BLOGS
  // ==========================================

  const createBlog = useCallback(async (poiId: string, title: string, content: string, description?: string, coverImage?: string) => {
    if (!currentUser) throw new Error("Non connecté");

    try {
      const blog = await userProfileService.createBlog({
        user_id: currentUser.userId,
        poi_id: poiId,
        title,
        content,
        description,
        cover_image_url: coverImage,
      });

      setMyBlogs(prev => [blog, ...prev]);
      
      if (stats) {
        setStats({ ...stats, totalBlogs: stats.totalBlogs + 1 });
      }

      return blog;
    } catch (err: any) {
      console.error("Erreur création blog:", err);
      throw err;
    }
  }, [currentUser, stats]);

  const updateBlog = useCallback(async (blogId: string, data: Partial<any>) => {
    try {
      const updated = await userProfileService.updateBlog(blogId, data);
      setMyBlogs(prev => prev.map(b => b.blog_id === blogId ? updated : b));
      return updated;
    } catch (err: any) {
      console.error("Erreur mise à jour blog:", err);
      throw err;
    }
  }, []);

  const deleteBlog = useCallback(async (blogId: string) => {
    try {
      await userProfileService.deleteBlog(blogId);
      setMyBlogs(prev => prev.filter(b => b.blog_id !== blogId));
      
      if (stats) {
        setStats({ ...stats, totalBlogs: Math.max(0, stats.totalBlogs - 1) });
      }
    } catch (err: any) {
      console.error("Erreur suppression blog:", err);
      throw err;
    }
  }, [stats]);

  // ==========================================
  // ACTIONS PODCASTS
  // ==========================================

  const createPodcast = useCallback(async (poiId: string, title: string, audioUrl: string, duration: number, description?: string, coverImage?: string) => {
    if (!currentUser) throw new Error("Non connecté");

    try {
      const podcast = await userProfileService.createPodcast({
        user_id: currentUser.userId,
        poi_id: poiId,
        title,
        audio_file_url: audioUrl,
        duration_seconds: duration,
        description,
        cover_image_url: coverImage,
      });

      setMyPodcasts(prev => [podcast, ...prev]);
      
      if (stats) {
        setStats({ ...stats, totalPodcasts: stats.totalPodcasts + 1 });
      }

      return podcast;
    } catch (err: any) {
      console.error("Erreur création podcast:", err);
      throw err;
    }
  }, [currentUser, stats]);

  const updatePodcast = useCallback(async (podcastId: string, data: Partial<any>) => {
    try {
      const updated = await userProfileService.updatePodcast(podcastId, data);
      setMyPodcasts(prev => prev.map(p => p.podcast_id === podcastId ? updated : p));
      return updated;
    } catch (err: any) {
      console.error("Erreur mise à jour podcast:", err);
      throw err;
    }
  }, []);

  const deletePodcast = useCallback(async (podcastId: string) => {
    try {
      await userProfileService.deletePodcast(podcastId);
      setMyPodcasts(prev => prev.filter(p => p.podcast_id !== podcastId));
      
      if (stats) {
        setStats({ ...stats, totalPodcasts: Math.max(0, stats.totalPodcasts - 1) });
      }
    } catch (err: any) {
      console.error("Erreur suppression podcast:", err);
      throw err;
    }
  }, [stats]);

  // ==========================================
  // ACTIONS ACCÈS (Logs)
  // ==========================================

  const logPoiView = useCallback(async (poiId: string) => {
    if (!currentUser) return;

    try {
      await userProfileService.createAccessLog({
        poiId,
        userId: currentUser.userId,
        organizationId: currentUser.organizationId,
        platformType: "WEB",
        accessType: "VIEW",
      });

      // Rafraîchir les POIs récents
      const updated = await userProfileService.getRecentPois(currentUser.userId, 10);
      setRecentPois(updated);
    } catch (err) {
      console.warn("Échec log vue POI");
    }
  }, [currentUser]);

  const logTrip = useCallback(async (tripData: any) => {
    if (!currentUser) return;

    try {
      await userProfileService.createAccessLog({
        poiId: tripData.poiId || tripData.id,
        userId: currentUser.userId,
        organizationId: currentUser.organizationId,
        platformType: "WEB",
        accessType: "TRIP",
        metadata: tripData,
      });

      // Rafraîchir les trajets récents
      const updated = await userProfileService.getRecentTrips(currentUser.userId, 10);
      setRecentTrips(updated);
    } catch (err) {
      console.warn("Échec log trajet");
    }
  }, [currentUser]);

  // ==========================================
  // REFRESH MANUEL
  // ==========================================

  const refresh = useCallback(async () => {
    if (currentUser?.userId) {
      await loadUserData(currentUser.userId);
    }
  }, [currentUser, loadUserData]);

  return {
    // État
    profile,
    stats,
    myPois,
    myReviews,
    myBlogs,
    myPodcasts,
    recentPois,
    savedPois,
    recentTrips,
    isLoading,
    error,
    
    // Actions Profil
    updateProfile,
    
    // Actions Reviews
    createReview,
    updateReview,
    deleteReview,
    
    // Actions Blogs
    createBlog,
    updateBlog,
    deleteBlog,
    
    // Actions Podcasts
    createPodcast,
    updatePodcast,
    deletePodcast,
    
    // Actions Logs
    logPoiView,
    logTrip,
    
    // Utilitaires
    refresh,
  };
};