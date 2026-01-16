"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Map, { Marker, NavigationControl, GeolocateControl, ScaleControl, Popup, MapRef } from "react-map-gl/maplibre";
import maplibregl, { LngLatBounds } from "maplibre-gl"; // Import de LngLatBounds
import "maplibre-gl/dist/maplibre-gl.css";
import { POI, Location } from "@/types";
import { getCategoryConfig } from "@/data/categories";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Star, MapPin as MapPinIcon } from "lucide-react";
import { Source, Layer } from "react-map-gl/maplibre";

interface MapProps {
  apiKey: string;
  pois: POI[];
  onSelectPoi: (poi: POI | null) => void;
  selectedPoi: POI | null;
  userLocation: Location | null;
  routeGeometry: any | null; 
  mapStyleType: "streets-v2" | "hybrid"; // Nouveau
}

export default function MapComponent({ apiKey, pois, onSelectPoi, selectedPoi, userLocation, routeGeometry, mapStyleType }: MapProps) {
  const mapRef = useRef<MapRef>(null);

  const [viewState, setViewState] = useState({
    longitude: 11.516,
    latitude: 3.866,
    zoom: 13.5
  });

  const [hoveredPoi, setHoveredPoi] = useState<POI | null>(null);

  // ------------------------------------------
  // EFFET 1 : ZOOM UTILISATEUR
  // ------------------------------------------
  useEffect(() => {
    // On ne centre sur l'user que si pas d'itinéraire actif
    if (userLocation && mapRef.current && !routeGeometry) {
      mapRef.current.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 15,
        duration: 2000
      });
    }
  }, [userLocation, routeGeometry]);

  // ------------------------------------------
  // EFFET 2 : ZOOM POI SÉLECTIONNÉ
  // ------------------------------------------
  useEffect(() => {
    // On ne centre sur le POI que si pas d'itinéraire actif
    if (selectedPoi && mapRef.current && !routeGeometry) {
      mapRef.current.flyTo({
        center: [selectedPoi.location.longitude, selectedPoi.location.latitude],
        zoom: 16,
        duration: 1500
      });
    }
  }, [selectedPoi, routeGeometry]);

  // ------------------------------------------
  // EFFET 3 : ZOOM & FIT ITINÉRAIRE (NOUVEAU)
  // ------------------------------------------
  useEffect(() => {
    if (routeGeometry && mapRef.current) {
        const coords = routeGeometry.coordinates;

        // Créer les limites (Bounding Box) pour inclure tout le chemin
        const bounds = new LngLatBounds(coords[0], coords[0]);
        for (const coord of coords) {
            bounds.extend(coord as [number, number]);
        }

        // Appliquer le zoom automatique
        mapRef.current.fitBounds(bounds, {
            padding: {
                top: 50,
                bottom: 50,
                right: 50,
                // On met plus de marge à gauche car il y a la sidebar (400px + 72px sidebar ~ 500px)
                // Sur mobile, on mettra moins.
                left: window.innerWidth > 768 ? 480 : 50
            },
            duration: 2000 // Animation fluide de 2 secondes
        });
    }
  }, [routeGeometry]);

  // ------------------------------------------
  // MARQUEURS
  // ------------------------------------------
  const pins = useMemo(() => pois.map((poi) => {
    const config = getCategoryConfig(poi.poi_category);
    const isSelected = selectedPoi?.poi_id === poi.poi_id;

    return (
      <Marker
        key={poi.poi_id}
        longitude={poi.location.longitude}
        latitude={poi.location.latitude}
        anchor="bottom"
        onClick={(e) => {
          e.originalEvent.stopPropagation();
          onSelectPoi(poi);
        }}
      >
        <div 
          onMouseEnter={() => setHoveredPoi(poi)}
          onMouseLeave={() => setHoveredPoi(null)}
          className="relative flex flex-col items-center cursor-pointer group"
          style={{ zIndex: isSelected ? 50 : 10 }}
        >
          {isSelected ? (
             <div className="relative">
                <div className="absolute inset-0 bg-red-500 rounded-full opacity-75 animate-ping"></div>
                <div className="relative z-10 text-red-600 drop-shadow-lg transform transition-transform hover:scale-110">
                   <MapPinIcon size={48} fill="#ef4444" className="text-red-900" />
                   <div className="absolute top-[14px] left-[14px] w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-red-600 rounded-full" />
                   </div>
                </div>
             </div>
          ) : (
            <>
               <div 
                 className="flex items-center justify-center w-8 h-8 rounded-full shadow-lg border-2 border-white transition-transform duration-200 group-hover:scale-110 bg-zinc-900"
                 style={{ backgroundColor: config.color }}
               >
                 <div className="text-white drop-shadow-md">
                   {config.icon}
                 </div>
               </div>
               <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] mt-[-1px]" style={{ borderTopColor: config.color }}></div>
            </>
          )}
        </div>
      </Marker>
    );
  }), [pois, selectedPoi, onSelectPoi]);

  return (
    <Map
      ref={mapRef}
      {...viewState}
      onMove={evt => setViewState(evt.viewState)}
      style={{ width: "100%", height: "100%" }}
      mapStyle={`https://api.maptiler.com/maps/${mapStyleType}/style.json?key=${apiKey}`}
      attributionControl={false}
      onClick={() => onSelectPoi(null)}
    >
      <GeolocateControl position="bottom-right" />
      <NavigationControl position="bottom-right" showCompass={false} />
      <ScaleControl />

      {routeGeometry && (
          <Source id="route-source" type="geojson" data={routeGeometry}>
             <Layer 
               id="route-line-outline"
               type="line"
               paint={{
                 'line-color': '#1a5d99',
                 'line-width': 8,
                 'line-opacity': 0.8
               }}
             />
             <Layer 
               id="route-line"
               type="line"
               layout={{
                 'line-join': 'round',
                 'line-cap': 'round'
               }}
               paint={{
                 'line-color': '#9400D3',
                 'line-width': 5,
                 'line-opacity': 1
               }}
             />
          </Source>
       )}

      {userLocation && (
        <Marker longitude={userLocation.longitude} latitude={userLocation.latitude}>
           <div className="relative flex items-center justify-center w-6 h-6">
              <div className="absolute w-12 h-12 bg-blue-500 rounded-full opacity-30 animate-ping"></div>
              <div className="absolute w-6 h-6 bg-blue-500/40 rounded-full border border-blue-500/50 backdrop-blur-sm shadow-[0_0_10px_rgba(59,130,246,0.6)]"></div>
              <div className="absolute w-3.5 h-3.5 bg-blue-600 rounded-full border-2 border-white shadow-sm z-10"></div>
           </div>
        </Marker>
      )}

      {pins}

      <AnimatePresence>
        {hoveredPoi && !selectedPoi && (
          <Popup
            longitude={hoveredPoi.location.longitude}
            latitude={hoveredPoi.location.latitude}
            anchor="top"
            closeButton={false}
            offset={15}
            className="z-50"
          >
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 p-0 min-w-[200px]">
               <div className="relative w-12 h-12 rounded-md overflow-hidden shrink-0 bg-gray-200">
                  {hoveredPoi.poi_images_urls && hoveredPoi.poi_images_urls[0] && (
                     <Image src={hoveredPoi.poi_images_urls[0]} alt="img" fill className="object-cover" sizes="50px" />
                  )}
               </div>
               <div className="flex flex-col justify-center">
                 <h4 className="font-bold text-sm text-zinc-800 leading-tight">{hoveredPoi.poi_name}</h4>
                 <div className="flex items-center gap-1 mt-0.5 text-xs text-zinc-600">
                   <Star size={10} className="text-yellow-500 fill-current" />
                   <span>{hoveredPoi.rating}</span>
                 </div>
               </div>
            </motion.div>
          </Popup>
        )}
      </AnimatePresence>
    </Map>
  );
}