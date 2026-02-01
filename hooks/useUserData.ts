// hooks/useUserData.ts

"use client";

import { useState, useEffect, useCallback } from "react";
import { POI, Trip, MapStyle } from "@/types";
import { poiService } from "@/services/poiService";
import { authService } from "@/services/authService";
import { AccessLogAPI } from "@/services/adminService";

export const useUserData = () => {
  const [savedPois, setSavedPois] = useState<POI[]>([]); // Simulation via Favoris (à implémenter au backend si besoin)
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
      // On récupère les logs d'accès de l'utilisateur pour construire la liste "Récents"
      const logs = await AccessLogAPI.getByUser(userId);
      
      // On prend les 5 derniers IDs de POIs uniques visités
      const uniquePoiIds = Array.from(new Set(logs.map((log) => log.poiId))).slice(0, 5);
      
      // On récupère les détails de ces POIs
      const detailedPois = await Promise.all(
        uniquePoiIds.map((id) => poiService.getPoiById(id))
      );
      
      setRecentPois(detailedPois);
      
      // Filtrage des logs pour les trajets récents (si métadonnées présentes)
      const trips = logs
        .filter(l => l.accessType === "TRIP" && l.metadata)
        .map(l => l.metadata as unknown as Trip);
      setRecentTrips(trips);

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
      await AccessLogAPI.create({
        poiId: poi.poi_id,
        userId: currentUser.userId,
        organizationId: currentUser.organizationId,
        accessType: "VIEW",
        platformType: "WEB"
      });
      // Update local state pour réactivité immédiate
      setRecentPois((prev) => [poi, ...prev.filter((p) => p.poi_id !== poi.poi_id)].slice(0, 10));
    } catch (err) {
      console.warn("Échec enregistrement log accès");
    }
  };

  const addTrip = async (trip: Trip) => {
    if (!currentUser) return;
    try {
        await AccessLogAPI.create({
            poiId: trip.id, // Destination
            userId: currentUser.userId,
            organizationId: currentUser.organizationId,
            accessType: "TRIP",
            platformType: "WEB",
            metadata: { ...trip }
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
    // Le backend ne possède pas encore de table /favorites, on peut utiliser 
    // les likes de la table Reviews ou attendre une évolution API.
    console.info("L'API actuelle ne gère pas encore les favoris persistants.");
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