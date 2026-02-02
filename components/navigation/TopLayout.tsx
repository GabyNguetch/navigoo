"use client";

import { SearchInput } from "./SearchInput";
import { CategoryBar } from "./CategoryBar";
import { Grip, UserCircle2, LogIn, LayoutDashboard } from "lucide-react";
import { POI, AppUser } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authService } from "@/services/authService";
import { clsx } from "clsx";

interface TopLayoutProps {
  onToggleSidebar: () => void;
  allPois: POI[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onSearch: (query: string) => void;
  onSelectResult: (poi: POI) => void;
  onLocateMe: () => void;
  recentSearches: string[];
  recentPois: POI[];
}

export const TopLayout = ({
  onToggleSidebar,
  allPois,
  selectedCategory,
  onSelectCategory,
  onSearch,
  onLocateMe,
  onSelectResult,
  recentSearches,
  recentPois,
}: TopLayoutProps) => {
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    // Récupération réelle de la session via le service
    const session = authService.getSession();
    setUser(session);
  }, []);

  const handleProfileClick = () => {
    if (user?.role === "SUPER_ADMIN") {
      router.push("/admin");
    } else {
      router.push("/profile");
    }
  };

  return (
    <div className="absolute top-0 left-0 w-full z-40 p-2 md:p-4 pointer-events-none flex flex-col md:flex-row items-start gap-3">
      
      {/* 1. BLOC RECHERCHE - Largeur fixe sur PC, Full sur mobile */}
      <div className="ml-16 pointer-events-auto w-full md:w-[380px] lg:w-[320px] shrink-0">
        <SearchInput
          onMenuClick={onToggleSidebar}
          pois={allPois}
          onSearch={onSearch}
          onSelectResult={onSelectResult}
          onLocateMe={onLocateMe}
          recentSearches={recentSearches}
          recentPois={recentPois}
          className="shadow-xl"
        />
      </div>

      {/* 2. BLOC CATÉGORIES ET AUTH - S'adapte au reste de l'espace */}
      <div className="flex-1 flex items-center justify-between gap-2 w-full pointer-events-auto overflow-hidden">
        
        {/* Barre de Catégories : Visible principalement sur Desktop/Tablet */}
        <div className="flex-1 hidden sm:block min-w-0">
          <CategoryBar
            selected={selectedCategory}
            onSelect={onSelectCategory}
          />
        </div>

        {/* SECTION UTILISATEUR / ACTIONS */}
        <div className="flex items-center gap-2 ml-auto pr-1 md:pr-0">
          
          {user ? (
            /* --- CAS CONNECTÉ --- */
            <div className="flex items-center gap-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-lg">
              
              {/* Bouton Raccourci Admin (Optionnel) */}
              {user.role === "SUPER_ADMIN" && (
                <button 
                  onClick={() => router.push("/admin")}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-600 dark:text-zinc-400 hidden lg:block"
                  title="Panel Admin"
                >
                  <LayoutDashboard size={20} />
                </button>
              )}

              {/* Grip / Menu Applications (Style Google) */}
              <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-600 dark:text-zinc-400 hidden md:block">
                <Grip size={20} />
              </button>

              {/* Avatar et Lien Profil */}
              <button
                onClick={handleProfileClick}
                className={clsx(
                  "relative group flex items-center justify-center",
                  "w-9 h-9 rounded-full overflow-hidden transition-all duration-300",
                  "border-2 border-primary/20 hover:border-primary active:scale-95 shadow-inner"
                )}
              >
                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                  <UserCircle2 size={38} className="text-primary/70 group-hover:scale-110 transition-transform" />
                </div>
                {/* On peut ajouter l'initiale de l'utilisateur par dessus si pas de photo */}
                <span className="relative z-10 text-[10px] font-black text-primary pointer-events-none">
                   {user.username.charAt(0).toUpperCase()}
                </span>
              </button>
            </div>
          ) : (
            /* --- CAS DÉCONNECTÉ --- */
            <button
              onClick={() => router.push("/signin")}
              className={clsx(
                "group relative flex items-center gap-2 px-6 py-2.5 rounded-full overflow-hidden",
                "bg-primary text-white font-bold text-sm",
                "shadow-lg shadow-primary/30",
                "transition-all duration-300 hover:shadow-primary/50 hover:scale-[1.03] active:scale-95"
              )}
            >
              {/* Effet Brillance / Hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              
              <LogIn size={18} className="stroke-[3]" />
              <span className="whitespace-nowrap">Connexion</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};