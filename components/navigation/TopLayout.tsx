import { SearchInput } from "./SearchInput";
import { CategoryBar } from "./CategoryBar";
import { Grip, UserCircle2 } from "lucide-react";
import { POI } from "@/types";

interface TopLayoutProps {
  onToggleSidebar: () => void;
  // Nouvelles props de data
  allPois: POI[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onSearch: (query: string) => void;
  onSelectResult: (poi: POI) => void;
  onLocateMe: () => void; // Nouvelle prop
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
  recentPois
}: TopLayoutProps) => {

  return (
    <div className="absolute top-0 ml-18 left-0 w-full z-40 bg-transparent p-2 pointer-events-none flex items-start gap-2">
      
      {/* Bloc Recherche */}
      <div className="pointer-events-auto min-w-[340px] max-w-[420px] shrink-0">
        <SearchInput 
          onMenuClick={onToggleSidebar}
          pois={allPois}
          onSearch={onSearch}
          onSelectResult={onSelectResult}
          onLocateMe={onLocateMe}
          recentSearches={recentSearches}
          recentPois={recentPois}
        />
      </div>

      {/* 2. Bloc Catégories + Profil */}
      <div className="flex-1 flex items-center gap-2 min-w-0 pointer-events-auto pl-2">
        <div className="flex-1 min-w-0">
           <CategoryBar 
             selected={selectedCategory} 
             onSelect={onSelectCategory} 
           />
        </div>

        {/* Profil etc... (Code inchangé pour la partie droite) */}
        <div className="flex items-center gap-1 pl-2 bg-white/0 rounded-full pr-2">
           <button className="p-2.5 rounded-full bg-white shadow-sm border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-700 hidden sm:block">
             <Grip size={20} className="text-zinc-600" />
           </button>
           <div className="relative cursor-pointer ml-1 w-10 h-10 rounded-full border-2 border-white bg-primary/10 flex items-center justify-center shadow-md">
              <UserCircle2 size={42} className="text-zinc-600" />
           </div>
        </div>
      </div>
    </div>
  );
};