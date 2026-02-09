// hooks/useUserData.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { POI, Trip, MapStyle } from "@/types";
import { poiService } from "@/services/poiService";
import { authService } from "@/services/authService";
import { userProfileService } from "@/services/userProfileService";

export const useUserData = () => {
  const [savedPois, setSavedPois] = useState<POI[]>([]);
  const [recentPois, setRecentPois] = useState<POI[]>([]);
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [myPois, setMyPois] = useState<POI[]>([]);
  const [mapStyle, setMapStyle] = useState<MapStyle>("streets-v2");
  const [isLoading, setIsLoading] = useState(true);

  const currentUser = authService.getSession();

  // --- CHARGEMENT DES DONNÉES DEPUIS LE BACKEND ---

  const loadUserPois = useCallback(async (userId: string) => {
    try {
      const data = await poiService.getPoisByUser(userId);
      setMyPois(data || []);
    } catch (err) {
      console.error("Erreur chargement mes POIs:", err);
    }
  }, []);

  const loadRecentActivity = useCallback(async (userId: string) => {
    try {
      // Récupérer POIs récents via le service profil
      const recentPoisData = await userProfileService.getRecentPois(userId, 10);
      setRecentPois(recentPoisData);

      // Récupérer POIs sauvegardés
      const savedPoisData = await userProfileService.getSavedPois(userId);
      setSavedPois(savedPoisData);

      // Récupérer trajets récents
      const tripsData = await userProfileService.getRecentTrips(userId, 10);
      setRecentTrips(tripsData);

    } catch (err) {
      console.error("Erreur chargement historique:", err);
    }
  }, []);

  // Sync initiale avec le Backend au montage du composant
  useEffect(() => {
    const initSync = async () => {
      if (currentUser?.userId) {
        setIsLoading(true);
        await Promise.all([
          loadUserPois(currentUser.userId),
          loadRecentActivity(currentUser.userId)
        ]);
        setIsLoading(false);
      }
    };
    initSync();
  }, [currentUser?.userId, loadUserPois, loadRecentActivity]);

  // --- ACTIONS DE MISE À JOUR (BACKEND WRITE) ---

  const addMyPoi = async (poiData: Partial<POI>) => {
    try {
      const created = await poiService.createPoi(poiData);
      setMyPois((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      throw err;
    }
  };

  const updateMyPoi = async (updatedPoi: POI) => {
    try {
      const result = await poiService.updatePoi(updatedPoi.poi_id, updatedPoi);
      setMyPois((prev) =>
        prev.map((p) => (p.poi_id === result.poi_id ? result : p))
      );
      return result;
    } catch (err) {
      throw err;
    }
  };

  const deleteMyPoi = async (poiId: string) => {
    try {
      await poiService.deletePoi(poiId);
      setMyPois((prev) => prev.filter((p) => p.poi_id !== poiId));
    } catch (err) {
      throw err;
    }
  };

  const addRecentPoi = async (poi: POI) => {
    if (!currentUser) return;
    try {
      // Enregistre l'accès au backend
      await userProfileService.createAccessLog({
        poiId: poi.poi_id,
        userId: currentUser.userId,
        organizationId: currentUser.organizationId,
        accessType: "VIEW",
        platformType: "WEB"
      });
      
      // Update local state pour réactivité immédiate
      setRecentPois((prev) => {
        const exists = prev.find(p => p.poi_id === poi.poi_id);
        if (exists) {
          return [exists, ...prev.filter(p => p.poi_id !== poi.poi_id)].slice(0, 10);
        }
        return [poi, ...prev].slice(0, 10);
      });
    } catch (err) {
      console.warn("Échec enregistrement log accès");
    }
  };

  const addTrip = async (trip: Trip) => {
    if (!currentUser) return;
    try {
        await userProfileService.createAccessLog({
            poiId: trip.poiId || trip.id,
            userId: currentUser.userId,
            organizationId: currentUser.organizationId,
            accessType: "TRIP",
            platformType: "WEB",
            metadata: trip
        });
        setRecentTrips((prev) => [trip, ...prev].slice(0, 10));
    } catch (err) {
        console.error("Erreur enregistrement trajet");
    }
  };

  // --- GESTION DES POIs SAUVEGARDÉS ---
  
  const toggleSavePoi = async (poi: POI) => {
    if (!currentUser) {
      alert("Vous devez être connecté pour sauvegarder des POIs");
      return;
    }

    const isSaved = savedPois.some(p => p.poi_id === poi.poi_id);
    
    if (isSaved) {
      // Retirer de la liste
      setSavedPois(prev => prev.filter(p => p.poi_id !== poi.poi_id));
      
      // Supprimer du localStorage
      const favorites = JSON.parse(localStorage.getItem("navigoo_favorites") || "[]");
      const updated = favorites.filter((f: any) => !(f.poiId === poi.poi_id && f.userId === currentUser.userId));
      localStorage.setItem("navigoo_favorites", JSON.stringify(updated));
      
      console.log("❌ POI retiré des favoris:", poi.poi_name);
    } else {
      // Ajouter à la liste
      setSavedPois(prev => [poi, ...prev]);
      
      // Sauvegarder dans localStorage
      const favorites = JSON.parse(localStorage.getItem("navigoo_favorites") || "[]");
      favorites.push({
        userId: currentUser.userId,
        poiId: poi.poi_id,
        savedAt: new Date().toISOString()
      });
      localStorage.setItem("navigoo_favorites", JSON.stringify(favorites));
      
      // Enregistrer dans l'historique
      try {
        await userProfileService.createAccessLog({
          poiId: poi.poi_id,
          userId: currentUser.userId,
          organizationId: currentUser.organizationId,
          accessType: "SAVE",
          platformType: "WEB"
        });
      } catch (err) {
        console.warn("Échec enregistrement sauvegarde");
      }
      
      console.log("✅ POI ajouté aux favoris:", poi.poi_name);
    }
  };

  const isSaved = (poiId: string): boolean => {
    return savedPois.some(p => p.poi_id === poiId);
  };

  // --- UI STATE ---
  
  const toggleMapStyle = () => {
    setMapStyle((prev) => (prev === "streets-v2" ? "hybrid" : "streets-v2"));
  };

  return {
    // États
    savedPois,
    recentPois,
    recentTrips,
    myPois,
    mapStyle,
    isLoading,
    
    // Méthodes
    loadUserPois,
    toggleSavePoi,
    isSaved,
    addRecentPoi,
    addTrip,
    addMyPoi,
    updateMyPoi,
    deleteMyPoi,
    toggleMapStyle
  };
};