import { useState } from "react";
import { motion } from "framer-motion";
import { SidebarItem } from "./SidebarItem";
import { 
  Bookmark, Clock, Share2, Printer, MapPin, 
  Settings, HelpCircle, Shield, Globe, 
  Building, UserSearch, PanelLeftClose, MapPinHouse
} from "lucide-react";
import { clsx } from "clsx";
import { captureMap, shareMap } from "@/services/mapCaptureService";

interface SidebarProps {
  isOpen: boolean; 
  onClose: () => void;
  // Actions
  onViewChange: (view: "saved" | "recent" | "trips" | "mypois") => void;
  onLocateMe: () => void;
  onShare: () => void;
  onPrint: () => void;
  onToggleSettings: () => void;
}

export const Sidebar = ({ 
    isOpen, 
    onClose, 
    onViewChange, 
    onLocateMe,
    onShare,
    onPrint,
    onToggleSettings
}: SidebarProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = isHovered || isOpen;

  const handleAction = (action: () => void) => {
    action();    // 1. Exécute l'action demandée (ex: ouvrir panneau favoris)
    onClose();   // 2. Force la fermeture du mode "Menu étendu"
    setIsHovered(false); // 3. Force la fin de l'état survol (pour éviter qu'il reste ouvert si la souris ne bouge pas vite)
  };

  return (
    <>
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={{ width: "70px" }}
        animate={{ width: isExpanded ? "300px" : "72px" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={clsx(
          "fixed top-0 left-0 h-full bg-white dark:bg-black/95 backdrop-blur-md shadow-2xl z-[60] flex flex-col border-r border-zinc-200 dark:border-zinc-800 overflow-hidden",
          !isOpen && "hidden md:flex" 
        )}
      >
        {/* HEADER LOGO */}
        <div className="h-16 flex items-center shrink-0 border-b border-zinc-100 dark:border-zinc-800 px-3">
           {isExpanded ? (
             <div className="flex items-center justify-between w-full pl-2">
               <div className="flex items-center gap-3">
                 <div className="bg-primary/10 p-1.5 rounded-lg"><MapPinHouse className="text-primary" size={24} /></div>
                 <span className="text-xl font-bold tracking-tight text-zinc-700 dark:text-white">Navi<span className="text-primary">goo</span></span>
               </div>
               <button onClick={onClose} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md text-zinc-400"><PanelLeftClose size={20} /></button>
             </div>
           ) : (
             <div className="w-full flex justify-center">
                <div className="bg-white dark:bg-zinc-800 p-2 rounded-xl border border-zinc-100 dark:border-zinc-700">
                  <MapPinHouse className="text-primary" size={26} />
                </div>
             </div>
           )}
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin px-2 py-4 space-y-1">
          <SidebarItem isExpanded={isExpanded} icon={<Bookmark size={22} />} label="Enregistrés" onClick={() => handleAction(() => onViewChange("saved"))} />
          <SidebarItem isExpanded={isExpanded} icon={<Clock size={22} />} label="Récents" onClick={() => handleAction(() => onViewChange("recent"))} />
          <SidebarItem isExpanded={isExpanded} icon={<Building size={22} />} label="Creer un point d'interet" onClick={() => handleAction(() => onViewChange("mypois"))} />
          <SidebarItem isExpanded={isExpanded} icon={<UserSearch size={22} />} label="Trouver ma position" onClick={() => handleAction(onLocateMe)} />
          <SidebarItem isExpanded={isExpanded} icon={<MapPin size={22} />} label="Mes trajets" onClick={() => handleAction(() => onViewChange("trips"))} />
          
          <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-2 mx-2" />

          <SidebarItem isExpanded={isExpanded} icon={<Share2 size={22} />} label="Partager la carte" onClick={() => handleAction(shareMap)} />
          <SidebarItem isExpanded={isExpanded} icon={<Printer size={22} />} label="Imprimer la carte" onClick={() => handleAction(captureMap)} />
          
          <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-2 mx-2" />

          <SidebarItem isExpanded={isExpanded} icon={<Settings size={22} />} label="Paramètres & Style" onClick={() => handleAction(onToggleSettings)} />
          <SidebarItem isExpanded={isExpanded} icon={<Shield size={22} />} label="Confidentialité" />
        </div>

        {/* Footer */}
        <div className={clsx("p-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-center")}>
             <Globe size={20} className="text-zinc-400 hover:text-primary cursor-pointer" />
        </div>
      </motion.div>
      
      {/* Mobile Backdrop */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-[55] md:hidden" onClick={onClose} />}
    </>
  );
};