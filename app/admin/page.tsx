'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/admin/Sidebar';
import { StatsCard } from '@/components/admin/StatCards';
import { Chart } from '@/components/admin/Chart';
import { RecentActivity } from '@/components/admin/RecentActivity';
import { DataTable, Column } from '@/components/admin/DataTable';
<<<<<<< HEAD
import { Modal } from '@/components/admin/Modal';
=======
import { Modal } from '@/components/admin/Modal'; // Import du nouveau composant
>>>>>>> d23c286 (feat: Enhance API call logging and handle non-JSON responses)
import { 
  DashboardAPI, 
  PoiAPI, 
  ReviewAPI, 
  UserAPI, 
<<<<<<< HEAD
  BlogAPI,
  PodcastAPI,
  AccessLogAPI,
  PointOfInterest,
  PoiReview,
  AppUser,
  Blog,
  Podcast,
  PoiAccessLog
=======
  OrganizationAPI,
  StatisticsAPI,
  PointOfInterest,
  PoiReview,
  AppUser,
  Organization,
  PoiPlatformStat
>>>>>>> d23c286 (feat: Enhance API call logging and handle non-JSON responses)
} from '@/services/adminService';
import { authService } from '@/services/authService';
import { formatDate, formatCompactNumber, getPoiCategoryLabel, cn } from '@/components/admin/utils';
import { Eye, CheckCircle, XCircle, AlertCircle, Edit, Trash2, MapPin, User, Star } from 'lucide-react';

export default function AdminPage() {
<<<<<<< HEAD
  const router = useRouter();
  
  // Vérification admin au montage
  useEffect(() => {
    const session = authService.getSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      router.push('/signin');
      return;
    }
  }, [router]);

=======
>>>>>>> d23c286 (feat: Enhance API call logging and handle non-JSON responses)
  // --- NAVIGATION & LOADING ---
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // --- DATA STATES ---
  const [dashboardData, setDashboardData] = useState({
<<<<<<< HEAD
    totalPois: 0, activePois: 0, pendingPois: 0, totalUsers: 0, totalReviews: 0, 
=======
    totalPois: 0, activePois: 0, totalUsers: 0, totalReviews: 0, 
>>>>>>> d23c286 (feat: Enhance API call logging and handle non-JSON responses)
    averageRating: 0, totalViews: 0, totalLikes: 0,
  });
  const [pois, setPois] = useState<PointOfInterest[]>([]);
  const [reviews, setReviews] = useState<PoiReview[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
<<<<<<< HEAD
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [accessLogs, setAccessLogs] = useState<PoiAccessLog[]>([]);

  // --- MODAL STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'POI' | 'POI_DETAIL' | 'USER' | 'REVIEW' | null>(null);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT' | 'VIEW'>('CREATE');
  const [selectedPoi, setSelectedPoi] = useState<Partial<PointOfInterest>>({});
  const [selectedUser, setSelectedUser] = useState<Partial<AppUser>>({});
  const [selectedPoiDetail, setSelectedPoiDetail] = useState<PointOfInterest | null>(null);
  const [poiBlogs, setPoiBlogs] = useState<Blog[]>([]);
  const [poiPodcasts, setPoiPodcasts] = useState<Podcast[]>([]);
  const [poiReviews, setPoiReviews] = useState<PoiReview[]>([]);
  const [poiLogs, setPoiLogs] = useState<PoiAccessLog[]>([]);
=======
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [stats, setStats] = useState<PoiPlatformStat[]>([]);

  // --- MODAL STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'POI' | 'USER' | null>(null);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [selectedPoi, setSelectedPoi] = useState<Partial<PointOfInterest>>({});
  const [selectedUser, setSelectedUser] = useState<Partial<AppUser>>({});
>>>>>>> d23c286 (feat: Enhance API call logging and handle non-JSON responses)

  // --- INITIAL LOAD ---
  useEffect(() => {
    loadGlobalData();
  }, []);

<<<<<<< HEAD
=======
  // Chargement spécifique pour les stats quand on clique sur l'onglet
  useEffect(() => {
    if (currentSection === 'analytics' && stats.length === 0) {
      loadAnalytics();
    }
  }, [currentSection]);

>>>>>>> d23c286 (feat: Enhance API call logging and handle non-JSON responses)
  const loadGlobalData = async () => {
    try {
      setLoading(true);
      const [overview, poisData, reviewsData, usersData, blogsData, podcastsData, logsData] = await Promise.all([
        DashboardAPI.getOverview(),
        PoiAPI.getAll(),
        ReviewAPI.getAll(),
        UserAPI.getAll(),
        BlogAPI.getAll(),
        PodcastAPI.getAll(),
        AccessLogAPI.getAll(),
      ]);

      setDashboardData(overview);
      setPois(poisData);
      setReviews(reviewsData);
      setUsers(usersData);
      setBlogs(blogsData);
      setPodcasts(podcastsData);
      setAccessLogs(logsData);
      
      console.log('📊 Dashboard chargé:', {
        pois: poisData.length,
        users: usersData.length,
        reviews: reviewsData.length,
        blogs: blogsData.length,
        podcasts: podcastsData.length
      });
    } catch (error) {
      console.error('❌ Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  // --- POI DETAIL MODAL ---
  const openPoiDetailModal = async (poi: PointOfInterest) => {
    setSelectedPoiDetail(poi);
    setModalType('POI_DETAIL');
    setModalMode('VIEW');
    
    // Charger les détails du POI
    const [blogs, podcasts, reviews, logs] = await Promise.all([
      BlogAPI.getByPoi(poi.poi_id),
      PodcastAPI.getByPoi(poi.poi_id),
      ReviewAPI.getByPoi(poi.poi_id),
      AccessLogAPI.getByPoi(poi.poi_id),
    ]);
    
    setPoiBlogs(blogs);
    setPoiPodcasts(podcasts);
    setPoiReviews(reviews);
    setPoiLogs(logs);
    setIsModalOpen(true);
  };

  // --- CRUD ACTIONS (POI) ---
  const openPoiModal = (mode: 'CREATE' | 'EDIT', poi?: PointOfInterest) => {
    setModalType('POI');
    setModalMode(mode);
    setSelectedPoi(poi || { 
        poi_name: '', 
        poi_category: 'FOOD_DRINK', 
        poi_type: 'OTHER',
        is_active: false, 
        latitude: 0, 
        longitude: 0, 
        organization_id: 'default',
        address_country: 'Cameroon'
    });
    setIsModalOpen(true);
  };

  const handleSavePoi = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalMode === 'CREATE') {
        const session = authService.getSession();
        await PoiAPI.create({ 
          ...selectedPoi, 
          created_by_user_id: session?.userId || 'admin' 
        });
      } else if (selectedPoi.poi_id) {
        await PoiAPI.update(selectedPoi.poi_id, selectedPoi);
      }
      setIsModalOpen(false);
      loadGlobalData();
      alert('✅ POI sauvegardé avec succès');
    } catch (error) { 
      console.error("Erreur sauvegarde POI", error);
      alert('❌ Erreur lors de la sauvegarde');
    }
  };

  const handleApprovePoi = async (id: string) => {
    if (!confirm('Approuver ce POI ?')) return;
    try {
      const session = authService.getSession();
      await PoiAPI.activate(id, session?.userId || 'admin');
      loadGlobalData();
      alert('✅ POI approuvé et publié');
    } catch (error) {
      console.error("Erreur approbation POI", error);
      alert('❌ Erreur lors de l\'approbation');
    }
  };

  const handleRejectPoi = async (id: string) => {
    if (!confirm('Rejeter ce POI ?')) return;
    try {
      const session = authService.getSession();
      await PoiAPI.reject(id, session?.userId || 'admin');
      loadGlobalData();
      alert('⛔ POI rejeté');
    } catch (error) {
      console.error("Erreur rejet POI", error);
    }
  };

  const handleTogglePoiStatus = async (id: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await PoiAPI.deactivate(id);
        alert('❌ POI désactivé');
      } else {
        const session = authService.getSession();
        await PoiAPI.activate(id, session?.userId || 'admin');
        alert('✅ POI activé');
      }
      loadGlobalData();
    } catch (error) {
      console.error("Erreur toggle status POI", error);
    }
  };

  const handleDeletePoi = async (id: string) => {
    if (!confirm('⚠️ Supprimer définitivement ce POI ? Cette action est irréversible.')) return;
    try {
      await PoiAPI.delete(id);
      loadGlobalData();
      alert('🗑️ POI supprimé');
    } catch (error) {
      console.error("Erreur suppression POI", error);
    }
  };

  // --- CRUD ACTIONS (USER) ---
  const openUserModal = (mode: 'CREATE' | 'EDIT', user?: AppUser) => {
    setModalType('USER');
    setModalMode(mode);
    setSelectedUser(user || { 
      username: '', 
      email: '', 
      role: 'USER', 
      isActive: true,
      organizationId: 'default',
      userId: '',
      createdAt: ''
    });
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalMode === 'CREATE') {
        await UserAPI.create(selectedUser);
      } else if (selectedUser.userId) {
        await UserAPI.update(selectedUser.userId, selectedUser);
      }
      setIsModalOpen(false);
      loadGlobalData();
      alert('✅ Utilisateur sauvegardé');
    } catch (error) { 
      console.error("Erreur sauvegarde utilisateur", error);
      alert('❌ Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    try {
      await UserAPI.delete(id);
      loadGlobalData();
      alert('🗑️ Utilisateur supprimé');
    } catch (error) {
      console.error("Erreur suppression utilisateur", error);
    }
  };

  // --- CRUD ACTIONS (REVIEW) ---
  const handleDeleteReview = async (id: string) => {
    if (!confirm('Supprimer cet avis ?')) return;
    try {
      await ReviewAPI.delete(id);
      loadGlobalData();
      alert('🗑️ Avis supprimé');
    } catch (error) {
      console.error("Erreur suppression avis", error);
    }
  };

  // --- DATA PREPARATION ---
  const recentActivities = React.useMemo(() => {
    const activities: any[] = [];
    
    // POIs récents
    pois.slice(0, 5).forEach(poi => {
      activities.push({
        id: poi.poi_id,
        type: 'poi' as const,
        title: poi.is_active ? 'POI actif' : 'POI en attente',
        description: poi.poi_name,
        timestamp: poi.created_at,
        user: poi.created_by_user_id || 'Utilisateur'
      });
    });
    
    // Reviews récentes
    reviews.slice(0, 3).forEach(review => {
      activities.push({
        id: review.reviewId,
        type: 'review' as const,
        title: 'Nouvel avis',
        description: `${review.rating} ⭐ - ${review.reviewText?.substring(0, 50) || 'Sans commentaire'}`,
        timestamp: review.createdAt,
        user: review.userId
      });
    });
    
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  }, [pois, reviews]);

=======
  const loadAnalytics = async () => {
    try {
      const data = await StatisticsAPI.getAll();
      setStats(data);
    } catch (e) { console.error("Error stats", e); }
  };

  // --- CRUD ACTIONS (POI) ---
  const openPoiModal = (mode: 'CREATE' | 'EDIT', poi?: PointOfInterest) => {
    setModalType('POI');
    setModalMode(mode);
    setSelectedPoi(poi || { 
        poi_name: '', poi_category: 'FOOD_DRINK', is_active: true, 
        latitude: 0, longitude: 0, organization_id: 'default' 
    });
    setIsModalOpen(true);
  };

  const handleSavePoi = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalMode === 'CREATE') {
        await PoiAPI.create({ ...selectedPoi, created_by_user_id: 'admin' });
      } else if (selectedPoi.poi_id) {
        await PoiAPI.update(selectedPoi.poi_id, selectedPoi);
      }
      setIsModalOpen(false);
      loadGlobalData(); // Refresh list
    } catch (error) { console.error("Save POI error", error); }
  };

  const handleDeletePoi = async (id: string) => {
    if (confirm('Supprimer ce POI ?')) {
      await PoiAPI.delete(id);
      loadGlobalData();
    }
  };

  // --- CRUD ACTIONS (USER) ---
  const openUserModal = (mode: 'CREATE' | 'EDIT', user?: AppUser) => {
    setModalType('USER');
    setModalMode(mode);
    setSelectedUser(user || { username: '', email: '', role: 'USER', isActive: true });
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalMode === 'CREATE') await UserAPI.create(selectedUser);
      else if (selectedUser.userId) await UserAPI.update(selectedUser.userId, selectedUser);
      setIsModalOpen(false);
      loadGlobalData();
    } catch (error) { console.error("Save User error", error); }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Supprimer cet utilisateur ?')) {
      await UserAPI.delete(id);
      loadGlobalData();
    }
  };

  // --- DATA PREPARATION ---
  const recentActivities = [
    { id: '1', type: 'poi' as const, title: 'Nouveau POI créé', description: 'Hôtel Hilton Yaoundé ajouté', timestamp: new Date().toISOString(), user: 'Admin' },
    // ... vos activités hardcodées ou dynamiques ici
  ];

>>>>>>> d23c286 (feat: Enhance API call logging and handle non-JSON responses)
  const categoryData = React.useMemo(() => {
    const categories = pois.reduce((acc, poi) => {
      acc[poi.poi_category] = (acc[poi.poi_category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
<<<<<<< HEAD
    return Object.entries(categories).map(([label, value]) => ({ 
      label: getPoiCategoryLabel(label), 
      value 
    }));
  }, [pois]);

  const statusData = React.useMemo(() => [
    { label: 'Actifs', value: pois.filter(p => p.is_active).length },
    { label: 'En attente', value: pois.filter(p => !p.is_active).length },
  ], [pois]);

  // --- COLUMNS DEFINITIONS ---
=======
    return Object.entries(categories).map(([label, value]) => ({ label: getPoiCategoryLabel(label), value }));
  }, [pois]);

  // Données dynamiques pour les graphiques analytiques
  const analyticsData = React.useMemo(() => {
    const platforms = stats.reduce((acc, curr) => {
        const found = acc.find(a => a.label === curr.platformType);
        if(found) found.value += curr.views;
        else acc.push({ label: curr.platformType, value: curr.views });
        return acc;
    }, [] as {label: string, value: number}[]);
    
    // Simuler des données mensuelles si pas assez de stats réelles
    const timeline = [ { label: 'Jan', value: 65 }, { label: 'Fév', value: 59 }, { label: 'Mar', value: 80 } ];
    
    return { platforms, timeline };
  }, [stats]);


  // --- COLUMNS DEFINITIONS (Gardées intactes) ---
>>>>>>> d23c286 (feat: Enhance API call logging and handle non-JSON responses)
  const poiColumns: Column<PointOfInterest>[] = [
    {
      key: 'poi_name',
      label: 'Nom',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
<<<<<<< HEAD
          <div className="h-10 w-10 rounded-lg overflow-hidden bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
            {row.poi_images_urls?.[0] ? (
              <img src={row.poi_images_urls[0]} alt="" className="w-full h-full object-cover" />
            ) : (
              row.poi_name?.charAt(0) || 'P'
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 dark:text-white truncate">{row.poi_name}</p>
            <p className="text-xs text-gray-500 truncate">{getPoiCategoryLabel(row.poi_category)}</p>
=======
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-bold">
            {row.poi_name?.charAt(0) || 'P'}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{row.poi_name}</p>
            <p className="text-xs text-gray-500">{getPoiCategoryLabel(row.poi_category)}</p>
>>>>>>> d23c286 (feat: Enhance API call logging and handle non-JSON responses)
          </div>
        </div>
      ),
    },
<<<<<<< HEAD
    { 
      key: 'address_city', 
      label: 'Ville', 
      sortable: true,
      render: (row) => (
        <div>
          <p className="text-sm">{row.address_city || 'Non renseigné'}</p>
          <p className="text-xs text-gray-500">{row.address_informal}</p>
=======
    { key: 'address_city', label: 'Ville', sortable: true },
    {
      key: 'popularity_score',
      label: 'Popularité',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="h-2 w-24 rounded-full bg-gray-200 dark:bg-gray-700">
            <div className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-500" style={{ width: `${row.popularity_score || 0}%` }} />
          </div>
          <span className="text-xs">{row.popularity_score || 0}</span>
>>>>>>> d23c286 (feat: Enhance API call logging and handle non-JSON responses)
        </div>
      )
    },
    {
      key: 'is_active',
      label: 'Statut',
      render: (row) => (
<<<<<<< HEAD
        <span className={cn(
          'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium',
          row.is_active 
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
            : row.approval_status === 'REJECTED'
            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
        )}>
          <span className={cn(
            'h-2 w-2 rounded-full',
            row.is_active ? 'bg-emerald-500' : row.approval_status === 'REJECTED' ? 'bg-red-500' : 'bg-yellow-500'
          )} />
          {row.is_active ? 'Actif' : row.approval_status === 'REJECTED' ? 'Rejeté' : 'En attente'}
        </span>
      ),
    },
    { 
      key: 'created_at', 
      label: 'Date', 
      sortable: true, 
      render: (row) => (
        <div>
          <p className="text-sm">{formatDate(row.created_at)}</p>
          <p className="text-xs text-gray-500">par {row.created_by_user_id?.substring(0, 8)}</p>
        </div>
      )
    },
=======
        <span className={cn('inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium', row.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400')}>
          <span className={cn('h-2 w-2 rounded-full', row.is_active ? 'bg-emerald-500' : 'bg-gray-400')} />
          {row.is_active ? 'Actif' : 'Inactif'}
        </span>
      ),
    },
    { key: 'created_at', label: 'Date', sortable: true, render: (row) => formatDate(row.created_at) },
>>>>>>> d23c286 (feat: Enhance API call logging and handle non-JSON responses)
  ];

  const reviewColumns: Column<PoiReview>[] = [
    {
<<<<<<< HEAD
      key: 'rating', 
      label: 'Note',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} className={i < row.rating ? 'fill-current' : ''} />
            ))}
          </div>
          <span className="text-sm font-bold">{row.rating}/5</span>
        </div>
      )
    },
    { 
      key: 'reviewText', 
      label: 'Commentaire', 
      render: (row) => (
        <p className="truncate max-w-xs text-sm text-gray-600 dark:text-gray-300">
          {row.reviewText || 'Pas de commentaire'}
        </p>
      )
    },
    { 
      key: 'platformType', 
      label: 'Source', 
      render: (row) => (
        <span className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded">
          {row.platformType}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (row) => formatDate(row.createdAt)
    }
=======
        key: 'rating', label: 'Note',
        render: (row) => (
          <div className="flex text-amber-400">
             {[...Array(5)].map((_, i) => (
                <svg key={i} className={cn('h-4 w-4', i < row.rating ? 'fill-current' : 'text-gray-300')} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
             ))}
          </div>
        )
    },
    { key: 'reviewText', label: 'Commentaire', render: (row) => <p className="truncate max-w-xs text-sm text-gray-600 dark:text-gray-300">{row.reviewText}</p> },
    { key: 'platformType', label: 'Source', render: (row) => <span className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded">{row.platformType}</span> },
>>>>>>> d23c286 (feat: Enhance API call logging and handle non-JSON responses)
  ];

  const userColumns: Column<AppUser>[] = [
    {
      key: 'username',
      label: 'Utilisateur',
      render: (row) => (
        <div className="flex items-center gap-3">
<<<<<<< HEAD
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
            {row.photoUri ? (
              <img src={row.photoUri} alt="" className="w-full h-full object-cover rounded-full" />
            ) : (
              row.username?.charAt(0).toUpperCase() || 'U'
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 dark:text-white truncate">{row.username}</p>
            <p className="text-xs text-gray-500 truncate">{row.email}</p>
=======
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-bold">
            {row.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{row.username}</p>
            <p className="text-xs text-gray-500">{row.email}</p>
>>>>>>> d23c286 (feat: Enhance API call logging and handle non-JSON responses)
          </div>
        </div>
      ),
    },
    { 
<<<<<<< HEAD
      key: 'role', 
      label: 'Rôle', 
      render: (row) => (
        <span className={cn(
          'px-2 py-1 rounded text-xs font-bold',
          row.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-700' :
          row.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 
          'bg-blue-100 text-blue-700'
        )}>
          {row.role}
        </span>
      )
    },
    {
      key: 'isActive', 
      label: 'Statut',
      render: (row) => (
        <span className={cn(
          'text-xs font-medium',
          row.isActive ? 'text-green-600' : 'text-red-600'
        )}>
          {row.isActive ? 'Actif' : 'Inactif'}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Inscription',
      sortable: true,
      render: (row) => formatDate(row.createdAt)
=======
        key: 'role', label: 'Rôle', 
        render: (row) => <span className={cn('px-2 py-1 rounded text-xs font-bold', row.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700')}>{row.role}</span>
    },
    {
        key: 'isActive', label: 'Statut',
        render: (row) => <span className={row.isActive ? 'text-green-600 text-xs font-medium' : 'text-red-600 text-xs font-medium'}>{row.isActive ? 'Actif' : 'Inactif'}</span>
>>>>>>> d23c286 (feat: Enhance API call logging and handle non-JSON responses)
    }
  ];

  // --- RENDERS PER SECTION ---
<<<<<<< HEAD
  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Points d'Intérêt" 
          value={formatCompactNumber(dashboardData.totalPois)} 
          subtitle={`${dashboardData.activePois} actifs, ${dashboardData.pendingPois} en attente`}
          variant="default" 
          trend={{ direction: 'up', percentage: 12.5 }} 
          icon={<MapPin className="h-6 w-6 text-violet-600" />} 
        />
        <StatsCard 
          title="Utilisateurs" 
          value={formatCompactNumber(dashboardData.totalUsers)} 
          variant="accent" 
          trend={{ direction: 'up', percentage: 8.2 }} 
          icon={<User className="h-6 w-6 text-fuchsia-600" />} 
        />
        <StatsCard 
          title="Avis" 
          value={formatCompactNumber(dashboardData.totalReviews)} 
          subtitle={`${dashboardData.averageRating.toFixed(1)} ⭐ moyenne`}
          variant="success" 
          trend={{ direction: 'up', percentage: 15.3 }} 
          icon={<Star className="h-6 w-6 text-emerald-600" />} 
        />
        <StatsCard 
          title="Vues totales" 
          value={formatCompactNumber(dashboardData.totalViews)} 
          variant="warning" 
          trend={{ direction: 'up', percentage: 23.1 }} 
          icon={<Eye className="h-6 w-6 text-amber-600" />} 
        />
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <Chart type="doughnut" data={categoryData} title="POIs par catégorie" />
        <Chart type="doughnut" data={statusData} title="Statut des POIs" />
      </div>
      
=======
  
  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Points d'Intérêt" value={formatCompactNumber(dashboardData.totalPois)} subtitle={`${dashboardData.activePois} actifs`} variant="default" trend={{ direction: 'up', percentage: 12.5 }} icon={<svg className="h-6 w-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>} />
        <StatsCard title="Utilisateurs" value={formatCompactNumber(dashboardData.totalUsers)} variant="accent" trend={{ direction: 'up', percentage: 8.2 }} icon={<svg className="h-6 w-6 text-fuchsia-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} />
        <StatsCard title="Avis" value={formatCompactNumber(dashboardData.totalReviews)} subtitle={`${dashboardData.averageRating.toFixed(1)} ⭐ moyenne`} variant="success" trend={{ direction: 'up', percentage: 15.3 }} icon={<svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>} />
        <StatsCard title="Vues totales" value={formatCompactNumber(dashboardData.totalViews)} variant="warning" trend={{ direction: 'up', percentage: 23.1 }} icon={<svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Chart type="area" data={analyticsData.timeline} title="Activité globale" />
        <Chart type="doughnut" data={categoryData} title="Répartition par catégorie" />
      </div>
>>>>>>> d23c286 (feat: Enhance API call logging and handle non-JSON responses)
      <RecentActivity activities={recentActivities} />
    </div>
  );

<<<<<<< HEAD
  const renderPending = () => {
    const pendingPois = pois.filter(p => !p.is_active || p.approval_status === 'PENDING');
    
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="text-yellow-600" size={24} />
          <div>
            <p className="font-bold text-yellow-900 dark:text-yellow-100">
              {pendingPois.length} POI(s) en attente de validation
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Vérifiez et approuvez les nouveaux lieux soumis par les utilisateurs
            </p>
          </div>
        </div>

        {pendingPois.length > 0 ? (
          <DataTable
            columns={poiColumns}
            data={pendingPois}
            searchPlaceholder="Rechercher un POI..."
            actions={(row) => (
              <div className="flex gap-2">
                <button 
                  onClick={() => openPoiDetailModal(row)}
                  className="rounded-lg p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 transition-colors"
                  title="Voir détails"
                >
                  <Eye size={18} />
                </button>
                <button 
                  onClick={() => handleApprovePoi(row.poi_id)}
                  className="rounded-lg p-2 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 transition-colors"
                  title="Approuver"
                >
                  <CheckCircle size={18} />
                </button>
                <button 
                  onClick={() => handleRejectPoi(row.poi_id)}
                  className="rounded-lg p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-colors"
                  title="Rejeter"
                >
                  <XCircle size={18} />
                </button>
              </div>
            )}
          />
        ) : (
          <div className="text-center py-12 text-gray-500">
            <CheckCircle size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Aucun POI en attente</p>
            <p className="text-sm">Tous les POIs sont validés ou rejetés</p>
          </div>
        )}
      </div>
    );
  };
=======
  const renderAnalytics = () => (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid gap-6 md:grid-cols-2">
            <Chart type="bar" data={analyticsData.platforms} title="Vues par Plateforme" />
            <Chart type="doughnut" data={analyticsData.platforms} title="Distribution du Traffic" />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700"><h3 className="font-bold">Détails des Statistiques</h3></div>
              <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                      <tr><th className="p-3">Date</th><th className="p-3">Plateforme</th><th className="p-3">Vues</th><th className="p-3">Likes</th></tr>
                  </thead>
                  <tbody>
                      {stats.slice(0, 10).map((s, i) => (
                          <tr key={i} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <td className="p-3">{formatDate(s.statDate)}</td>
                              <td className="p-3">{s.platformType}</td>
                              <td className="p-3 font-medium">{s.views}</td>
                              <td className="p-3 text-green-600">{s.likes}</td>
                          </tr>
                      ))}
                      {stats.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-500">Aucune donnée disponible</td></tr>}
                  </tbody>
              </table>
          </div>
      </div>
  );
>>>>>>> d23c286 (feat: Enhance API call logging and handle non-JSON responses)

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar currentSection={currentSection} onNavigate={setCurrentSection} />
      
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl p-6 lg:p-8">
          {/* Header */}
          <header className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white capitalize">
                {currentSection === 'dashboard' ? 'Tableau de bord' : 
                 currentSection === 'pois' ? 'Points d\'Intérêt' :
<<<<<<< HEAD
                 currentSection === 'pending' ? 'En attente de validation' :
                 currentSection}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Gestion et supervision de la plateforme Navigoo
              </p>
            </div>
            
            {/* Boutons d'ajout contextuels */}
            {currentSection === 'pois' && (
              <button 
                onClick={() => openPoiModal('CREATE')} 
                className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg shadow-sm transition-all flex items-center gap-2"
              >
                <span className="text-xl leading-none">+</span> Ajouter un POI
              </button>
            )}
            {currentSection === 'users' && (
              <button 
                onClick={() => openUserModal('CREATE')} 
                className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg shadow-sm transition-all flex items-center gap-2"
              >
                <span className="text-xl leading-none">+</span> Ajouter un Utilisateur
              </button>
=======
                 currentSection === 'analytics' ? 'Analytiques' : currentSection}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Gestion et supervision de la plateforme</p>
            </div>
            {/* Boutons d'ajout contextuels */}
            {currentSection === 'pois' && (
                <button onClick={() => openPoiModal('CREATE')} className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg shadow-sm transition-all flex items-center gap-2">
                    <span className="text-xl leading-none">+</span> Ajouter un POI
                </button>
            )}
            {currentSection === 'users' && (
                <button onClick={() => openUserModal('CREATE')} className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg shadow-sm transition-all flex items-center gap-2">
                    <span className="text-xl leading-none">+</span> Ajouter un Utilisateur
                </button>
>>>>>>> d23c286 (feat: Enhance API call logging and handle non-JSON responses)
            )}
          </header>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
            </div>
          ) : (
            <>
              {currentSection === 'dashboard' && renderDashboard()}
              
<<<<<<< HEAD
              {currentSection === 'pending' && renderPending()}
=======
              {currentSection === 'analytics' && renderAnalytics()}
>>>>>>> d23c286 (feat: Enhance API call logging and handle non-JSON responses)

              {currentSection === 'pois' && (
                <DataTable
                  columns={poiColumns}
                  data={pois}
                  searchPlaceholder="Rechercher un POI..."
                  actions={(row) => (
                    <div className="flex gap-2">
<<<<<<< HEAD
                      <button 
                        onClick={() => openPoiDetailModal(row)}
                        className="rounded-lg p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 transition-colors"
                        title="Voir détails"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => openPoiModal('EDIT', row)} 
                        className="rounded-lg p-2 hover:bg-violet-100 dark:hover:bg-violet-900/30 text-violet-600 transition-colors"
                        title="Modifier"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleTogglePoiStatus(row.poi_id, row.is_active)}
                        className={cn(
                          "rounded-lg p-2 transition-colors",
                          row.is_active 
                            ? "hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600"
                            : "hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600"
                        )}
                        title={row.is_active ? 'Désactiver' : 'Activer'}
                      >
                        {row.is_active ? <XCircle size={18} /> : <CheckCircle size={18} />}
                      </button>
                      <button 
                        onClick={() => handleDeletePoi(row.poi_id)} 
                        className="rounded-lg p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
=======
                      <button onClick={() => openPoiModal('EDIT', row)} className="rounded-lg p-2 hover:bg-violet-100 dark:hover:bg-violet-900/30 text-violet-600 transition-colors">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleDeletePoi(row.poi_id)} className="rounded-lg p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-colors">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
>>>>>>> d23c286 (feat: Enhance API call logging and handle non-JSON responses)
                      </button>
                    </div>
                  )}
                />
              )}

              {currentSection === 'reviews' && (
<<<<<<< HEAD
                <DataTable 
                  columns={reviewColumns} 
                  data={reviews} 
                  searchPlaceholder="Rechercher un avis..."
                  actions={(row) => (
                    <button 
                      onClick={() => handleDeleteReview(row.reviewId)}
                      className="rounded-lg p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                />
=======
                <DataTable columns={reviewColumns} data={reviews} searchPlaceholder="Rechercher un avis..." />
>>>>>>> d23c286 (feat: Enhance API call logging and handle non-JSON responses)
              )}

              {currentSection === 'users' && (
                <DataTable
                  columns={userColumns}
                  data={users}
                  searchPlaceholder="Rechercher un utilisateur..."
                  actions={(row) => (
                    <div className="flex gap-2">
<<<<<<< HEAD
                      <button 
                        onClick={() => openUserModal('EDIT', row)} 
                        className="p-2 text-gray-500 hover:text-violet-600"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(row.userId)} 
                        className="p-2 text-gray-500 hover:text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
=======
                        <button onClick={() => openUserModal('EDIT', row)} className="p-2 text-gray-500 hover:text-violet-600"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                        <button onClick={() => handleDeleteUser(row.userId)} className="p-2 text-gray-500 hover:text-red-600"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
>>>>>>> d23c286 (feat: Enhance API call logging and handle non-JSON responses)
                    </div>
                  )}
                />
              )}

              {currentSection === 'blogs' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {blogs.map(blog => (
                    <div key={blog.blog_id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                      {blog.cover_image_url && (
                        <img src={blog.cover_image_url} alt="" className="w-full h-48 object-cover" />
                      )}
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-2">{blog.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                          {blog.description}
                        </p>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>{formatDate(blog.created_at)}</span>
                          <button 
                            onClick={() => BlogAPI.delete(blog.blog_id).then(() => loadGlobalData())}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {blogs.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                      Aucun blog publié
                    </div>
                  )}
                </div>
              )}

              {currentSection === 'podcasts' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {podcasts.map(podcast => (
                    <div key={podcast.podcast_id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                      {podcast.cover_image_url && (
                        <img src={podcast.cover_image_url} alt="" className="w-full h-48 object-cover" />
                      )}
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-2">🎙️ {podcast.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                          {podcast.description}
                        </p>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>{Math.floor(podcast.duration_seconds / 60)}min</span>
                          <button 
                            onClick={() => PodcastAPI.delete(podcast.podcast_id).then(() => loadGlobalData())}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {podcasts.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                      Aucun podcast publié
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

<<<<<<< HEAD
      {/* --- MODAL POI DETAIL --- */}
      <Modal 
        isOpen={isModalOpen && modalType === 'POI_DETAIL'} 
        onClose={() => setIsModalOpen(false)} 
        title={selectedPoiDetail?.poi_name || 'Détails POI'}
        size="large"
      >
        {selectedPoiDetail && (
          <div className="space-y-6">
            {/* Images */}
            {selectedPoiDetail.poi_images_urls && selectedPoiDetail.poi_images_urls.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {selectedPoiDetail.poi_images_urls.map((url, i) => (
                  <img key={i} src={url} alt="" className="w-full h-32 object-cover rounded-lg" />
                ))}
              </div>
            )}

            {/* Infos principales */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 font-medium">Catégorie</p>
                <p className="font-bold">{getPoiCategoryLabel(selectedPoiDetail.poi_category)}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Ville</p>
                <p className="font-bold">{selectedPoiDetail.address_city}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Coordonnées</p>
                <p className="font-mono text-xs">{selectedPoiDetail.latitude}, {selectedPoiDetail.longitude}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Créé le</p>
                <p className="font-bold">{formatDate(selectedPoiDetail.created_at)}</p>
              </div>
            </div>

            {/* Description */}
            {selectedPoiDetail.poi_description && (
              <div>
                <p className="text-gray-500 font-medium mb-2">Description</p>
                <p className="text-sm">{selectedPoiDetail.poi_description}</p>
              </div>
            )}

            {/* Statistiques */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-violet-600">{poiReviews.length}</p>
                <p className="text-xs text-gray-500">Avis</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{poiBlogs.length}</p>
                <p className="text-xs text-gray-500">Blogs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{poiPodcasts.length}</p>
                <p className="text-xs text-gray-500">Podcasts</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{poiLogs.length}</p>
                <p className="text-xs text-gray-500">Vues</p>
              </div>
            </div>

            {/* Avis récents */}
            {poiReviews.length > 0 && (
              <div>
                <h4 className="font-bold mb-3">Avis récents</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {poiReviews.slice(0, 5).map(review => (
                    <div key={review.reviewId} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} className={i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
                        ))}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{review.reviewText || 'Pas de commentaire'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              {!selectedPoiDetail.is_active && (
                <button
                  onClick={() => {
                    handleApprovePoi(selectedPoiDetail.poi_id);
                    setIsModalOpen(false);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  ✅ Approuver
                </button>
              )}
              <button
                onClick={() => {
                  openPoiModal('EDIT', selectedPoiDetail);
                  setModalType('POI');
                }}
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                ✏️ Modifier
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* --- MODAL POI CREATE/EDIT --- */}
      <Modal 
        isOpen={isModalOpen && modalType === 'POI'} 
        onClose={() => setIsModalOpen(false)} 
        title={`${modalMode === 'CREATE' ? 'Nouveau' : 'Modifier'} POI`}
      >
        <form onSubmit={handleSavePoi} className="space-y-4 text-gray-700 dark:text-gray-200">
          <div>
            <label className="block text-sm font-semibold mb-1">Nom du POI</label>
            <input 
              type="text" 
              required 
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
              value={selectedPoi.poi_name || ''} 
              onChange={e => setSelectedPoi({...selectedPoi, poi_name: e.target.value})} 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Catégorie</label>
              <select 
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
                value={selectedPoi.poi_category || 'FOOD_DRINK'} 
                onChange={e => setSelectedPoi({...selectedPoi, poi_category: e.target.value})}
              >
                <option value="FOOD_DRINK">Restauration</option>
                <option value="ACCOMMODATION">Hébergement</option>
                <option value="LEISURE_CULTURE">Loisirs & Culture</option>
                <option value="SHOPPING">Shopping</option>
                <option value="HEALTH_WELLNESS">Santé & Bien-être</option>
                <option value="SERVICES">Services</option>
                <option value="NATURE_OUTDOORS">Nature & Plein air</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Ville</label>
              <input 
                type="text" 
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
                value={selectedPoi.address_city || ''} 
                onChange={e => setSelectedPoi({...selectedPoi, address_city: e.target.value})} 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Latitude</label>
              <input 
                type="number" 
                step="any" 
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
                value={selectedPoi.latitude || 0} 
                onChange={e => setSelectedPoi({...selectedPoi, latitude: parseFloat(e.target.value)})} 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Longitude</label>
              <input 
                type="number" 
                step="any" 
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
                value={selectedPoi.longitude || 0} 
                onChange={e => setSelectedPoi({...selectedPoi, longitude: parseFloat(e.target.value)})} 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Description</label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
              value={selectedPoi.poi_description || ''}
              onChange={e => setSelectedPoi({...selectedPoi, poi_description: e.target.value})}
            />
          </div>
          
          <div className="flex items-center gap-2 pt-2">
            <input 
              type="checkbox" 
              id="isActive" 
              className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              checked={selectedPoi.is_active || false} 
              onChange={e => setSelectedPoi({...selectedPoi, is_active: e.target.checked})} 
            />
            <label htmlFor="isActive" className="text-sm">Rendre visible publiquement</label>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)} 
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </Modal>

      {/* --- MODAL USER --- */}
      <Modal 
        isOpen={isModalOpen && modalType === 'USER'} 
        onClose={() => setIsModalOpen(false)} 
        title={`${modalMode === 'CREATE' ? 'Créer' : 'Modifier'} Utilisateur`}
      >
        <form onSubmit={handleSaveUser} className="space-y-4 text-gray-700 dark:text-gray-200">
          <div>
            <label className="block text-sm font-semibold mb-1">Username</label>
            <input 
              type="text" 
              required 
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
              value={selectedUser.username || ''} 
              onChange={e => setSelectedUser({...selectedUser, username: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input 
              type="email" 
              required 
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
              value={selectedUser.email || ''} 
              onChange={e => setSelectedUser({...selectedUser, email: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Rôle</label>
            <select 
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
              value={selectedUser.role || 'USER'} 
              onChange={e => setSelectedUser({...selectedUser, role: e.target.value as any})}
            >
              <option value="USER">Utilisateur</option>
              <option value="ADMIN">Administrateur</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="userActive" 
              className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              checked={selectedUser.isActive ?? true} 
              onChange={e => setSelectedUser({...selectedUser, isActive: e.target.checked})} 
            />
            <label htmlFor="userActive" className="text-sm">Compte actif</label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)} 
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </Modal>
=======
      {/* --- MODALES --- */}
      <Modal isOpen={isModalOpen && modalType === 'POI'} onClose={() => setIsModalOpen(false)} title={`${modalMode === 'CREATE' ? 'Nouveau' : 'Modifier'} POI`}>
        <form onSubmit={handleSavePoi} className="space-y-4 text-gray-700 dark:text-gray-200">
             {/* Nom */}
             <div>
                <label className="block text-sm font-semibold mb-1">Nom du POI</label>
                <input type="text" required className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
                    value={selectedPoi.poi_name || ''} onChange={e => setSelectedPoi({...selectedPoi, poi_name: e.target.value})} />
             </div>
             {/* Categorie & Ville */}
             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-semibold mb-1">Catégorie</label>
                    <select className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
                        value={selectedPoi.poi_category || 'FOOD_DRINK'} onChange={e => setSelectedPoi({...selectedPoi, poi_category: e.target.value})}>
                        <option value="FOOD_DRINK">Restauration</option>
                        <option value="ACCOMMODATION">Hébergement</option>
                        <option value="LEISURE_CULTURE">Loisirs</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-semibold mb-1">Ville</label>
                    <input type="text" className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
                        value={selectedPoi.address_city || ''} onChange={e => setSelectedPoi({...selectedPoi, address_city: e.target.value})} />
                 </div>
             </div>
             {/* Lat / Long */}
             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-semibold mb-1">Latitude</label>
                    <input type="number" step="any" className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
                        value={selectedPoi.latitude || 0} onChange={e => setSelectedPoi({...selectedPoi, latitude: parseFloat(e.target.value)})} />
                 </div>
                 <div>
                    <label className="block text-sm font-semibold mb-1">Longitude</label>
                    <input type="number" step="any" className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
                        value={selectedPoi.longitude || 0} onChange={e => setSelectedPoi({...selectedPoi, longitude: parseFloat(e.target.value)})} />
                 </div>
             </div>
             {/* Actif */}
             <div className="flex items-center gap-2 pt-2">
                 <input type="checkbox" id="isActive" className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                    checked={selectedPoi.is_active || false} onChange={e => setSelectedPoi({...selectedPoi, is_active: e.target.checked})} />
                 <label htmlFor="isActive" className="text-sm">Rendre visible publiquement</label>
             </div>
             {/* Actions */}
             <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                 <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700">Enregistrer</button>
             </div>
        </form>
      </Modal>

      <Modal isOpen={isModalOpen && modalType === 'USER'} onClose={() => setIsModalOpen(false)} title={`${modalMode === 'CREATE' ? 'Créer' : 'Modifier'} Utilisateur`}>
         <form onSubmit={handleSaveUser} className="space-y-4 text-gray-700 dark:text-gray-200">
             <div>
                <label className="block text-sm font-semibold mb-1">Username</label>
                <input type="text" required className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
                    value={selectedUser.username || ''} onChange={e => setSelectedUser({...selectedUser, username: e.target.value})} />
             </div>
             <div>
                <label className="block text-sm font-semibold mb-1">Email</label>
                <input type="email" required className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
                    value={selectedUser.email || ''} onChange={e => setSelectedUser({...selectedUser, email: e.target.value})} />
             </div>
             <div>
                <label className="block text-sm font-semibold mb-1">Rôle</label>
                <select className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
                    value={selectedUser.role || 'USER'} onChange={e => setSelectedUser({...selectedUser, role: e.target.value as any})}>
                    <option value="USER">Utilisateur</option>
                    <option value="ADMIN">Administrateur</option>
                </select>
             </div>
             <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                 <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700">Enregistrer</button>
             </div>
         </form>
      </Modal>

      <style jsx global>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.5); border-radius: 20px; }
      `}</style>
>>>>>>> d23c286 (feat: Enhance API call logging and handle non-JSON responses)
    </div>
  );
}