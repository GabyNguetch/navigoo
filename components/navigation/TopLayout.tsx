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
      </div>
    </div>
  );
};