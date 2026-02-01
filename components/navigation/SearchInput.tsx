import { Search, Menu, X, ArrowRight, History, MapPin, Navigation2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import { POI } from "@/types";
import { poiService } from "@/services/poiService";

interface SearchInputProps {
  onMenuClick: () => void;
  className?: string;
  pois: POI[]; // Peut servir de cache ou fallback, mais la recherche principale est via API
  onSearch: (query: string) => void;
  onSelectResult: (poi: POI) => void;
  onLocateMe: () => void;
  recentSearches: string[];
  recentPois: POI[];
}

export const SearchInput = ({ 
  onMenuClick, 
  className, 
  pois, 
  onLocateMe,
  onSearch, 
  onSelectResult,
  recentSearches, 
  recentPois 
}: SearchInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState("");
  
  // State pour les résultats de l'API (Live Search)
  const [suggestions, setSuggestions] = useState<POI[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // --- LIVE SEARCH AVEC DEBOUNCE SUR LE BACKEND ---
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length === 0) {
        setSuggestions([]);
        return;
      }

      try {
        // Appel au endpoint GET /api/pois/name/{name}
        const results = await poiService.searchPoisByName(query);
        // On limite à 5 résultats pour l'affichage dropdown
        setSuggestions(results ? results.slice(0, 5) : []);
      } catch (error) {
        console.error("Erreur recherche backend:", error);
        setSuggestions([]); 
        // Optionnel : Fallback sur le filtre client si le backend échoue
        // setSuggestions(pois.filter(p => p.poi_name.toLowerCase().includes(query.toLowerCase())).slice(0, 5));
      }
    };

    // Délai de 300ms pour éviter de spammer l'API à chaque lettre
    const timeoutId = setTimeout(fetchSuggestions, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    onSearch(query);
    setIsFocused(false);
    inputRef.current?.blur();
  };

  const handleSelectPoi = (poi: POI) => {
    setQuery(poi.poi_name);
    onSelectResult(poi); // Zoom sur la carte et ouvre details
    setIsFocused(false);
  };

  return (
    <div className={clsx("relative z-50", className)}>
            <form 
        onSubmit={handleSearchSubmit}
        className={clsx(
          "flex items-center bg-white dark:bg-zinc-800 h-11 border border-zinc-200 dark:border-zinc-700 transition-shadow",
          isFocused ? "rounded-t-[24px] rounded-b-none shadow-lg border-b-0" : "rounded-full shadow-sm hover:shadow-md"
        )}
      >
        <button 
          type="button"
          onClick={onMenuClick}
          className="pl-3 pr-2 text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
        >
          {isFocused ? <Search size={20} /> : <Menu size={20} />}
        </button>

        <input 
          ref={inputRef}
          type="text" 
          placeholder="Rechercher ici..."
          className="flex-1 bg-transparent border-none outline-none text-[15px] text-zinc-900 dark:text-zinc-100 px-2 truncate font-normal"
          value={query}
          onFocus={() => setIsFocused(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            // Si on efface tout, on déclenche une recherche vide pour reset la vue parente si besoin
            if (e.target.value === "") onSearch("");
          }}
        />

        <div className="flex items-center gap-1 pr-1.5">
          {query && (
            <button 
              type="button" 
              onClick={() => { setQuery(""); onSearch(""); setSuggestions([]); }} 
              className="p-2 text-zinc-500 hover:text-black"
            >
              <X size={18} />
            </button>
          )}
          
          <div className="h-6 w-px bg-zinc-300 dark:bg-zinc-600 mx-1"></div>
          
          {/* BOUTON LOCALISATION (Flèche Violette) */}
          <button 
            type="button" 
            onClick={onLocateMe}
            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full group transition-colors"
            title="Me localiser"
          >
             <div className="w-7 h-7 bg-primary flex items-center justify-center rounded-full text-white shadow-sm group-hover:scale-105 transition-transform">
                <Navigation2 size={14} className="-rotate-45" fill="currentColor" />
             </div>
          </button>
        </div>
      </form>

      {/* --- MENU DÉROULANT --- */}
      {isFocused && (
        <>
          <div 
            className="fixed inset-0 bg-transparent z-[-1]" 
            onClick={() => setIsFocused(false)} 
          />
          <div className="absolute top-full left-0 w-full bg-white dark:bg-zinc-800 rounded-b-[24px] shadow-lg border-t-0 border border-zinc-200 dark:border-zinc-700 pb-2 overflow-hidden">
             
             {/* CAS 1 : SUGGESTIONS AUTOCOMPLÉTION (Recherche active via BACKEND) */}
             {query.length > 0 && (
                <div className="pt-2">
                  {suggestions.length > 0 ? (
                    suggestions.map(poi => (
                      <SuggestionItem 
                        key={poi.poi_id}
                        icon={<MapPin size={18} />} 
                        title={poi.poi_name} 
                        subtitle={poi.address_city} 
                        onClick={() => handleSelectPoi(poi)}
                        isLocation
                      />
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-zinc-500 italic">Aucun résultat trouvé</div>
                  )}
                </div>
             )}

             {/* CAS 2 : HISTORIQUE (Champ vide) */}
             {query.length === 0 && (
                <div className="pt-1">
                  <div className="px-4 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Récents</div>
                  
                  {/* 3 Dernières Recherches (String) */}
                  {recentSearches.map((term, i) => (
                    <SuggestionItem 
                      key={`hist-${i}`}
                      icon={<History size={18} />} 
                      title={term} 
                      onClick={() => { setQuery(term); onSearch(term); setIsFocused(false); }}
                    />
                  ))}

                  {/* 2 Derniers POIs Vus (Objets) */}
                  {recentPois.map((poi) => (
                    <SuggestionItem 
                      key={`recent-poi-${poi.poi_id}`}
                      icon={<Navigation2 size={18} className="text-primary" />} 
                      title={poi.poi_name} 
                      subtitle={`${poi.poi_category} • Consulté récemment`}
                      onClick={() => handleSelectPoi(poi)}
                    />
                  ))}
                </div>
             )}
          </div>
        </>
      )}
    </div>
  );
};

// Item générique de la liste
const SuggestionItem = ({ icon, title, subtitle, onClick, isLocation }: any) => (
  <div 
    onClick={onClick}
    className="flex items-center gap-4 py-3 px-4 hover:bg-zinc-50 dark:hover:bg-zinc-700 cursor-pointer transition-colors"
  >
    <div className={clsx(
      "w-9 h-9 min-w-9 rounded-full flex items-center justify-center",
      isLocation ? "bg-white border border-zinc-200" : "bg-zinc-100 dark:bg-zinc-900"
    )}>
      <span className="text-zinc-500 dark:text-zinc-400">{icon}</span>
    </div>
    <div className="flex flex-col overflow-hidden">
      <span className={clsx("text-[15px] truncate font-medium text-zinc-800 dark:text-zinc-100")}>
        {title}
      </span>
      {subtitle && <span className="text-zinc-500 text-xs truncate">{subtitle}</span>}
    </div>
  </div>
);