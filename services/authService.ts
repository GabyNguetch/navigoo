import { AppUser } from "@/types";

// Utilise le proxy POI unifié
const API_PROXY = "/remote-api";

export const DEFAULT_ORG_ID = "83ce5943-d920-454f-908d-3248a73aafdf"; 

export interface Organization {
  organizationId: string;
  organizationName: string;
  orgCode?: string;
  orgType?: string;
  isActive: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: {
    userId: string;
    organizationId: string;
    username: string;
    email: string;
    phone?: string;
    role: "USER" | "ADMIN" | "SUPER_ADMIN";
    isActive: boolean;
    emailVerified: boolean;
    createdAt: string;
    lastLoginAt?: string;
  };
}

class AuthService {
  
  /**
   * Récupère la liste des organisations (SIMULÉ avec localStorage)
   */
  async getOrganizations(): Promise<Organization[]> {
    try {
      // Tentative de récupération depuis le backend réel
      const res = await fetch(`${API_PROXY}/api/organizations`, {
        headers: {
          "Accept": "application/json"
        }
      });
      
      if (!res.ok) {
        console.warn("❌ Erreur chargement organisations depuis backend, utilisation du localStorage");
        return this.getOrganizationsFromLocalStorage();
      }
      
      const data = await res.json();
      return Array.isArray(data) ? data.filter((org: Organization) => org.isActive !== false) : [];
    } catch (error) {
      console.error("❌ [AuthService] Erreur Organizations, utilisation du localStorage");
      return this.getOrganizationsFromLocalStorage();
    }
  }

  /**
   * Organisations simulées depuis localStorage
   */
  private getOrganizationsFromLocalStorage(): Organization[] {
    const stored = localStorage.getItem("navigoo_organizations");
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Organisations par défaut
    const defaultOrgs: Organization[] = [
      {
        organizationId: DEFAULT_ORG_ID,
        organizationName: "Utilisateur Standard",
        orgCode: "STANDARD",
        orgType: "PUBLIC",
        isActive: true
      },
      {
        organizationId: "550e8400-e29b-41d4-a716-446655440001",
        organizationName: "Navigoo Tourism",
        orgCode: "TOURISM",
        orgType: "BUSINESS",
        isActive: true
      },
      {
        organizationId: "550e8400-e29b-41d4-a716-446655440002",
        organizationName: "Cameroon Heritage",
        orgCode: "HERITAGE",
        orgType: "NGO",
        isActive: true
      }
    ];
    
    localStorage.setItem("navigoo_organizations", JSON.stringify(defaultOrgs));
    return defaultOrgs;
  }

  /**
   * ✅ INSCRIPTION SIMULÉE (localStorage)
   */
  async register(userData: {
    username: string;
    email: string;
    password: string;
    phone?: string;
    organizationId: string;
  }): Promise<AppUser> {
    
    console.log("🚀 [AuthService SIMULÉ] Démarrage inscription pour:", userData.username);

    // Vérifier si l'utilisateur existe déjà
    const existingUsers = this.getAllUsers();
    
    if (existingUsers.find(u => u.email === userData.email.toLowerCase())) {
      throw new Error("Cet email est déjà utilisé");
    }
    
    if (existingUsers.find(u => u.username === userData.username)) {
      throw new Error("Ce nom d'utilisateur est déjà pris");
    }

    // Créer le nouvel utilisateur
    const newUser: AppUser = {
      id: this.generateUUID(),
      userId: this.generateUUID(),
      organizationId: userData.organizationId,
      username: userData.username,
      email: userData.email.toLowerCase(),
      phone: userData.phone,
      role: "USER",
      isActive: true,
      createdAt: new Date().toISOString(),
      accessToken: this.generateToken(),
      permissions: []
    };

    // Sauvegarder le mot de passe de manière sécurisée (en production, ne jamais stocker en clair!)
    const userWithPassword = {
      ...newUser,
      password: userData.password // ⚠️ Pour démo uniquement
    };

    // Ajouter aux utilisateurs existants
    existingUsers.push(userWithPassword);
    localStorage.setItem("navigoo_all_users", JSON.stringify(existingUsers));

    console.log("✅ [AuthService SIMULÉ] Inscription réussie !");
    
    this.saveSession(newUser);
    return newUser;
  }

  /**
   * ✅ CONNEXION SIMULÉE (localStorage)
   */
  async login(credentials: { email: string; password: string }): Promise<AppUser> {
    
    console.log("🔐 [AuthService SIMULÉ] Tentative connexion:", credentials.email);

    // Backdoor Admin
    if (credentials.email === "admin@navigoo.com" && credentials.password === "Admin@Navigoo2026") {
      console.log("🚀 [AuthService SIMULÉ] Mode Admin Statique");
      const adminUser: AppUser = {
        id: "00000000-0000-0000-0000-000000000000",
        userId: "00000000-0000-0000-0000-000000000000",
        organizationId: DEFAULT_ORG_ID,
        username: "Administrateur",
        email: "admin@navigoo.com",
        role: "SUPER_ADMIN",
        isActive: true,
        createdAt: new Date().toISOString(),
        accessToken: "mock-admin-token-dev-only",
        permissions: ["ALL"]
      };
      this.saveSession(adminUser);
      return adminUser;
    }

    // Connexion simulée
    const allUsers = this.getAllUsers();
    const user = allUsers.find(u => 
      (u.email === credentials.email.toLowerCase() || u.username === credentials.email) &&
      u.password === credentials.password
    );

    if (!user) {
      throw new Error("Identifiants incorrects");
    }

    // Mettre à jour le dernier login
    user.lastLoginAt = new Date().toISOString();
    user.accessToken = this.generateToken();
    
    const updatedUsers = allUsers.map(u => 
      u.userId === user.userId ? user : u
    );
    localStorage.setItem("navigoo_all_users", JSON.stringify(updatedUsers));

    console.log("✅ [AuthService SIMULÉ] Connexion réussie:", user.username);

    const sessionUser: AppUser = {
      id: user.userId,
      userId: user.userId,
      organizationId: user.organizationId,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      accessToken: user.accessToken,
      permissions: []
    };

    this.saveSession(sessionUser);
    return sessionUser;
  }

  /**
   * Sauvegarde la session utilisateur
   */
  saveSession(user: AppUser) {
    if (typeof window !== 'undefined') {
      localStorage.setItem("navigoo_user", JSON.stringify(user));
      console.log("💾 Session sauvegardée pour:", user.username);
    }
  }

  /**
   * Récupère la session utilisateur
   */
  getSession(): AppUser | null {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("navigoo_user");
      if (!stored) return null;
      
      try {
        const user = JSON.parse(stored);
        
        // Assurance compatibilité id/userId
        if (user) {
          if (!user.userId && user.id) user.userId = user.id;
          if (!user.id && user.userId) user.id = user.userId;
        }
        
        return user;
      } catch (e) {
        console.error("❌ Erreur parsing session:", e);
        return null;
      }
    }
    return null;
  }

  /**
   * Récupère le token JWT
   */
  getToken(): string | undefined {
    return this.getSession()?.accessToken;
  }

  /**
   * Vérifie si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    const session = this.getSession();
    return session !== null && session.accessToken !== undefined;
  }

  /**
   * ✅ DÉCONNEXION SIMULÉE
   */
  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("navigoo_user");
      console.log("🚪 Déconnexion locale");
      window.location.href = "/signin";
    }
  }

  /**
   * ✅ RAFRAÎCHISSEMENT TOKEN SIMULÉ
   */
  async refreshToken(refreshToken: string): Promise<AppUser> {
    const currentUser = this.getSession();
    if (!currentUser) {
      throw new Error("Session expirée");
    }

    // Générer un nouveau token
    currentUser.accessToken = this.generateToken();
    this.saveSession(currentUser);
    
    return currentUser;
  }

  /**
   * ✅ RÉCUPÉRATION PROFIL SIMULÉ
   */
  async getCurrentUser(): Promise<AppUser> {
    const user = this.getSession();
    
    if (!user) {
      throw new Error("Non authentifié");
    }

    return user;
  }

  /**
   * Utilitaires privés
   */
  private getAllUsers(): any[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem("navigoo_all_users");
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private generateToken(): string {
    return 'token_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }
}

export const authService = new AuthService();