"use client";

import { useState, useEffect } from "react";
import { POI, Trip, MapStyle } from "@/types";

export const useUserData = () => {
  const [savedPois, setSavedPois] = useState<POI[]>([]);
  const [recentPois, setRecentPois] = useState<POI[]>([]);
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [myPois, setMyPois] = useState<POI[]>([]); 
  const [mapStyle, setMapStyle] = useState<MapStyle>("streets-v2");

  // Chargement initial
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("navigoo_saved");
      const recents = localStorage.getItem("navigoo_recent");
      const trips = localStorage.getItem("navigoo_trips");
      const style = localStorage.getItem("navigoo_style");
      const my = localStorage.getItem("navigoo_my_pois");

      if (saved) setSavedPois(JSON.parse(saved));
      if (recents) setRecentPois(JSON.parse(recents));
      if (trips) setRecentTrips(JSON.parse(trips));
      if (my) setMyPois(JSON.parse(my));
      if (style === "hybrid" || style === "streets-v2") setMapStyle(style);
    }
  }, []);

  // --- ACTIONS ---

  const toggleSavePoi = (poi: POI) => {
    let newSaved;
    if (savedPois.some((p) => p.poi_id === poi.poi_id)) {
      newSaved = savedPois.filter((p) => p.poi_id !== poi.poi_id);
    } else {
      newSaved = [poi, ...savedPois];
    }
    setSavedPois(newSaved);
    localStorage.setItem("navigoo_saved", JSON.stringify(newSaved));
  };

  const addRecentPoi = (poi: POI) => {
    const filtered = recentPois.filter((p) => p.poi_id !== poi.poi_id);
    const newRecent = [poi, ...filtered].slice(0, 10);
    setRecentPois(newRecent);
    localStorage.setItem("navigoo_recent", JSON.stringify(newRecent));
  };

  const addTrip = (trip: Trip) => {
    const newTrips = [trip, ...recentTrips].slice(0, 10);
    setRecentTrips(newTrips);
    localStorage.setItem("navigoo_trips", JSON.stringify(newTrips));
  };

  // Ajout d'un nouveau POI utilisateur
  const addMyPoi = (poi: POI) => {
    const newPois = [poi, ...myPois];
    setMyPois(newPois);
    localStorage.setItem("navigoo_my_pois", JSON.stringify(newPois));
  };

  // Modification d'un POI existant
  const updateMyPoi = (updatedPoi: POI) => {
    const newPois = myPois.map(p => p.poi_id === updatedPoi.poi_id ? updatedPoi : p);
    setMyPois(newPois);
    localStorage.setItem("navigoo_my_pois", JSON.stringify(newPois));
  };

  // Suppression d'un POI
  const deleteMyPoi = (poiId: string) => {
    const newPois = myPois.filter(p => p.poi_id !== poiId);
    setMyPois(newPois);
    localStorage.setItem("navigoo_my_pois", JSON.stringify(newPois));
  };

  const toggleMapStyle = () => {
    const newStyle: MapStyle = mapStyle === "streets-v2" ? "hybrid" : "streets-v2";
    setMapStyle(newStyle);
    localStorage.setItem("navigoo_style", newStyle);
  };

  return {
    savedPois,
    recentPois,
    recentTrips,
    myPois,
    mapStyle,
    toggleSavePoi,
    addRecentPoi,
    addTrip,
    addMyPoi,
    updateMyPoi,
    deleteMyPoi,
    toggleMapStyle,
    isSaved: (id: string) => savedPois.some(p => p.poi_id === id)
  };
};