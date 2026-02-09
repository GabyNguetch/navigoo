"use client";

import { HeroSection } from "@/components/landing/HeroSection";
import { motion } from "framer-motion";
import { FileText, Mic, Star, MapPin, TrendingUp, ArrowRight, ExternalLink, Plus, PenTool, Camera, Headphones, HandCoins, Car, Truck, StoreIcon, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { contentService } from "@/services/contentService";
import { poiService } from "@/services/poiService";
import { reviewService } from "@/services/reviewService";

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

interface TopPoi {
  poi_id: string;
  poi_name: string;
  address_city?: string;
  poi_category: string;
  averageRating: number;
  reviewCount: number;
  poi_images_urls?: string[];
}

export default function LandingPage() {
  const [blogs, setBlogs] = useState<BlogWithAuthor[]>([]);
  const [podcasts, setPodcasts] = useState<PodcastWithDetails[]>([]);
  const [topPois, setTopPois] = useState<TopPoi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);

      // Charger les blogs
      const allBlogs = contentService.getAllBlogs();
      const blogsWithDetails = await Promise.all(
        allBlogs.slice(0, 10).map(async (blog) => {
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
      setBlogs(blogsWithDetails.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));

      // Charger les podcasts
      const allPodcasts = contentService.getAllPodcasts();
      const podcastsWithDetails = await Promise.all(
        allPodcasts.slice(0, 5).map(async (podcast) => {
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
      setPodcasts(podcastsWithDetails.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));

      // Charger les POIs les mieux notés
      const allPois = await poiService.getAllPois();
      const poisWithRatings = await Promise.all(
        allPois.slice(0, 20).map(async (poi) => {
          try {
            const stats = await reviewService.getPoiStats(poi.poi_id);
            return {
              poi_id: poi.poi_id,
              poi_name: poi.poi_name,
              address_city: poi.address_city,
              poi_category: poi.poi_category,
              averageRating: stats.averageRating,
              reviewCount: stats.reviewCount,
              poi_images_urls: poi.poi_images_urls,
            };
          } catch {
            return {
              poi_id: poi.poi_id,
              poi_name: poi.poi_name,
              address_city: poi.address_city,
              poi_category: poi.poi_category,
              averageRating: 0,
              reviewCount: 0,
              poi_images_urls: poi.poi_images_urls,
            };
          }
        })
      );

      // Trier par note moyenne et nombre d'avis
      const sortedPois = poisWithRatings
        .filter(poi => poi.averageRating > 0)
        .sort((a, b) => {
          if (b.averageRating !== a.averageRating) {
            return b.averageRating - a.averageRating;
          }
          return b.reviewCount - a.reviewCount;
        })
        .slice(0, 6);

      setTopPois(sortedPois);

    } catch (error) {
      console.error("Erreur chargement contenu:", error);
    } finally {
      setLoading(false);
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

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      'FOOD_DRINK': 'Restaurant',
      'ACCOMMODATION': 'Hébergement',
      'SHOPPING': 'Shopping',
      'ENTERTAINMENT': 'Loisirs',
      'SERVICES': 'Services',
      'TOURISM': 'Tourisme',
      'TRANSPORT': 'Transport',
      'HEALTH': 'Santé',
      'EDUCATION': 'Éducation',
    };
    return labels[category] || category;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      
      {/* Hero Section */}
      <HeroSection />

      {/* Fil d'actualités - Style Instagram */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Dernières{" "}
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Découvertes
              </span>
            </h2>
            <p className="text-xl text-zinc-600 dark:text-zinc-400">
              Explorez les expériences partagées par la communauté
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-zinc-600 dark:text-zinc-400">Chargement des contenus...</p>
            </div>
          ) : (
            <>
              {/* Blog Stories - Défilement horizontal infini */}
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <FileText className="text-primary" />
                    Fils d'actualités
                  </h3>
                  <Link href="/blogs" className="text-primary hover:underline text-sm font-medium">
                    Voir tout ({blogs.length}) →
                  </Link>
                </div>
                
                {blogs.length > 0 ? (
                  <div className="relative">
                    <div className="overflow-hidden">
                      <motion.div
                        className="flex gap-4"
                        animate={{
                          x: blogs.length > 3 ? [0, -1000] : [0, 0],
                        }}
                        transition={{
                          x: {
                            repeat: blogs.length > 3 ? Infinity : 0,
                            repeatType: "loop",
                            duration: 30,
                            ease: "linear",
                          },
                        }}
                      >
                        {/* Dupliquer les blogs pour un défilement infini */}
                        {[...blogs, ...blogs, ...blogs].map((blog, index) => (
                          <Link
                            key={`${blog.blog_id}-${index}`}
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
                        ))}
                      </motion.div>
                    </div>
                    
                    {/* Gradient fade sur les côtés */}
                    <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-zinc-50 dark:from-zinc-950 to-transparent pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-zinc-50 dark:from-zinc-950 to-transparent pointer-events-none" />
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <FileText size={48} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
                    <p className="text-zinc-600 dark:text-zinc-400">Aucun blog pour le moment</p>
                    <Link href="/create/blog">
                      <Button className="mt-4 gap-2">
                        <Plus size={18} />
                        Créer le premier blog
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Grid: Podcasts + Call to Action */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Podcasts Section - 2 colonnes */}
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                      <Headphones className="text-purple-600" />
                      Podcasts Audio
                    </h3>
                    <Link href="/podcasts" className="text-primary hover:underline text-sm font-medium">
                      Voir tout ({podcasts.length}) →
                    </Link>
                  </div>
                  
                  {podcasts.length > 0 ? (
                    <div className="space-y-4">
                      {podcasts.slice(0, 3).map((podcast, i) => (
                        <motion.div
                          key={podcast.podcast_id}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                        >
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
                                    <span>{Math.floor(podcast.duration_seconds / 60)} min d'écoute</span>
                                    <span>•</span>
                                    <span>{podcast.poiName}</span>
                                  </div>
                                  <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400">
                                    <span className="flex items-center gap-1">
                                      🎧 {podcast.plays || 0}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      ❤️ {podcast.likes || 0}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                      <Mic size={48} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
                      <p className="text-zinc-600 dark:text-zinc-400">Aucun podcast pour le moment</p>
                      <Link href="/create/podcast">
                        <Button className="mt-4 gap-2">
                          <Plus size={18} />
                          Créer le premier podcast
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Call to Action - Créer une publication */}
                <div className="lg:col-span-1">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="sticky top-8"
                  >
                    <div className="bg-gradient-to-br from-primary to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden">
                      {/* Motif décoratif */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />
                      
                      <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                          <Camera size={32} />
                        </div>
                        
                        <h3 className="text-2xl font-black mb-3">
                          Partagez votre expérience
                        </h3>
                        
                        <p className="text-white/90 mb-6 text-sm leading-relaxed">
                          Racontez vos découvertes, partagez vos aventures et inspirez la communauté Navigoo.
                        </p>
                        
                        <div className="space-y-3">
                          <Link href="/create/blog">
                            <Button className="w-full bg-white text-primary hover:bg-zinc-100 shadow-xl font-bold gap-2">
                              <FileText size={18} />
                              Écrire un blog
                            </Button>
                          </Link>
                          
                          <Link href="/create/podcast">
                            <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 font-bold gap-2">
                              <Mic size={18} />
                              Créer un podcast
                            </Button>
                          </Link>
                        </div>
                        
                        <p className="text-xs text-white/70 mt-4 text-center">
                          Rejoignez +{blogs.length + podcasts.length} créateurs
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* POIs les mieux notés */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Les Lieux{" "}
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Incontournables
              </span>
            </h2>
            <p className="text-xl text-zinc-600 dark:text-zinc-400">
              Les endroits les plus appréciés par notre communauté
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-zinc-600 dark:text-zinc-400">Chargement des lieux...</p>
            </div>
          ) : topPois.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topPois.map((poi, i) => (
                <motion.div
                  key={poi.poi_id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group"
                >
                  <Link href={`/poi/${poi.poi_id}`}>
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:shadow-2xl transition-all cursor-pointer">
                      <div className="relative h-48 bg-gradient-to-br from-primary/10 to-purple-500/10">
                        {poi.poi_images_urls && poi.poi_images_urls[0] ? (
                          <img 
                            src={poi.poi_images_urls[0]} 
                            alt={poi.poi_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <MapPin size={48} className="text-zinc-300 dark:text-zinc-700" />
                          </div>
                        )}
                        <div className="absolute top-4 right-4 bg-white dark:bg-zinc-900 px-3 py-1 rounded-full flex items-center gap-1">
                          <Star size={14} className="text-yellow-500 fill-yellow-500" />
                          <span className="font-bold text-sm">{poi.averageRating.toFixed(1)}</span>
                        </div>
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
                            {getCategoryLabel(poi.poi_category)}
                          </span>
                          <span className="text-xs text-zinc-400">{poi.reviewCount} avis</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <MapPin size={48} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
              <p className="text-zinc-600 dark:text-zinc-400">Aucun lieu avec avis pour le moment</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/marketplace">
              <Button className="px-8 py-6 text-lg gap-2 bg-primary hover:bg-primary-dark shadow-xl shadow-primary/20">
                Explorer tous les lieux
                <ArrowRight size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Marketplace TraMaSys */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-950">
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
            {[
              { 
                name: "FareCalculator", 
                desc: "Calculez vos tarifs de course instantanément avec précision", 
                link: "https://fare-calculator-front.vercel.app/en", 
                color: "from-blue-500 to-cyan-500",
                icon: <HandCoins />
              },
              { 
                name: "RidenGo", 
                desc: "Application de covoiturage moderne et sécurisée", 
                link: "https://ride-go-web.vercel.app/", 
                color: "from-green-500 to-emerald-500",
                icon: <Car />
              },
              { 
                name: "Fleet Management", 
                desc: "Gérez votre flotte de véhicules efficacement en temps réel", 
                link: "https://fleet-management-tramasys.vercel.app/", 
                color: "from-orange-500 to-red-500",
                icon: <Truck />
              },
              { 
                name: "Freelance Driver", 
                desc: "Plateforme pour chauffeurs indépendants et professionnels", 
                link: "https://freelance-driver.vercel.app", 
                color: "from-purple-500 to-pink-500",
                icon: <PenTool />
              },
              { 
                name: "Syndicat", 
                desc: "Gestion complète des organisations de transport", 
                link: "https://ugates.vercel.app/fr", 
                color: "from-indigo-500 to-blue-500",
                icon: <StoreIcon />
              },
              { 
                name: "Navigoo API", 
                desc: "Intégrez nos services de navigation dans vos applications", 
                link: "/pricing", 
                color: "from-primary to-purple-600",
                icon: <Settings />
              },
            ].map((service, i) => (
              <motion.a
                key={i}
                href={service.link}
                target={service.link.startsWith('http') ? '_blank' : '_self'}
                rel={service.link.startsWith('http') ? 'noopener noreferrer' : ''}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group relative overflow-hidden bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 hover:shadow-2xl hover:scale-105 transition-all p-8"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                
                <div className="relative z-10">
                  <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-3xl`}>
                    {service.icon}
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
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Colonne 1 - Logo & Description */}
            <div>
              <Link href="/landing" className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center">
                  <MapPin className="text-white" size={24} />
                </div>
                <span className="text-2xl font-black">Navigoo</span>
              </Link>
              <p className="text-zinc-400 text-sm mb-4">
                La plateforme de navigation N°1 au Cameroun. Explorez, partagez, découvrez.
              </p>
              <div className="flex gap-3">
                {["facebook", "twitter", "instagram", "linkedin"].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-10 h-10 bg-zinc-800 hover:bg-primary rounded-xl flex items-center justify-center transition-colors"
                  >
                    <span className="text-xs">{social[0].toUpperCase()}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Colonne 2 - Produit */}
            <div>
              <h4 className="font-bold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><Link href="/marketplace" className="hover:text-white transition-colors">Marketplace</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Tarifs</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">API</Link></li>
                <li><Link href="/add-poi" className="hover:text-white transition-colors">Ajouter un lieu</Link></li>
              </ul>
            </div>

            {/* Colonne 3 - Entreprise */}
            <div>
              <h4 className="font-bold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carrières</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Partenaires</a></li>
              </ul>
            </div>

            {/* Colonne 4 - Support */}
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><a href="#" className="hover:text-white transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Conditions</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-zinc-400">
              © 2026 Navigoo by TraMaSys. Tous droits réservés.
            </p>
            <p className="text-sm text-zinc-400">
              Made with ❤️ in Cameroon 🇨🇲
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}