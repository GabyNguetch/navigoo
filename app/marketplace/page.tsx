"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  MapPin, Search, Filter, Star, TrendingUp, Users, 
  FileText, Mic, Grid, List, X, ChevronRight,
  Phone, Globe, Clock, Navigation, Heart, MessageCircle,
  Building2, Utensils, Hotel, ShoppingBag, Coffee, Landmark
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { poiService } from "@/services/poiService";
import { reviewService } from "@/services/reviewService";
import { contentService } from "@/services/contentService";
import { UserAPI } from "@/services/adminService";
import { POI } from "@/types";
import dynamic from "next/dynamic";

// Import dynamique de la carte pour éviter les erreurs SSR
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

interface PoiWithStats extends POI {
  averageRating: number;
  reviewCount: number;
  blogCount: number;
  podcastCount: number;
}

const CATEGORIES = [
  { id: "ALL", label: "Tous", icon: Grid },
  { id: "FOOD_DRINK", label: "Restaurants", icon: Utensils },
  { id: "ACCOMMODATION", label: "Hébergement", icon: Hotel },
  { id: "SHOPPING", label: "Shopping", icon: ShoppingBag },
  { id: "ENTERTAINMENT", label: "Loisirs", icon: Coffee },
  { id: "SERVICES", label: "Services", icon: Building2 },
  { id: "TOURISM", label: "Tourisme", icon: Landmark },
];

export default function MarketplacePage() {
  const [pois, setPois] = useState<PoiWithStats[]>([]);
  const [filteredPois, setFilteredPois] = useState<PoiWithStats[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [selectedPoi, setSelectedPoi] = useState<PoiWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([7.3697, 13.5833]); // Ngaoundéré

  useEffect(() => {
    loadMarketplaceData();
  }, []);

  useEffect(() => {
    filterPois();
  }, [selectedCategory, searchQuery, pois]);

  const loadMarketplaceData = async () => {
    try {
      setLoading(true);
      
      // Charger tous les POIs
      const allPois = await poiService.getAllPois();
      
      // Enrichir chaque POI avec ses statistiques
      const enrichedPois = await Promise.all(
        allPois.map(async (poi) => {
          try {
            const stats = await reviewService.getPoiStats(poi.poi_id);
            const blogs = await contentService.getBlogsByPoiId(poi.poi_id);
            const podcasts = await contentService.getPodcastsByPoiId(poi.poi_id);
            
            return {
              ...poi,
              averageRating: stats.averageRating,
              reviewCount: stats.reviewCount,
              blogCount: blogs.length,
              podcastCount: podcasts.length,
            };
          } catch (error) {
            return {
              ...poi,
              averageRating: 0,
              reviewCount: 0,
              blogCount: 0,
              podcastCount: 0,
            };
          }
        })
      );

      setPois(enrichedPois);
      
      // Charger les utilisateurs
      const allUsers = await UserAPI.getAll();
      setUsers(allUsers);
      
    } catch (error) {
      console.error("Erreur chargement marketplace:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterPois = () => {
    let filtered = [...pois];

    // Filtre par catégorie
    if (selectedCategory !== "ALL") {
      filtered = filtered.filter(poi => poi.poi_category === selectedCategory);
    }

    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(poi => 
        poi.poi_name?.toLowerCase().includes(query) ||
        poi.address_city?.toLowerCase().includes(query) ||
        poi.poi_description?.toLowerCase().includes(query)
      );
    }

    setFilteredPois(filtered);
  };

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES.find(c => c.id === category);
    return cat?.icon || MapPin;
  };

  const openPoiDetails = (poi: PoiWithStats) => {
    setSelectedPoi(poi);
    if (poi.location) {
      setMapCenter([poi.location.latitude, poi.location.longitude]);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-black mb-4">
              Marketplace Navigoo
            </h1>
            <p className="text-xl text-white/90">
              Découvrez {pois.length} lieux exceptionnels et {users.length} contributeurs
            </p>
          </motion.div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-black text-primary">{pois.length}</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Lieux</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-purple-600">{users.length}</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Utilisateurs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-green-600">
                {pois.reduce((sum, poi) => sum + poi.blogCount, 0)}
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Blogs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-orange-600">
                {pois.reduce((sum, poi) => sum + poi.podcastCount, 0)}
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Podcasts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="sticky top-0 bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Barre de recherche */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un lieu, une ville..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                onClick={() => setViewMode("grid")}
                className="gap-2"
              >
                <Grid size={18} />
                Grille
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                onClick={() => setViewMode("list")}
                className="gap-2"
              >
                <List size={18} />
                Liste
              </Button>
              <Button
                variant={viewMode === "map" ? "default" : "outline"}
                onClick={() => setViewMode("map")}
                className="gap-2"
              >
                <MapPin size={18} />
                Carte
              </Button>
            </div>
          </div>

          {/* Catégories */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? "bg-primary text-white"
                      : "bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  }`}
                >
                  <Icon size={16} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-zinc-600 dark:text-zinc-400">Chargement des lieux...</p>
          </div>
        ) : (
          <>
            {/* Vue Grille */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPois.map((poi) => (
                  <PoiCard key={poi.poi_id} poi={poi} onSelect={openPoiDetails} />
                ))}
              </div>
            )}

            {/* Vue Liste */}
            {viewMode === "list" && (
              <div className="space-y-4">
                {filteredPois.map((poi) => (
                  <PoiListItem key={poi.poi_id} poi={poi} onSelect={openPoiDetails} />
                ))}
              </div>
            )}

            {/* Vue Carte */}
            {viewMode === "map" && (
              <div className="h-[600px] rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                <MapContainer
                  center={mapCenter}
                  zoom={13}
                  className="h-full w-full"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />
                  {filteredPois.map((poi) => (
                    poi.location && (
                      <Marker
                        key={poi.poi_id}
                        position={[poi.location.latitude, poi.location.longitude]}
                        eventHandlers={{
                          click: () => openPoiDetails(poi)
                        }}
                      >
                        <Popup>
                          <div className="p-2">
                            <h3 className="font-bold">{poi.poi_name}</h3>
                            <p className="text-sm text-zinc-600">{poi.address_city}</p>
                          </div>
                        </Popup>
                      </Marker>
                    )
                  ))}
                </MapContainer>
              </div>
            )}

            {filteredPois.length === 0 && (
              <div className="text-center py-20">
                <MapPin size={48} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
                <h3 className="text-xl font-bold mb-2">Aucun lieu trouvé</h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Essayez de modifier vos filtres ou votre recherche
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal détails POI */}
      {selectedPoi && (
        <PoiDetailsModal poi={selectedPoi} onClose={() => setSelectedPoi(null)} />
      )}
    </div>
  );
}

// Composant carte POI
function PoiCard({ poi, onSelect }: { poi: PoiWithStats; onSelect: (poi: PoiWithStats) => void }) {
  const Icon = poi.poi_category ? getCategoryIcon(poi.poi_category) : MapPin;
  
  function getCategoryIcon(category: string) {
    const cat = CATEGORIES.find(c => c.id === category);
    return cat?.icon || MapPin;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group cursor-pointer"
      onClick={() => onSelect(poi)}
    >
      <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:shadow-2xl transition-all">
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-primary/10 to-purple-500/10">
          {poi.poi_images_urls && poi.poi_images_urls[0] ? (
            <img 
              src={poi.poi_images_urls[0]} 
              alt={poi.poi_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon size={48} className="text-zinc-300 dark:text-zinc-700" />
            </div>
          )}
          
          {poi.averageRating > 0 && (
            <div className="absolute top-4 right-4 bg-white dark:bg-zinc-900 px-3 py-1 rounded-full flex items-center gap-1">
              <Star size={14} className="text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-sm">{poi.averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
            {poi.poi_name}
          </h3>
          
          <p className="text-sm text-zinc-500 mb-3 flex items-center gap-1">
            <MapPin size={14} />
            {poi.address_city || "Ville non spécifiée"}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
              {poi.poi_category?.replace('_', ' ')}
            </span>
            
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              {poi.blogCount > 0 && (
                <span className="flex items-center gap-1">
                  <FileText size={12} />
                  {poi.blogCount}
                </span>
              )}
              {poi.podcastCount > 0 && (
                <span className="flex items-center gap-1">
                  <Mic size={12} />
                  {poi.podcastCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Composant liste POI
function PoiListItem({ poi, onSelect }: { poi: PoiWithStats; onSelect: (poi: PoiWithStats) => void }) {
  const Icon = poi.poi_category ? getCategoryIcon(poi.poi_category) : MapPin;
  
  function getCategoryIcon(category: string) {
    const cat = CATEGORIES.find(c => c.id === category);
    return cat?.icon || MapPin;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 hover:shadow-lg transition-all cursor-pointer"
      onClick={() => onSelect(poi)}
    >
      <div className="flex gap-4">
        <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-xl shrink-0 flex items-center justify-center">
          {poi.poi_images_urls && poi.poi_images_urls[0] ? (
            <img 
              src={poi.poi_images_urls[0]} 
              alt={poi.poi_name}
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <Icon size={32} className="text-zinc-300 dark:text-zinc-700" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-lg line-clamp-1">{poi.poi_name}</h3>
            {poi.averageRating > 0 && (
              <div className="flex items-center gap-1 shrink-0">
                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                <span className="font-bold text-sm">{poi.averageRating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <p className="text-sm text-zinc-500 mb-2 flex items-center gap-1">
            <MapPin size={14} />
            {poi.address_city || "Ville non spécifiée"}
          </p>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
              {poi.poi_category?.replace('_', ' ')}
            </span>
            
            {poi.reviewCount > 0 && (
              <span className="text-xs text-zinc-400">{poi.reviewCount} avis</span>
            )}
            
            {poi.blogCount > 0 && (
              <span className="text-xs text-zinc-400 flex items-center gap-1">
                <FileText size={12} />
                {poi.blogCount}
              </span>
            )}
            
            {poi.podcastCount > 0 && (
              <span className="text-xs text-zinc-400 flex items-center gap-1">
                <Mic size={12} />
                {poi.podcastCount}
              </span>
            )}
          </div>
        </div>

        <ChevronRight className="text-zinc-400 shrink-0" />
      </div>
    </motion.div>
  );
}

// Modal détails POI
function PoiDetailsModal({ poi, onClose }: { poi: PoiWithStats; onClose: () => void }) {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    loadPoiContent();
  }, [poi.poi_id]);

  const loadPoiContent = async () => {
    try {
      const [blogsData, podcastsData, reviewsData] = await Promise.all([
        contentService.getBlogsByPoiId(poi.poi_id),
        contentService.getPodcastsByPoiId(poi.poi_id),
        reviewService.getReviewsByPoi(poi.poi_id),
      ]);
      
      setBlogs(blogsData);
      setPodcasts(podcastsData);
      setReviews(reviewsData);
    } catch (error) {
      console.error("Erreur chargement contenu POI:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-zinc-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-black">{poi.poi_name}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6 space-y-6">
          {/* Image principale */}
          {poi.poi_images_urls && poi.poi_images_urls[0] && (
            <div className="h-64 rounded-2xl overflow-hidden">
              <img 
                src={poi.poi_images_urls[0]} 
                alt={poi.poi_name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Infos principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <MapPin className="text-primary shrink-0 mt-1" size={20} />
              <div>
                <div className="font-medium">Adresse</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  {poi.address_informal || poi.address_city || "Non spécifiée"}
                </div>
              </div>
            </div>

            {poi.poi_contacts?.phone && (
              <div className="flex items-start gap-3">
                <Phone className="text-primary shrink-0 mt-1" size={20} />
                <div>
                  <div className="font-medium">Téléphone</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    {poi.poi_contacts.phone}
                  </div>
                </div>
              </div>
            )}

            {poi.poi_contacts?.website && (
              <div className="flex items-start gap-3">
                <Globe className="text-primary shrink-0 mt-1" size={20} />
                <div>
                  <div className="font-medium">Site web</div>
                  <a 
                    href={poi.poi_contacts.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Visiter
                  </a>
                </div>
              </div>
            )}

            {poi.averageRating > 0 && (
              <div className="flex items-start gap-3">
                <Star className="text-yellow-500 fill-yellow-500 shrink-0 mt-1" size={20} />
                <div>
                  <div className="font-medium">Note moyenne</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    {poi.averageRating.toFixed(1)} / 5 ({poi.reviewCount} avis)
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {poi.poi_description && (
            <div>
              <h3 className="font-bold text-lg mb-2">Description</h3>
              <p className="text-zinc-600 dark:text-zinc-400">{poi.poi_description}</p>
            </div>
          )}

          {/* Blogs */}
          {blogs.length > 0 && (
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <FileText className="text-primary" />
                Blogs ({blogs.length})
              </h3>
              <div className="space-y-2">
                {blogs.map((blog) => (
                  <Link
                    key={blog.blog_id}
                    href={`/blogs/${blog.blog_id}`}
                    className="block p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <div className="font-medium">{blog.title}</div>
                    <div className="text-sm text-zinc-500">
                      {new Date(blog.created_at).toLocaleDateString()}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Podcasts */}
          {podcasts.length > 0 && (
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Mic className="text-purple-600" />
                Podcasts ({podcasts.length})
              </h3>
              <div className="space-y-2">
                {podcasts.map((podcast) => (
                  <Link
                    key={podcast.podcast_id}
                    href={`/podcasts/${podcast.podcast_id}`}
                    className="block p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <div className="font-medium">{podcast.title}</div>
                    <div className="text-sm text-zinc-500">
                      {Math.floor(podcast.duration_seconds / 60)} min
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <Link href={`/poi/${poi.poi_id}`} className="flex-1">
              <Button className="w-full gap-2">
                <Navigation size={18} />
                Voir les détails complets
              </Button>
            </Link>
            <Button variant="outline" className="gap-2">
              <Heart size={18} />
            </Button>
            <Button variant="outline" className="gap-2">
              <MessageCircle size={18} />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}