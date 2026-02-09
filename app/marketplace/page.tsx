"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  MapPin, Search, Filter, Star, TrendingUp, Users, 
  FileText, Mic, Grid, List, X, ChevronRight,
  Phone, Globe, Clock, Navigation, Heart, MessageCircle,
  Building2, Utensils, Hotel, ShoppingBag, Coffee, Landmark,
  ExternalLink, HandCoins, Car, Truck, PenTool, StoreIcon, Settings
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

interface BlogWithAuthor {
  blog_id: string;
  title: string;
  content: string;
  cover_image_url?: string;
  user_id: string;
  poi_id: string;
  created_at: string;
  views: number;
  likes: number;
  author?: string;
  poiName?: string;
}

interface PodcastWithDetails {
  podcast_id: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  audio_file_url: string;
  duration_seconds: number;
  user_id: string;
  poi_id: string;
  created_at: string;
  plays: number;
  likes: number;
  poiName?: string;
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

const TRAMASYS_SERVICES = [
  { 
    name: "FareCalculator", 
    desc: "Calculez vos tarifs de course instantanément", 
    link: "https://fare-calculator-front.vercel.app/en", 
    color: "from-blue-500 to-cyan-500",
    icon: HandCoins
  },
  { 
    name: "RidenGo", 
    desc: "Application de covoiturage moderne", 
    link: "https://ride-go-web.vercel.app/", 
    color: "from-green-500 to-emerald-500",
    icon: Car
  },
  { 
    name: "Fleet Management", 
    desc: "Gérez votre flotte de véhicules", 
    link: "https://fleet-management-tramasys.vercel.app/", 
    color: "from-orange-500 to-red-500",
    icon: Truck
  },
  { 
    name: "Freelance Driver", 
    desc: "Plateforme pour chauffeurs indépendants", 
    link: "https://freelance-driver.vercel.app", 
    color: "from-purple-500 to-pink-500",
    icon: PenTool
  },
  { 
    name: "Syndicat", 
    desc: "Gestion des organisations de transport", 
    link: "https://ugates.vercel.app/fr", 
    color: "from-indigo-500 to-blue-500",
    icon: StoreIcon
  },
  { 
    name: "Navigoo API", 
    desc: "Intégrez nos services dans vos apps", 
    link: "/pricing", 
    color: "from-primary to-purple-600",
    icon: Settings
  },
];

export default function MarketplacePage() {
  const [pois, setPois] = useState<PoiWithStats[]>([]);
  const [blogs, setBlogs] = useState<BlogWithAuthor[]>([]);
  const [podcasts, setPodcasts] = useState<PodcastWithDetails[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [filteredPois, setFilteredPois] = useState<PoiWithStats[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [selectedPoi, setSelectedPoi] = useState<PoiWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([7.3697, 13.5833]);

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
      
      // Charger les blogs
      const allBlogs = contentService.getAllBlogs();
      const blogsWithDetails = await Promise.all(
        allBlogs.map(async (blog) => {
          try {
            const poi = await poiService.getPoiById(blog.poi_id);
            return {
              ...blog,
              poiName: poi.poi_name,
            };
          } catch {
            return {
              ...blog,
              poiName: "Lieu inconnu",
            };
          }
        })
      );
      setBlogs(blogsWithDetails);

      // Charger les podcasts
      const allPodcasts = contentService.getAllPodcasts();
      const podcastsWithDetails = await Promise.all(
        allPodcasts.map(async (podcast) => {
          try {
            const poi = await poiService.getPoiById(podcast.poi_id);
            return {
              ...podcast,
              poiName: poi.poi_name,
            };
          } catch {
            return {
              ...podcast,
              poiName: "Lieu inconnu",
            };
          }
        })
      );
      setPodcasts(podcastsWithDetails);
      
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

    if (selectedCategory !== "ALL") {
      filtered = filtered.filter(poi => poi.poi_category === selectedCategory);
    }

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

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Il y a quelques minutes";
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return "Il y a 1j";
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Hero Section avec image de fond */}
      <div className="relative h-[70vh] overflow-hidden">
        {/* Image de fond */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1519904981063-b0cf448d479e?q=80&w=2070')",
          }}
        >
          {/* Overlay gradient violet */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/95 via-primary/90 to-purple-800/95" />
        </div>

        {/* Contenu */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-black text-white mb-6">
                Marketplace Navigoo
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
                Découvrez {pois.length} lieux exceptionnels, {blogs.length} blogs, {podcasts.length} podcasts et {users.length} contributeurs
              </p>
              
              {/* Statistiques rapides */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-12">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
                >
                  <div className="text-4xl font-black text-white mb-2">{pois.length}</div>
                  <div className="text-sm text-white/80">Lieux</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
                >
                  <div className="text-4xl font-black text-white mb-2">{blogs.length}</div>
                  <div className="text-sm text-white/80">Blogs</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
                >
                  <div className="text-4xl font-black text-white mb-2">{podcasts.length}</div>
                  <div className="text-sm text-white/80">Podcasts</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
                >
                  <div className="text-4xl font-black text-white mb-2">{users.length}</div>
                  <div className="text-sm text-white/80">Utilisateurs</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronRight className="text-white rotate-90" size={32} />
        </motion.div>
      </div>

      {/* Section POIs avec filtres */}
      <section className="py-16 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Explorez nos{" "}
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Lieux
              </span>
            </h2>
            <p className="text-xl text-zinc-600 dark:text-zinc-400">
              Découvrez les meilleurs endroits de votre ville
            </p>
          </motion.div>

          {/* Barre de recherche et filtres */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
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

          {/* Contenu POIs */}
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-zinc-600 dark:text-zinc-400">Chargement des lieux...</p>
            </div>
          ) : (
            <>
              {viewMode === "grid" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPois.map((poi) => (
                    <PoiCard key={poi.poi_id} poi={poi} onSelect={openPoiDetails} />
                  ))}
                </div>
              )}

              {viewMode === "list" && (
                <div className="space-y-4">
                  {filteredPois.map((poi) => (
                    <PoiListItem key={poi.poi_id} poi={poi} onSelect={openPoiDetails} />
                  ))}
                </div>
              )}

              {viewMode === "map" && (
                <div className="h-[600px] rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                  <MapContainer center={mapCenter} zoom={13} className="h-full w-full">
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; OpenStreetMap contributors'
                    />
                    {filteredPois.map((poi) => (
                      poi.location && (
                        <Marker
                          key={poi.poi_id}
                          position={[poi.location.latitude, poi.location.longitude]}
                          eventHandlers={{ click: () => openPoiDetails(poi) }}
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
            </>
          )}
        </div>
      </section>

      {/* Section Blogs */}
      <section className="py-16 bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <FileText className="inline-block mr-3 text-primary" size={48} />
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Blogs
              </span>
            </h2>
            <p className="text-xl text-zinc-600 dark:text-zinc-400">
              Découvrez les expériences partagées par notre communauté
            </p>
          </motion.div>

          {blogs.length > 0 ? (
            <div className="relative overflow-hidden">
              <motion.div
                className="flex gap-6"
                animate={{
                  x: [0, -2000],
                }}
                transition={{
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 40,
                    ease: "linear",
                  },
                }}
              >
                {[...blogs, ...blogs, ...blogs].map((blog, index) => (
                  <BlogCard key={`${blog.blog_id}-${index}`} blog={blog} getTimeAgo={getTimeAgo} />
                ))}
              </motion.div>
              
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-zinc-50 dark:from-zinc-950 to-transparent pointer-events-none z-10" />
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-zinc-50 dark:from-zinc-950 to-transparent pointer-events-none z-10" />
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
              <p className="text-zinc-600 dark:text-zinc-400">Aucun blog disponible</p>
            </div>
          )}
        </div>
      </section>

      {/* Section Podcasts */}
      <section className="py-16 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <Mic className="inline-block mr-3 text-purple-600" size={48} />
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Podcasts
              </span>
            </h2>
            <p className="text-xl text-zinc-600 dark:text-zinc-400">
              Écoutez les récits audio de nos explorateurs
            </p>
          </motion.div>

          {podcasts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[800px] overflow-hidden">
              {[...podcasts, ...podcasts].map((podcast, index) => (
                <motion.div
                  key={`${podcast.podcast_id}-${index}`}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ 
                    opacity: 1, 
                    y: [0, -1500]
                  }}
                  transition={{
                    opacity: { duration: 0.5 },
                    y: {
                      repeat: Infinity,
                      repeatType: "loop",
                      duration: 30,
                      ease: "linear",
                      delay: (index % 3) * 2,
                    },
                  }}
                >
                  <PodcastCard podcast={podcast} getTimeAgo={getTimeAgo} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Mic size={48} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
              <p className="text-zinc-600 dark:text-zinc-400">Aucun podcast disponible</p>
            </div>
          )}
        </div>
      </section>

      {/* Section Utilisateurs */}
      <section className="py-16 bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <Users className="inline-block mr-3 text-green-600" size={48} />
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Contributeurs
              </span>
            </h2>
            <p className="text-xl text-zinc-600 dark:text-zinc-400">
              Rejoignez notre communauté de {users.length} explorateurs
            </p>
          </motion.div>

          {users.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {users.slice(0, 12).map((user, i) => (
                <motion.div
                  key={user.user_id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="text-center"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold">
                    {user.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <p className="font-medium text-sm truncate">{user.username || "Utilisateur"}</p>
                  <p className="text-xs text-zinc-500">{user.role || "Membre"}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
              <p className="text-zinc-600 dark:text-zinc-400">Aucun utilisateur</p>
            </div>
          )}
        </div>
      </section>

      {/* Section Services TraMaSys */}
      <section className="py-16 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Écosystème{" "}
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                TraMaSys
              </span>
            </h2>
            <p className="text-xl text-zinc-600 dark:text-zinc-400">
              Découvrez notre suite complète de solutions de mobilité
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {TRAMASYS_SERVICES.map((service, i) => {
              const Icon = service.icon;
              return (
                <motion.a
                  key={i}
                  href={service.link}
                  target={service.link.startsWith('http') ? '_blank' : '_self'}
                  rel={service.link.startsWith('http') ? 'noopener noreferrer' : ''}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative overflow-hidden bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 hover:shadow-2xl hover:scale-105 transition-all p-8"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  
                  <div className="relative z-10">
                    <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-white`}>
                      <Icon size={32} />
                    </div>
                    
                    <h3 className="text-2xl font-black mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-primary group-hover:to-purple-600 transition-all">
                      {service.name}
                    </h3>
                    
                    <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                      {service.desc}
                    </p>
                    
                    <div className="flex items-center gap-2 text-primary font-medium">
                      <span>Découvrir</span>
                      <ExternalLink size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                  </div>
                </motion.a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modal détails POI */}
      {selectedPoi && (
        <PoiDetailsModal poi={selectedPoi} onClose={() => setSelectedPoi(null)} />
      )}
    </div>
  );
}

// Composant carte POI
function PoiCard({ poi, onSelect }: { poi: PoiWithStats; onSelect: (poi: PoiWithStats) => void }) {
  const Icon = poi.poi_category ? CATEGORIES.find(c => c.id === poi.poi_category)?.icon || MapPin : MapPin;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group cursor-pointer"
      onClick={() => onSelect(poi)}
    >
      <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:shadow-2xl transition-all">
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
  const Icon = poi.poi_category ? CATEGORIES.find(c => c.id === poi.poi_category)?.icon || MapPin : MapPin;

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

// Composant Blog Card
function BlogCard({ blog, getTimeAgo }: { blog: BlogWithAuthor; getTimeAgo: (date: string) => string }) {
  return (
    <Link
      href={`/blogs/${blog.blog_id}`}
      className="flex-shrink-0 w-80 group cursor-pointer"
    >
      <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:shadow-2xl transition-all">
        <div className="relative h-48 bg-gradient-to-br from-primary/20 to-purple-500/20">
          {blog.cover_image_url ? (
            <img 
              src={blog.cover_image_url} 
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FileText size={48} className="text-primary/30" />
            </div>
          )}
        </div>
        <div className="p-4">
          <h4 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {blog.title}
          </h4>
          <p className="text-sm text-zinc-500 line-clamp-2 mb-3">
            {blog.content.substring(0, 100)}...
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">{blog.poiName}</span>
            <span className="text-xs text-zinc-400">{getTimeAgo(blog.created_at)}</span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400">
            <span className="flex items-center gap-1">
              👁️ {blog.views || 0}
            </span>
            <span className="flex items-center gap-1">
              ❤️ {blog.likes || 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Composant Podcast Card
function PodcastCard({ podcast, getTimeAgo }: { podcast: PodcastWithDetails; getTimeAgo: (date: string) => string }) {
  return (
    <Link href={`/podcasts/${podcast.podcast_id}`}>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:shadow-xl transition-all cursor-pointer group">
        <div className="flex gap-4 p-4">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl shrink-0 flex items-center justify-center">
            {podcast.cover_image_url ? (
              <img 
                src={podcast.cover_image_url} 
                alt={podcast.title}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <Mic size={32} className="text-purple-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
              {podcast.title}
            </h4>
            <p className="text-sm text-zinc-500 line-clamp-2 mb-2">
              {podcast.description || "Découvrez ce podcast audio passionnant..."}
            </p>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span>{getTimeAgo(podcast.created_at)}</span>
              <span>•</span>
              <span>{Math.floor(podcast.duration_seconds / 60)} min</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Modal détails POI
function PoiDetailsModal({ poi, onClose }: { poi: PoiWithStats; onClose: () => void }) {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [podcasts, setPodcasts] = useState<any[]>([]);

  useEffect(() => {
    loadPoiContent();
  }, [poi.poi_id]);

  const loadPoiContent = async () => {
    try {
      const [blogsData, podcastsData] = await Promise.all([
        contentService.getBlogsByPoiId(poi.poi_id),
        contentService.getPodcastsByPoiId(poi.poi_id),
      ]);
      
      setBlogs(blogsData);
      setPodcasts(podcastsData);
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
        <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-black">{poi.poi_name}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {poi.poi_images_urls && poi.poi_images_urls[0] && (
            <div className="h-64 rounded-2xl overflow-hidden">
              <img 
                src={poi.poi_images_urls[0]} 
                alt={poi.poi_name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

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

          {poi.poi_description && (
            <div>
              <h3 className="font-bold text-lg mb-2">Description</h3>
              <p className="text-zinc-600 dark:text-zinc-400">{poi.poi_description}</p>
            </div>
          )}

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
          </div>
        </div>
      </motion.div>
    </div>
  );
}