"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  FileText, Mic, Heart, MessageSquare, Share2, Clock, User, MapPin, 
  Play, Pause, Volume2, ArrowLeft, Send, X, Eye, Loader2, TrendingUp,
  ThumbsUp, MessageCircle, Share, Bookmark, MoreHorizontal
} from "lucide-react";
import { contentService } from "@/services/contentService";
import { authService } from "@/services/authService";
import { poiService } from "@/services/poiService";
import { Loader } from "@/components/ui/Loader";
import { Button } from "@/components/ui/Button";

export default function BlogsPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'blogs' | 'podcasts'>('all');
  const [playingPodcast, setPlayingPodcast] = useState<string | null>(null);
  const [audioRefs, setAudioRefs] = useState<Map<string, HTMLAudioElement>>(new Map());
  
  // Sidebar state
  const [selectedContent, setSelectedContent] = useState<any | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // User & POI data
  const [users, setUsers] = useState<Map<string, any>>(new Map());
  const [pois, setPois] = useState<Map<string, any>>(new Map());
  const currentUser = authService.getSession();

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setIsLoading(true);
      const [blogsData, podcastsData] = await Promise.all([
        contentService.getAllBlogs(),
        contentService.getAllPodcasts()
      ]);

      setBlogs(blogsData || []);
      setPodcasts(podcastsData || []);

      // Charger les utilisateurs et POIs
      await loadUsersAndPois(blogsData, podcastsData);
    } catch (error) {
      console.error("Erreur chargement contenu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsersAndPois = async (blogsData: any[], podcastsData: any[]) => {
    const userIds = new Set<string>();
    const poiIds = new Set<string>();

    [...blogsData, ...podcastsData].forEach(item => {
      if (item.user_id) userIds.add(item.user_id);
      if (item.poi_id) poiIds.add(item.poi_id);
    });

    // Charger les POIs avec gestion d'erreur améliorée
    const poisMap = new Map();
    for (const poiId of poiIds) {
      try {
        const poi = await poiService.getPoiById(poiId);
        if (poi) {
          poisMap.set(poiId, poi);
        }
      } catch (e: any) {
        // Si le POI n'existe pas, on crée un placeholder
        console.warn(`⚠️ POI ${poiId} non trouvé, utilisation placeholder`);
        poisMap.set(poiId, {
          poi_id: poiId,
          poi_name: "Lieu non disponible",
          poi_category: "OTHER",
          location: { latitude: 0, longitude: 0 }
        });
      }
    }
    setPois(poisMap);

    // Pour les users, on simule avec l'ID (dans un vrai cas, on appellerait un service)
    const usersMap = new Map();
    userIds.forEach(id => {
      usersMap.set(id, {
        userId: id,
        username: `Utilisateur ${id.substring(0, 8)}`,
        avatar: null
      });
    });
    setUsers(usersMap);
  };

  // Créer les références audio pour chaque podcast
  useEffect(() => {
    podcasts.forEach(podcast => {
      if (!audioRefs.has(podcast.podcast_id)) {
        const audio = new Audio(podcast.audio_file_url);
        audioRefs.set(podcast.podcast_id, audio);
      }
    });
  }, [podcasts]);

  const handlePlayPodcast = (podcastId: string) => {
    audioRefs.forEach((audio, id) => {
      if (id !== podcastId) {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    const audio = audioRefs.get(podcastId);
    if (audio) {
      if (playingPodcast === podcastId) {
        audio.pause();
        setPlayingPodcast(null);
      } else {
        audio.play();
        setPlayingPodcast(podcastId);
        
        audio.onended = () => {
          setPlayingPodcast(null);
        };
      }
    }
  };

  const handleLike = async (item: any) => {
    if (!currentUser) {
      alert("Vous devez être connecté pour aimer un contenu");
      return;
    }

    try {
      if (item.type === 'blog') {
        const updated = await contentService.toggleBlogLike(item.blog_id, currentUser.userId);
        setBlogs(prev => prev.map(b => b.blog_id === item.blog_id ? { ...b, ...updated } : b));
        if (selectedContent?.blog_id === item.blog_id) {
          setSelectedContent({ ...selectedContent, ...updated });
        }
      } else {
        const updated = await contentService.togglePodcastLike(item.podcast_id, currentUser.userId);
        setPodcasts(prev => prev.map(p => p.podcast_id === item.podcast_id ? { ...p, ...updated } : p));
        if (selectedContent?.podcast_id === item.podcast_id) {
          setSelectedContent({ ...selectedContent, ...updated });
        }
      }
    } catch (error) {
      console.error("Erreur lors du like:", error);
    }
  };

  const openSidebar = async (item: any) => {
    setSelectedContent(item);
    setIsSidebarOpen(true);

    // Charger les commentaires
    if (item.type === 'blog') {
      const blogComments = contentService.getBlogComments(item.blog_id);
      setComments(blogComments);
      await contentService.incrementBlogViews(item.blog_id);
    } else {
      const podcastComments = contentService.getPodcastComments(item.podcast_id);
      setComments(podcastComments);
    }
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setTimeout(() => {
      setSelectedContent(null);
      setComments([]);
      setNewComment("");
    }, 300);
  };

  const handleSubmitComment = async () => {
    if (!currentUser || !newComment.trim() || !selectedContent) return;

    setIsSubmittingComment(true);
    try {
      let comment;
      if (selectedContent.type === 'blog') {
        comment = await contentService.addBlogComment(
          selectedContent.blog_id,
          currentUser.userId,
          currentUser.username,
          newComment.trim()
        );
      } else {
        comment = await contentService.addPodcastComment(
          selectedContent.podcast_id,
          currentUser.userId,
          currentUser.username,
          newComment.trim()
        );
      }

      setComments(prev => [...prev, comment]);
      setNewComment("");
    } catch (error) {
      console.error("Erreur ajout commentaire:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Combiner et trier les contenus
  const combinedContent = [
    ...blogs.map(b => ({ ...b, type: 'blog', created_at: b.created_at })),
    ...podcasts.map(p => ({ ...p, type: 'podcast', created_at: p.created_at }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Filtrer selon le type sélectionné
  const filteredContent = filter === 'all' 
    ? combinedContent 
    : combinedContent.filter(c => c.type === filter.replace('s', ''));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "À l'instant";
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getUserAvatar = (userId: string) => {
    const user = users.get(userId);
    if (user?.avatar) return user.avatar;
    
    // Générer une couleur basée sur l'ID
    const colors = ['bg-violet-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-pink-500'];
    const colorIndex = userId.charCodeAt(0) % colors.length;
    
    return (
      <div className={`w-full h-full ${colors[colorIndex]} flex items-center justify-center text-white font-bold text-lg`}>
        {userId.substring(0, 2).toUpperCase()}
      </div>
    );
  };

  const getUserName = (userId: string) => {
    const user = users.get(userId);
    return user?.username || `Utilisateur ${userId.substring(0, 8)}`;
  };

  const getPoiName = (poiId: string) => {
    const poi = pois.get(poiId);
    return poi?.poi_name || "Lieu inconnu";
  };

  const hasUserLiked = (item: any) => {
    if (!currentUser) return false;
    const likedBy = item.liked_by || [];
    return likedBy.includes(currentUser.userId);
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-violet-50/20 to-zinc-100 dark:from-black dark:via-violet-950/10 dark:to-zinc-950">
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.back()}
                className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all duration-200"
              >
                <ArrowLeft size={22} className="text-zinc-700 dark:text-zinc-300" />
              </button>
              <div>
                <h1 className="text-2xl font-black text-zinc-900 dark:text-white bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  Fil d'Actualité
                </h1>
                <p className="text-xs text-zinc-500 mt-0.5">Découvrez les derniers partages de la communauté</p>
              </div>
            </div>
            <Button onClick={() => router.push('/profile')} size="sm" className="shadow-lg">
              Mon Profil
            </Button>
          </div>

          {/* FILTRES */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <FilterButton 
              active={filter === 'all'} 
              onClick={() => setFilter('all')}
              label="Tout"
              count={combinedContent.length}
            />
            <FilterButton 
              active={filter === 'blogs'} 
              onClick={() => setFilter('blogs')}
              icon={<FileText size={16} />}
              label="Articles"
              count={blogs.length}
            />
            <FilterButton 
              active={filter === 'podcasts'} 
              onClick={() => setFilter('podcasts')}
              icon={<Mic size={16} />}
              label="Podcasts"
              count={podcasts.length}
            />
          </div>
        </div>
      </div>

      {/* CONTENU */}
      <div className={`max-w-7xl mx-auto px-4 py-6 transition-all duration-300 ${isSidebarOpen ? 'lg:pr-[500px]' : ''}`}>
        <div className="space-y-4">
          {filteredContent.length === 0 ? (
            <EmptyState filter={filter} router={router} />
          ) : (
            filteredContent.map((item) => (
              <ContentCard
                key={item.type === 'blog' ? item.blog_id : item.podcast_id}
                item={item}
                getUserAvatar={getUserAvatar}
                getUserName={getUserName}
                getPoiName={getPoiName}
                formatDate={formatDate}
                formatDuration={formatDuration}
                hasUserLiked={hasUserLiked}
                handleLike={handleLike}
                handlePlayPodcast={handlePlayPodcast}
                playingPodcast={playingPodcast}
                openSidebar={openSidebar}
                pois={pois}
                commentsCount={
                  item.type === 'blog' 
                    ? contentService.getBlogComments(item.blog_id).length 
                    : contentService.getPodcastComments(item.podcast_id).length
                }
              />
            ))
          )}
        </div>
      </div>

      {/* SIDEBAR */}
      <AnimatePresence>
        {isSidebarOpen && selectedContent && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSidebar}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-screen w-full lg:w-[480px] bg-white dark:bg-zinc-900 shadow-2xl z-50 overflow-y-auto"
            >
              <Sidebar
                content={selectedContent}
                comments={comments}
                newComment={newComment}
                setNewComment={setNewComment}
                isSubmittingComment={isSubmittingComment}
                handleSubmitComment={handleSubmitComment}
                closeSidebar={closeSidebar}
                getUserAvatar={getUserAvatar}
                getUserName={getUserName}
                getPoiName={getPoiName}
                formatDate={formatDate}
                formatDuration={formatDuration}
                hasUserLiked={hasUserLiked}
                handleLike={handleLike}
                handlePlayPodcast={handlePlayPodcast}
                playingPodcast={playingPodcast}
                currentUser={currentUser}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Composants

const FilterButton = ({ active, onClick, icon, label, count }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all duration-200 whitespace-nowrap ${
      active
        ? 'bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-600/25 scale-105'
        : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700'
    }`}
  >
    {icon}
    <span className="text-sm">{label}</span>
    {count !== undefined && (
      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
        active ? 'bg-white/25 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
      }`}>
        {count}
      </span>
    )}
  </button>
);

const ContentCard = ({ 
  item, getUserAvatar, getUserName, getPoiName, formatDate, formatDuration,
  hasUserLiked, handleLike, handlePlayPodcast, playingPodcast, openSidebar,
  pois, commentsCount
}: any) => {
  const poi = pois.get(item.poi_id);
  const isLiked = hasUserLiked(item);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-xl hover:border-violet-200 dark:hover:border-violet-900 transition-all duration-300"
    >
      {/* HEADER DU POST */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-violet-200 dark:border-violet-800">
          {getUserAvatar(item.user_id)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-zinc-900 dark:text-white text-sm">
            {getUserName(item.user_id)}
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 flex-wrap">
            <Clock size={12} />
            <span>{formatDate(item.created_at)}</span>
            {poi && (
              <>
                <span>•</span>
                <MapPin size={12} className="text-violet-600" />
                <span className="font-medium text-violet-600 dark:text-violet-400 truncate">
                  {getPoiName(item.poi_id)}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
            item.type === 'blog' 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
              : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
          }`}>
            {item.type === 'blog' ? <FileText size={14} /> : <Mic size={14} />}
            {item.type === 'blog' ? 'Article' : 'Podcast'}
          </div>
          <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
            <MoreHorizontal size={18} className="text-zinc-400" />
          </button>
        </div>
      </div>

      {/* IMAGE DE COUVERTURE */}
      {item.cover_image_url && (
        <div 
          className="relative w-full h-80 bg-zinc-200 dark:bg-zinc-800 cursor-pointer group"
          onClick={() => openSidebar(item)}
        >
          <Image 
            src={item.cover_image_url} 
            alt={item.title} 
            fill 
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p className="text-white text-sm font-medium">Cliquez pour lire l'article complet</p>
          </div>
        </div>
      )}

      {/* CONTENU */}
      <div className="p-4">
        <h2 
          className="text-xl font-bold text-zinc-900 dark:text-white mb-2 cursor-pointer hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
          onClick={() => openSidebar(item)}
        >
          {item.title}
        </h2>
        
        {item.description && (
          <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-3 line-clamp-2">
            {item.description}
          </p>
        )}

        {item.type === 'blog' && item.content && (
          <div 
            className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed line-clamp-3 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: item.content }}
          />
        )}

        {item.type === 'podcast' && (
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 rounded-xl p-4 flex items-center gap-4 border border-violet-200 dark:border-violet-900">
            <button
              onClick={() => handlePlayPodcast(item.podcast_id)}
              className="w-14 h-14 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 rounded-full flex items-center justify-center text-white transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              {playingPodcast === item.podcast_id ? (
                <Pause size={24} />
              ) : (
                <Play size={24} className="ml-1" />
              )}
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                <Volume2 size={16} className="text-violet-600" />
                <span className="font-mono font-bold">{formatDuration(item.duration_seconds)}</span>
              </div>
              {playingPodcast === item.podcast_id && (
                <div className="mt-2 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-600 to-violet-500 animate-pulse" style={{ width: '30%' }} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        {(item.views > 0 || item.plays > 0) && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Eye size={14} />
              <span>{item.type === 'blog' ? item.views : item.plays} {item.type === 'blog' ? 'vues' : 'lectures'}</span>
            </div>
            {item.likes > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <ThumbsUp size={14} />
                <span>{item.likes}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ACTIONS */}
      <div className="px-4 pb-4 flex items-center gap-2 border-t border-zinc-100 dark:border-zinc-800 pt-3">
        <ActionButton 
          icon={<ThumbsUp size={18} />} 
          label="J'aime" 
          count={item.likes || 0}
          active={isLiked}
          onClick={() => handleLike(item)}
        />
        <ActionButton 
          icon={<MessageCircle size={18} />} 
          label="Commenter"
          count={commentsCount}
          onClick={() => openSidebar(item)}
        />
        <ActionButton 
          icon={<Share size={18} />} 
          label="Partager" 
        />
        <ActionButton 
          icon={<Bookmark size={18} />} 
          label="Enregistrer" 
          className="ml-auto"
        />
      </div>
    </motion.div>
  );
};

const ActionButton = ({ icon, label, count, active, onClick, className }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
      active 
        ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' 
        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
    } ${className || ''}`}
  >
    {icon}
    <span className="text-sm hidden sm:inline">{label}</span>
    {count !== undefined && count > 0 && (
      <span className="text-xs font-bold">{count}</span>
    )}
  </button>
);

const EmptyState = ({ filter, router }: any) => (
  <div className="text-center py-20">
    <div className="text-zinc-300 mb-4 flex justify-center">
      {filter === 'all' ? <TrendingUp size={64} /> : filter === 'blogs' ? <FileText size={64} /> : <Mic size={64} />}
    </div>
    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
      Aucun contenu disponible
    </h3>
    <p className="text-zinc-500 mb-6">
      Soyez le premier à partager une expérience !
    </p>
    <Button onClick={() => router.push('/profile')} className="shadow-lg">
      Créer du contenu
    </Button>
  </div>
);

const Sidebar = ({ 
  content, comments, newComment, setNewComment, isSubmittingComment,
  handleSubmitComment, closeSidebar, getUserAvatar, getUserName, getPoiName,
  formatDate, formatDuration, hasUserLiked, handleLike, handlePlayPodcast,
  playingPodcast, currentUser
}: any) => {
  const isLiked = hasUserLiked(content);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between z-10 shadow-sm">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
          {content.type === 'blog' ? 'Article' : 'Podcast'}
        </h2>
        <button
          onClick={closeSidebar}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
        >
          <X size={22} />
        </button>
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto">
        {/* Article Header */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-violet-200 dark:border-violet-800">
              {getUserAvatar(content.user_id)}
            </div>
            <div className="flex-1">
              <div className="font-bold text-zinc-900 dark:text-white">
                {getUserName(content.user_id)}
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Clock size={12} />
                <span>{formatDate(content.created_at)}</span>
                {content.poi_id && (
                  <>
                    <span>•</span>
                    <MapPin size={12} className="text-violet-600" />
                    <span className="font-medium text-violet-600 dark:text-violet-400">
                      {getPoiName(content.poi_id)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white mb-3 leading-tight">
            {content.title}
          </h1>

          {content.description && (
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              {content.description}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-4">
            <button
              onClick={() => handleLike(content)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all duration-200 ${
                isLiked
                  ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              <ThumbsUp size={18} className={isLiked ? 'fill-current' : ''} />
              <span>{content.likes || 0}</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
              <MessageCircle size={18} />
              <span>{comments.length}</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
              <Share size={18} />
            </button>
          </div>
        </div>

        {/* Image de couverture */}
        {content.cover_image_url && (
          <div className="relative w-full h-96 bg-zinc-200 dark:bg-zinc-800">
            <Image 
              src={content.cover_image_url} 
              alt={content.title} 
              fill 
              className="object-cover"
              unoptimized
            />
          </div>
        )}

        {/* Contenu de l'article */}
        <div className="p-6">
          {content.type === 'blog' && content.content && (
            <div 
              className="prose prose-lg dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content.content }}
            />
          )}

          {content.type === 'podcast' && (
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 rounded-2xl p-6 border border-violet-200 dark:border-violet-900">
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => handlePlayPodcast(content.podcast_id)}
                  className="w-16 h-16 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 rounded-full flex items-center justify-center text-white transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  {playingPodcast === content.podcast_id ? (
                    <Pause size={28} />
                  ) : (
                    <Play size={28} className="ml-1" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                    <Volume2 size={18} className="text-violet-600" />
                    <span className="font-mono font-bold text-base">{formatDuration(content.duration_seconds)}</span>
                  </div>
                  {playingPodcast === content.podcast_id && (
                    <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-violet-600 to-violet-500 animate-pulse" style={{ width: '30%' }} />
                    </div>
                  )}
                </div>
              </div>
              <audio className="w-full mt-4" controls src={content.audio_file_url} />
            </div>
          )}
        </div>

        {/* Commentaires */}
        <div className="p-6 border-t border-zinc-200 dark:border-zinc-800">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
            <MessageCircle size={20} />
            Commentaires ({comments.length})
          </h3>

          <div className="space-y-4 mb-6">
            {comments.length === 0 ? (
              <p className="text-center text-zinc-500 py-8">
                Aucun commentaire. Soyez le premier à commenter !
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.comment_id} className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {comment.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 bg-zinc-50 dark:bg-zinc-800 rounded-2xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-zinc-900 dark:text-white">
                        {comment.username}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Ajouter un commentaire */}
          {currentUser && (
            <div className="sticky bottom-0 bg-white dark:bg-zinc-900 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {currentUser.username.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
                    placeholder="Écrivez un commentaire..."
                    disabled={isSubmittingComment}
                    className="flex-1 px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl border-2 border-transparent focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-900 transition-all outline-none text-sm"
                  />
                  <button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || isSubmittingComment}
                    className="px-4 py-3 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-xl font-bold hover:from-violet-700 hover:to-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 disabled:hover:scale-100 flex items-center gap-2"
                  >
                    {isSubmittingComment ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};