// services/adminService.ts - VERSION COMPLÈTE BACKEND + LOCALSTORAGE
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
  photoId?: string;
  photoUri?: string;
}

export interface PointOfInterest {
  poi_id: string;
  organization_id: string;
  town_id?: string;
  created_by_user_id?: string;
  created_by?: string;
  poi_name: string;
  poi_type: string;
  poi_category: string;
  poi_description?: string;
  latitude: number;
  longitude: number;
  location?: { latitude: number; longitude: number };
  address_city?: string;
  address_country?: string;
  address_informal?: string;
  poi_images_urls?: string[];
  popularity_score?: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  approval_status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejected_at?: string;
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
  views?: number;
  likes?: number;
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
  plays?: number;
  likes?: number;
}

// Helper function for API calls avec fallback localStorage
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
<<<<<<< HEAD
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`📡 Admin API: ${options?.method || 'GET'} ${url}`);
=======
  const url = `${API_BASE_URL}${endpoint}`; // Construire l'URL
  console.log(`📡 Calling API: ${options?.method || 'GET'} ${url}`); // LOG DE DEBUG

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
>>>>>>> d23c286 (feat: Enhance API call logging and handle non-JSON responses)

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type");
    if (response.status === 204 || !contentType || !contentType.includes("application/json")) {
      return {} as T;
    }

    return response.json();
  } catch (error) {
    console.warn(`⚠️ API call failed, using localStorage fallback:`, error);
    throw error;
  }
}

<<<<<<< HEAD
// Fonctions localStorage
function getLocalStorageData<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
}

function saveLocalStorageData<T>(key: string, data: T[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
=======
  const contentType = response.headers.get("content-type");
  if (response.status === 204 || !contentType || !contentType.includes("application/json")) {
    return {} as T; 
  }

  return response.json();
>>>>>>> d23c286 (feat: Enhance API call logging and handle non-JSON responses)
}

// ==================== USER API ====================
export const UserAPI = {
  getAll: async () => {
    try {
      const backendUsers = await apiCall<AppUser[]>('/api/users');
      const localUsers = getLocalStorageData<AppUser>('navigoo_all_users');
      
      // Fusionner et dédupliquer
      const allUsers = [...backendUsers];
      localUsers.forEach(lu => {
        if (!allUsers.find(u => u.userId === lu.userId)) {
          allUsers.push(lu);
        }
      });
      
      console.log(`✅ Admin: ${allUsers.length} utilisateurs (${backendUsers.length} backend + ${localUsers.length} local)`);
      return allUsers;
    } catch {
      console.warn('📦 Utilisation localStorage uniquement pour users');
      return getLocalStorageData<AppUser>('navigoo_all_users');
    }
  },
  
  getById: (id: string) => apiCall<AppUser>(`/api/users/${id}`).catch(() => {
    const users = getLocalStorageData<AppUser>('navigoo_all_users');
    const found = users.find(u => u.userId === id);
    if (!found) throw new Error('User not found');
    return found;
  }),
  
  getByRole: (role: string) => apiCall<AppUser[]>(`/api/users/role/${role}`).catch(() => {
    return getLocalStorageData<AppUser>('navigoo_all_users').filter(u => u.role === role);
  }),
  
  create: async (user: Partial<AppUser>) => {
    try {
      return await apiCall<AppUser>('/api/users', { method: 'POST', body: JSON.stringify(user) });
    } catch {
      // Fallback localStorage
      const users = getLocalStorageData<AppUser>('navigoo_all_users');
      const newUser: AppUser = {
        userId: `user-${Date.now()}`,
        organizationId: user.organizationId || 'default',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone,
        role: user.role || 'USER',
        isActive: user.isActive ?? true,
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      saveLocalStorageData('navigoo_all_users', users);
      return newUser;
    }
  },
  
  update: async (id: string, user: Partial<AppUser>) => {
    try {
      return await apiCall<AppUser>(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(user) });
    } catch {
      const users = getLocalStorageData<AppUser>('navigoo_all_users');
      const index = users.findIndex(u => u.userId === id);
      if (index !== -1) {
        users[index] = { ...users[index], ...user };
        saveLocalStorageData('navigoo_all_users', users);
        return users[index];
      }
      throw new Error('User not found');
    }
  },
  
  delete: async (id: string) => {
    try {
      await apiCall<void>(`/api/users/${id}`, { method: 'DELETE' });
    } catch {
      const users = getLocalStorageData<AppUser>('navigoo_all_users');
      const filtered = users.filter(u => u.userId !== id);
      saveLocalStorageData('navigoo_all_users', filtered);
    }
  },
};

// ==================== POI API ====================
export const PoiAPI = {
  getAll: async () => {
    try {
      const backendPois = await apiCall<PointOfInterest[]>('/api/pois');
      const localPois = getLocalStorageData<PointOfInterest>('navigoo_user_pois');
      
      // Fusionner et dédupliquer
      const allPois = [...backendPois];
      localPois.forEach(lp => {
        if (!allPois.find(p => p.poi_id === lp.poi_id)) {
          allPois.push(lp);
        }
      });
      
      console.log(`✅ Admin: ${allPois.length} POIs (${backendPois.length} backend + ${localPois.length} local)`);
      return allPois;
    } catch {
      console.warn('📦 Utilisation localStorage uniquement pour POIs');
      return getLocalStorageData<PointOfInterest>('navigoo_user_pois');
    }
  },
  
  getById: (id: string) => apiCall<PointOfInterest>(`/api/pois/${id}`).catch(() => {
    const pois = getLocalStorageData<PointOfInterest>('navigoo_user_pois');
    const found = pois.find(p => p.poi_id === id);
    if (!found) throw new Error('POI not found');
    return found;
  }),
  
  getByUser: (userId: string) => apiCall<PointOfInterest[]>(`/api/pois/user/${userId}`).catch(() => {
    return getLocalStorageData<PointOfInterest>('navigoo_user_pois')
      .filter(p => p.created_by === userId || p.created_by_user_id === userId);
  }),
  
  getPending: async () => {
    const allPois = await PoiAPI.getAll();
    return allPois.filter(p => !p.is_active || p.approval_status === 'PENDING');
  },
  
  getApproved: async () => {
    const allPois = await PoiAPI.getAll();
    return allPois.filter(p => p.is_active && p.approval_status !== 'REJECTED');
  },
  
  create: async (poi: Partial<PointOfInterest>) => {
    try {
      return await apiCall<PointOfInterest>('/api/pois', { method: 'POST', body: JSON.stringify(poi) });
    } catch {
      const pois = getLocalStorageData<PointOfInterest>('navigoo_user_pois');
      const newPoi: PointOfInterest = {
        poi_id: `poi-${Date.now()}`,
        organization_id: poi.organization_id || 'default',
        created_by_user_id: poi.created_by_user_id || 'admin',
        poi_name: poi.poi_name || '',
        poi_type: poi.poi_type || 'OTHER',
        poi_category: poi.poi_category || 'FOOD_DRINK',
        poi_description: poi.poi_description,
        latitude: poi.latitude || 0,
        longitude: poi.longitude || 0,
        address_city: poi.address_city,
        address_country: poi.address_country || 'Cameroon',
        is_active: poi.is_active ?? false,
        approval_status: 'PENDING',
        created_at: new Date().toISOString()
      };
      pois.push(newPoi);
      saveLocalStorageData('navigoo_user_pois', pois);
      return newPoi;
    }
  },
  
  update: async (id: string, poi: Partial<PointOfInterest>) => {
    try {
      return await apiCall<PointOfInterest>(`/api/pois/${id}`, { method: 'PUT', body: JSON.stringify(poi) });
    } catch {
      const pois = getLocalStorageData<PointOfInterest>('navigoo_user_pois');
      const index = pois.findIndex(p => p.poi_id === id);
      if (index !== -1) {
        pois[index] = { 
          ...pois[index], 
          ...poi,
          updated_at: new Date().toISOString()
        };
        saveLocalStorageData('navigoo_user_pois', pois);
        return pois[index];
      }
      throw new Error('POI not found');
    }
  },
  
  delete: async (id: string) => {
    try {
      await apiCall<void>(`/api/pois/${id}`, { method: 'DELETE' });
    } catch {
      const pois = getLocalStorageData<PointOfInterest>('navigoo_user_pois');
      const filtered = pois.filter(p => p.poi_id !== id);
      saveLocalStorageData('navigoo_user_pois', filtered);
    }
  },
  
  activate: async (id: string, adminId: string) => {
    try {
      await apiCall<void>(`/api/pois/${id}/activate`, { method: 'PATCH' });
    } catch (error) {
      console.log('Activation locale du POI');
    }
    // Toujours mettre à jour localement
    const pois = getLocalStorageData<PointOfInterest>('navigoo_user_pois');
    const index = pois.findIndex(p => p.poi_id === id);
    if (index !== -1) {
      pois[index] = {
        ...pois[index],
        is_active: true,
        approval_status: 'APPROVED',
        approved_by: adminId,
        approved_at: new Date().toISOString()
      };
      saveLocalStorageData('navigoo_user_pois', pois);
    }
  },
  
  deactivate: async (id: string) => {
    try {
      await apiCall<void>(`/api/pois/${id}/desactivate`, { method: 'PATCH' });
    } catch (error) {
      console.log('Désactivation locale du POI');
    }
    // Toujours mettre à jour localement
    const pois = getLocalStorageData<PointOfInterest>('navigoo_user_pois');
    const index = pois.findIndex(p => p.poi_id === id);
    if (index !== -1) {
      pois[index] = {
        ...pois[index],
        is_active: false
      };
      saveLocalStorageData('navigoo_user_pois', pois);
    }
  },
  
  reject: async (id: string, adminId: string) => {
    const pois = getLocalStorageData<PointOfInterest>('navigoo_user_pois');
    const index = pois.findIndex(p => p.poi_id === id);
    if (index !== -1) {
      pois[index] = {
        ...pois[index],
        is_active: false,
        approval_status: 'REJECTED',
        rejected_by: adminId,
        rejected_at: new Date().toISOString()
      };
      saveLocalStorageData('navigoo_user_pois', pois);
    }
  },
};

// ==================== REVIEWS API ====================
export const ReviewAPI = {
  getAll: async () => {
    try {
      const backendReviews = await apiCall<PoiReview[]>('/api-reviews');
      const localReviews = getLocalStorageData<PoiReview>('navigoo_reviews');
      
      const allReviews = [...backendReviews];
      localReviews.forEach(lr => {
        if (!allReviews.find(r => r.reviewId === lr.reviewId)) {
          allReviews.push(lr);
        }
      });
      
      console.log(`✅ Admin: ${allReviews.length} reviews`);
      return allReviews;
    } catch {
      return getLocalStorageData<PoiReview>('navigoo_reviews');
    }
  },
  
  getByPoi: (poiId: string) => apiCall<PoiReview[]>(`/api-reviews/poi/${poiId}/reviews`).catch(() => {
    return getLocalStorageData<PoiReview>('navigoo_reviews').filter(r => r.poiId === poiId);
  }),
  
  delete: async (id: string) => {
    try {
      await apiCall<void>(`/api-reviews/${id}`, { method: 'DELETE' });
    } catch {
      const reviews = getLocalStorageData<PoiReview>('navigoo_reviews');
      const filtered = reviews.filter(r => r.reviewId !== id);
      saveLocalStorageData('navigoo_reviews', filtered);
    }
  },
};

// ==================== STATISTICS API ====================
export const StatisticsAPI = {
  getAll: () => apiCall<PoiPlatformStat[]>('/api/poi-platform-stats').catch(() => []),
  getByPoi: (poiId: string) => apiCall<PoiPlatformStat[]>(`/api/poi-platform-stats/poi/${poiId}/stats`).catch(() => []),
  getByOrganization: (orgId: string) => apiCall<PoiPlatformStat[]>(`/api/poi-platform-stats/organization/${orgId}/stats`).catch(() => []),
};

// ==================== ACCESS LOGS API ====================
export const AccessLogAPI = {
  getAll: () => {
    const logs = getLocalStorageData<PoiAccessLog>('navigoo_access_logs');
    return Promise.resolve(logs);
  },
  
  getByPoi: (poiId: string) => {
    const logs = getLocalStorageData<PoiAccessLog>('navigoo_access_logs');
    return Promise.resolve(logs.filter(l => l.poiId === poiId));
  },
  
  getByUser: (userId: string) => {
    const logs = getLocalStorageData<PoiAccessLog>('navigoo_access_logs');
    return Promise.resolve(logs.filter(l => l.userId === userId));
  },
};

// ==================== BLOG API ====================
export const BlogAPI = {
  getAll: () => {
    const blogs = getLocalStorageData<Blog>('navigoo_blogs');
    return Promise.resolve(blogs);
  },
  
  getByPoi: (poiId: string) => {
    const blogs = getLocalStorageData<Blog>('navigoo_blogs');
    return Promise.resolve(blogs.filter(b => b.poi_id === poiId));
  },
  
  delete: (id: string) => {
    const blogs = getLocalStorageData<Blog>('navigoo_blogs');
    const filtered = blogs.filter(b => b.blog_id !== id);
    saveLocalStorageData('navigoo_blogs', filtered);
    return Promise.resolve();
  },
};

// ==================== PODCAST API ====================
export const PodcastAPI = {
  getAll: () => {
    const podcasts = getLocalStorageData<Podcast>('navigoo_podcasts');
    return Promise.resolve(podcasts);
  },
  
  getByPoi: (poiId: string) => {
    const podcasts = getLocalStorageData<Podcast>('navigoo_podcasts');
    return Promise.resolve(podcasts.filter(p => p.poi_id === poiId));
  },
  
  delete: (id: string) => {
    const podcasts = getLocalStorageData<Podcast>('navigoo_podcasts');
    const filtered = podcasts.filter(p => p.podcast_id !== id);
    saveLocalStorageData('navigoo_podcasts', filtered);
    return Promise.resolve();
  },
};

// ==================== ORGANIZATION API ====================
export const OrganizationAPI = {
  getAll: () => apiCall<Organization[]>('/api/organizations').catch(() => {
    return getLocalStorageData<Organization>('navigoo_organizations');
  }),
};

// ==================== DASHBOARD AGGREGATES ====================
export const DashboardAPI = {
  async getOverview(orgId?: string) {
    const [pois, users, reviews, stats] = await Promise.all([
      PoiAPI.getAll(),
      UserAPI.getAll(),
      ReviewAPI.getAll(),
      StatisticsAPI.getAll(),
    ]);

    const filteredPois = orgId ? pois.filter(p => p.organization_id === orgId) : pois;
    const filteredUsers = orgId ? users.filter(u => u.organizationId === orgId) : users;
    const filteredReviews = orgId ? reviews.filter(r => r.organizationId === orgId) : reviews;

    return {
      totalPois: filteredPois.length,
      activePois: filteredPois.filter(p => p.is_active).length,
      pendingPois: filteredPois.filter(p => !p.is_active || p.approval_status === 'PENDING').length,
      totalUsers: filteredUsers.length,
      totalReviews: filteredReviews.length,
      averageRating: filteredReviews.length > 0 
        ? filteredReviews.reduce((sum, r) => sum + r.rating, 0) / filteredReviews.length 
        : 0,
      totalViews: stats.reduce((sum, s) => sum + s.views, 0),
      totalLikes: stats.reduce((sum, s) => sum + s.likes, 0),
    };
  },
};