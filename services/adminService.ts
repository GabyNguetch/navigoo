// Admin Service - Centralized API calls for POI Navigoo Admin Dashboard
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://poi-navigoo.pynfi.com';

// Types
export interface AppUser {
  userId: string;
  organizationId: string;
  username: string;
  email: string;
  phone?: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  isActive: boolean;
  createdAt: string;
}

export interface PointOfInterest {
  poi_id: string;
  organization_id: string;
  town_id?: string;
  created_by_user_id: string;
  poi_name: string;
  poi_type: string;
  poi_category: string;
  poi_description?: string;
  latitude: number;
  longitude: number;
  address_city?: string;
  address_country?: string;
  popularity_score?: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface PoiReview {
  reviewId: string;
  poiId: string;
  userId: string;
  organizationId: string;
  platformType: string;
  rating: number;
  reviewText?: string;
  createdAt: string;
  likes: number;
  dislikes: number;
}

export interface PoiPlatformStat {
  statId: string;
  orgId: string;
  poiId: string;
  platformType: string;
  statDate: string;
  views: number;
  reviews: number;
  likes: number;
  dislikes: number;
}

export interface PoiAccessLog {
  accessId: string;
  poiId: string;
  organizationId: string;
  platformType: string;
  userId?: string;
  accessType: string;
  accessDatetime: string;
  metadata?: Record<string, any>;
}

export interface Organization {
  organizationId: string;
  organizationName: string;
  orgCode: string;
  orgType: 'MERCHANT' | 'DISTRIBUTOR' | 'SUPPLIER' | 'INTERNAL';
  createdAt: string;
  isActive: boolean;
}

export interface Blog {
  blog_id: string;
  user_id: string;
  poi_id: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  content: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Podcast {
  podcast_id: string;
  user_id: string;
  poi_id: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  audio_file_url: string;
  duration_seconds: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

// Helper function for API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// ==================== USER API ====================
export const UserAPI = {
  getAll: () => apiCall<AppUser[]>('/api/users'),
  getById: (id: string) => apiCall<AppUser>(`/api/users/${id}`),
  getByUsername: (username: string) => apiCall<AppUser>(`/api/users/username/${username}`),
  getByEmail: (email: string) => apiCall<AppUser>(`/api/users/email/${email}`),
  getByRole: (role: string) => apiCall<AppUser[]>(`/api/users/role/${role}`),
  getActiveByOrg: (orgId: string) => apiCall<AppUser[]>(`/api/users/organization/${orgId}/active`),
  countActiveByOrg: (orgId: string) => apiCall<number>(`/api/users/organization/${orgId}/count`),
  exists: (id: string) => apiCall<boolean>(`/api/users/${id}/exists`),
  usernameExists: (username: string) => apiCall<boolean>(`/api/users/check-username/${username}`),
  emailExists: (email: string) => apiCall<boolean>(`/api/users/check-email/${email}`),
  create: (user: Partial<AppUser>) => apiCall<AppUser>('/api/users', { method: 'POST', body: JSON.stringify(user) }),
  update: (id: string, user: Partial<AppUser>) => apiCall<AppUser>(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(user) }),
  delete: (id: string) => apiCall<void>(`/api/users/${id}`, { method: 'DELETE' }),
};

// ==================== POI API ====================
export const PoiAPI = {
  getAll: () => apiCall<PointOfInterest[]>('/api/pois'),
  getById: (id: string) => apiCall<PointOfInterest>(`/api/pois/${id}`),
  getByUser: (userId: string) => apiCall<PointOfInterest[]>(`/api/pois/user/${userId}`),
  getByType: (type: string) => apiCall<PointOfInterest[]>(`/api/pois/type/${type}`),
  getByCategory: (category: string) => apiCall<PointOfInterest[]>(`/api/pois/category/${category}`),
  getByCity: (city: string) => apiCall<PointOfInterest[]>(`/api/pois/city/${city}`),
  getByOrganization: (orgId: string) => apiCall<PointOfInterest[]>(`/api/pois/organization/${orgId}`),
  getAllByOrganization: (orgId: string) => apiCall<PointOfInterest[]>(`/api/pois/organization/${orgId}/all`),
  countByOrganization: (orgId: string) => apiCall<number>(`/api/pois/organization/${orgId}/count`),
  searchByName: (name: string) => apiCall<PointOfInterest[]>(`/api/pois/name/${name}`),
  getByLocation: (latitude: number, longitude: number, radiusKm?: number) => 
    apiCall<PointOfInterest[]>(`/api/pois/location?latitude=${latitude}&longitude=${longitude}&radiusKm=${radiusKm || 10}`),
  getPopular: (limit?: number) => apiCall<PointOfInterest[]>(`/api/pois/popular?limit=${limit || 10}`),
  checkNameExists: (name: string, organizationId: string, excludeId?: string) => 
    apiCall<boolean>(`/api/pois/check-name?name=${encodeURIComponent(name)}&organizationId=${organizationId}${excludeId ? `&excludeId=${excludeId}` : ''}`),
  create: (poi: Partial<PointOfInterest>) => apiCall<PointOfInterest>('/api/pois', { method: 'POST', body: JSON.stringify(poi) }),
  update: (id: string, poi: Partial<PointOfInterest>) => apiCall<PointOfInterest>(`/api/pois/${id}`, { method: 'PUT', body: JSON.stringify(poi) }),
  delete: (id: string) => apiCall<void>(`/api/pois/${id}`, { method: 'DELETE' }),
  activate: (id: string) => apiCall<void>(`/api/pois/${id}/activate`, { method: 'PATCH' }),
  deactivate: (id: string) => apiCall<void>(`/api/pois/${id}/desactivate`, { method: 'PATCH' }),
  updatePopularity: (id: string, score: number) => apiCall<void>(`/api/pois/${id}/popularity?score=${score}`, { method: 'PATCH' }),
};

// ==================== REVIEWS API ====================
export const ReviewAPI = {
  getAll: () => apiCall<PoiReview[]>('/api-reviews'),
  getById: (id: string) => apiCall<PoiReview>(`/api-reviews/${id}`),
  getByPoi: (poiId: string) => apiCall<PoiReview[]>(`/api-reviews/poi/${poiId}/reviews`),
  getByUser: (userId: string) => apiCall<PoiReview[]>(`/api-reviews/user/${userId}/reviews`),
  getByOrganization: (orgId: string) => apiCall<PoiReview[]>(`/api-reviews/organization/${orgId}/reviews`),
  getPoiStats: (poiId: string) => apiCall<{ averageRating: number; reviewCount: number }>(`/api-reviews/poi/${poiId}/stats`),
  getAverageRating: (poiId: string) => apiCall<number>(`/api-reviews/poi/${poiId}/average-rating`),
  getCount: (poiId: string) => apiCall<number>(`/api-reviews/poi/${poiId}/count`),
  create: (review: Partial<PoiReview>) => apiCall<PoiReview>('/api-reviews', { method: 'POST', body: JSON.stringify(review) }),
  update: (id: string, review: Partial<PoiReview>) => apiCall<PoiReview>(`/api-reviews/${id}`, { method: 'PUT', body: JSON.stringify(review) }),
  delete: (id: string) => apiCall<void>(`/api-reviews/${id}`, { method: 'DELETE' }),
  like: (id: string) => apiCall<PoiReview>(`/api-reviews/${id}/like`, { method: 'PATCH' }),
  unlike: (id: string) => apiCall<PoiReview>(`/api-reviews/${id}/unlike`, { method: 'PATCH' }),
};

// ==================== STATISTICS API ====================
export const StatisticsAPI = {
  getAll: () => apiCall<PoiPlatformStat[]>('/api/poi-platform-stats'),
  getById: (id: string) => apiCall<PoiPlatformStat>(`/api/poi-platform-stats/${id}`),
  getByPoi: (poiId: string) => apiCall<PoiPlatformStat[]>(`/api/poi-platform-stats/poi/${poiId}/stats`),
  getByOrganization: (orgId: string) => apiCall<PoiPlatformStat[]>(`/api/poi-platform-stats/organization/${orgId}/stats`),
  getByPlatform: (platformType: string) => apiCall<PoiPlatformStat[]>(`/api/poi-platform-stats/platform/${platformType}/stats`),
  getByDate: (date: string) => apiCall<PoiPlatformStat[]>(`/api/poi-platform-stats/date/${date}/stats`),
  getByDateRange: (startDate: string, endDate: string) => 
    apiCall<PoiPlatformStat[]>(`/api/poi-platform-stats/date-range?startDate=${startDate}&endDate=${endDate}`),
  getByOrgAndDateRange: (orgId: string, startDate: string, endDate: string) => 
    apiCall<PoiPlatformStat[]>(`/api/poi-platform-stats/organization/${orgId}/date-range?startDate=${startDate}&endDate=${endDate}`),
  create: (stat: Partial<PoiPlatformStat>) => apiCall<PoiPlatformStat>('/api/poi-platform-stats', { method: 'POST', body: JSON.stringify(stat) }),
  update: (id: string, stat: Partial<PoiPlatformStat>) => apiCall<PoiPlatformStat>(`/api/poi-platform-stats/${id}`, { method: 'PUT', body: JSON.stringify(stat) }),
  delete: (id: string) => apiCall<void>(`/api/poi-platform-stats/${id}`, { method: 'DELETE' }),
  deleteByPoi: (poiId: string) => apiCall<void>(`/api/poi-platform-stats/poi/${poiId}`, { method: 'DELETE' }),
  deleteByOrg: (orgId: string) => apiCall<void>(`/api/poi-platform-stats/organization/${orgId}`, { method: 'DELETE' }),
};

// ==================== ACCESS LOGS API ====================
export const AccessLogAPI = {
  getAll: () => apiCall<PoiAccessLog[]>('/api/poi-access-logs'),
  getById: (id: string) => apiCall<PoiAccessLog>(`/api/poi-access-logs/${id}`),
  getByPoi: (poiId: string) => apiCall<PoiAccessLog[]>(`/api/poi-access-logs/poi/${poiId}`),
  getByPoiPaginated: (poiId: string, page: number = 0, size: number = 10) => 
    apiCall<PoiAccessLog[]>(`/api/poi-access-logs/poi/${poiId}/paginated?page=${page}&size=${size}`),
  getRecentByPoi: (poiId: string, since: string) => 
    apiCall<PoiAccessLog[]>(`/api/poi-access-logs/poi/${poiId}/recent?since=${since}`),
  getByUser: (userId: string) => apiCall<PoiAccessLog[]>(`/api/poi-access-logs/user/${userId}`),
  getByOrganization: (orgId: string) => apiCall<PoiAccessLog[]>(`/api/poi-access-logs/organization/${orgId}`),
  getByPoiAndOrg: (poiId: string, orgId: string) => 
    apiCall<PoiAccessLog[]>(`/api/poi-access-logs/poi/${poiId}/organization/${orgId}`),
  getByPlatform: (platformType: string) => apiCall<PoiAccessLog[]>(`/api/poi-access-logs/platform/${platformType}`),
  getByAccessType: (accessType: string) => apiCall<PoiAccessLog[]>(`/api/poi-access-logs/access-type/${accessType}`),
  getByDateRange: (startDate: string, endDate: string) => 
    apiCall<PoiAccessLog[]>(`/api/poi-access-logs/date-range?startDate=${startDate}&endDate=${endDate}`),
  countByPoiAndAccessType: (poiId: string, accessType: string) => 
    apiCall<number>(`/api/poi-access-logs/poi/${poiId}/count/access-type/${accessType}`),
  getPlatformStatsForOrg: (orgId: string) => apiCall<Record<string, number>>(`/api/poi-access-logs/organization/${orgId}/platform-stats`),
  create: (log: Partial<PoiAccessLog>) => apiCall<PoiAccessLog>('/api/poi-access-logs', { method: 'POST', body: JSON.stringify(log) }),
  update: (id: string, log: Partial<PoiAccessLog>) => apiCall<PoiAccessLog>(`/api/poi-access-logs/${id}`, { method: 'PUT', body: JSON.stringify(log) }),
  delete: (id: string) => apiCall<void>(`/api/poi-access-logs/${id}`, { method: 'DELETE' }),
  deleteOldLogs: (beforeDate: string) => apiCall<string>(`/api/poi-access-logs/cleanup?beforeDate=${beforeDate}`, { method: 'DELETE' }),
};

// ==================== ORGANIZATION API ====================
export const OrganizationAPI = {
  getAll: () => apiCall<Organization[]>('/api/organizations'),
  getById: (id: string) => apiCall<Organization>(`/api/organizations/${id}`),
  getByCode: (code: string) => apiCall<Organization>(`/api/organizations/by-code/${code}`),
  getByType: (type: string) => apiCall<Organization[]>(`/api/organizations/by-type/${type}`),
  searchByName: (name: string) => apiCall<Organization[]>(`/api/organizations/by-name/${name}`),
  getByActiveStatus: (isActive: boolean) => apiCall<Organization[]>(`/api/organizations/by-active-status/${isActive}`),
  create: (org: Partial<Organization>) => apiCall<Organization>('/api/organizations', { method: 'POST', body: JSON.stringify(org) }),
  update: (id: string, org: Partial<Organization>) => apiCall<Organization>(`/api/organizations/${id}`, { method: 'PUT', body: JSON.stringify(org) }),
  delete: (id: string) => apiCall<void>(`/api/organizations/${id}`, { method: 'DELETE' }),
};

// ==================== BLOG API ====================
export const BlogAPI = {
  getAll: () => apiCall<Blog[]>('/api/blogs'),
  getById: (id: string) => apiCall<Blog>(`/api/blogs/${id}`),
  getByUser: (userId: string) => apiCall<Blog[]>(`/api/blogs/user/${userId}`),
  getByPoi: (poiId: string) => apiCall<Blog[]>(`/api/blogs/poi/${poiId}`),
  searchByTitle: (title: string) => apiCall<Blog[]>(`/api/blogs/search?title=${encodeURIComponent(title)}`),
  create: (blog: { user_id: string; poi_id: string; title: string; description?: string; cover_image_url?: string; content: string }) => 
    apiCall<Blog>('/api/blogs', { method: 'POST', body: JSON.stringify(blog) }),
  update: (id: string, blog: Partial<Blog>) => apiCall<Blog>(`/api/blogs/${id}`, { method: 'PUT', body: JSON.stringify(blog) }),
  delete: (id: string) => apiCall<void>(`/api/blogs/${id}`, { method: 'DELETE' }),
};

// ==================== PODCAST API ====================
export const PodcastAPI = {
  getAll: () => apiCall<Podcast[]>('/api/podcasts'),
  getById: (id: string) => apiCall<Podcast>(`/api/podcasts/${id}`),
  getByUser: (userId: string) => apiCall<Podcast[]>(`/api/podcasts/user/${userId}`),
  getByPoi: (poiId: string) => apiCall<Podcast[]>(`/api/podcasts/poi/${poiId}`),
  searchByTitle: (title: string) => apiCall<Podcast[]>(`/api/podcasts/search?title=${encodeURIComponent(title)}`),
  getByDurationRange: (minDuration: number, maxDuration: number) => 
    apiCall<Podcast[]>(`/api/podcasts/duration?minDuration=${minDuration}&maxDuration=${maxDuration}`),
  create: (podcast: { user_id: string; poi_id: string; title: string; description?: string; cover_image_url?: string; audio_file_url: string; duration_seconds: number }) => 
    apiCall<Podcast>('/api/podcasts', { method: 'POST', body: JSON.stringify(podcast) }),
  update: (id: string, podcast: Partial<Podcast>) => apiCall<Podcast>(`/api/podcasts/${id}`, { method: 'PUT', body: JSON.stringify(podcast) }),
  delete: (id: string) => apiCall<void>(`/api/podcasts/${id}`, { method: 'DELETE' }),
};

// ==================== DASHBOARD AGGREGATES ====================
export const DashboardAPI = {
  async getOverview(orgId?: string) {
    const [pois, users, reviews, stats] = await Promise.all([
      orgId ? PoiAPI.getByOrganization(orgId) : PoiAPI.getAll(),
      orgId ? UserAPI.getActiveByOrg(orgId) : UserAPI.getAll(),
      orgId ? ReviewAPI.getByOrganization(orgId) : ReviewAPI.getAll(),
      orgId ? StatisticsAPI.getByOrganization(orgId) : StatisticsAPI.getAll(),
    ]);

    return {
      totalPois: pois.length,
      activePois: pois.filter(p => p.is_active).length,
      totalUsers: users.length,
      totalReviews: reviews.length,
      averageRating: reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0,
      totalViews: stats.reduce((sum, s) => sum + s.views, 0),
      totalLikes: stats.reduce((sum, s) => sum + s.likes, 0),
    };
  },
};