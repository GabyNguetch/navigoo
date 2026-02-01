'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/admin/Sidebar';
import { StatsCard } from '@/components/admin/StatCards';
import { Chart } from '@/components/admin/Chart';
import { RecentActivity } from '@/components/admin/RecentActivity';
import { DataTable, Column } from '@/components/admin/DataTable';
import { 
  DashboardAPI, 
  PoiAPI, 
  ReviewAPI, 
  UserAPI, 
  OrganizationAPI,
  StatisticsAPI,
  AccessLogAPI,
  BlogAPI,
  PodcastAPI,
  PointOfInterest,
  PoiReview,
  AppUser,
  Organization,
} from '@/services/adminService';
import { formatDate, formatCompactNumber, getPoiCategoryLabel, cn } from '@/components/admin/utils';

export default function AdminPage() {
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalPois: 0,
    activePois: 0,
    totalUsers: 0,
    totalReviews: 0,
    averageRating: 0,
    totalViews: 0,
    totalLikes: 0,
  });
  const [pois, setPois] = useState<PointOfInterest[]>([]);
  const [reviews, setReviews] = useState<PoiReview[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
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

  const recentActivities = [
    {
      id: '1',
      type: 'poi' as const,
      title: 'Nouveau POI créé',
      description: 'Hôtel Hilton Yaoundé ajouté au système',
      timestamp: new Date().toISOString(),
      user: 'Admin',
    },
    {
      id: '2',
      type: 'review' as const,
      title: 'Nouvel avis',
      description: '5 étoiles pour Restaurant Le Palais',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      user: 'Jean Dupont',
    },
    {
      id: '3',
      type: 'user' as const,
      title: 'Nouvel utilisateur',
      description: 'marie.martin@example.com s\'est inscrit',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
    },
  ];

  const poiColumns: Column<PointOfInterest>[] = [
    {
      key: 'poi_name',
      label: 'Nom',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-bold">
            {row.poi_name.charAt(0)}
          </div>
          <div>
            <p className="font-medium">{row.poi_name}</p>
            <p className="text-xs text-gray-500">{getPoiCategoryLabel(row.poi_category)}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'address_city',
      label: 'Ville',
      sortable: true,
    },
    {
      key: 'popularity_score',
      label: 'Popularité',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="h-2 w-24 rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
              style={{ width: `${row.popularity_score || 0}%` }}
            />
          </div>
          <span className="text-xs">{row.popularity_score || 0}</span>
        </div>
      ),
    },
    {
      key: 'is_active',
      label: 'Statut',
      render: (row) => (
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium',
            row.is_active
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
          )}
        >
          <span className={cn('h-2 w-2 rounded-full', row.is_active ? 'bg-emerald-500' : 'bg-gray-400')} />
          {row.is_active ? 'Actif' : 'Inactif'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Date de création',
      sortable: true,
      render: (row) => formatDate(row.created_at),
    },
  ];

  const reviewColumns: Column<PoiReview>[] = [
    {
      key: 'rating',
      label: 'Note',
      render: (row) => (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={cn('h-4 w-4', i < row.rating ? 'text-amber-400' : 'text-gray-300')}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      ),
    },
    {
      key: 'reviewText',
      label: 'Commentaire',
      render: (row) => (
        <p className="max-w-md truncate text-sm">{row.reviewText || 'Aucun commentaire'}</p>
      ),
    },
    {
      key: 'platformType',
      label: 'Plateforme',
      render: (row) => (
        <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
          {row.platformType}
        </span>
      ),
    },
    {
      key: 'likes',
      label: 'Likes',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-sm">
            <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            {row.likes}
          </span>
          <span className="flex items-center gap-1 text-sm">
            <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
            </svg>
            {row.dislikes}
          </span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (row) => formatDate(row.createdAt),
    },
  ];

  const userColumns: Column<AppUser>[] = [
    {
      key: 'username',
      label: 'Utilisateur',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-bold">
            {row.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium">{row.username}</p>
            <p className="text-xs text-gray-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Rôle',
      render: (row) => (
        <span
          className={cn(
            'inline-flex rounded-full px-3 py-1 text-xs font-medium',
            row.role === 'SUPER_ADMIN' && 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            row.role === 'ADMIN' && 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
            row.role === 'USER' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
          )}
        >
          {row.role}
        </span>
      ),
    },
    {
      key: 'phone',
      label: 'Téléphone',
      render: (row) => row.phone || '-',
    },
    {
      key: 'isActive',
      label: 'Statut',
      render: (row) => (
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium',
            row.isActive
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
          )}
        >
          <span className={cn('h-2 w-2 rounded-full', row.isActive ? 'bg-emerald-500' : 'bg-gray-400')} />
          {row.isActive ? 'Actif' : 'Inactif'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date d\'inscription',
      sortable: true,
      render: (row) => formatDate(row.createdAt),
    },
  ];

  const categoryData = React.useMemo(() => {
    const categories = pois.reduce((acc, poi) => {
      acc[poi.poi_category] = (acc[poi.poi_category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categories).map(([label, value]) => ({
      label: getPoiCategoryLabel(label),
      value,
    }));
  }, [pois]);

  const monthlyData = [
    { label: 'Jan', value: 65 },
    { label: 'Fév', value: 59 },
    { label: 'Mar', value: 80 },
    { label: 'Avr', value: 81 },
    { label: 'Mai', value: 56 },
    { label: 'Juin', value: 55 },
    { label: 'Juil', value: 70 },
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Points d'Intérêt"
          value={formatCompactNumber(dashboardData.totalPois)}
          subtitle={`${dashboardData.activePois} actifs`}
          variant="default"
          icon={
            <svg className="h-6 w-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          }
          trend={{ direction: 'up', percentage: 12.5 }}
        />
        <StatsCard
          title="Utilisateurs"
          value={formatCompactNumber(dashboardData.totalUsers)}
          variant="accent"
          icon={
            <svg className="h-6 w-6 text-fuchsia-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          trend={{ direction: 'up', percentage: 8.2 }}
        />
        <StatsCard
          title="Avis"
          value={formatCompactNumber(dashboardData.totalReviews)}
          subtitle={`${dashboardData.averageRating.toFixed(1)} ⭐ moyenne`}
          variant="success"
          icon={
            <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          }
          trend={{ direction: 'up', percentage: 15.3 }}
        />
        <StatsCard
          title="Vues totales"
          value={formatCompactNumber(dashboardData.totalViews)}
          variant="warning"
          icon={
            <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          }
          trend={{ direction: 'up', percentage: 23.1 }}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Chart type="area" data={monthlyData} title="POIs créés par mois" />
        <Chart type="doughnut" data={categoryData} title="Répartition par catégorie" />
      </div>

      {/* Recent Activity */}
      <RecentActivity activities={recentActivities} />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar currentSection={currentSection} onNavigate={setCurrentSection} />
      
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl p-6 lg:p-8">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {currentSection === 'dashboard' && 'Tableau de bord'}
              {currentSection === 'pois' && 'Gestion des POIs'}
              {currentSection === 'reviews' && 'Gestion des Avis'}
              {currentSection === 'users' && 'Gestion des Utilisateurs'}
              {currentSection === 'organizations' && 'Gestion des Organisations'}
              {currentSection === 'analytics' && 'Analytiques'}
              {currentSection === 'content' && 'Contenu'}
              {currentSection === 'settings' && 'Paramètres'}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {currentSection === 'dashboard' && 'Vue d\'ensemble de votre plateforme'}
              {currentSection === 'pois' && 'Gérez tous vos points d\'intérêt'}
              {currentSection === 'reviews' && 'Modérez et analysez les avis'}
              {currentSection === 'users' && 'Administrez les comptes utilisateurs'}
            </p>
          </header>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
            </div>
          ) : (
            <>
              {currentSection === 'dashboard' && renderDashboard()}
              {currentSection === 'pois' && (
                <DataTable
                  columns={poiColumns}
                  data={pois}
                  searchPlaceholder="Rechercher un POI..."
                  actions={(row) => (
                    <div className="flex gap-2">
                      <button className="rounded-lg p-2 hover:bg-violet-100 dark:hover:bg-violet-900/30">
                        <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button className="rounded-lg p-2 hover:bg-red-100 dark:hover:bg-red-900/30">
                        <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
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
                />
              )}
              {currentSection === 'users' && (
                <DataTable
                  columns={userColumns}
                  data={users}
                  searchPlaceholder="Rechercher un utilisateur..."
                />
              )}
            </>
          )}
        </div>
      </main>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}