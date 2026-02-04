"use client";

import { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { TopLayout } from "@/components/navigation/TopLayout";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { PoiDetailsSidebar } from "@/components/sidebar/POIDetailsSidebar";
import { POI, Location, TransportMode } from "@/types";
import { getRoute, calculateDistance } from "@/services/routingService";
import { poiService } from "@/services/poiService";
import { useUserData } from "@/hooks/useUserData";
import { Settings as SettingsIcon, Check, X, AlertTriangle } from "lucide-react";
import { Loader } from "@/components/ui/Loader";
import { MobileNavBar } from "@/components/navigation/MobileNavbar";
import { authService } from "@/services/authService";
import { reverseGeocode } from "@/services/geocodingService";
import { useGeolocation } from "@/hooks/useGeolocation";
import { captureMap, shareMap } from "@/services/mapCaptureService";

// Import Map Dynamique sans SSR
const MapComponent = dynamic(() => import("@/components/map/Map"), {
  ssr: false,
  loading: () => <Loader />,
});

// Ajoutez aussi le chargement différé pour les Sidebars secondaires qui ne sont pas visibles au chargement
const SecondarySidebar = dynamic(() => import("@/components/sidebar/SecondarySidebar").then(mod => mod.SecondarySidebar), { ssr: false });
const DirectionsSidebar = dynamic(() => import("@/components/sidebar/DirectionSidebar").then(mod => mod.DirectionsSidebar), { ssr: false });

const MAPTILER_API_KEY = "Lr72DkH8TYyjpP7RNZS9"; 

export default function Home() {
  // États d'interface
  const [isMainSidebarOpen, setIsMainSidebarOpen] = useState(false);
  const [panelState, setPanelState] = useState<{
     type: "details" | "directions" | "saved" | "recent" | "trips" | "mypois" | null;
     data?: any; 
  }>({ type: null });
  
  // États de Données (Backend Integration)
  const [allPois, setAllPois] = useState<POI[]>([]);
  const [isLoadingPois, setIsLoadingPois] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Hooks Persistance Utilisateur
  const { 
    savedPois, recentPois, recentTrips, mapStyle, 
    addRecentPoi, addTrip, toggleMapStyle, myPois, loadUserPois 
  } = useUserData();

  // États Recherche & Carte
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  
  // États Routage
  const [routeStats, setRouteStats] = useState<any>(null);
  const [routeGeometry, setRouteGeometry] = useState<any>(null);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [activeTransportMode, setActiveTransportMode] = useState<TransportMode>("driving");

  // États pour la navigation GPS
  const [isNavigating, setIsNavigating] = useState(false);
  const [traveledPath, setTraveledPath] = useState<Location[]>([]);

  // ✅ CORRECTION : On utilise uniquement le hook useGeolocation (plus de state séparé)
  const { 
    position: userLocation,  // Renommage direct ici
    isTracking, 
    startTracking, 
    stopTracking,
    getCurrentPosition 
  } = useGeolocation();

    // 1. Déclenchement automatique au chargement
  useEffect(() => {
    const autoLocate = async () => {
      try {
        await getCurrentPosition();
      } catch (err) {
        console.warn("Auto-localisation désactivée par l'utilisateur ou indisponible.");
      }
    };
    autoLocate();
  }, [getCurrentPosition]);

  // ============================================
  // INITIALISATION (Géoloc + Fetch API)
  // ============================================
  
  useEffect(() => {
     let mounted = true;

     const loadAllPois = async () => {
        try {
            if(mounted) setIsLoadingPois(true);
            const data = await poiService.getAllPois();
            if(mounted) setAllPois(data || []);
        } catch (error) {
            console.error("Erreur chargement POIs:", error);
            if(mounted) setFetchError("Impossible de contacter le serveur.");
        } finally {
            if(mounted) setIsLoadingPois(false);
        }
     };

     const loadLocalPois = async (lat: number, lon: number) => {
        try {
            if(mounted) setIsLoadingPois(true);
            const data = await poiService.searchPoisByLocation(lat, lon, 50);
            
            if (!data || data.length === 0) {
               console.warn("Pas de POIs proches, chargement global.");
               await loadAllPois();
            } else {
               if(mounted) setAllPois(data);
            }
        } catch (err) {
            console.error("Erreur recherche locale, repli sur tout:", err);
            await loadAllPois();
        } finally {
            if(mounted) setIsLoadingPois(false);
        }
     };

     // ✅ Utilisation du hook getCurrentPosition au lieu de navigator.geolocation
     getCurrentPosition()
       .then(loc => {
         if (mounted) {
           loadLocalPois(loc.latitude, loc.longitude);
         }
       })
       .catch(() => {
         console.warn("Géolocalisation échouée, chargement de tous les POIs");
         loadAllPois();
       });

     return () => { mounted = false; };
  }, [getCurrentPosition]);

  useEffect(() => {
    if (panelState.type === "mypois") {
        const user = authService.getSession(); 
        if (user?.userId) {
            loadUserPois(user.userId); 
        } else {
            console.warn("Utilisateur non connecté, impossible de charger 'Mes POIs'");
        }
    }
  }, [panelState.type, loadUserPois]);

    // 2. Gestionnaire pour le bouton "Ma position"
  const handleLocateMe = async () => {
    try {
      const pos = await getCurrentPosition();
      // On force la carte à se repositionner (géré par le useEffect dans Map.tsx)
      console.log("📍 Localisation manuelle vers:", pos);
    } catch (err) {
      alert("Localisation impossible : vérifiez les permissions de votre navigateur.");
    }
  };

  // ============================================
  // HANDLERS INTERFACE
  // ============================================

  const handleSelectPoi = (poi: POI | null) => {
    if(!poi) {
        setPanelState({ type: null });
        return;
    }
    const safePoi = { ...poi, poi_images_urls: poi.poi_images_urls || [] };
    
    addRecentPoi(safePoi);
    setIsMainSidebarOpen(false); 
    setPanelState({ type: "details", data: safePoi });
  };

  const handleViewChange = (view: "saved" | "recent" | "trips" | "mypois") => {
    setIsMainSidebarOpen(false);
    setPanelState({ type: view });
  };

  const handleOpenDirections = () => {
    if (panelState.type === "details" && panelState.data) {
        setPanelState({ type: "directions", data: panelState.data });
        handleCalculateRoute(panelState.data, "driving");
    }
  };

  const handleCalculateRoute = async (destination: POI, mode: TransportMode) => {
    if (!userLocation) {
      alert("Impossible de calculer l'itinéraire sans votre position.");
      return;
    }
    
    setActiveTransportMode(mode);
    setIsRouteLoading(true);

    const result = await getRoute(userLocation, destination.location, mode, MAPTILER_API_KEY);
    
    if (result) {
        addTrip({
            id: Date.now().toString(),
            departName: "Ma Position",
            arriveName: destination.poi_name,
            date: new Date().toISOString(),
            distance: result.distance,
            duration: result.duration
        });
        setRouteStats(result);
        setRouteGeometry(result.geometry);
    } else {
        alert("Impossible de calculer l'itinéraire.");
    }
    setIsRouteLoading(false);
  };

  const handleClosePanel = () => {
    setPanelState({ type: null });
    setRouteGeometry(null); 
    setRouteStats(null);
    handleStopNavigation(); // Arrêter la navigation si active
  };

  const handleResetToMap = () => {
    setPanelState({ type: null });
    setIsMainSidebarOpen(false);
    handleStopNavigation();
  };

  // HANDLER OPTIMISÉ POUR LE CLIC SUR LA CARTE
  const handleMapClick = async (lng: number, lat: number) => {
    try {
      const externalPoi = await reverseGeocode(lat, lng);
      
      if (externalPoi) {
        setPanelState({ 
          type: "details", 
          data: externalPoi as POI 
        });
      }
    } catch (error) {
      console.error("Erreur lors du clic sur la carte:", error);
    }
  };

  // ============================================
  // NAVIGATION GPS
  // ============================================

  const handleStartNavigation = () => {
    if (!userLocation || !panelState.data) {
      alert("Position ou destination manquante");
      return;
    }

    setIsNavigating(true);
    setTraveledPath([userLocation]); // Début du trajet
    startTracking(); // Activer le suivi GPS continu
    
    console.log("🚀 Navigation démarrée");
  };

  const handleStopNavigation = () => {
    setIsNavigating(false);
    setTraveledPath([]);
    stopTracking();
    console.log("🛑 Navigation arrêtée");
  };

  // Mise à jour du chemin parcouru
  useEffect(() => {
    if (isNavigating && userLocation) {
      setTraveledPath(prev => {
        // Éviter les doublons trop proches
        const lastPoint = prev[prev.length - 1];
        if (lastPoint) {
          const dist = calculateDistance(lastPoint, userLocation);
          if (dist < 5) return prev; // Ignorer si < 5m
        }
        return [...prev, userLocation];
      });

      // Vérifier si on est arrivé (distance < 20m)
      if (panelState.data?.location) {
        const distanceToDestination = calculateDistance(userLocation, panelState.data.location);
        if (distanceToDestination < 20) {
          alert("🎉 Vous êtes arrivé à destination !");
          handleStopNavigation();
        }
      }
    }
  }, [isNavigating, userLocation, panelState.data]);

  // Filtrage Local
  const filteredPois = useMemo(() => {
    return allPois.filter((poi) => {
      const catMatch = selectedCategory ? (poi.poi_category === selectedCategory) : true;
      const nameMatch = searchQuery 
        ? (poi.poi_name?.toLowerCase().includes(searchQuery.toLowerCase())) 
        : true;
      const activeMatch = poi.is_active !== false; 

      return catMatch && nameMatch && activeMatch;
    });
  }, [selectedCategory, searchQuery, allPois]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-black font-sans">
      
      {isLoadingPois && <Loader className="z-[9999]" />}

      {fetchError && !isLoadingPois && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 shadow-xl animate-in fade-in slide-in-from-top-5">
            <AlertTriangle size={20} />
            <span className="text-sm font-medium">{fetchError}</span>
            <button onClick={() => setFetchError(null)} className="ml-2 hover:bg-red-200 p-1 rounded-full"><X size={16}/></button>
        </div>
      )}

      <TopLayout 
        onToggleSidebar={() => setIsMainSidebarOpen(!isMainSidebarOpen)}
        allPois={allPois}
        selectedCategory={selectedCategory}
        onSelectCategory={(id) => setSelectedCategory(prev => prev === id ? "" : id)}
        onSearch={setSearchQuery}
        onSelectResult={handleSelectPoi}
        onLocateMe={handleLocateMe}
        recentSearches={[]}
        recentPois={recentPois}
      />

      <Sidebar 
        isOpen={isMainSidebarOpen} 
        onClose={() => setIsMainSidebarOpen(false)}
        onViewChange={handleViewChange}
        onLocateMe={handleLocateMe}
        onShare={shareMap}
        onPrint={captureMap}
        onToggleSettings={() => setIsSettingsOpen(true)}
      />

      <MobileNavBar 
        currentView={panelState.type === "details" || panelState.type === "directions" ? null : panelState.type}
        onViewChange={handleViewChange}
        onOpenSidebar={() => setIsMainSidebarOpen(true)}
        onResetView={handleResetToMap}
      />

      {panelState.type === "details" && panelState.data && (
        <PoiDetailsSidebar 
          poi={panelState.data} 
          isOpen={true}
          onClose={handleClosePanel}
          onOpenDirections={handleOpenDirections}
        />
      )}

      {panelState.type === "directions" && panelState.data && (
        <DirectionsSidebar 
            isOpen={true}
            onClose={handleClosePanel}
            originPoi={null}
            destinationPoi={panelState.data}
            userLocation={userLocation}
            activeMode={activeTransportMode}
            isLoadingRoute={isRouteLoading}
            routeStats={routeStats}
            onCalculateRoute={(mode) => handleCalculateRoute(panelState.data, mode)}
            onStartNavigation={handleStartNavigation}
            onStopNavigation={handleStopNavigation}
            isNavigating={isNavigating}
        />
      )}

      {(["saved", "recent", "trips", "mypois"].includes(panelState.type || "")) && (
        <SecondarySidebar 
          view={panelState.type as "saved" | "recent" | "trips" | "mypois"}
          onClose={handleClosePanel}
          data={{ savedPois, recentPois, trips: recentTrips }}
          onSelectPoi={handleSelectPoi}
        />
      )}

      {isSettingsOpen && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
             <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-800 dark:text-white">
                        <SettingsIcon className="text-primary" /> Apparence
                    </h2>
                    <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-500"><X/></button>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <button 
                       onClick={() => { toggleMapStyle(); setIsSettingsOpen(false); }}
                       className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${mapStyle === 'streets-v2' ? 'border-primary bg-primary/5' : 'border-zinc-200 dark:border-zinc-700'}`}
                    >
                        <div className="w-full h-20 bg-zinc-200 rounded-lg bg-cover bg-center" style={{backgroundImage: "url('https://cloud.maptiler.com/static/img/maps/streets-v2.png')"}}></div>
                        <span className="font-semibold text-sm text-zinc-700 dark:text-zinc-200">Plan</span>
                        {mapStyle === 'streets-v2' && <Check size={16} className="text-primary"/>}
                    </button>
                    <button 
                       onClick={() => { toggleMapStyle(); setIsSettingsOpen(false); }}
                       className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${mapStyle === 'hybrid' ? 'border-primary bg-primary/5' : 'border-zinc-200 dark:border-zinc-700'}`}
                    >
                         <div className="w-full h-20 bg-zinc-700 rounded-lg bg-cover bg-center" style={{backgroundImage: "url('https://cloud.maptiler.com/static/img/maps/hybrid.png')"}}></div>
                        <span className="font-semibold text-sm text-zinc-700 dark:text-zinc-200">Satellite</span>
                        {mapStyle === 'hybrid' && <Check size={16} className="text-primary"/>}
                    </button>
                 </div>
             </div>
         </div>
      )}

      <div className="absolute top-0 left-0 w-full h-full z-0 print:block">
        <MapComponent 
          apiKey={MAPTILER_API_KEY} 
          pois={filteredPois}
          selectedPoi={panelState.type === "details" || panelState.type === "directions" ? panelState.data : null}
          userLocation={userLocation}
          onSelectPoi={handleSelectPoi}
          routeGeometry={routeGeometry}
          mapStyleType={mapStyle} 
          onMapEmptyClick={handleMapClick}
          isNavigating={isNavigating}
          traveledPath={traveledPath}
        />
      </div>

    </main>
  );
}