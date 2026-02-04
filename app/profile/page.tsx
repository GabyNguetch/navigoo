"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  User, Mail, Phone, Lock, Camera, LogOut, 
  MapPin, Route, Star, ChevronRight, 
  Settings, Building2, Calendar, TrendingUp,
  MessageSquare, FileText, Mic, Plus,
  Edit, Trash2, Eye, Send, Loader2, X,
  BarChart3, Award, Heart, Clock, Grid,
  List, Image as ImageIcon, Video, Music
} from "lucide-react";
import { authService } from "@/services/authService";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { BlogModal } from "@/components/content/BlogModal";
import { PodcastModal } from "@/components/content/PodcastModal";
import { AddPoiPanel } from "@/components/profile/AddPoiPanel";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { POI } from "@/types";

type TabType = 'overview' | 'pois' | 'reviews' | 'blogs' | 'podcasts' | 'activity' | 'add-poi';

export default function ProfilePage() {
  const router = useRouter();
  const {
    profile,
    stats,
    myPois,
    myReviews,
    myBlogs,
    myPodcasts,
    recentPois,
    recentTrips,
    isLoading,
    error,
    updateProfile,
    deleteReview,
    deleteBlog,
    deletePodcast,
  } = useUserProfile();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ email: '', phone: '' });
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [isPodcastModalOpen, setIsPodcastModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const session = authService.getSession();
    
    if (!session) {
      router.push("/signin");
      return;
    }

    if (session.role === "SUPER_ADMIN") {
      router.push("/admin");
      return;
    }
  }, [router]);

  useEffect(() => {
    if (profile) {
      setEditForm({
        email: profile.email,
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  const handleLogout = () => {
    authService.logout();
  };

  const handleContentSuccess = () => {
    alert("Contenu publié avec succès !");
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile(editForm);
      setIsEditingProfile(false);
      alert("Profil mis à jour avec succès !");
    } catch (err) {
      alert("Erreur lors de la mise à jour");
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  if (isLoading) return <Loader />;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">Erreur: {error}</div>;
  if (!profile) return <div className="min-h-screen flex items-center justify-center">Profil non trouvé</div>;

  return (
    <div className="min-h-screen bg-img bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-black dark:via-zinc-950 dark:to-black">
      
      {/* HERO HEADER avec Avatar */}
      <div 
        className="relative h-72 w-full overflow-hidden bg-cover bg-center"
        style={{ 
          backgroundImage: "url('images/fond1.jpg')",
        }}
      >
        {/* Overlay sombre pour la lisibilité (indispensable) */}
        <div className="absolute inset-0 bg-black/40 shadow-inner" />
        
        {/* Dégradé vers le bas pour faire ressortir le nom d'utilisateur */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        {/* Effet de grille animée */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }} />
        </div>
        
        {/* Cercles flottants */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-20 -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />

        {/* Contenu Header */}
        <div className="relative max-w-7xl mx-auto px-4 h-full flex items-end pb-8">
          <div className="flex items-end gap-6 w-full">
            
            {/* Avatar */}
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="relative group"
            >
              <div className="relative w-32 h-32 md:w-40 md:h-40">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary to-purple-400 rounded-3xl rotate-6 group-hover:rotate-12 transition-transform duration-300" />
                <div className="relative w-full h-full bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border-4 border-white dark:border-zinc-800 shadow-2xl flex items-center justify-center">
                  <span className="text-6xl font-black bg-gradient-to-br from-primary to-purple-600 bg-clip-text text-transparent">
                    {profile.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <button className="absolute -bottom-2 -right-2 p-3 bg-primary text-white rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-transform">
                  <Camera size={20} />
                </button>
              </div>
            </motion.div>

            {/* Infos Profil */}
            <div className="flex-1 pb-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-4xl md:text-5xl font-black text-white mb-2 drop-shadow-lg">
                  {profile.username}
                </h1>
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md text-white text-sm font-bold rounded-full border border-white/30">
                    🌟 Explorateur Navigoo
                  </span>
                  <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md text-white text-sm font-bold rounded-full border border-white/30">
                    Membre depuis {new Date(profile.createdAt).getFullYear()}
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Actions Rapides */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="hidden lg:flex items-center gap-3 pb-4"
            >
              <Button
                onClick={() => setIsEditingProfile(true)}
                className="bg-white/20 backdrop-blur-md text-white border-2 border-white/30 hover:bg-white/30"
              >
                <Edit size={18} /> Modifier
              </Button>
              <Button
                onClick={handleLogout}
                className="bg-red-500/20 backdrop-blur-md text-white border-2 border-red-300/30 hover:bg-red-500/30"
              >
                <LogOut size={18} /> Déconnexion
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* STATISTIQUES RAPIDES */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-7xl mx-auto px-4 -mt-8 mb-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<MapPin className="text-blue-500" />}
              label="POIs"
              value={stats.totalPois}
              color="from-blue-500/10 to-blue-500/5"
            />
            <StatCard
              icon={<MessageSquare className="text-green-500" />}
              label="Avis"
              value={stats.totalReviews}
              color="from-green-500/10 to-green-500/5"
            />
            <StatCard
              icon={<FileText className="text-purple-500" />}
              label="Blogs"
              value={stats.totalBlogs}
              color="from-purple-500/10 to-purple-500/5"
            />
            <StatCard
              icon={<Mic className="text-orange-500" />}
              label="Podcasts"
              value={stats.totalPodcasts}
              color="from-orange-500/10 to-orange-500/5"
            />
          </div>
        </motion.div>
      )}

      {/* TABS NAVIGATION */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
          <div className="flex gap-2 p-2">
            <TabButton
              active={activeTab === 'overview'}
              onClick={() => handleTabChange('overview')}
              icon={<BarChart3 size={18} />}
              label="Vue d'ensemble"
            />
            <TabButton
              active={activeTab === 'pois'}
              onClick={() => handleTabChange('pois')}
              icon={<Building2 size={18} />}
              label={`Mes POIs (${myPois.length})`}
            />
            <TabButton
              active={activeTab === 'reviews'}
              onClick={() => handleTabChange('reviews')}
              icon={<Star size={18} />}
              label={`Avis (${myReviews.length})`}
            />
            <TabButton
              active={activeTab === 'blogs'}
              onClick={() => handleTabChange('blogs')}
              icon={<FileText size={18} />}
              label={`Blogs (${myBlogs.length})`}
            />
            <TabButton
              active={activeTab === 'podcasts'}
              onClick={() => handleTabChange('podcasts')}
              icon={<Mic size={18} />}
              label={`Podcasts (${myPodcasts.length})`}
            />
            <TabButton
              active={activeTab === 'activity'}
              onClick={() => handleTabChange('activity')}
              icon={<Clock size={18} />}
              label="Activité"
            />
          </div>
        </div>
      </div>

      {/* CONTENU DES TABS */}
      <div className="max-w-7xl mx-auto px-4 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && (
              <OverviewTab
                stats={stats}
                myPois={myPois}
                recentPois={recentPois}
                recentTrips={recentTrips}
                router={router}
                onAddPoi={() => handleTabChange('add-poi')}
              />
            )}

            {activeTab === 'pois' && (
              <PoisTab
                myPois={myPois}
                router={router}
                onAddPoi={() => handleTabChange('add-poi')}
                viewMode={viewMode}
                setViewMode={setViewMode}
              />
            )}

            {activeTab === 'reviews' && (
              <ReviewsTab
                myReviews={myReviews}
                onDelete={deleteReview}
                router={router}
              />
            )}

            {activeTab === 'blogs' && (
              <BlogsTab
                myBlogs={myBlogs}
                onDelete={deleteBlog}
                onAdd={() => setIsBlogModalOpen(true)}
              />
            )}

            {activeTab === 'podcasts' && (
              <PodcastsTab
                myPodcasts={myPodcasts}
                onDelete={deletePodcast}
                onAdd={() => setIsPodcastModalOpen(true)}
              />
            )}

            {activeTab === 'activity' && (
              <ActivityTab
                recentPois={recentPois}
                recentTrips={recentTrips}
                router={router}
              />
            )}

            {activeTab === 'add-poi' && (
              <AddPoiPanel onClose={() => handleTabChange('pois')} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* MODALS */}
      <BlogModal
        isOpen={isBlogModalOpen}
        onClose={() => setIsBlogModalOpen(false)}
        onSuccess={handleContentSuccess}
      />
      <PodcastModal
        isOpen={isPodcastModalOpen}
        onClose={() => setIsPodcastModalOpen(false)}
        onSuccess={handleContentSuccess}
      />

      {/* MODAL ÉDITION PROFIL */}
      <AnimatePresence>
        {isEditingProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsEditingProfile(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold dark:text-white">Modifier le profil</h3>
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Téléphone</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setIsEditingProfile(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  className="flex-1"
                >
                  Sauvegarder
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// COMPOSANTS TABS
// ============================================

const OverviewTab = ({ stats, myPois, recentPois, recentTrips, router, onAddPoi }: any) => (
  <div className="space-y-6">
    {/* Actions Rapides */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <QuickActionCard
        icon={<Plus />}
        title="Nouveau POI"
        description="Créer un point d'intérêt"
        onClick={onAddPoi}
        color="from-blue-500 to-blue-600"
      />
      <QuickActionCard
        icon={<FileText />}
        title="Nouveau Blog"
        description="Partager une expérience"
        onClick={() => {}}
        color="from-purple-500 to-purple-600"
      />
      <QuickActionCard
        icon={<Mic />}
        title="Nouveau Podcast"
        description="Enregistrer un audio"
        onClick={() => {}}
        color="from-orange-500 to-orange-600"
      />
    </div>

    {/* Mes POIs Récents */}
    {myPois.length > 0 && (
      <section>
        <h3 className="text-xl font-bold mb-4 dark:text-white">Mes derniers établissements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myPois.slice(0, 6).map((poi: any) => (
            <PoiCard key={poi.poi_id} poi={poi} onClick={() => router.push(`/?poi=${poi.poi_id}`)} />
          ))}
        </div>
      </section>
    )}

    {/* Activité Récente */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <RecentSection title="Lieux consultés" items={recentPois} type="poi" router={router} />
      <RecentSection title="Derniers trajets" items={recentTrips} type="trip" router={router} />
    </div>
  </div>
);

const PoisTab = ({ myPois, router, onAddPoi, viewMode, setViewMode }: any) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <p className="text-zinc-500">{myPois.length} établissement(s)</p>
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('grid')}
          className={clsx(
            "p-2 rounded-lg transition-colors",
            viewMode === 'grid' ? "bg-primary text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600"
          )}
        >
          <Grid size={20} />
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={clsx(
            "p-2 rounded-lg transition-colors",
            viewMode === 'list' ? "bg-primary text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600"
          )}
        >
          <List size={20} />
        </button>
        <Button onClick={onAddPoi} className="gap-2 ml-4">
          <Plus size={18} /> Nouveau POI
        </Button>
      </div>
    </div>

    {myPois.length > 0 ? (
      <div className={clsx(
        "grid gap-4",
        viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
      )}>
        {myPois.map((poi: any) => (
          <PoiCard key={poi.poi_id} poi={poi} onClick={() => router.push(`/add-poi?id=${poi.poi_id}`)} showEdit />
        ))}
      </div>
    ) : (
      <EmptyState
        icon={<Building2 size={48} />}
        title="Aucun point d'intérêt"
        description="Créez votre premier établissement"
        action={<Button onClick={onAddPoi}>Créer un POI</Button>}
      />
    )}
  </div>
);

const ReviewsTab = ({ myReviews, onDelete, router }: any) => (
  <div className="space-y-4">
    <p className="text-zinc-500 mb-6">{myReviews.length} avis publié(s)</p>

    {myReviews.length > 0 ? (
      myReviews.map((review: any) => (
        <ReviewCard key={review.reviewId} review={review} onDelete={onDelete} />
      ))
    ) : (
      <EmptyState
        icon={<MessageSquare size={48} />}
        title="Aucun avis"
        description="Partagez votre expérience sur vos lieux préférés"
      />
    )}
  </div>
);

const BlogsTab = ({ myBlogs, onDelete, onAdd }: any) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-lg font-bold dark:text-white">Mes Blogs ({myBlogs.length})</h3>
      <Button onClick={onAdd} size="sm" className="gap-2">
        <Plus size={16} /> Nouveau Blog
      </Button>
    </div>

    {myBlogs.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {myBlogs.map((blog: any) => (
          <ContentCard key={blog.blog_id} content={blog} onDelete={() => onDelete(blog.blog_id)} type="blog" />
        ))}
      </div>
    ) : (
      <EmptyState
        icon={<FileText size={48} />}
        title="Aucun blog"
        description="Créez votre premier article de blog"
        action={<Button onClick={onAdd}>Créer un Blog</Button>}
      />
    )}
  </div>
);

const PodcastsTab = ({ myPodcasts, onDelete, onAdd }: any) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-lg font-bold dark:text-white">Mes Podcasts ({myPodcasts.length})</h3>
      <Button onClick={onAdd} size="sm" className="gap-2">
        <Plus size={16} /> Nouveau Podcast
      </Button>
    </div>

    {myPodcasts.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {myPodcasts.map((podcast: any) => (
          <ContentCard key={podcast.podcast_id} content={podcast} onDelete={() => onDelete(podcast.podcast_id)} type="podcast" />
        ))}
      </div>
    ) : (
      <EmptyState
        icon={<Mic size={48} />}
        title="Aucun podcast"
        description="Créez votre premier épisode de podcast"
        action={<Button onClick={onAdd}>Créer un Podcast</Button>}
      />
    )}
  </div>
);

const ActivityTab = ({ recentPois, recentTrips, router }: any) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <RecentSection title="Lieux consultés" items={recentPois} type="poi" router={router} />
    <RecentSection title="Trajets effectués" items={recentTrips} type="trip" router={router} />
  </div>
);

// ============================================
// COMPOSANTS RÉUTILISABLES
// ============================================

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={clsx(
      "flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap",
      active
        ? "bg-primary text-white shadow-lg shadow-primary/20"
        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
    )}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

const StatCard = ({ icon, label, value, color }: any) => (
  <motion.div
    whileHover={{ y: -5, scale: 1.02 }}
    className={clsx(
      "bg-gradient-to-br backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white dark:border-zinc-800",
      color
    )}
  >
    <div className="flex items-center justify-between mb-3">
      {icon}
      <span className="text-3xl font-black dark:text-white">{value}</span>
    </div>
    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{label}</p>
  </motion.div>
);

const QuickActionCard = ({ icon, title, description, onClick, color }: any) => (
  <motion.button
    whileHover={{ scale: 1.02, y: -5 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={clsx(
      "p-6 rounded-2xl shadow-lg bg-gradient-to-br text-white text-left group overflow-hidden relative",
      color
    )}
  >
    <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
    <div className="relative">
      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
        {icon}
      </div>
      <h4 className="font-bold text-lg mb-1">{title}</h4>
      <p className="text-sm opacity-90">{description}</p>
    </div>
  </motion.button>
);

const PoiCard = ({ poi, onClick, showEdit }: any) => (
  <motion.div
    whileHover={{ y: -5 }}
    onClick={onClick}
    className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-lg border border-zinc-200 dark:border-zinc-800 cursor-pointer group"
  >
    <div className="relative h-48 bg-zinc-200">
      {poi.poi_images_urls?.[0] && (
        <Image src={poi.poi_images_urls[0]} alt="" fill className="object-cover group-hover:scale-110 transition-transform duration-300" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-3 left-3 right-3">
        <h3 className="font-bold text-white line-clamp-1">{poi.poi_name}</h3>
        <p className="text-xs text-white/80">{poi.poi_category} • {poi.address_city}</p>
      </div>
    </div>
    {showEdit && (
      <div className="p-3 flex items-center justify-between">
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">Actif</span>
        <span className="text-xs text-primary font-bold group-hover:underline">Modifier →</span>
      </div>
    )}
  </motion.div>
);

const ReviewCard = ({ review, onDelete }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
  >
    <div className="flex justify-between items-start mb-3">
      <div className="flex items-center gap-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map(s => (
            <Star key={s} size={14} className={s <= review.rating ? "fill-primary text-primary" : "text-zinc-300"} />
          ))}
        </div>
        <span className="text-xs text-zinc-500">{new Date(review.createdAt).toLocaleDateString()}</span>
      </div>
      <button onClick={() => onDelete(review.reviewId)} className="text-red-500 hover:text-red-700">
        <Trash2 size={16} />
      </button>
    </div>
    <p className="text-sm text-zinc-700 dark:text-zinc-300">{review.reviewText || "Pas de commentaire"}</p>
  </motion.div>
);

const ContentCard = ({ content, onDelete, type }: any) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-lg border border-zinc-200 dark:border-zinc-800"
  >
    <div className="relative h-48 bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center">
      {type === 'blog' ? <FileText size={48} className="text-primary/30" /> : <Mic size={48} className="text-primary/30" />}
    </div>
    <div className="p-4">
      <h4 className="font-bold mb-2 line-clamp-1 dark:text-white">{content.title}</h4>
      {content.description && <p className="text-xs text-zinc-500 line-clamp-2 mb-3">{content.description}</p>}
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400">{new Date(content.created_at).toLocaleDateString()}</span>
        <button onClick={() => onDelete()} className="text-red-500 hover:text-red-700">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  </motion.div>
);

const RecentSection = ({ title, items, type, router }: any) => (
  <section className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
    <h3 className="text-lg font-bold dark:text-white mb-4">{title}</h3>
    <div className="space-y-3">
      {items.length > 0 ? (
        items.slice(0, 5).map((item: any) => (
          <div key={item.poi_id || item.id} className="flex items-center gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl cursor-pointer transition-colors">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              {type === 'poi' ? <MapPin size={18} className="text-primary" /> : <Route size={18} className="text-primary" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm dark:text-white truncate">
                {type === 'poi' ? item.poi_name : item.arriveName || 'Destination'}
              </p>
              <p className="text-xs text-zinc-500">
                {type === 'poi' ? item.address_city : `${Math.round((item.distance || 0) / 1000)} km`}
              </p>
            </div>
            <ChevronRight size={16} className="text-zinc-300 shrink-0" />
          </div>
        ))
      ) : (
        <p className="text-sm text-zinc-400 italic text-center py-8">Aucune donnée</p>
      )}
    </div>
  </section>
);

const EmptyState = ({ icon, title, description, action }: any) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="text-zinc-300 mb-4">{icon}</div>
    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">{title}</h3>
    <p className="text-sm text-zinc-500 mb-6 max-w-sm">{description}</p>
    {action}
  </div>
);