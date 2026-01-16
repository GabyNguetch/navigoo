"use client";

import { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { TopLayout } from "@/components/navigation/TopLayout";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { PoiDetailsSidebar } from "@/components/sidebar/POIDetailsSidebar";
import { DirectionsSidebar } from "@/components/sidebar/DirectionSidebar";
import { SecondarySidebar } from "@/components/sidebar/SecondarySidebar";
import { POI_DATA } from "@/data/mockData";
import { POI, Location, TransportMode } from "@/types";
import { getRoute } from "@/services/routingService";
import { useUserData } from "@/hooks/useUserData";
import { Settings as SettingsIcon, Check, X } from "lucide-react";


const MapComponent = dynamic(() => import("@/components/map/Map"), {
  ssr: false,
  loading: () => <div className="h-screen w-screen bg-zinc-100 flex items-center justify-center font-bold text-primary">Chargement Navigoo...</div>,
});

const MAPTILER_API_KEY = "Lr72DkH8TYyjpP7RNZS9"; 

export default function Home() {
  // Gestionnaires d'ouverture
  const [isMainSidebarOpen, setIsMainSidebarOpen] = useState(false); // Le mode "étendu" du menu
  
  // Contenu "Secondaire" (Panneaux qui s'affichent à coté du dock)
  // On utilise un state commun pour garantir qu'un seul panneau s'affiche à la fois
  // Types: "details" (fiche poi) | "directions" (itinéraire) | "list-saved" | "list-recent" | "list-trips" | "list-mypois" | null
  const [panelState, setPanelState] = useState<{
     type: "details" | "directions" | "saved" | "recent" | "trips" | "mypois" | null;
     data?: any; // Pour passer le POI selectionné ou autre
  }>({ type: null });
  
  const { savedPois, recentPois, recentTrips, mapStyle, addRecentPoi, addTrip, toggleMapStyle, myPois } = useUserData();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // États transverses
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  
  // États Routing spécifiques
  const [routeStats, setRouteStats] = useState<any>(null);
  const [routeGeometry, setRouteGeometry] = useState<any>(null);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [activeTransportMode, setActiveTransportMode] = useState<TransportMode>("driving");

  useEffect(() => {
     if("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            pos => setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
            err => console.warn(err)
        );
     }
  }, []);

  // --- GESTIONNAIRES D'AFFICHAGE ---

  // 1. Clic sur un POI (Carte ou Recherche)
  const handleSelectPoi = (poi: POI | null) => {
    if(!poi) {
        // Clic dans le vide -> Tout fermer sauf la barre de recherche
        setPanelState({ type: null });
        return;
    }
    
    // Ajout historique
    addRecentPoi(poi);

    // Ouvre le panneau détails et ferme le menu étendu s'il gêne
    setIsMainSidebarOpen(false); 
    setPanelState({ type: "details", data: poi });
  };

  // 2. Clic sur un élément du Menu Latéral (Ouvre Sidebar Secondaire)
  const handleViewChange = (view: "saved" | "recent" | "trips" | "mypois") => {
    setIsMainSidebarOpen(false); // On réduit le menu pour voir la liste
    setPanelState({ type: view });
    // Reset POI select (la carte reste centrée mais on n'est plus en mode fiche détails)
  };

  // 3. Passage en mode Itinéraire
  const handleOpenDirections = () => {
    if (panelState.type === "details" && panelState.data) {
        setPanelState({ type: "directions", data: panelState.data });
        handleCalculateRoute(panelState.data, "driving");
    }
  };

  // --- LOGIQUE ROUTING ---

  const handleCalculateRoute = async (destination: POI, mode: TransportMode) => {
    if (!userLocation) return alert("Géolocalisation requise pour le départ.");
    
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
        alert("Itinéraire introuvable");
    }
    setIsRouteLoading(false);
  };

  const handleClosePanel = () => {
    setPanelState({ type: null });
    setRouteGeometry(null); // Nettoyage carte
    setRouteStats(null);
  };

  const filteredPois = useMemo(() => {
    const base = [...POI_DATA, ...myPois]; // Fusion
    return base.filter((poi) => {
      const cat = selectedCategory ? poi.poi_category === selectedCategory : true;
      const search = searchQuery ? poi.poi_name.toLowerCase().includes(searchQuery.toLowerCase()) : true;
      return cat && search;
    });
  }, [selectedCategory, searchQuery, myPois]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-black font-sans">
      
      {/* Niveau 4 (Top) */}
      <TopLayout 
        onToggleSidebar={() => setIsMainSidebarOpen(!isMainSidebarOpen)}
        allPois={POI_DATA}
        selectedCategory={selectedCategory}
        onSelectCategory={(id) => setSelectedCategory(prev => prev === id ? "" : id)}
        onSearch={setSearchQuery}
        onSelectResult={handleSelectPoi}
        onLocateMe={() => userLocation && setUserLocation({...userLocation})}
        recentSearches={[]} 
        recentPois={recentPois}
      />

      {/* Niveau 3 (Gauche) - Sidebar Navigation */}
      <Sidebar 
        isOpen={isMainSidebarOpen} 
        onClose={() => setIsMainSidebarOpen(false)}
        onViewChange={handleViewChange}
        onLocateMe={() => userLocation && setUserLocation({...userLocation})}
        onShare={() => navigator.clipboard.writeText(window.location.href)}
        onPrint={() => setTimeout(() => window.print(), 100)}
        onToggleSettings={() => setIsSettingsOpen(true)}
      />

      {/* Niveau 2 (Panneaux glissants) - Mutuellement Exclusifs */}
      
      {/* A. Fiche Détails POI */}
      {panelState.type === "details" && panelState.data && (
        <PoiDetailsSidebar 
          poi={panelState.data} 
          isOpen={true}
          onClose={handleClosePanel}
          onOpenDirections={handleOpenDirections}
        />
      )}

      {/* B. Itinéraire */}
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
        />
      )}

      {/* C. Listes (Saved, Recent, Trips...) */}
      {(panelState.type === "saved" || panelState.type === "recent" || panelState.type === "trips" || panelState.type === "mypois") && (
          <SecondarySidebar 
             view={panelState.type}
             onClose={handleClosePanel}
             data={{ savedPois, recentPois, trips: recentTrips }}
             onSelectPoi={handleSelectPoi}
          />
      )}

      {/* Settings Modal (Overlay) */}
      {isSettingsOpen && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
             <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <SettingsIcon className="text-primary" /> Apparence
                    </h2>
                    <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"><X/></button>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <button 
                       onClick={() => { toggleMapStyle(); setIsSettingsOpen(false); }}
                       className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${mapStyle === 'streets-v2' ? 'border-primary bg-primary/5' : 'border-zinc-200 dark:border-zinc-700'}`}
                    >
                        <div className="w-full h-20 bg-zinc-200 rounded-lg bg-cover bg-center" style={{backgroundImage: "url('https://cloud.maptiler.com/static/img/maps/streets-v2.png')"}}></div>
                        <span className="font-semibold text-sm">Plan</span>
                        {mapStyle === 'streets-v2' && <Check size={16} className="text-primary"/>}
                    </button>
                    <button 
                       onClick={() => { toggleMapStyle(); setIsSettingsOpen(false); }}
                       className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${mapStyle === 'hybrid' ? 'border-primary bg-primary/5' : 'border-zinc-200 dark:border-zinc-700'}`}
                    >
                         <div className="w-full h-20 bg-zinc-700 rounded-lg bg-cover bg-center" style={{backgroundImage: "url('https://cloud.maptiler.com/static/img/maps/hybrid.png')"}}></div>
                        <span className="font-semibold text-sm">Satellite</span>
                        {mapStyle === 'hybrid' && <Check size={16} className="text-primary"/>}
                    </button>
                 </div>
             </div>
         </div>
      )}

      {/* Niveau 1 (Map) */}
      <div className="absolute top-0 left-0 w-full h-full z-0 print:block">
        <MapComponent 
          apiKey={MAPTILER_API_KEY} 
          pois={filteredPois} 
          selectedPoi={panelState.type === "details" || panelState.type === "directions" ? panelState.data : null}
          userLocation={userLocation}
          onSelectPoi={handleSelectPoi}
          routeGeometry={routeGeometry}
          mapStyleType={mapStyle} 
        />
      </div>

    </main>
  );
}