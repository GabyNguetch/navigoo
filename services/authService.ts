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
   * Récupère la liste des organisations depuis le Backend POI
   */
  async getOrganizations(): Promise<Organization[]> {
    try {
      const res = await fetch(`${API_PROXY}/api/organizations`, {
        headers: {
          "Accept": "application/json"
        }
      });
      
      if (!res.ok) {
        console.warn("❌ Erreur chargement organisations:", res.status);
        return [];
      }
      
      const data = await res.json();
      return Array.isArray(data) ? data.filter((org: Organization) => org.isActive !== false) : [];
    } catch (error) {
      console.error("❌ [AuthService] Erreur Organizations:", error);
      return [];
    }
  }

  /**
   * ✅ INSCRIPTION selon OpenAPI spec:
   * POST /api/auth/register
   * Body: RegisterRequest { username, email, password, phone?, organizationId, role }
   */
  async register(userData: {
    username: string;
    email: string;
    password: string;
    phone?: string;
    organizationId: string;
  }): Promise<AppUser> {
    
    console.log("🚀 [AuthService] Démarrage inscription pour:", userData.username);

    // ✅ Construire le payload en omettant les champs vides au lieu d'envoyer null
    const registerPayload: any = {
      username: userData.username.trim(),
      email: userData.email.trim().toLowerCase(),
      password: userData.password,
      organizationId: userData.organizationId,
      role: "USER" as const
    };

    // ✅ N'ajouter phone que s'il est défini et non vide
    if (userData.phone && userData.phone.trim()) {
      registerPayload.phone = userData.phone.trim();
    }

    console.log("📨 [AuthService] Payload Register:", registerPayload);

    try {
      const response = await fetch(`${API_PROXY}/api/auth/register`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(registerPayload)
      });

      // ✅ Gestion détaillée des erreurs
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = `Erreur ${response.status}`;
        
        if (contentType?.includes("application/json")) {
          const errorData = await response.json();
          console.error("❌ [AuthService] Erreur JSON:", errorData);
          
          // ✅ Extraction intelligente du message d'erreur
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.details) {
            errorMessage = errorData.details;
          } else if (errorData.errors) {
            // Si c'est un tableau d'erreurs de validation
            if (Array.isArray(errorData.errors)) {
              errorMessage = errorData.errors.map((e: any) => e.message || e).join(", ");
            } else if (typeof errorData.errors === 'object') {
              errorMessage = Object.values(errorData.errors).join(", ");
            }
          }
        } else {
          const textError = await response.text();
          console.error("❌ [AuthService] Erreur Text:", textError);
          errorMessage = textError || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const authResponse: AuthResponse = await response.json();
      console.log("✅ [AuthService] Inscription réussie !");
      
      // Conversion AuthResponse → AppUser
      const user: AppUser = {
        id: authResponse.user.userId,
        userId: authResponse.user.userId,
        organizationId: authResponse.user.organizationId,
        username: authResponse.user.username,
        email: authResponse.user.email,
        phone: authResponse.user.phone,
        role: authResponse.user.role,
        isActive: authResponse.user.isActive,
        createdAt: authResponse.user.createdAt,
        accessToken: authResponse.accessToken,
        permissions: []
      };

      this.saveSession(user);
      return user;
      
    } catch (error: any) {
      console.error("❌ [AuthService] Exception Register:", error.message);
      throw error;
    }
  }

  /**
   * ✅ CONNEXION selon OpenAPI spec:
   * POST /api/auth/login
   * Body: LoginRequest { emailOrUsername, password }
   */
  async login(credentials: { email: string; password: string }): Promise<AppUser> {
    
    console.log("🔐 [AuthService] Tentative connexion:", credentials.email);

    // Backdoor Admin (Développement uniquement - À RETIRER EN PRODUCTION)
    if (credentials.email === "admin@navigoo.com" && credentials.password === "Admin@Navigoo2026") {
      console.log("🚀 [AuthService] Mode Admin Statique");
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

    // Connexion Réelle
    try {
      const response = await fetch(`${API_PROXY}/api/auth/login`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          emailOrUsername: credentials.email.trim(),
          password: credentials.password
        })
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = "Identifiants incorrects";
        
        if (contentType?.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        }
        
        console.error("❌ [AuthService] Erreur Login:", errorMessage);
        throw new Error(errorMessage);
      }

      const authResponse: AuthResponse = await response.json();
      console.log("✅ [AuthService] Connexion réussie:", authResponse.user.username);

      // Conversion AuthResponse → AppUser
      const user: AppUser = {
        id: authResponse.user.userId,
        userId: authResponse.user.userId,
        organizationId: authResponse.user.organizationId,
        username: authResponse.user.username,
        email: authResponse.user.email,
        phone: authResponse.user.phone,
        role: authResponse.user.role,
        isActive: authResponse.user.isActive,
        createdAt: authResponse.user.createdAt,
        accessToken: authResponse.accessToken,
        permissions: []
      };

      this.saveSession(user);
      return user;
      
    } catch (error: any) {
      console.error("❌ [AuthService] Exception Login:", error.message);
      throw error;
    }
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
   * ✅ DÉCONNEXION selon OpenAPI spec:
   * POST /api/auth/logout/{userId}
   */
  logout() {
    if (typeof window !== 'undefined') {
      const user = this.getSession();
      
      // Tentative de logout propre côté serveur
      if (user && user.userId) {
        fetch(`${API_PROXY}/api/auth/logout/${user.userId}`, { 
          method: 'POST',
          headers: {
            "Authorization": `Bearer ${user.accessToken}`
          }
        })
        .then(() => console.log("✅ Logout serveur réussi"))
        .catch(err => console.warn("⚠️ Logout serveur échoué:", err));
      }
      
      localStorage.removeItem("navigoo_user");
      console.log("🚪 Déconnexion locale");
      window.location.href = "/signin";
    }
  }

  /**
   * ✅ RAFRAÎCHISSEMENT TOKEN selon OpenAPI spec:
   * POST /api/auth/refresh
   * Body: { refreshToken }
   */
  async refreshToken(refreshToken: string): Promise<AppUser> {
    try {
      const response = await fetch(`${API_PROXY}/api/auth/refresh`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const authResponse: AuthResponse = await response.json();
      
      const user: AppUser = {
        id: authResponse.user.userId,
        userId: authResponse.user.userId,
        organizationId: authResponse.user.organizationId,
        username: authResponse.user.username,
        email: authResponse.user.email,
        phone: authResponse.user.phone,
        role: authResponse.user.role,
        isActive: authResponse.user.isActive,
        createdAt: authResponse.user.createdAt,
        accessToken: authResponse.accessToken,
        permissions: []
      };

      this.saveSession(user);
      return user;
      
    } catch (error) {
      console.error("❌ Refresh token failed:", error);
      this.logout();
      throw error;
    }
  }

  /**
   * ✅ RÉCUPÉRATION PROFIL selon OpenAPI spec:
   * GET /api/auth/me
   */
  async getCurrentUser(): Promise<AppUser> {
    const token = this.getToken();
    
    if (!token) {
      throw new Error("Non authentifié");
    }

    try {
      const response = await fetch(`${API_PROXY}/api/auth/me`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Session expirée");
      }

      const userData = await response.json();
      
      // Mise à jour de la session
      const user: AppUser = {
        id: userData.userId,
        userId: userData.userId,
        organizationId: userData.organizationId,
        username: userData.username,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        isActive: userData.isActive,
        createdAt: userData.createdAt,
        accessToken: token,
        permissions: []
      };

      this.saveSession(user);
      return user;
      
    } catch (error) {
      console.error("❌ Get current user failed:", error);
      throw error;
    }
  }
}

export const authService = new AuthService();