// app/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  User, Mail, Phone, Lock, Camera, LogOut, 
  MapPin, Route, Star, ChevronRight, 
  Settings, Building2, Calendar, TrendingUp,
  MessageSquare, FileText, Mic, Plus,
  Edit, Trash2, Eye, Send, Loader2
} from "lucide-react";
import { authService } from "@/services/authService";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { clsx } from "clsx";

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

  const [activeTab, setActiveTab] = useState<'overview' | 'pois' | 'reviews' | 'blogs' | 'podcasts' | 'activity'>('overview');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ email: '', phone: '' });

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

  const handleSaveProfile = async () => {
    try {
      await updateProfile(editForm);
      setIsEditingProfile(false);
      alert("Profil mis à jour avec succès !");
    } catch (err) {
      alert("Erreur lors de la mise à jour");
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">Erreur: {error}</div>;
  if (!profile) return <div className="min-h-screen flex items-center justify-center">Profil non trouvé</div>;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col lg:flex-row font-sans">
      
      {/* SIDEBAR GAUCHE - Responsive */}
      <div className="w-full lg:w-[350px] bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 p-6 lg:p-8 flex flex-col shrink-0 overflow-y-auto max-h-screen">
        
        {/* Photo de Profil */}
        <div className="relative w-32 h-32 mx-auto mb-6 group">
            <div className="w-full h-full rounded-3xl bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary/20">
               <span className="text-4xl font-black text-primary">
                 {profile.username.charAt(0).toUpperCase()}
               </span>
            </div>
            <button className="absolute -bottom-2 -right-2 p-2.5 bg-primary text-white rounded-xl shadow-lg hover:scale-110 transition-transform">
                <Camera size={18} />
            </button>
        </div>

        <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{profile.username}</h1>
            <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1 bg-primary/5 py-1 px-3 rounded-full inline-block">
                Explorateur Navigoo
            </p>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <StatBox label="POIs" value={stats.totalPois} icon={<MapPin size={16}/>} />
            <StatBox label="Avis" value={stats.totalReviews} icon={<MessageSquare size={16}/>} />
            <StatBox label="Blogs" value={stats.totalBlogs} icon={<FileText size={16}/>} />
            <StatBox label="Podcasts" value={stats.totalPodcasts} icon={<Mic size={16}/>} />
          </div>
        )}

        {/* Infos Profil */}
        <div className="space-y-4 flex-1 overflow-y-auto">
            {isEditingProfile ? (
              <div className="space-y-3">
                <input 
                  type="email" 
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm"
                  placeholder="Email"
                />
                <input 
                  type="tel" 
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm"
                  placeholder="Téléphone"
                />
                <div className="flex gap-2">
                  <Button onClick={handleSaveProfile} className="flex-1" size="sm">Sauvegarder</Button>
                  <Button onClick={() => setIsEditingProfile(false)} variant="outline" size="sm">Annuler</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <InfoBox icon={<Mail size={18}/>} label="Email" value={profile.email} />
                <InfoBox icon={<Phone size={18}/>} label="Téléphone" value={profile.phone || "Non renseigné"} />
                <InfoBox icon={<Lock size={18}/>} label="Mot de passe" value="••••••••••••" />
                <InfoBox icon={<Calendar size={18}/>} label="Membre depuis" value={new Date(profile.createdAt).toLocaleDateString('fr-FR', {month: 'long', year: 'numeric'})} />
                <Button onClick={() => setIsEditingProfile(true)} variant="outline" className="w-full gap-2" size="sm">
                  <Edit size={16}/> Modifier le profil
                </Button>
              </div>
            )}
        </div>

        {/* Actions */}
        <div className="mt-auto space-y-3 pt-6 border-t border-zinc-100 dark:border-zinc-800">
            <Button variant="outline" className="w-full justify-start gap-3 h-12" onClick={() => router.push("/")} size="md">
                <MapPin size={20}/> Retour à la carte
            </Button>
            <Button onClick={handleLogout} className="w-full justify-start gap-3 h-12 bg-red-50 text-red-600 hover:bg-red-100 border-none shadow-none font-bold" size="md">
                <LogOut size={20}/> Se déconnecter
            </Button>
        </div>
      </div>

      {/* CONTENU CENTRAL - Responsive avec scroll */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 space-y-8 pb-24">
        
        {/* Header avec Tabs */}
        <div className="max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white mb-6">Tableau de Bord</h2>
            
            {/* Tabs - Scrollable horizontalement sur mobile */}
            <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800 mb-8 overflow-x-auto pb-2 scrollbar-hide">
              <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Vue d'ensemble" />
              <TabButton active={activeTab === 'pois'} onClick={() => setActiveTab('pois')} label={`Mes POIs (${myPois.length})`} />
              <TabButton active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')} label={`Avis (${myReviews.length})`} />
              <TabButton active={activeTab === 'blogs'} onClick={() => setActiveTab('blogs')} label={`Blogs (${myBlogs.length})`} />
              <TabButton active={activeTab === 'podcasts'} onClick={() => setActiveTab('podcasts')} label={`Podcasts (${myPodcasts.length})`} />
              <TabButton active={activeTab === 'activity'} onClick={() => setActiveTab('activity')} label="Activité" />
            </div>

            {/* Contenu des Tabs */}
            <div className="max-h-[calc(100vh-300px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
              {activeTab === 'overview' && (
                <OverviewTab 
                  stats={stats}
                  myPois={myPois}
                  recentPois={recentPois}
                  recentTrips={recentTrips}
                  router={router}
                />
              )}

              {activeTab === 'pois' && (
                <PoisTab 
                  myPois={myPois}
                  router={router}
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
                  router={router}
                />
              )}

              {activeTab === 'podcasts' && (
                <PodcastsTab 
                  myPodcasts={myPodcasts}
                  onDelete={deletePodcast}
                  router={router}
                />
              )}

              {activeTab === 'activity' && (
                <ActivityTab 
                  recentPois={recentPois}
                  recentTrips={recentTrips}
                  router={router}
                />
              )}
            </div>
        </div>
      </main>

    </div>
  );
}

// --- COMPOSANTS TABS ---

const OverviewTab = ({ stats, myPois, recentPois, recentTrips, router }: any) => (
  <div className="space-y-8">
    {/* Stats Grid - Responsive */}
    {stats && (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard icon={<MapPin/>} label="Points d'intérêt" value={stats.totalPois} color="bg-blue-500" />
        <StatsCard icon={<MessageSquare/>} label="Avis publiés" value={stats.totalReviews} color="bg-green-500" />
        <StatsCard icon={<Eye/>} label="Vues (7j)" value={stats.recentViews} color="bg-primary" />
        <StatsCard icon={<TrendingUp/>} label="Contenu créé" value={stats.totalBlogs + stats.totalPodcasts} color="bg-orange-500" />
      </div>
    )}

    {/* Mes POIs */}
    {myPois.length > 0 && (
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold dark:text-white">Mes établissements</h3>
          <button onClick={() => router.push("/add-poi")} className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
            <Plus size={16}/> Ajouter
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {myPois.slice(0, 4).map(poi => (
            <PoiCard key={poi.poi_id} poi={poi} onClick={() => router.push(`/?poi=${poi.poi_id}`)} />
          ))}
        </div>
      </section>
    )}

    {/* Activité Récente - Responsive Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <RecentSection title="Consultés récemment" items={recentPois} type="poi" router={router} />
      <RecentSection title="Derniers trajets" items={recentTrips} type="trip" router={router} />
    </div>
  </div>
);

const PoisTab = ({ myPois, router }: any) => (
  <div className="space-y-4">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <p className="text-zinc-500">{myPois.length} établissement(s)</p>
      <Button onClick={() => router.push("/add-poi")} className="gap-2 w-full sm:w-auto">
        <Plus size={18}/> Nouveau POI
      </Button>
    </div>
    
    {myPois.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {myPois.map(poi => (
          <PoiCard key={poi.poi_id} poi={poi} onClick={() => router.push(`/add-poi?id=${poi.poi_id}`)} showEdit />
        ))}
      </div>
    ) : (
      <EmptyState 
        icon={<Building2 size={48}/>}
        title="Aucun point d'intérêt"
        description="Créez votre premier établissement"
        action={<Button onClick={() => router.push("/add-poi")}>Créer un POI</Button>}
      />
    )}
  </div>
);

const ReviewsTab = ({ myReviews, onDelete, router }: any) => (
  <div className="space-y-4">
    <p className="text-zinc-500 mb-6">{myReviews.length} avis publié(s)</p>
    
    {myReviews.length > 0 ? (
      myReviews.map((review: any) => (
        <div key={review.reviewId} className="bg-white dark:bg-zinc-900 p-4 md:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={14} className={s <= review.rating ? "fill-primary text-primary" : "text-zinc-300"} />
                ))}
              </div>
              <span className="text-xs text-zinc-500">{new Date(review.createdAt).toLocaleDateString()}</span>
            </div>
            <button onClick={() => onDelete(review.reviewId)} className="text-red-500 hover:text-red-700">
              <Trash2 size={16}/>
            </button>
          </div>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">{review.reviewText || "Pas de commentaire"}</p>
          <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
            <span className="flex items-center gap-1">👍 {review.likes}</span>
            <span className="flex items-center gap-1">👎 {review.dislikes}</span>
          </div>
        </div>
      ))
    ) : (
      <EmptyState 
        icon={<MessageSquare size={48}/>}
        title="Aucun avis"
        description="Partagez votre expérience sur vos lieux préférés"
      />
    )}
  </div>
);

const BlogsTab = ({ myBlogs, onDelete, router }: any) => (
  <div className="space-y-4">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
        <FileText size={20}/> Mes Blogs ({myBlogs.length})
      </h3>
      <Button onClick={() => router.push("/add-content?type=blog")} size="sm" className="gap-2 w-full sm:w-auto">
        <Plus size={16}/> Nouveau Blog
      </Button>
    </div>
    
    {myBlogs.length > 0 ? (
      <div className="space-y-3">
        {myBlogs.map((blog: any) => (
          <ContentCard 
            key={blog.blog_id}
            title={blog.title}
            description={blog.description}
            date={blog.created_at}
            onDelete={() => onDelete(blog.blog_id)}
            type="blog"
          />
        ))}
      </div>
    ) : (
      <EmptyState 
        icon={<FileText size={48}/>}
        title="Aucun blog"
        description="Créez votre premier article de blog"
        action={<Button onClick={() => router.push("/add-content?type=blog")}>Créer un Blog</Button>}
      />
    )}
  </div>
);

const PodcastsTab = ({ myPodcasts, onDelete, router }: any) => (
  <div className="space-y-4">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
        <Mic size={20}/> Mes Podcasts ({myPodcasts.length})
      </h3>
      <Button onClick={() => router.push("/add-content?type=podcast")} size="sm" className="gap-2 w-full sm:w-auto">
        <Plus size={16}/> Nouveau Podcast
      </Button>
    </div>
    
    {myPodcasts.length > 0 ? (
      <div className="space-y-3">
        {myPodcasts.map((podcast: any) => (
          <ContentCard 
            key={podcast.podcast_id}
            title={podcast.title}
            description={podcast.description}
            date={podcast.created_at}
            duration={podcast.duration_seconds}
            onDelete={() => onDelete(podcast.podcast_id)}
            type="podcast"
          />
        ))}
      </div>
    ) : (
      <EmptyState 
        icon={<Mic size={48}/>}
        title="Aucun podcast"
        description="Créez votre premier épisode de podcast"
        action={<Button onClick={() => router.push("/add-content?type=podcast")}>Créer un Podcast</Button>}
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

// --- COMPOSANTS RÉUTILISABLES ---

const TabButton = ({ active, onClick, label }: any) => (
  <button 
    onClick={onClick}
    className={clsx(
      "px-4 py-3 text-sm font-bold transition-colors whitespace-nowrap shrink-0",
      active 
        ? "text-primary border-b-2 border-primary" 
        : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
    )}
  >
    {label}
  </button>
);

const InfoBox = ({ icon, label, value }: any) => (
    <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center gap-4">
        <div className="text-zinc-400 shrink-0">{icon}</div>
        <div className="overflow-hidden flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">{label}</p>
            <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300 truncate">{value}</p>
        </div>
    </div>
);

const StatBox = ({ label, value, icon }: any) => (
  <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
    <div className="flex items-center gap-2 text-zinc-400 mb-1">
      {icon}
      <span className="text-[10px] font-black uppercase">{label}</span>
    </div>
    <p className="text-2xl font-black text-primary">{value}</p>
  </div>
);

const StatsCard = ({ icon, label, value, color }: any) => (
  <div className="bg-white dark:bg-zinc-900 p-4 md:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white mb-4`}>
      {icon}
    </div>
    <p className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white mb-1">{value}</p>
    <p className="text-xs md:text-sm text-zinc-500">{label}</p>
  </div>
);

const PoiCard = ({ poi, onClick, showEdit }: any) => (
  <div 
    onClick={onClick}
    className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-primary cursor-pointer transition-all group"
  >
    <div className="flex gap-3">
      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-zinc-200">
        {poi.poi_images_urls?.[0] && (
          <Image src={poi.poi_images_urls[0]} alt="" width={64} height={64} className="object-cover w-full h-full" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-zinc-900 dark:text-white line-clamp-1">{poi.poi_name}</h3>
        <p className="text-xs text-zinc-500 mt-1">{poi.poi_category} • {poi.address_city}</p>
        {showEdit && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Actif</span>
            <span className="text-xs text-primary group-hover:underline">Modifier</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

const RecentSection = ({ title, items, type, router }: any) => (
  <section>
    <h3 className="text-lg font-bold dark:text-white mb-4">{title}</h3>
    <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
      {items.length > 0 ? (
        items.slice(0, 5).map((item: any) => (
          <div key={item.poi_id || item.id} className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-primary cursor-pointer transition-colors">
            <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
              {type === 'poi' ? <MapPin size={18} className="text-primary"/> : <Route size={18} className="text-primary"/>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-zinc-900 dark:text-white truncate">
                {type === 'poi' ? item.poi_name : item.arriveName || 'Destination'}
              </p>
              <p className="text-xs text-zinc-500">
                {type === 'poi' ? item.address_city : `${Math.round((item.distance || 0) / 1000)} km`}
              </p>
            </div>
            <ChevronRight size={16} className="text-zinc-300 shrink-0"/>
          </div>
        ))
      ) : (
        <p className="text-sm text-zinc-400 italic text-center py-8">Aucune donnée</p>
      )}
    </div>
  </section>
);

const ContentCard = ({ title, description, date, duration, onDelete, type }: any) => (
  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-2">
        {type === 'blog' ? <FileText size={16} className="text-primary shrink-0" /> : <Mic size={16} className="text-primary shrink-0" />}
        <h4 className="font-semibold text-sm dark:text-white truncate">{title}</h4>
      </div>
      {description && <p className="text-xs text-zinc-500 line-clamp-2 mb-2">{description}</p>}
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <span>{new Date(date).toLocaleDateString()}</span>
        {duration && <><span>•</span><span>{Math.floor(duration / 60)} min</span></>}
      </div>
    </div>
    <button onClick={onDelete} className="text-red-500 hover:text-red-700 p-2 shrink-0">
      <Trash2 size={16}/>
    </button>
  </div>
);

const EmptyState = ({ icon, title, description, action }: any) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="text-zinc-300 mb-4">{icon}</div>
    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">{title}</h3>
    <p className="text-sm text-zinc-500 mb-6 max-w-sm">{description}</p>
    {action}
  </div>
);