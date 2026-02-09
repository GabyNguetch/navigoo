// hooks/useUserProfile.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { userProfileService, UserProfile, UserStats } from "@/services/userProfileService";
import { authService } from "@/services/authService";
import { AppUser } from "@/services/adminService";

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
  // CHARGEMENT INITIAL - ✅ SANS loadUserData dans les dépendances
  // ==========================================

  useEffect(() => {
    const loadData = async () => {
      const currentUser = authService.getSession();
      if (!currentUser?.userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.group("🔄 Profil: Tentative de Liaison Backend");
        
        // 1. On lance les appels data (POIs, Blogs...) qui fonctionnent
        const [statsData, poisData, reviewsData, blogsData, podcastsData, recentPoisData] = 
        await Promise.all([
          userProfileService.getUserStats(currentUser.userId).catch(e => null),
          userProfileService.getUserPois(currentUser.userId).catch(e => []),
          userProfileService.getUserReviews(currentUser.userId).catch(e => []),
          userProfileService.getUserBlogs(currentUser.userId).catch(e => []),
          userProfileService.getUserPodcasts(currentUser.userId).catch(e => []),
          userProfileService.getRecentPois(currentUser.userId).catch(e => []),
        ]);

        // 2. On tente de récupérer le profil complet mais sans faire planter l'app si 500
        let remoteProfile = null;
        try {
           remoteProfile = await userProfileService.getUserProfile(currentUser.userId);
           console.log("✅ Profil distant récupéré");
        } catch (err) {
           console.warn("⚠️ Backend POI non synchronisé. Utilisation du cache Auth Session.");
           // Fallback sur les infos de session (email, username, etc.)
           remoteProfile = {
             ...currentUser,
             isActive: true,
             createdAt: new Date().toISOString()
           };
        }

        setProfile(remoteProfile);
        setStats(statsData || { totalPois: 0, totalReviews: 0, totalBlogs: 0, totalPodcasts: 0, recentViews: 0 });
        setMyPois(poisData);
        setMyReviews(reviewsData);
        setMyBlogs(blogsData);
        setMyPodcasts(podcastsData);
        setRecentPois(recentPoisData);
        
        console.groupEnd();
      } catch (err: any) {
        console.error("❌ Erreur critique:", err);
        setError("Une erreur est survenue lors de la liaison de données.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentUser?.userId]);

  // ==========================================
  // REFRESH MANUEL - ✅ Version simplifiée
  // ==========================================

  const refresh = useCallback(async () => {
    if (!currentUser?.userId) return;

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
        userProfileService.getUserProfile(currentUser.userId),
        userProfileService.getUserStats(currentUser.userId),
        userProfileService.getUserPois(currentUser.userId),
        userProfileService.getUserReviews(currentUser.userId),
        userProfileService.getUserBlogs(currentUser.userId),
        userProfileService.getUserPodcasts(currentUser.userId),
        userProfileService.getRecentPois(currentUser.userId, 10),
        userProfileService.getSavedPois(currentUser.userId),
        userProfileService.getRecentTrips(currentUser.userId, 10),
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
      console.error("Erreur refresh:", err);
      setError(err.message || "Erreur de chargement");
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.userId]); // ✅ Pas de dépendances circulaires

  // ==========================================
  // ACTIONS PROFIL
  // ==========================================

  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    if (!currentUser?.userId) throw new Error("Non connecté");
    
    try {
      const updated = await userProfileService.updateUserProfile(currentUser.userId, data);
      setProfile(updated);
      authService.saveSession({ ...currentUser, ...updated } as AppUser);
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
      setStats(prev => prev ? { ...prev, totalReviews: prev.totalReviews + 1 } : null);

      return review;
    } catch (err: any) {
      console.error("Erreur création avis:", err);
      throw err;
    }
  }, [currentUser]);

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
      setStats(prev => prev ? { ...prev, totalReviews: Math.max(0, prev.totalReviews - 1) } : null);
    } catch (err: any) {
      console.error("Erreur suppression avis:", err);
      throw err;
    }
  }, []);

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
      setStats(prev => prev ? { ...prev, totalBlogs: prev.totalBlogs + 1 } : null);

      return blog;
    } catch (err: any) {
      console.error("Erreur création blog:", err);
      throw err;
    }
  }, [currentUser]);

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
      setStats(prev => prev ? { ...prev, totalBlogs: Math.max(0, prev.totalBlogs - 1) } : null);
    } catch (err: any) {
      console.error("Erreur suppression blog:", err);
      throw err;
    }
  }, []);

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
      setStats(prev => prev ? { ...prev, totalPodcasts: prev.totalPodcasts + 1 } : null);

      return podcast;
    } catch (err: any) {
      console.error("Erreur création podcast:", err);
      throw err;
    }
  }, [currentUser]);

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
      setStats(prev => prev ? { ...prev, totalPodcasts: Math.max(0, prev.totalPodcasts - 1) } : null);
    } catch (err: any) {
      console.error("Erreur suppression podcast:", err);
      throw err;
    }
  }, []);

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

      const updated = await userProfileService.getRecentTrips(currentUser.userId, 10);
      setRecentTrips(updated);
    } catch (err) {
      console.warn("Échec log trajet");
    }
  }, [currentUser]);

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