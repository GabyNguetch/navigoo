import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, ArrowUpDown, Car, PersonStanding, Bike, Loader2, Navigation, CircleDot, MapPin, Clock, Flag, Play, Square } from "lucide-react";
import { POI, Location, TransportMode } from "@/types";
import { clsx } from "clsx";
import { EnrichedRouteStats } from "@/services/routingService";

interface DirectionsSidebarProps {
  originPoi: POI | null;
  destinationPoi: POI;
  userLocation: Location | null;
  isOpen: boolean;
  onClose: () => void;
  onCalculateRoute: (mode: TransportMode) => void;
  routeStats: EnrichedRouteStats | null;
  isLoadingRoute: boolean;
  activeMode: TransportMode;
  onStartNavigation: () => void;
  onStopNavigation: () => void;
  isNavigating: boolean;
}

export const DirectionsSidebar = ({
  originPoi,
  destinationPoi,
  userLocation,
  isOpen,
  onClose,
  onCalculateRoute,
  routeStats,
  isLoadingRoute,
  activeMode,
  onStartNavigation,
  onStopNavigation,
  isNavigating
}: DirectionsSidebarProps) => {

  const formatTime = (seconds: number) => {
    if (seconds < 60) return "1 min";
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours} h ${minutes % 60} min`;
    return `${minutes} min`;
  };

  const formatDist = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  return (
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: isOpen ? "0%" : "-100%" }}
      exit={{ x: "-100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-16 left-0 md:left-[72px] h-full w-full md:w-[400px] bg-white dark:bg-zinc-900 shadow-2xl z-[60] flex flex-col border-r border-zinc-200 dark:border-zinc-800 font-sans overflow-hidden"
    >
      {/* HEADER */}
      <div className="bg-primary px-4 py-4 shadow-md text-white z-10 shrink-0">
        
        {/* Navigation Modes */}
        <div className="flex justify-between items-center mb-4 px-2">
            <ModeButton 
              icon={<Car size={20} />} 
              mode="driving" 
              active={activeMode === "driving"} 
              onClick={() => onCalculateRoute("driving")} 
            />
            <ModeButton 
              icon={<Bike size={20} />} 
              mode="cycling" 
              active={activeMode === "cycling"} 
              onClick={() => onCalculateRoute("cycling")} 
            />
            <ModeButton 
              icon={<PersonStanding size={20} />} 
              mode="walking" 
              active={activeMode === "walking"} 
              onClick={() => onCalculateRoute("walking")} 
            />
            
            <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors ml-auto">
                <X size={20} />
            </button>
        </div>

        {/* Input Fields */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-3 shadow-inner flex gap-3 text-zinc-800 dark:text-zinc-200">
           <div className="flex flex-col items-center pt-2 gap-1 w-6">
              <CircleDot size={14} className="text-blue-500" />
              <div className="flex-1 w-0.5 border-l-2 border-dotted border-zinc-300 dark:border-zinc-600 my-1"></div>
              <MapPin size={14} className="text-red-500 fill-red-500" />
           </div>

           <div className="flex-1 flex flex-col gap-3">
              <div className="h-8 flex items-center border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded px-3 text-sm truncate">
                  {originPoi ? originPoi.poi_name : (userLocation ? "Votre position" : "Départ")}
              </div>
              <div className="h-8 flex items-center border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded px-3 text-sm font-semibold truncate">
                  {destinationPoi.poi_name}
              </div>
           </div>

           <div className="flex items-center">
              <button className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-zinc-400">
                  <ArrowUpDown size={16} />
              </button>
           </div>
        </div>
      </div>

      {/* RESULTS BODY */}
      <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-black p-2">
        
        {isLoadingRoute ? (
           <div className="flex flex-col items-center justify-center h-40 gap-3 text-zinc-500">
               <Loader2 size={32} className="animate-spin text-primary" />
               <p className="text-sm">Calcul de l'itinéraire...</p>
           </div>
        ) : routeStats ? (
            <div className="space-y-2 mt-2">
                {/* Carte récapitulative */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                   <div className="flex justify-between items-start mb-4">
                      <div>
                         <div className="text-2xl font-bold text-green-600 dark:text-green-500">
                             {formatTime(routeStats.duration)}
                         </div>
                         <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm font-medium mt-1">
                             <span>{formatDist(routeStats.distance)}</span>
                             <span>•</span>
                             <span>~{routeStats.averageSpeed} km/h</span>
                         </div>
                      </div>
                      <div className="text-zinc-300">
                          {activeMode === "driving" && <Car size={24} />}
                          {activeMode === "walking" && <PersonStanding size={24} />}
                          {activeMode === "cycling" && <Bike size={24} />}
                      </div>
                   </div>
                   
                   <button 
                      onClick={isNavigating ? onStopNavigation : onStartNavigation}
                      className={clsx(
                        "w-full py-3 rounded-full font-bold flex items-center justify-center gap-2 shadow-lg transition-all",
                        isNavigating 
                          ? "bg-red-600 text-white hover:bg-red-700"
                          : "bg-primary text-white hover:bg-primary-dark"
                      )}
                   >
                      {isNavigating ? (
                        <>
                          <Square size={18} fill="currentColor" />
                          Terminer
                        </>
                      ) : (
                        <>
                          <Play size={18} fill="currentColor" />
                          Démarrer
                        </>
                      )}
                   </button>
                </div>

                {/* Étapes détaillées */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                   <h3 className="font-semibold mb-3 flex items-center gap-2">
                       <Clock size={16} /> Étapes de navigation
                   </h3>
                   <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {routeStats.steps && routeStats.steps.length > 0 ? (
                        routeStats.steps.map((step, idx) => (
                          <Step 
                            key={idx}
                            text={step.instruction}
                            distance={formatDist(step.distance)}
                            isLast={idx === routeStats.steps.length - 1}
                          />
                        ))
                      ) : (
                        <>
                          <Step text={`Partir de ${originPoi ? originPoi.poi_name : "Votre position"}`} distance="" />
                          <Step text="Suivre l'itinéraire" distance={formatDist(routeStats.distance)} />
                          <Step text={`Arrivée à ${destinationPoi.poi_name}`} distance="" isLast />
                        </>
                      )}
                   </div>
                </div>
            </div>
        ) : (
            <div className="text-center p-8 text-zinc-400">
                Sélectionnez un mode de transport pour calculer l'itinéraire.
            </div>
        )}

      </div>
    </motion.div>
  );
};

const ModeButton = ({ icon, active, onClick }: any) => (
  <button 
     onClick={onClick}
     className={clsx(
       "p-2 rounded-full transition-all flex flex-col items-center gap-1 min-w-[60px]",
       active ? "bg-white text-primary font-bold shadow-sm scale-110" : "text-white/70 hover:bg-white/10"
     )}
  >
     {icon}
  </button>
);

const Step = ({ text, distance, isLast }: { text: string; distance: string; isLast?: boolean }) => (
   <div className="flex gap-4 min-h-[40px]">
       <div className="flex flex-col items-center">
           <div className="w-3 h-3 rounded-full border-2 border-zinc-400 bg-white dark:bg-black z-10"></div>
           {!isLast && <div className="w-0.5 flex-1 bg-zinc-200 dark:bg-zinc-700 -mt-1 -mb-1"></div>}
       </div>
       <div className="flex-1 pb-4">
          <p className="text-sm text-zinc-800 dark:text-zinc-200 font-medium">{text}</p>
          {distance && <p className="text-xs text-zinc-500 mt-1">{distance}</p>}
       </div>
   </div>
);