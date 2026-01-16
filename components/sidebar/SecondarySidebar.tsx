import { motion } from "framer-motion";
import { X, MapPin, Clock, Bookmark, PlusCircle, Crown, Navigation, ArrowRight } from "lucide-react";
import { POI, Trip } from "@/types";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

type ViewType = "saved" | "recent" | "trips" | "mypois" | null;

interface SecondarySidebarProps {
  view: ViewType;
  onClose: () => void;
  data: {
    savedPois: POI[];
    recentPois: POI[];
    trips: Trip[];
  };
  onSelectPoi: (poi: POI) => void;
}

export const SecondarySidebar = ({ view, onClose, data, onSelectPoi }: SecondarySidebarProps) => {
  const getHeader = () => {
    switch (view) {
      case "saved": return { title: "Enregistrés", icon: <Bookmark className="text-primary" /> };
      case "recent": return { title: "Récents", icon: <Clock className="text-primary" /> };
      case "trips": return { title: "Trajets Récents", icon: <Navigation className="text-primary" /> };
      case "mypois": return { title: "Mes Lieux", icon: <MapPin className="text-primary" /> };
      default: return { title: "", icon: null };
    }
  };

  const { title, icon } = getHeader();

  // Helper pour formater la date
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('fr-CM', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: "0%" }}
      exit={{ x: "-100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 left-[72px] h-full w-[400px] bg-white dark:bg-zinc-900 shadow-2xl z-[55] flex flex-col border-r border-zinc-200 dark:border-zinc-800"
    >
      {/* Header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-black/50">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">{icon}</div>
            <h2 className="text-lg font-bold text-zinc-800 dark:text-white">{title}</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full text-zinc-500">
            <X size={20} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        
        {/* VIEW: ENREGISTRÉS & RÉCENTS */}
        {(view === "saved" || view === "recent") && (
            (view === "saved" ? data.savedPois : data.recentPois).length > 0 ? (
                (view === "saved" ? data.savedPois : data.recentPois).map(poi => (
                    <div key={poi.poi_id} onClick={() => onSelectPoi(poi)} className="flex gap-3 p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer border border-zinc-100 dark:border-zinc-800/50 transition-colors">
                        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 relative bg-zinc-200">
                           {poi.poi_images_urls[0] && <Image src={poi.poi_images_urls[0]} alt="" fill className="object-cover" />}
                        </div>
                        <div>
                            <h3 className="font-semibold text-zinc-800 dark:text-zinc-100 line-clamp-1">{poi.poi_name}</h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{poi.poi_category} • {poi.address_city}</p>
                            <div className="text-xs text-primary mt-1 flex items-center gap-1">Voir sur la carte <ArrowRight size={10}/></div>
                        </div>
                    </div>
                ))
            ) : <EmptyState text="Aucun lieu trouvé." />
        )}

        {/* VIEW: TRAJETS */}
        {view === "trips" && (
             data.trips.length > 0 ? (
                data.trips.map(trip => (
                    <div key={trip.id} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 hover:border-primary/30 transition-colors group">
                        <div className="flex justify-between items-center mb-2">
                             <span className="text-xs font-mono text-zinc-400">{formatDate(trip.date)}</span>
                             <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full dark:bg-green-900/30 dark:text-green-400">Terminé</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-zinc-400"></div>
                                <span className="text-sm truncate">{trip.departName}</span>
                            </div>
                            <div className="ml-[3px] w-0.5 h-3 bg-zinc-300 dark:bg-zinc-700"></div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                                <span className="text-sm font-semibold truncate">{trip.arriveName}</span>
                            </div>
                        </div>
                        <div className="mt-3 flex gap-4 text-xs text-zinc-500 font-medium pt-2 border-t border-zinc-200 dark:border-zinc-700/50">
                            <span>{Math.round(trip.distance / 1000)} km</span>
                            <span>{Math.round(trip.duration / 60)} min</span>
                        </div>
                    </div>
                ))
             ) : <EmptyState text="Aucun trajet récent." />
        )}

        {/* VIEW: MES POIS & PARTENARIAT */}
        {view === "mypois" && (
            <div className="space-y-6">
                
                {/* CTA CRÉATION */}
                <button className="w-full py-4 border-2 border-dashed border-primary/30 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary transition-all group text-zinc-500 dark:text-zinc-400">
                    <div className="p-3 bg-white dark:bg-zinc-800 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                        <PlusCircle size={24} className="text-primary" />
                    </div>
                    <span className="text-sm font-medium group-hover:text-primary">Créer un nouveau Point d'intérêt</span>
                </button>

                {/* PROMOTION PARTENAIRE */}
                <div className="bg-gradient-to-br from-indigo-900 to-primary p-5 rounded-2xl text-white relative overflow-hidden">
                    <Crown className="absolute -right-4 -bottom-4 text-white/10" size={120} />
                    <h3 className="font-bold text-lg mb-2 relative z-10">Devenir Partenaire Navigoo</h3>
                    <p className="text-white/80 text-sm mb-4 relative z-10 leading-relaxed">
                        Boostez la visibilité de votre commerce. Accédez aux statistiques, répondez aux avis et mettez en avant vos offres.
                    </p>
                    <Button size="sm" className="w-full bg-white text-primary hover:bg-zinc-100 border-none relative z-10 font-bold">
                        Demander mon badge Pro
                    </Button>
                </div>
            </div>
        )}

      </div>
    </motion.div>
  );
};

const EmptyState = ({ text }: { text: string }) => (
    <div className="flex flex-col items-center justify-center h-48 text-zinc-400">
        <MapPin size={48} className="mb-2 opacity-20" />
        <p>{text}</p>
    </div>
);