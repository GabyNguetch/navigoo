"use client";

import { Map, Bookmark, Plus, Route, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";

interface MobileNavBarProps {
  currentView: "saved" | "recent" | "trips" | "mypois" | null;
  onViewChange: (view: "saved" | "recent" | "trips" | "mypois") => void;
  onOpenSidebar: () => void;
  onResetView: () => void;
}

export const MobileNavBar = ({ 
  currentView, 
  onViewChange, 
  onOpenSidebar,
  onResetView 
}: MobileNavBarProps) => {
  const router = useRouter();

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full z-50 px-4 pb-4 pt-0">
      {/* Container Flottant pour effet "Island" ou simple barre fixée */}
      <nav className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl shadow-zinc-200/50 dark:shadow-black/50 h-[72px] flex items-center justify-around px-2">
        
        {/* 1. ACCUEIL / CARTE */}
        <NavItem 
          label="Carte" 
          icon={<Map size={24} />} 
          isActive={currentView === null}
          onClick={onResetView}
        />

        {/* 2. FAVORIS */}
        <NavItem 
          label="Favoris" 
          icon={<Bookmark size={24} />} 
          isActive={currentView === "saved"}
          onClick={() => onViewChange("saved")}
        />

        {/* 3. AJOUTER (Bouton Central Highlight) */}
        <button 
          onClick={() => router.push("/add-poi")}
          className="relative -top-6 flex flex-col items-center justify-center w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/40 transform active:scale-95 transition-all border-4 border-zinc-50 dark:border-zinc-950"
        >
          <Plus size={32} />
        </button>

        {/* 4. TRAJETS */}
        <NavItem 
          label="Trajets" 
          icon={<Route size={24} />} 
          isActive={currentView === "trips"}
          onClick={() => onViewChange("trips")}
        />

        {/* 5. MENU (Ouvre la Sidebar existante) */}
        <NavItem 
          label="Menu" 
          icon={<Menu size={24} />} 
          isActive={false} // Le menu est un tiroir, pas un état actif de la nav
          onClick={onOpenSidebar}
        />

      </nav>
    </div>
  );
};

// Sous-composant pour les boutons classiques
const NavItem = ({ label, icon, isActive, onClick }: any) => (
  <button 
    onClick={onClick}
    className={clsx(
      "flex flex-col items-center justify-center w-16 gap-1 transition-colors",
      isActive 
        ? "text-primary font-bold" 
        : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
    )}
  >
    <div className={clsx("transition-transform", isActive && "scale-110")}>
      {icon}
    </div>
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);