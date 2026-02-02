"use client";

import { useState, useEffect, useCallback } from "react";
import { Location } from "@/types";

interface GeolocationState {
  position: Location | null;
  isTracking: boolean;
  error: string | null;
  accuracy: number | null;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    isTracking: false,
    error: null,
    accuracy: null
  });

  const [watchId, setWatchId] = useState<number | null>(null);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: "Géolocalisation non supportée" }));
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        setState({
          position: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          },
          isTracking: true,
          error: null,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        setState(prev => ({ 
          ...prev, 
          error: error.message,
          isTracking: false 
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    setWatchId(id);
  }, []);

  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setState(prev => ({ ...prev, isTracking: false }));
    }
  }, [watchId]);

  const getCurrentPosition = useCallback((): Promise<Location> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Géolocalisation non supportée"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          // IMPORTANT: Mettre à jour le state pour notifier app/page.tsx
          setState(prev => ({ 
            ...prev, 
            position: { ...location } // Création d'un nouvel objet pour forcer la détection de changement
          }));
          resolve(location);
        },
        // ...
      );
    });
  }, []);

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    ...state,
    startTracking,
    stopTracking,
    getCurrentPosition
  };
};