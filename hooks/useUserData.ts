// hooks/useUserData.ts - VERSION COMPLÈTE BACKEND
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

  // --- 1. CHARGEMENT DES DONNÉES DEPUIS LE BACKEND ---

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


  // --- 2. ACTIONS DE MISE À JOUR (BACKEND WRITE) ---

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
            poiId: trip.id,
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

  // --- 3. UI STATE (Volatile ou à porter en table préférences plus tard) ---
  
  const toggleMapStyle = () => {
    setMapStyle((prev) => (prev === "streets-v2" ? "hybrid" : "streets-v2"));
  };

  const toggleSavePoi = async (poi: POI) => {
    // Gestion temporaire locale
    // TODO: Créer une vraie table favorites sur le backend
    const isSaved = savedPois.some(p => p.poi_id === poi.poi_id);
    
    if (isSaved) {
      setSavedPois(prev => prev.filter(p => p.poi_id !== poi.poi_id));
    } else {
      setSavedPois(prev => [poi, ...prev]);
    }
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
    addRecentPoi,
    addTrip,
    addMyPoi,
    updateMyPoi,
    deleteMyPoi,
    toggleMapStyle,
    isSaved: (id: string) => savedPois.some((p) => p.poi_id === id)
  };
};