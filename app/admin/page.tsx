'use client';

import React, { useState, useEffect } from 'react';
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
  OrganizationAPI,
  StatisticsAPI,
  PointOfInterest,
  PoiReview,
  AppUser,
  Organization,
  PoiPlatformStat
} from '@/services/adminService';
import { formatDate, formatCompactNumber, getPoiCategoryLabel, cn } from '@/components/admin/utils';

export default function AdminPage() {
  // --- NAVIGATION & LOADING ---
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // --- DATA STATES ---
  const [dashboardData, setDashboardData] = useState({
    totalPois: 0, activePois: 0, totalUsers: 0, totalReviews: 0, 
    averageRating: 0, totalViews: 0, totalLikes: 0,
  });
  const [pois, setPois] = useState<PointOfInterest[]>([]);
  const [reviews, setReviews] = useState<PoiReview[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [stats, setStats] = useState<PoiPlatformStat[]>([]);

  // --- MODAL STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'POI' | 'USER' | null>(null);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [selectedPoi, setSelectedPoi] = useState<Partial<PointOfInterest>>({});
  const [selectedUser, setSelectedUser] = useState<Partial<AppUser>>({});

  // --- INITIAL LOAD ---
  useEffect(() => {
    loadGlobalData();
  }, []);

  // Chargement spécifique pour les stats quand on clique sur l'onglet
  useEffect(() => {
    if (currentSection === 'analytics' && stats.length === 0) {
      loadAnalytics();
    }
  }, [currentSection]);

  const loadGlobalData = async () => {
    try {
      setLoading(true);
      const [overview, poisData, reviewsData, usersData, orgsData] = await Promise.all([
        DashboardAPI.getOverview(),
        PoiAPI.getAll(),
        ReviewAPI.getAll(),
        UserAPI.getAll(),
        OrganizationAPI.getAll(),
      ]);

      setDashboardData(overview);
      setPois(poisData);
      setReviews(reviewsData);
      setUsers(usersData);
      setOrganizations(orgsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const categoryData = React.useMemo(() => {
    const categories = pois.reduce((acc, poi) => {
      acc[poi.poi_category] = (acc[poi.poi_category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
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
  const poiColumns: Column<PointOfInterest>[] = [
    {
      key: 'poi_name',
      label: 'Nom',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-bold">
            {row.poi_name?.charAt(0) || 'P'}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{row.poi_name}</p>
            <p className="text-xs text-gray-500">{getPoiCategoryLabel(row.poi_category)}</p>
          </div>
        </div>
      ),
    },
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
        </div>
      ),
    },
    {
      key: 'is_active',
      label: 'Statut',
      render: (row) => (
        <span className={cn('inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium', row.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400')}>
          <span className={cn('h-2 w-2 rounded-full', row.is_active ? 'bg-emerald-500' : 'bg-gray-400')} />
          {row.is_active ? 'Actif' : 'Inactif'}
        </span>
      ),
    },
    { key: 'created_at', label: 'Date', sortable: true, render: (row) => formatDate(row.created_at) },
  ];

  const reviewColumns: Column<PoiReview>[] = [
    {
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
  ];

  const userColumns: Column<AppUser>[] = [
    {
      key: 'username',
      label: 'Utilisateur',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-bold">
            {row.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{row.username}</p>
            <p className="text-xs text-gray-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    { 
        key: 'role', label: 'Rôle', 
        render: (row) => <span className={cn('px-2 py-1 rounded text-xs font-bold', row.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700')}>{row.role}</span>
    },
    {
        key: 'isActive', label: 'Statut',
        render: (row) => <span className={row.isActive ? 'text-green-600 text-xs font-medium' : 'text-red-600 text-xs font-medium'}>{row.isActive ? 'Actif' : 'Inactif'}</span>
    }
  ];

  // --- RENDERS PER SECTION ---
  
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
      <RecentActivity activities={recentActivities} />
    </div>
  );

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
              
              {currentSection === 'analytics' && renderAnalytics()}

              {currentSection === 'pois' && (
                <DataTable
                  columns={poiColumns}
                  data={pois}
                  searchPlaceholder="Rechercher un POI..."
                  actions={(row) => (
                    <div className="flex gap-2">
                      <button onClick={() => openPoiModal('EDIT', row)} className="rounded-lg p-2 hover:bg-violet-100 dark:hover:bg-violet-900/30 text-violet-600 transition-colors">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleDeletePoi(row.poi_id)} className="rounded-lg p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-colors">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  )}
                />
              )}

              {currentSection === 'reviews' && (
                <DataTable columns={reviewColumns} data={reviews} searchPlaceholder="Rechercher un avis..." />
              )}

              {currentSection === 'users' && (
                <DataTable
                  columns={userColumns}
                  data={users}
                  searchPlaceholder="Rechercher un utilisateur..."
                  actions={(row) => (
                    <div className="flex gap-2">
                        <button onClick={() => openUserModal('EDIT', row)} className="p-2 text-gray-500 hover:text-violet-600"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                        <button onClick={() => handleDeleteUser(row.userId)} className="p-2 text-gray-500 hover:text-red-600"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    </div>
                  )}
                />
              )}
            </>
          )}
        </div>
      </main>

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
    </div>
  );
}