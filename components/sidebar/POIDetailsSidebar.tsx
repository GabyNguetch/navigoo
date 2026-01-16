import { motion } from "framer-motion";
import Image from "next/image";
import { POI } from "@/types";
import { X, Navigation, Bookmark, Share2, Smartphone, Globe, Clock, MapPin, Star } from "lucide-react";
import { getCategoryConfig } from "@/data/categories";

interface PoiDetailsProps {
  poi: POI;
  onClose: () => void;
  isOpen: boolean;
  onOpenDirections: () => void;
}

export const PoiDetailsSidebar = ({ poi, onClose, isOpen, onOpenDirections }: PoiDetailsProps) => {
  const categoryConfig = getCategoryConfig(poi.poi_category);

  return (
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: isOpen ? "0%" : "-100%" }}
      exit={{ x: "-100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 md:left-[72px] h-full w-full md:w-[400px] bg-white dark:bg-zinc-900 shadow-2xl z-[55] flex flex-col border-r border-zinc-200 dark:border-zinc-800"
    >
      {/* HEADER IMAGE HERO */}
      <div className="relative w-full h-48 bg-zinc-200">
        {/* Vérification que l'image existe avant affichage */}
        {poi.poi_images_urls && poi.poi_images_urls[0] ? (
            <Image 
            src={poi.poi_images_urls[0]} 
            alt={poi.poi_name}
            fill
            className="object-cover"
            />
        ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-400">Aucune image</div>
        )}
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-md transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* CONTENU */}
      <div className="p-6 space-y-6">
        
        {/* TITRE & REVIEW */}
        <div>
          <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">{poi.poi_name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-bold text-sm">{poi.rating}</span>
            <div className="flex text-yellow-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={14} fill={star <= Math.round(poi.rating) ? "currentColor" : "none"} />
              ))}
            </div>
            <span className="text-zinc-500 text-sm">({poi.review_count})</span>
            <span className="text-zinc-400">•</span>
            <span className="text-primary text-sm font-medium">{categoryConfig.label}</span>
          </div>
        </div>

        {/* ONGLETS SIMPLIFIÉS */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-700">
          {["Présentation", "Avis", "À propos"].map((tab, i) => (
            <button key={tab} className={`px-4 py-2 text-sm font-medium ${i===0 ? "text-primary border-b-2 border-primary" : "text-zinc-500 hover:text-zinc-800"}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* ACTIONS CIRCULAIRES */}
        <div className="flex justify-between px-2">
          {/* C'est ici que l'événement onClick est passé */}
          <ActionButton 
              icon={<Navigation size={20} className="-rotate-45" />} 
              label="Itinéraire" 
              active 
              onClick={onOpenDirections} 
          />
          <ActionButton icon={<Bookmark size={20} />} label="Enregistrer" />
          <ActionButton icon={<MapPin size={20} />} label="À proximité" />
          <ActionButton icon={<Share2 size={20} />} label="Partager" />
        </div>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800 w-full" />

        {/* DESCRIPTION RAPIDE */}
        <div className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          <p>{poi.poi_description}</p>
        </div>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800 w-full" />

        {/* INFOS PRATIQUES (ICONES) */}
        <div className="space-y-4">
          <InfoRow icon={<MapPin className="text-zinc-400" size={20} />} text={poi.address_informal || poi.address_city} />
          <InfoRow icon={<Clock className="text-zinc-400" size={20} />} text={poi.operation_time_plan ? "Ouvert • Ferme à 22:00" : "Horaires non disponibles"} isActive />
          <InfoRow icon={<Smartphone className="text-zinc-400" size={20} />} text={poi.poi_contacts?.phone || "Pas de numéro"} />
          {poi.poi_contacts?.website && (
             <InfoRow icon={<Globe className="text-zinc-400" size={20} />} text={poi.poi_contacts.website} />
          )}
        </div>

      </div>
    </motion.div>
  );
};

// --- CORRECTION DU SOUS-COMPOSANT ICI ---
// On doit bien récupérer `onClick` dans les props et le mettre sur le <button>
const ActionButton = ({ icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick} // <--- AJOUT CRUCIAL ICI
    className="flex flex-col items-center gap-2 group"
  >
    <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${
      active ? "bg-primary text-white border-primary shadow-md" : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-primary hover:bg-primary/5"
    }`}>
      {icon}
    </div>
    <span className={`text-xs font-medium ${active ? "text-primary" : "text-primary"}`}>{label}</span>
  </button>
);

const InfoRow = ({ icon, text, isActive }: any) => (
  <div className="flex items-start gap-4">
    <div className="mt-0.5">{icon}</div>
    <span className={`text-sm ${isActive ? "text-green-600 font-medium" : "text-zinc-700 dark:text-zinc-300"}`}>{text}</span>
  </div>
);