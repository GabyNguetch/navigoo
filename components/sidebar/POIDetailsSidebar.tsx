// components/sidebar/POIDetailsSidebar.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { POI } from "@/types";
import { X, Navigation, Bookmark, Share2, Smartphone, Globe, Clock, MapPin, Star, MessageSquare, Edit, FileText, Mic } from "lucide-react";
import { getCategoryConfig } from "@/data/categories";
import { useRouter } from "next/navigation";
import { useUserData } from "@/hooks/useUserData";
import { Button } from "@/components/ui/Button";
import { ReviewsSection } from "../reviews/ReviewsSection";
import { reviewService } from "@/services/reviewService";

interface PoiDetailsProps {
  poi: POI;
  onClose: () => void;
  isOpen: boolean;
  onOpenDirections: () => void;
}

export const PoiDetailsSidebar = ({ poi, onClose, isOpen, onOpenDirections }: PoiDetailsProps) => {
  const categoryConfig = getCategoryConfig(poi.poi_category);
  const router = useRouter();
  const { myPois } = useUserData();
  
  const [stats, setStats] = useState<{ averageRating: number; reviewCount: number } | null>(null);

  // Vérifier si le POI appartient à l'utilisateur
  const isOwner = myPois.some(p => p.poi_id === poi.poi_id);

  // Charger les stats d'avis
  useEffect(() => {
    const loadStats = async () => {
      try {
        console.log("📊 [PoiDetailsSidebar] Chargement stats avis pour POI:", poi.poi_id);
        const statsData = await reviewService.getPoiStats(poi.poi_id);
        setStats(statsData);
        console.log("✅ [PoiDetailsSidebar] Stats chargées:", statsData);
      } catch (error) {
        console.warn("⚠️ [PoiDetailsSidebar] Impossible de charger les stats:", error);
      }
    };

    if (poi.poi_id) {
      loadStats();
    }
  }, [poi.poi_id]);

  const handleEdit = () => {
    router.push(`/add-poi?id=${poi.poi_id}`);
  };

  const handleCreateContent = (type: 'blog' | 'podcast') => {
    router.push(`/add-content?type=${type}&poiId=${poi.poi_id}`);
  };

  const handleReviewSubmitted = async () => {
    // Recharger les stats après soumission d'un avis
    try {
      const statsData = await reviewService.getPoiStats(poi.poi_id);
      setStats(statsData);
    } catch (error) {
      console.error("Erreur rechargement stats:", error);
    }
  };

  return (
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: isOpen ? "0%" : "-100%" }}
      exit={{ x: "-100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 md:left-[72px] h-full w-full md:w-[420px] bg-white dark:bg-zinc-900 shadow-2xl z-[55] flex flex-col border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent"
    >
      {/* HEADER IMAGE HERO */}
      <div className="relative w-full h-56 shrink-0 bg-zinc-200">
        {poi.poi_images_urls && poi.poi_images_urls[0] ? (
            <Image src={poi.poi_images_urls[0]} alt={poi.poi_name} fill className="object-cover"/>
        ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-400 bg-zinc-100">Aucune image</div>
        )}
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-md transition-colors z-20">
          <X size={20} />
        </button>

        {/* OWNER EDIT BUTTON */}
        {isOwner && (
            <button 
                onClick={handleEdit}
                className="absolute bottom-4 right-4 bg-white text-black px-4 py-2 rounded-full shadow-lg font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform"
            >
                <Edit size={16} /> Modifier
            </button>
        )}
      </div>

      {/* CONTENU */}
      <div className="p-6 space-y-6 pb-20">
        
        {/* TITRE & STATS */}
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 leading-tight">{poi.poi_name}</h1>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {stats ? (
              <>
                <span className="font-black text-sm bg-green-600 text-white px-2 py-0.5 rounded">{stats.averageRating.toFixed(1)}</span>
                <div className="flex text-yellow-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={14} fill={star <= Math.round(stats.averageRating) ? "currentColor" : "none"} />
                  ))}
                </div>
                <span className="text-zinc-500 text-sm underline">({stats.reviewCount} avis)</span>
              </>
            ) : (
              <>
                <span className="font-black text-sm bg-zinc-600 text-white px-2 py-0.5 rounded">{poi.rating || "N/A"}</span>
                <span className="text-zinc-500 text-sm">Chargement...</span>
              </>
            )}
            <span className="text-zinc-300">•</span>
            <span className="text-primary text-sm font-semibold flex items-center gap-1">
                {categoryConfig.icon} {categoryConfig.label}
            </span>
          </div>
        </div>

        {/* ACTIONS CIRCULAIRES */}
        <div className="flex justify-between px-2 py-2">
          <ActionButton icon={<Navigation size={22} className="-rotate-45 ml-1 mt-1" />} label="Y aller" active onClick={onOpenDirections} />
          <ActionButton icon={<Bookmark size={22} />} label="Sauver" onClick={() => {}}/>
          <ActionButton icon={<Share2 size={22} />} label="Partager" onClick={() => {}}/>
          <ActionButton icon={<Globe size={22} />} label="Site web" onClick={() => {}} disabled={!poi.poi_contacts?.website} />
        </div>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800 w-full" />

        {/* DESCRIPTION */}
        <div className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          <p>{poi.poi_description || "Aucune description disponible."}</p>
        </div>

        {/* AMENITIES */}
        {poi.poi_amenities && poi.poi_amenities.length > 0 && (
            <div className="flex flex-wrap gap-2">
                {poi.poi_amenities.map(am => (
                    <span key={am} className="text-xs px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full font-medium border border-zinc-200 dark:border-zinc-700">
                        {am}
                    </span>
                ))}
            </div>
        )}

        <div className="h-px bg-zinc-100 dark:bg-zinc-800 w-full" />

        {/* INFO PRATIQUES */}
        <div className="space-y-4">
          <InfoRow icon={<MapPin className="text-zinc-400" size={20} />} text={poi.address_informal || `${poi.address_city}, ${poi.address_country || "Cameroun"}`} />
          <InfoRow icon={<Clock className="text-zinc-400" size={20} />} text="Ouvert maintenant (ferme à 22h)" isActive />
          <InfoRow icon={<Smartphone className="text-zinc-400" size={20} />} text={poi.poi_contacts?.phone || "Non renseigné"} />
        </div>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800 w-full" />

        {/* CRÉER DU CONTENU (Blog/Podcast) */}
        <div>
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            📝 Créer du contenu
          </h3>
          <div className="flex gap-3">
            <Button 
              onClick={() => handleCreateContent('blog')}
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
            >
              <FileText size={16}/> Blog
            </Button>
            <Button 
              onClick={() => handleCreateContent('podcast')}
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
            >
              <Mic size={16}/> Podcast
            </Button>
          </div>
        </div>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800 w-full" />

        {/* SECTION AVIS - Intégration complète */}
        <ReviewsSection 
          poiId={poi.poi_id} 
          onReviewSubmitted={handleReviewSubmitted}
        />

      </div>
    </motion.div>
  );
};

const ActionButton = ({ icon, label, active, onClick, disabled }: any) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`flex flex-col items-center gap-2 group ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
  >
    <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${
      active ? "bg-primary text-white border-primary shadow-md" : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-primary hover:border-primary/30"
    }`}>
      {icon}
    </div>
    <span className={`text-[10px] font-medium uppercase tracking-wide ${active ? "text-primary" : "text-zinc-500"}`}>{label}</span>
  </button>
);

const InfoRow = ({ icon, text, isActive }: any) => (
  <div className="flex items-start gap-4">
    <div className="mt-0.5 min-w-[20px]">{icon}</div>
    <span className={`text-sm ${isActive ? "text-green-600 font-bold" : "text-zinc-700 dark:text-zinc-300"}`}>{text}</span>
  </div>
);