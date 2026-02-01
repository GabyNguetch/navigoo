import { SearchInput } from "./SearchInput";
import { CategoryBar } from "./CategoryBar";
import { Grip, UserCircle2, LogIn } from "lucide-react";
import { POI } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";

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
  recentPois
}: TopLayoutProps) => {

  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Vérification basique de l'authentification (à adapter avec ton vrai context si besoin)
  useEffect(() => {
    // Exemple : on vérifie si un token ou des infos user existent dans le localStorage
    const user = localStorage.getItem("navigoo_user"); 
    // OU pour simuler : const user = "ok";
    setIsAuthenticated(!!user);
  }, []);

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

      {/* 2. Bloc Catégories + Section Auth */}
      <div className="flex-1 flex items-center gap-2 min-w-0 pointer-events-auto pl-2">
        <div className="flex-1 min-w-0">
           <CategoryBar 
             selected={selectedCategory} 
             onSelect={onSelectCategory} 
           />
        </div>

        {/* --- SECTION AUTHENTIFICATION & PROFIL --- */}
        <div className="flex items-center gap-2 pl-2 pr-2">
           
           {isAuthenticated ? (
             /* === CAS CONNECTÉ === */
             <>
               <button className="p-2.5 rounded-full bg-white shadow-sm border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-700 hidden sm:block transition-colors">
                 <Grip size={20} className="text-zinc-600" />
               </button>
               
               <div 
                 onClick={() => {
                    // Optionnel: Logout ou aller vers profil
                    // localStorage.removeItem("navigoo_user");
                    // window.location.reload();
                 }}
                 className="relative cursor-pointer ml-1 w-10 h-10 rounded-full border-2 border-white bg-primary/10 flex items-center justify-center shadow-md hover:scale-105 transition-transform"
               >
                  {/* Tu pourras remplacer UserCircle2 par l'image de l'user s'il en a une */}
                  <UserCircle2 size={42} className="text-zinc-600 dark:text-zinc-300" />
               </div>
             </>
           ) : (
             /* === CAS DÉCONNECTÉ (Bouton Animé) === */
             <button
                onClick={() => router.push("/signin")}
                className={clsx(
                  "flex items-center gap-2 px-5 py-2.5 rounded-full",
                  "bg-primary text-white font-bold text-sm",
                  "shadow-lg shadow-primary/30 border border-primary/50",
                  "transform hover:scale-105 active:scale-95 transition-all duration-300",
                  "animate-[pulse_3s_ease-in-out_infinite]" // Petite animation pulse subtile
                )}
             >
                <LogIn size={18} className="stroke-[3]" />
                <span className="whitespace-nowrap hidden sm:inline">Se connecter</span>
             </button>
           )}

        </div>
      </div>
    </div>
  );
};