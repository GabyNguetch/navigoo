"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { 
  LogOut, 
  MapPin, 
  BarChart3, Building2, Star, FileText, Mic, Clock, 
  Store, Grid, List, Plus, X, Camera, Trash2, ChevronRight, Route,
  MessageSquare,
  MapPinHouse,
  Heart,
  Eye,
  ThumbsUp,
  Calendar,
  Edit,
  Bookmark,
  CheckCircle,
  XCircle,
  AlertCircle as AlertCircleIcon,
  Loader2
} from "lucide-react";
import { authService } from "@/services/authService";
import { useUserProfile } from "@/hooks/useUserProfile";
import { userProfileService } from "@/services/userProfileService";
import { poiService } from "@/services/poiService";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { BlogModal } from "@/components/content/BlogModal";
import { PodcastModal } from "@/components/content/PodcastModal";
import { AddPoiPanel } from "@/components/profile/AddPoiPanel";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { AppUser } from "@/types";
import { mediaService } from "@/services/mediaService";

type TabType = 'overview' | 'pois' | 'reviews' | 'blogs' | 'podcasts' | 'activity' | 'saved' | 'add-poi' | 'edit-poi';

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    profile,
    stats,
    myPois,
    myReviews,
    myBlogs,
    myPodcasts,
    recentPois,
    savedPois,
    recentTrips,
    isLoading,
    error,
    updateProfile,
    deleteReview,
    deleteBlog,
    deletePodcast,
    refresh,
  } = useUserProfile();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', email: '', phone: '' });
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [isPodcastModalOpen, setIsPodcastModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploading, setUploading] = useState(false);
  const [editingPoiId, setEditingPoiId] = useState<string | null>(null);
  
  const [user, setUser] = useState<AppUser | null>(null);

  // Gestion des params URL pour édition POI depuis la carte
  useEffect(() => {
    const poiId = searchParams?.get('editPoi');
    if (poiId) {
      setEditingPoiId(poiId);
      setActiveTab('edit-poi');
    }
  }, [searchParams]);

  // Vérification session et chargement initial
  useEffect(() => {
    console.log("🔍 [Profile] Vérification session...");
    const session = authService.getSession();
    
    if (!session) {
      console.log("⚠️ Pas de session, redirection signin");
      router.push("/signin");
      return;
    }

    if (session.role === "SUPER_ADMIN") {
      console.log("⚠️ Admin détecté, redirection");
      router.push("/admin");
      return;
    }
    
    console.log("✅ Session valide:", session.username);
    setUser(session);
  }, [router]);

  // Initialisation du formulaire d'édition
  useEffect(() => {
    if (profile) {
      setEditForm({
        username: profile.username || '',
        email: profile.email || '',
        phone: profile.phone || '',
      });
    } else if (user) {
      setEditForm({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [profile, user]);

  // Loading state
  if (isLoading || !user) {
    return <Loader />;
  }
  
  if (error) {
    console.error("❌ Erreur dans useUserProfile:", error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">Erreur: {error}</div>
          <Button onClick={() => refresh()}>Réessayer</Button>
        </div>
      </div>
    );
  }

  // Profil à afficher (avec fallback sur user)
  const displayProfile = profile || {
    userId: user.userId,
    email: user.email,
    phone: user.phone || '',
    username: user.username,
    role: user.role,
    organizationId: user.organizationId,
    isActive: user.isActive,
    createdAt: user.createdAt
  };

  // URL de la photo de profil
  const profilePic = user.photoUri 
    ? user.photoUri 
    : user.photoId 
        ? mediaService.getMediaUrl(user.photoId) 
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=6366f1&color=fff&size=200&bold=true`;

  // Gestionnaires
  const handleLogout = () => {
    authService.logout();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);
      
      const media = await mediaService.uploadFile(file, "users/avatars");
      
      await userProfileService.updateUserProfile(user.userId, {
        photoId: media.id
      } as any);

      const updatedUser = { ...user, photoId: media.id };
      authService.saveSession(updatedUser);
      setUser(updatedUser);
      
      alert("✅ Photo de profil mise à jour !");
    } catch (err) {
      console.error("❌ Erreur mise à jour photo:", err);
      alert("Erreur lors de la mise à jour de la photo");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        username: editForm.username,
        email: editForm.email,
        phone: editForm.phone,
      } as any);
      
      const updatedUser = { 
        ...user, 
        username: editForm.username,
        email: editForm.email,
        phone: editForm.phone 
      };
      authService.saveSession(updatedUser);
      setUser(updatedUser);
      
      setIsEditingProfile(false);
      alert("✅ Profil mis à jour avec succès !");
    } catch (err) {
      console.error("❌ Erreur mise à jour profil:", err);
      alert("Erreur lors de la mise à jour du profil");
    }
  };

  const handleContentSuccess = () => {
    refresh();
    alert("✅ Contenu publié avec succès !");
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setEditingPoiId(null);
  };

  const handleEditPoi = (poiId: string) => {
    setEditingPoiId(poiId);
    setActiveTab('edit-poi');
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Supprimer cet avis ?")) return;
    try {
      await deleteReview(reviewId);
      alert("✅ Avis supprimé");
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (!confirm("Supprimer ce blog ?")) return;
    try {
      await deleteBlog(blogId);
      alert("✅ Blog supprimé");
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  };

  const handleDeletePodcast = async (podcastId: string) => {
    if (!confirm("Supprimer ce podcast ?")) return;
    try {
      await deletePodcast(podcastId);
      alert("✅ Podcast supprimé");
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  };

  const handleDeletePoi = async (poiId: string) => {
    if (!confirm("Supprimer ce POI ? Cette action est irréversible.")) return;
    try {
      await poiService.deletePoi(poiId);
      refresh();
      alert("✅ POI supprimé");
    } catch (err) {
      alert("Erreur lors de la suppression du POI");
    }
  };

  const handlePoiSaved = () => {
    refresh();
    setActiveTab('pois');
    setEditingPoiId(null);
  };

  // Stats calculées
  const calculatedStats = stats || {
    totalPois: myPois?.length || 0,
    totalReviews: myReviews?.length || 0,
    totalBlogs: myBlogs?.length || 0,
    totalPodcasts: myPodcasts?.length || 0,
    recentViews: recentPois?.length || 0
  };

  // Stats POI par statut
  const poiStats = myPois ? {
    pending: myPois.filter(p => !p.is_active).length,
    approved: myPois.filter(p => p.is_active).length,
    total: myPois.length
  } : { pending: 0, approved: 0, total: 0 };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans pb-20">
      
      {/* HERO HEADER */}
      <div className="w-full">
        <div 
          className="relative h-72 w-full overflow-hidden bg-cover bg-center"
          style={{ 
            backgroundImage: "url('/images/fond1.jpg')",
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          <div className="relative max-w-7xl mx-auto px-4 h-full flex items-end pb-8">
            <div className="flex items-end gap-6 w-full">
              
              {/* Avatar */}
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.8 }}
                className="relative group shrink-0"
              >
                <div className="relative w-32 h-32 md:w-40 md:h-40">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary to-purple-400 rounded-full md:rounded-3xl rotate-6 group-hover:rotate-12 transition-transform duration-300 blur-sm" />
                  <div className="relative w-full h-full bg-white dark:bg-zinc-900 rounded-full md:rounded-3xl overflow-hidden border-4 border-white dark:border-zinc-800 shadow-2xl flex items-center justify-center">
                    <Image 
                      src={profilePic} 
                      alt={user.username} 
                      fill 
                      className="object-cover"
                      unoptimized
                      onError={(e) => { 
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=6366f1&color=fff&size=200&bold=true`;
                      }}
                    />
                  </div>
                  
                  <label className="absolute -bottom-2 -right-2 p-2 bg-primary text-white rounded-full md:rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-transform cursor-pointer">
                    <Camera size={18} />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handlePhotoUpload}
                      disabled={uploading}
                    />
                  </label>
                  
                  {uploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-full md:rounded-3xl flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Infos Profil */}
              <div className="flex-1 pb-1 md:pb-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h1 className="text-3xl md:text-5xl font-black text-white mb-2 drop-shadow-lg leading-none">
                    {user.username}
                  </h1>
                  <p className="text-zinc-300 font-medium text-lg mb-3">@{user.username}</p>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/30 uppercase tracking-wide">
                      {user.role === 'USER' ? 'Explorateur' : user.role}
                    </span>
                    <span className="px-4 py-1.5 bg-black/40 backdrop-blur-md text-zinc-200 text-xs font-bold rounded-full border border-white/10">
                      {displayProfile.email}
                    </span>
                    {displayProfile.phone && (
                      <span className="px-4 py-1.5 bg-black/40 backdrop-blur-md text-zinc-200 text-xs font-bold rounded-full border border-white/10">
                        📞 {displayProfile.phone}
                      </span>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Actions Desktop */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="hidden lg:flex flex-col items-end gap-3 pb-2"
              >
                <Button
                  onClick={() => setIsEditingProfile(true)}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30"
                >
                  <Edit size={18} className="mr-2" /> Modifier
                </Button>
                <Button
                  onClick={() => router.push("/")}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30"
                >
                  <MapPinHouse size={18} className="mr-2" /> Carte
                </Button>
                <Button
                  onClick={handleLogout}
                  className="bg-red-500/20 hover:bg-red-500/40 backdrop-blur-md text-white border border-red-500/30"
                >
                  <LogOut size={18} className="mr-2" /> Déconnexion
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* STATISTIQUES */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="max-w-7xl mx-auto px-4 -mt-8 mb-8 relative z-10"
      >
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard
            icon={<MapPin className="text-blue-500" />}
            label="POIs"
            value={calculatedStats.totalPois}
            color="from-blue-500/10 to-blue-500/5"
            subtitle={`${poiStats.approved} actifs, ${poiStats.pending} en attente`}
          />
          <StatCard
            icon={<MessageSquare className="text-green-500" />}
            label="Avis"
            value={calculatedStats.totalReviews}
            color="from-green-500/10 to-green-500/5"
          />
          <StatCard
            icon={<FileText className="text-purple-500" />}
            label="Blogs"
            value={calculatedStats.totalBlogs}
            color="from-purple-500/10 to-purple-500/5"
          />
          <StatCard
            icon={<Mic className="text-orange-500" />}
            label="Podcasts"
            value={calculatedStats.totalPodcasts}
            color="from-orange-500/10 to-orange-500/5"
          />
          <StatCard
            icon={<Eye className="text-pink-500" />}
            label="Vues"
            value={calculatedStats.recentViews}
            color="from-pink-500/10 to-pink-500/5"
          />
        </div>
      </motion.div>

      {/* TABS NAVIGATION */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-x-auto scrollbar-hide">
          <div className="flex p-2 gap-2 min-w-max">
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
              label={`Mes POIs (${myPois?.length || 0})`}
            />
            <TabButton
              active={activeTab === 'reviews'}
              onClick={() => handleTabChange('reviews')}
              icon={<Star size={18} />}
              label={`Avis (${myReviews?.length || 0})`}
            />
            <TabButton
              active={activeTab === 'blogs'}
              onClick={() => handleTabChange('blogs')}
              icon={<FileText size={18} />}
              label={`Blogs (${myBlogs?.length || 0})`}
            />
            <TabButton
              active={activeTab === 'podcasts'}
              onClick={() => handleTabChange('podcasts')}
              icon={<Mic size={18} />}
              label={`Podcasts (${myPodcasts?.length || 0})`}
            />
            <TabButton
              active={activeTab === 'saved'}
              onClick={() => handleTabChange('saved')}
              icon={<Bookmark size={18} />}
              label={`Sauvegardés (${savedPois?.length || 0})`}
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
                stats={calculatedStats}
                poiStats={poiStats}
                myPois={myPois || []}
                recentPois={recentPois || []}
                recentTrips={recentTrips || []}
                savedPois={savedPois || []}
                router={router}
                onAddPoi={() => handleTabChange('add-poi')}
                onAddBlog={() => setIsBlogModalOpen(true)}
                onAddPodcast={() => setIsPodcastModalOpen(true)}
                onEditPoi={handleEditPoi}
              />
            )}

            {activeTab === 'pois' && (
              <PoisTab
                myPois={myPois || []}
                router={router}
                onAddPoi={() => handleTabChange('add-poi')}
                onEditPoi={handleEditPoi}
                onDeletePoi={handleDeletePoi}
                viewMode={viewMode}
                setViewMode={setViewMode}
              />
            )}

            {activeTab === 'reviews' && (
              <ReviewsTab
                myReviews={myReviews || []}
                onDelete={handleDeleteReview}
                router={router}
              />
            )}

            {activeTab === 'blogs' && (
              <BlogsTab
                myBlogs={myBlogs || []}
                onDelete={handleDeleteBlog}
                onAdd={() => setIsBlogModalOpen(true)}
              />
            )}

            {activeTab === 'podcasts' && (
              <PodcastsTab
                myPodcasts={myPodcasts || []}
                onDelete={handleDeletePodcast}
                onAdd={() => setIsPodcastModalOpen(true)}
              />
            )}

            {activeTab === 'saved' && (
              <SavedTab
                savedPois={savedPois || []}
                router={router}
              />
            )}

            {activeTab === 'activity' && (
              <ActivityTab
                recentPois={recentPois || []}
                recentTrips={recentTrips || []}
                router={router}
              />
            )}

            {activeTab === 'add-poi' && (
              <AddPoiPanel 
                onClose={() => handleTabChange('pois')} 
                onSuccess={handlePoiSaved}
              />
            )}

            {activeTab === 'edit-poi' && editingPoiId && (
              <AddPoiPanel 
                poiId={editingPoiId}
                onClose={() => handleTabChange('pois')} 
                onSuccess={handlePoiSaved}
              />
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
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Nom d'utilisateur</label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
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

const OverviewTab = ({ stats, poiStats, myPois, recentPois, recentTrips, savedPois, router, onAddPoi, onAddBlog, onAddPodcast, onEditPoi }: any) => (
  <div className="space-y-6">
    {/* Actions Rapides */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <QuickActionCard
        icon={<Store />}
        title="Nouveau POI"
        description="Créer un point d'intérêt"
        onClick={onAddPoi}
        color="from-blue-600 to-blue-800"
      />
      <QuickActionCard
        icon={<FileText />}
        title="Nouveau Blog"
        description="Partager une expérience"
        onClick={onAddBlog}
        color="from-purple-600 to-purple-800"
      />
      <QuickActionCard
        icon={<Mic />}
        title="Nouveau Podcast"
        description="Enregistrer un audio"
        onClick={onAddPodcast}
        color="from-orange-600 to-orange-800"
      />
    </div>

    {/* Statut POIs */}
    {poiStats.total > 0 && (
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-zinc-900 dark:to-zinc-800 rounded-2xl p-6 border border-blue-100 dark:border-zinc-700">
        <h3 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-2">
          <Building2 size={20} className="text-primary" />
          Statut de vos POIs
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-black text-blue-600 mb-1">{poiStats.total}</div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">Total</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-green-600 mb-1">{poiStats.approved}</div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">Approuvés</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-yellow-600 mb-1">{poiStats.pending}</div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">En attente</div>
          </div>
        </div>
      </section>
    )}

    {/* Mes POIs Récents */}
    {myPois && myPois.length > 0 && (
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold dark:text-white">Mes derniers établissements</h3>
          <button 
            onClick={() => router.push('/profile?tab=pois')}
            className="text-primary text-sm font-bold hover:underline"
          >
            Voir tout →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myPois.slice(0, 6).map((poi: any) => (
            <PoiCard 
              key={poi.poi_id} 
              poi={poi} 
              onClick={() => router.push(`/?poi=${poi.poi_id}`)} 
              onEdit={() => onEditPoi(poi.poi_id)}
              showEdit 
            />
          ))}
        </div>
      </section>
    )}

    {/* POIs Sauvegardés */}
    {savedPois && savedPois.length > 0 && (
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
            <Bookmark className="text-primary" size={20} />
            Lieux sauvegardés
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedPois.slice(0, 3).map((poi: any) => (
            <PoiCard key={poi.poi_id} poi={poi} onClick={() => router.push(`/?poi=${poi.poi_id}`)} showSaved />
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

const PoisTab = ({ myPois, router, onAddPoi, onEditPoi, onDeletePoi, viewMode, setViewMode }: any) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <p className="text-zinc-500">{myPois?.length || 0} établissement(s)</p>
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

    {myPois && myPois.length > 0 ? (
      <div className={clsx(
        "grid gap-4",
        viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
      )}>
        {myPois.map((poi: any) => (
          <PoiCard 
            key={poi.poi_id} 
            poi={poi} 
            onClick={() => router.push(`/?poi=${poi.poi_id}`)} 
            onEdit={() => onEditPoi(poi.poi_id)}
            onDelete={() => onDeletePoi(poi.poi_id)}
            showEdit 
            showDelete
          />
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
    <p className="text-zinc-500 mb-6">{myReviews?.length || 0} avis publié(s)</p>

    {myReviews && myReviews.length > 0 ? (
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
      <h3 className="text-lg font-bold dark:text-white">Mes Blogs ({myBlogs?.length || 0})</h3>
      <Button onClick={onAdd} size="sm" className="gap-2">
        <Plus size={16} /> Nouveau Blog
      </Button>
    </div>

    {myBlogs && myBlogs.length > 0 ? (
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
      <h3 className="text-lg font-bold dark:text-white">Mes Podcasts ({myPodcasts?.length || 0})</h3>
      <Button onClick={onAdd} size="sm" className="gap-2">
        <Plus size={16} /> Nouveau Podcast
      </Button>
    </div>

    {myPodcasts && myPodcasts.length > 0 ? (
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

const SavedTab = ({ savedPois, router }: any) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 mb-6">
      <Bookmark className="text-primary" size={24} />
      <h3 className="text-xl font-bold dark:text-white">Lieux sauvegardés ({savedPois?.length || 0})</h3>
    </div>

    {savedPois && savedPois.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {savedPois.map((poi: any) => (
          <PoiCard key={poi.poi_id} poi={poi} onClick={() => router.push(`/?poi=${poi.poi_id}`)} showSaved />
        ))}
      </div>
    ) : (
      <EmptyState
        icon={<Bookmark size={48} />}
        title="Aucun lieu sauvegardé"
        description="Sauvegardez vos lieux préférés pour les retrouver facilement"
      />
    )}
  </div>
);

const ActivityTab = ({ recentPois, recentTrips, router }: any) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <RecentSection title="Lieux consultés récemment" items={recentPois} type="poi" router={router} />
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

const StatCard = ({ icon, label, value, color, subtitle }: any) => (
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
    {subtitle && <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>}
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

const PoiCard = ({ poi, onClick, onEdit, onDelete, showEdit, showDelete, showSaved }: any) => {
  const getStatusBadge = () => {
    if (!poi.is_active) {
      return (
        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-bold bg-yellow-100 text-yellow-700">
          <AlertCircleIcon size={12} />
          En attente
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-bold bg-green-100 text-green-700">
        <CheckCircle size={12} />
        Approuvé
      </span>
    );
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-lg border border-zinc-200 dark:border-zinc-800 group"
    >
      <div className="relative h-48 bg-zinc-200 cursor-pointer" onClick={onClick}>
        {poi.poi_images_urls?.[0] ? (
          <Image 
            src={poi.poi_images_urls[0]} 
            alt={poi.poi_name} 
            fill 
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-purple-500/20">
            <MapPin size={48} className="text-primary/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-bold text-white line-clamp-1">{poi.poi_name}</h3>
          <p className="text-xs text-white/80">{poi.poi_category} • {poi.address_city}</p>
        </div>
        {showSaved && (
          <div className="absolute top-3 right-3">
            <div className="p-2 bg-white/90 rounded-full">
              <Heart size={16} className="text-red-500 fill-red-500" />
            </div>
          </div>
        )}
      </div>
      {(showEdit || showDelete) && (
        <div className="p-3 flex items-center justify-between">
          {getStatusBadge()}
          <div className="flex items-center gap-2">
            {showEdit && onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="text-primary hover:text-primary-dark p-2 hover:bg-primary/10 rounded-lg transition-colors"
              >
                <Edit size={16} />
              </button>
            )}
            {showDelete && onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

const ReviewCard = ({ review, onDelete }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
  >
    <div className="flex justify-between items-start mb-3">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map(s => (
              <Star 
                key={s} 
                size={16} 
                className={s <= review.rating ? "fill-primary text-primary" : "text-zinc-300"} 
              />
            ))}
          </div>
          <span className="text-xs text-zinc-500">
            {new Date(review.createdAt).toLocaleDateString('fr-FR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
        <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-2">
          {review.reviewText || "Pas de commentaire"}
        </p>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <ThumbsUp size={12} /> {review.likes || 0}
          </span>
        </div>
      </div>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onDelete(review.reviewId);
        }} 
        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
      >
        <Trash2 size={18} />
      </button>
    </div>
  </motion.div>
);

const ContentCard = ({ content, onDelete, type }: any) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-lg border border-zinc-200 dark:border-zinc-800"
  >
    <div className="relative h-48 bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center">
      {content.cover_image_url ? (
        <Image 
          src={content.cover_image_url} 
          alt={content.title} 
          fill 
          className="object-cover"
          unoptimized
        />
      ) : (
        type === 'blog' 
          ? <FileText size={48} className="text-primary/30" /> 
          : <Mic size={48} className="text-primary/30" />
      )}
    </div>
    <div className="p-4">
      <h4 className="font-bold mb-2 line-clamp-1 dark:text-white">{content.title}</h4>
      {content.description && (
        <p className="text-xs text-zinc-500 line-clamp-2 mb-3">{content.description}</p>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {new Date(content.created_at).toLocaleDateString('fr-FR')}
          </span>
          {type === 'podcast' && content.duration_seconds && (
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {Math.floor(content.duration_seconds / 60)}min
            </span>
          )}
        </div>
        <button 
          onClick={() => onDelete()} 
          className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors"
        >
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
      {items && items.length > 0 ? (
        items.slice(0, 5).map((item: any, index: number) => (
          <div 
            key={item.poi_id || item.id || index} 
            className="flex items-center gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl cursor-pointer transition-colors"
            onClick={() => type === 'poi' && router.push(`/?poi=${item.poi_id}`)}
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              {type === 'poi' 
                ? <MapPin size={18} className="text-primary" /> 
                : <Route size={18} className="text-primary" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm dark:text-white truncate">
                {type === 'poi' ? item.poi_name : item.arriveName || 'Destination'}
              </p>
              <p className="text-xs text-zinc-500">
                {type === 'poi' 
                  ? item.address_city 
                  : `${Math.round((item.distance || 0) / 1000)} km`
                }
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

export default function ProfilePage() {
  return (
    <Suspense fallback={<Loader />}>
      <ProfileContent />
    </Suspense>
  );
}