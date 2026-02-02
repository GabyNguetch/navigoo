"use client";

import { Search, Menu, X, History, MapPin, Navigation2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import { POI } from "@/types";
import { poiService } from "@/services/poiService";

interface SearchInputProps {
  onMenuClick: () => void;
  className?: string;
  pois: POI[]; // Liste complète pour fallback
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
  const [suggestions, setSuggestions] = useState<POI[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // --- LIVE SEARCH AVEC DEBOUNCE & BACKEND SEARCH GLOBAL ---
  useEffect(() => {
    const fetchSuggestions = async () => {
      // Si la recherche est vide ou trop courte
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        // Appeler la méthode searchGlobal (Recherche Backend sur Nom/Ville/Keywords)
        // Note: Assurez-vous d'avoir implémenté searchGlobal dans votre poiService.ts
        const results = await poiService.searchGlobal(query);
        
        if (results && results.length > 0) {
            setSuggestions(results.slice(0, 8));
        } else {
            // Fallback sur le filtrage local si le serveur ne renvoie rien
            throw new Error("Aucun résultat backend");
        }
      } catch (err) {
        // Fallback local intelligent sur Nom, Ville ou Tags
        const lowerQuery = query.toLowerCase();
        const localResults = pois.filter(p => 
          p.poi_name?.toLowerCase().includes(lowerQuery) ||
          p.address_city?.toLowerCase().includes(lowerQuery) ||
          p.poi_keywords?.some(k => k.toLowerCase().includes(lowerQuery))
        );
        setSuggestions(localResults.slice(0, 8));
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [query, pois]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim()) {
        onSearch(query);
        setIsFocused(false);
        inputRef.current?.blur();
    }
  };

  const handleSelectPoi = (poi: POI) => {
    setQuery(poi.poi_name);
    onSelectResult(poi); 
    setIsFocused(false);
    inputRef.current?.blur();
  };

  return (
    <div className={clsx("relative z-50", className)}>
      <form
        onSubmit={handleSearchSubmit}
        className={clsx(
          "flex items-center bg-white dark:bg-zinc-900 h-12 border border-zinc-200 dark:border-zinc-800 transition-all duration-200",
          isFocused ? "rounded-t-[24px] rounded-b-none shadow-2xl border-b-0" : "rounded-full shadow-lg hover:shadow-xl"
        )}
      >
        <button
          type="button"
          onClick={onMenuClick}
          className="pl-4 pr-2 text-zinc-500 hover:text-primary dark:text-zinc-400 dark:hover:text-primary transition-colors"
        >
          {isFocused ? <Search size={20} /> : <Menu size={22} />}
        </button>

        <input
          ref={inputRef}
          type="text"
          placeholder="Rechercher un lieu, une ville ou un tag..."
          className="flex-1 bg-transparent border-none outline-none text-[15px] text-zinc-900 dark:text-zinc-100 px-2 truncate font-medium"
          value={query}
          onFocus={() => setIsFocused(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value === "") onSearch("");
          }}
        />

        <div className="flex items-center gap-1 pr-2">
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(""); onSearch(""); setSuggestions([]); }}
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X size={18} />
            </button>
          )}

          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1"></div>

          <button
            type="button"
            onClick={(e) => { e.preventDefault(); onLocateMe(); }}
            className="p-1.5 hover:bg-primary/10 rounded-full group transition-all"
            title="Ma position"
          >
            <div className="w-8 h-8 bg-primary flex items-center justify-center rounded-full text-white shadow-md group-hover:scale-105 group-active:scale-95 transition-transform">
              <Navigation2 size={16} className="-rotate-45" fill="currentColor" />
            </div>
          </button>
        </div>
      </form>

      {/* --- MENU DÉROULANT --- */}
      {isFocused && (
        <>
          <div className="fixed inset-0 bg-black/5 dark:bg-white/5 z-[-1]" onClick={() => setIsFocused(false)} />
          <div className="absolute top-full left-0 w-full bg-white dark:bg-zinc-900 rounded-b-[24px] shadow-2xl border border-t-0 border-zinc-200 dark:border-zinc-800 pb-3 max-h-[70vh] overflow-y-auto">
            
            {/* SUGGESTIONS LIVE (Backend Results) */}
            {query.length >= 2 && (
              <div className="pt-2">
                {suggestions.length > 0 ? (
                  suggestions.map(poi => (
                    <SuggestionItem
                      key={poi.poi_id}
                      icon={<MapPin size={18} />}
                      title={poi.poi_name}
                      subtitle={`${poi.poi_category} • ${poi.address_city}`}
                      onClick={() => handleSelectPoi(poi)}
                      isLocation
                    />
                  ))
                ) : (
                  <div className="px-6 py-4 text-sm text-zinc-400 italic">Aucun résultat pour cette recherche...</div>
                )}
              </div>
            )}

            {/* HISTORIQUE ET RECENTS (Quand le champ est vide) */}
            {query.length < 2 && (
              <div className="pt-2">
                {recentSearches.length > 0 && (
                  <div className="mb-2">
                    <div className="px-6 py-2 text-[11px] font-bold text-zinc-400 uppercase tracking-[0.1em]">Recherches passées</div>
                    {recentSearches.slice(0, 3).map((term, i) => (
                      <SuggestionItem
                        key={`hist-${i}`}
                        icon={<History size={18} />}
                        title={term}
                        onClick={() => { setQuery(term); onSearch(term); setIsFocused(false); }}
                      />
                    ))}
                  </div>
                )}

                {recentPois.length > 0 && (
                  <div>
                    <div className="px-6 py-2 text-[11px] font-bold text-zinc-400 uppercase tracking-[0.1em]">Lieux consultés</div>
                    {recentPois.slice(0, 3).map((poi) => (
                      <SuggestionItem
                        key={`recent-poi-${poi.poi_id}`}
                        icon={<MapPin size={18} className="text-primary" />}
                        title={poi.poi_name}
                        subtitle={`${poi.poi_category} • ${poi.address_city}`}
                        onClick={() => handleSelectPoi(poi)}
                      />
                    ))}
                  </div>
                )}

                {recentSearches.length === 0 && recentPois.length === 0 && (
                   <div className="px-6 py-4 text-center">
                        <p className="text-sm text-zinc-400 font-medium italic">Commencez à explorer...</p>
                   </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// --- COMPOSANT INTERNE SUGGESTION ---
const SuggestionItem = ({ icon, title, subtitle, onClick, isLocation }: any) => (
  <div
    onClick={onClick}
    className="flex items-center gap-4 py-3 px-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors group"
  >
    <div className={clsx(
      "w-9 h-9 min-w-[36px] rounded-xl flex items-center justify-center transition-colors",
      isLocation ? "bg-primary/10 text-primary" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
    )}>
      {icon}
    </div>
    <div className="flex flex-col overflow-hidden">
      <span className="text-[14px] font-bold text-zinc-800 dark:text-zinc-100 truncate group-hover:text-primary transition-colors">
        {title}
      </span>
      {subtitle && <span className="text-[12px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">{subtitle}</span>}
    </div>
  </div>
);