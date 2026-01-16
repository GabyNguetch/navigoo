"use client";

import { useState, useEffect } from "react";
import { POI, Trip, MapStyle } from "@/types";

export const useUserData = () => {
  const [savedPois, setSavedPois] = useState<POI[]>([]);
  const [recentPois, setRecentPois] = useState<POI[]>([]);
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [mapStyle, setMapStyle] = useState<MapStyle>("streets-v2");

  // Chargement initial
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("navigoo_saved");
      const recents = localStorage.getItem("navigoo_recent");
      const trips = localStorage.getItem("navigoo_trips");
      const style = localStorage.getItem("navigoo_style");

      if (saved) setSavedPois(JSON.parse(saved));
      if (recents) setRecentPois(JSON.parse(recents));
      if (trips) setRecentTrips(JSON.parse(trips));
      if (style) setMapStyle(style as MapStyle);
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
    const newRecent = [poi, ...filtered].slice(0, 10); // Garder les 10 derniers
    setRecentPois(newRecent);
    localStorage.setItem("navigoo_recent", JSON.stringify(newRecent));
  };

  const addTrip = (trip: Trip) => {
    const newTrips = [trip, ...recentTrips].slice(0, 10);
    setRecentTrips(newTrips);
    localStorage.setItem("navigoo_trips", JSON.stringify(newTrips));
  };

  const toggleMapStyle = () => {
    const newStyle = mapStyle === "streets-v2" ? "satellite-hybrid" : "streets-v2";
    setMapStyle(newStyle);
    localStorage.setItem("navigoo_style", newStyle);
  };

  return {
    savedPois,
    recentPois,
    recentTrips,
    mapStyle,
    toggleSavePoi,
    addRecentPoi,
    addTrip,
    toggleMapStyle,
    isSaved: (id: string) => savedPois.some(p => p.poi_id === id)
  };
};