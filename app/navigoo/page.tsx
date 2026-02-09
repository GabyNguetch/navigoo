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
import { userProfileService } from "@/services/userProfileService";
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

// Chargement différé pour les Sidebars secondaires
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
    addRecentPoi, addTrip, toggleMapStyle, myPois, loadUserPois, toggleSavePoi, isSaved
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

  // Hook de géolocalisation
  const { 
    position: userLocation,
    isTracking, 
    startTracking, 
    stopTracking,
    getCurrentPosition 
  } = useGeolocation();

  // Déclenchement automatique de la géolocalisation
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
            
            // Récupérer les POIs approuvés du backend
            const backendPois = await poiService.getApprovedPois();
            
            // Récupérer les POIs de l'utilisateur (approuvés et en attente)
            const currentUser = authService.getSession();
            let userPois: POI[] = [];
            if (currentUser?.userId) {
              userPois = await poiService.getPoisByUser(currentUser.userId);
            }
            
            // Combiner les deux listes en évitant les doublons
            const combinedPois = [...backendPois];
            userPois.forEach(userPoi => {
              if (!combinedPois.find(p => p.poi_id === userPoi.poi_id)) {
                combinedPois.push(userPoi);
              }
            });
            
            if(mounted) setAllPois(combinedPois || []);
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
            
            // Filtrer pour ne garder que les POIs approuvés + mes POIs
            const currentUser = authService.getSession();
            let approvedData = data.filter(poi => poi.is_active);
            
            // Ajouter mes POIs même s'ils ne sont pas actifs
              if (currentUser?.userId) {
                const myUserPois = data.filter(poi => 
                  poi.created_by_user_id === currentUser.userId
                );
              myUserPois.forEach(poi => {
                if (!approvedData.find(p => p.poi_id === poi.poi_id)) {
                  approvedData.push(poi);
                }
              });
            }
            
            if (!approvedData || approvedData.length === 0) {
               console.warn("Pas de POIs proches, chargement global.");
               await loadAllPois();
            } else {
               if(mounted) setAllPois(approvedData);
            }
        } catch (err) {
            console.error("Erreur recherche locale, repli sur tout:", err);
            await loadAllPois();
        } finally {
            if(mounted) setIsLoadingPois(false);
        }
     };

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

  // Gestionnaire pour le bouton "Ma position"
  const handleLocateMe = async () => {
    try {
      const pos = await getCurrentPosition();
      console.log("📍 Localisation manuelle vers:", pos);
    } catch (err) {
      alert("Localisation impossible : vérifiez les permissions de votre navigateur.");
    }
  };

  // ============================================
  // HANDLERS INTERFACE
  // ============================================

  const handleSelectPoi = async (poi: POI | null) => {
    if(!poi) {
        setPanelState({ type: null });
        return;
    }
    
    const safePoi = { ...poi, poi_images_urls: poi.poi_images_urls || [] };
    
    // Enregistrer l'accès dans l'historique
    const user = authService.getSession();
    if (user?.userId) {
      try {
        await userProfileService.createAccessLog({
          poiId: safePoi.poi_id,
          userId: user.userId,
          organizationId: user.organizationId,
          platformType: "WEB",
          accessType: "VIEW",
        });
        console.log("✅ Accès POI enregistré:", safePoi.poi_name);
      } catch (err) {
        console.warn("⚠️ Échec enregistrement accès POI");
      }
    }
    
    await addRecentPoi(safePoi);
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
        const tripData = {
            id: Date.now().toString(),
            departName: "Ma Position",
            arriveName: destination.poi_name,
            date: new Date().toISOString(),
            distance: result.distance,
            duration: result.duration,
            poiId: destination.poi_id
        };
        
        await addTrip(tripData);
        
        // Enregistrer le trajet dans l'historique
        const user = authService.getSession();
        if (user?.userId) {
          try {
            await userProfileService.createAccessLog({
              poiId: destination.poi_id,
              userId: user.userId,
              organizationId: user.organizationId,
              platformType: "WEB",
              accessType: "TRIP",
              metadata: tripData
            });
            console.log("✅ Trajet enregistré:", destination.poi_name);
          } catch (err) {
            console.warn("⚠️ Échec enregistrement trajet");
          }
        }
        
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
    handleStopNavigation();
  };

  const handleResetToMap = () => {
    setPanelState({ type: null });
    setIsMainSidebarOpen(false);
    handleStopNavigation();
  };

  // HANDLER POUR LE CLIC SUR LA CARTE
  const handleMapClick = async (lng: number, lat: number) => {
    try {
      const externalPoi = await reverseGeocode(lat, lng);
      
      if (externalPoi) {
        // Enregistrer l'accès au POI externe
        const user = authService.getSession();
        if (user?.userId) {
          try {
            await userProfileService.createAccessLog({
              poiId: externalPoi.poi_id || "",
              userId: user.userId,
              organizationId: user.organizationId,
              platformType: "WEB",
              accessType: "VIEW",
            });
          } catch (err) {
            console.warn("⚠️ Échec enregistrement accès POI externe");
          }
        }
        
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
    setTraveledPath([userLocation]);
    startTracking();
    
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
        const lastPoint = prev[prev.length - 1];
        if (lastPoint) {
          const dist = calculateDistance(lastPoint, userLocation);
          if (dist < 5) return prev;
        }
        return [...prev, userLocation];
      });

      if (panelState.data?.location) {
        const distanceToDestination = calculateDistance(userLocation, panelState.data.location);
        if (distanceToDestination < 20) {
          alert("🎉 Vous êtes arrivé à destination !");
          handleStopNavigation();
        }
      }
    }
  }, [isNavigating, userLocation, panelState.data]);

  // Filtrage Local - Afficher POIs approuvés + mes POIs
  const filteredPois = useMemo(() => {
    const currentUser = authService.getSession();
    
    return allPois.filter((poi) => {
      const catMatch = selectedCategory ? (poi.poi_category === selectedCategory) : true;
      const nameMatch = searchQuery 
        ? (poi.poi_name?.toLowerCase().includes(searchQuery.toLowerCase())) 
        : true;
      
      // Afficher si: POI approuvé OU c'est mon POI
      const isMyPoi = currentUser?.userId && 
                      poi.created_by_user_id === currentUser.userId;
      const shouldShow = poi.is_active || isMyPoi;

      return catMatch && nameMatch && shouldShow;
    });
  }, [selectedCategory, searchQuery, allPois]);

  // Handler pour sauvegarder un POI
  const handleToggleSave = async (poi: POI) => {
    await toggleSavePoi(poi);
  };

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
          onToggleSave={handleToggleSave}
          isSaved={isSaved(panelState.data.poi_id)}
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