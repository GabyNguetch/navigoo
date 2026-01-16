import { motion } from "framer-motion";
import { X, MapPin, Clock, Bookmark, PlusCircle, Crown, Navigation, Edit2 } from "lucide-react";
import { POI, Trip } from "@/types";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useUserData } from "@/hooks/useUserData";

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
  const router = useRouter();
  const { myPois } = useUserData(); // Accès aux POIs de l'utilisateur

  const getHeader = () => {
    switch (view) {
      case "saved": return { title: "Enregistrés", icon: <Bookmark className="text-primary" /> };
      case "recent": return { title: "Récents", icon: <Clock className="text-primary" /> };
      case "trips": return { title: "Trajets Récents", icon: <Navigation className="text-primary" /> };
      case "mypois": return { title: "Mes Points d'intérêt", icon: <MapPin className="text-primary" /> };
      default: return { title: "", icon: null };
    }
  };

  const { title, icon } = getHeader();

  const formatDate = (isoString: string) => {
    try { return new Date(isoString).toLocaleDateString('fr-CM', { day: 'numeric', month: 'short' }); } catch { return ""; }
  };

  return (
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: "0%" }}
      exit={{ x: "-100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 md:left-[72px] h-full w-full md:w-[400px] bg-white dark:bg-zinc-900 shadow-2xl z-[55] flex flex-col border-r border-zinc-200 dark:border-zinc-800"
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* === SECTION "MES POIS" === */}
        {view === "mypois" && (
            <div className="space-y-4">
                
                {/* Bouton Création Toujours Visible */}
                <button 
                    onClick={() => router.push("/add-poi")} 
                    className="w-full py-4 border-2 border-dashed border-primary/30 rounded-xl flex items-center justify-center gap-3 hover:bg-primary/5 hover:border-primary transition-all group text-zinc-500 dark:text-zinc-400"
                >
                    <div className="p-2 bg-white dark:bg-zinc-800 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                        <PlusCircle size={20} className="text-primary" />
                    </div>
                    <span className="text-sm font-bold text-primary">Créer un nouveau lieu</span>
                </button>

                <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-2"></div>

                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Mes Établissements ({myPois.length})</h3>

                {myPois.length > 0 ? (
                    <div className="space-y-3">
                        {myPois.map(poi => (
                            <div 
                                key={poi.poi_id} 
                                onClick={() => onSelectPoi(poi)} // Clic sur un "MyPOI" ouvre la sidebar détail
                                className="relative flex gap-3 p-3 rounded-xl bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 hover:border-primary cursor-pointer shadow-sm hover:shadow-md transition-all group"
                            >
                                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 relative bg-zinc-200">
                                   {poi.poi_images_urls[0] && <Image src={poi.poi_images_urls[0]} alt="" fill className="object-cover" />}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-zinc-800 dark:text-zinc-100 line-clamp-1 pr-6">{poi.poi_name}</h3>
                                    <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{poi.poi_description}</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Actif</span>
                                        <div className="ml-auto text-primary text-xs flex items-center gap-1 group-hover:underline">
                                            <Edit2 size={10} /> Gérer
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-zinc-400 text-sm">
                        Vous n'avez pas encore ajouté de lieu.
                    </div>
                )}

                {/* Promo Partenaire en bas de liste */}
                <div className="bg-gradient-to-br from-indigo-900 to-primary p-5 rounded-2xl text-white relative overflow-hidden mt-6">
                    <Crown className="absolute -right-4 -bottom-4 text-white/10" size={120} />
                    <h3 className="font-bold text-lg mb-2 relative z-10">Devenir Partenaire</h3>
                    <p className="text-white/80 text-sm mb-4 relative z-10 leading-relaxed">
                        Boostez la visibilité de vos commerces sur Navigoo.
                    </p>
                    <Button size="sm" className="w-full bg-white text-primary hover:bg-zinc-100 border-none relative z-10 font-bold">
                        Passer pro
                    </Button>
                </div>
            </div>
        )}

        {/* Autres Vues (Code inchangé mais condensé pour l'exemple) */}
        {(view === "saved" || view === "recent") && (
             (view === "saved" ? data.savedPois : data.recentPois).length > 0 ? (
                (view === "saved" ? data.savedPois : data.recentPois).map(poi => (
                    <div key={poi.poi_id} onClick={() => onSelectPoi(poi)} className="flex gap-3 p-3 rounded-xl hover:bg-zinc-100 cursor-pointer border border-transparent hover:border-zinc-200 transition-colors">
                        <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 relative bg-zinc-200">
                           {poi.poi_images_urls[0] && <Image src={poi.poi_images_urls[0]} alt="" fill className="object-cover" />}
                        </div>
                        <div>
                            <h3 className="font-semibold text-zinc-800 line-clamp-1">{poi.poi_name}</h3>
                            <p className="text-xs text-zinc-500">{poi.poi_category} • {poi.address_city}</p>
                        </div>
                    </div>
                ))
             ) : <EmptyState text="Aucun lieu trouvé." />
        )}

        {view === "trips" && data.trips.length > 0 && (
             data.trips.map(trip => (
                <div key={trip.id} className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 mb-3">
                    <div className="flex justify-between items-center mb-2 text-xs text-zinc-400">
                         <span>{formatDate(trip.date)}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-sm">
                        <span className="font-semibold">{trip.arriveName}</span>
                        <span className="text-zinc-500 text-xs">depuis {trip.departName}</span>
                    </div>
                </div>
             ))
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