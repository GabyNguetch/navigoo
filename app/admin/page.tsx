'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/admin/Sidebar';
import { StatsCard } from '@/components/admin/StatCards';
import { Chart } from '@/components/admin/Chart';
import { RecentActivity } from '@/components/admin/RecentActivity';
import { DataTable, Column } from '@/components/admin/DataTable';
import { Modal } from '@/components/admin/Modal';
import { 
  DashboardAPI, 
  PoiAPI, 
  ReviewAPI, 
  UserAPI, 
  BlogAPI,
  PodcastAPI,
  AccessLogAPI,
  PointOfInterest,
  PoiReview,
  AppUser,
  Blog,
  Podcast,
  PoiAccessLog
} from '@/services/adminService';
import { authService } from '@/services/authService';
import { formatDate, formatCompactNumber, getPoiCategoryLabel, cn } from '@/components/admin/utils';
import { Eye, CheckCircle, XCircle, AlertCircle, Edit, Trash2, MapPin, User, Star } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  
  // Vérification admin au montage
  useEffect(() => {
    const session = authService.getSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      router.push('/signin');
      return;
    }
  }, [router]);

  // --- NAVIGATION & LOADING ---
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // --- DATA STATES ---
  const [dashboardData, setDashboardData] = useState({
    totalPois: 0, activePois: 0, pendingPois: 0, totalUsers: 0, totalReviews: 0, 
    averageRating: 0, totalViews: 0, totalLikes: 0,
  });
  const [pois, setPois] = useState<PointOfInterest[]>([]);
  const [reviews, setReviews] = useState<PoiReview[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
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

  // --- INITIAL LOAD ---
  useEffect(() => {
    loadGlobalData();
  }, []);

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

  const categoryData = React.useMemo(() => {
    const categories = pois.reduce((acc, poi) => {
      acc[poi.poi_category] = (acc[poi.poi_category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
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
  const poiColumns: Column<PointOfInterest>[] = [
    {
      key: 'poi_name',
      label: 'Nom',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
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
          </div>
        </div>
      ),
    },
    { 
      key: 'address_city', 
      label: 'Ville', 
      sortable: true,
      render: (row) => (
        <div>
          <p className="text-sm">{row.address_city || 'Non renseigné'}</p>
          <p className="text-xs text-gray-500">{row.address_informal}</p>
        </div>
      )
    },
    {
      key: 'is_active',
      label: 'Statut',
      render: (row) => (
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
  ];

  const reviewColumns: Column<PoiReview>[] = [
    {
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
  ];

  const userColumns: Column<AppUser>[] = [
    {
      key: 'username',
      label: 'Utilisateur',
      render: (row) => (
        <div className="flex items-center gap-3">
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
          </div>
        </div>
      ),
    },
    { 
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
    }
  ];

  // --- RENDERS PER SECTION ---
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
      
      <RecentActivity activities={recentActivities} />
    </div>
  );

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
              
              {currentSection === 'pending' && renderPending()}

              {currentSection === 'pois' && (
                <DataTable
                  columns={poiColumns}
                  data={pois}
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
                      </button>
                    </div>
                  )}
                />
              )}

              {currentSection === 'reviews' && (
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
              )}

              {currentSection === 'users' && (
                <DataTable
                  columns={userColumns}
                  data={users}
                  searchPlaceholder="Rechercher un utilisateur..."
                  actions={(row) => (
                    <div className="flex gap-2">
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
    </div>
  );
}