import { AppUser } from "@/types";

const API_BASE_URL = "https://poi-navigoo.pynfi.com";
const DEFAULT_ORG_ID = "83ce5943-d920-454f-908d-3248a73aafdf"; 

class AuthService {
  /**
   * Inscrit un nouvel utilisateur selon le DTO Java
   */
  async register(userData: Partial<AppUser>): Promise<AppUser> {
    const endpoint = `${API_BASE_URL}/api/users`;

    // Validation Password (doit matcher la regex Java)
    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (userData.password && !pwdRegex.test(userData.password)) {
      throw new Error("Le mot de passe doit contenir: 8 chars min, 1 Maj, 1 Min, 1 Chiffre, 1 Spécial (@$!%*?&)");
    }

    // Validation Phone (doit matcher la regex Java: ^[+]?[0-9]{10,15}$)
    if (userData.phone) {
      const phoneRegex = /^[+]?[0-9]{10,15}$/;
      if (!phoneRegex.test(userData.phone)) {
        throw new Error("Le téléphone doit contenir entre 10 et 15 chiffres (+ optionnel au début)");
      }
    }

    // Validation Username (doit matcher: ^[a-zA-Z0-9_.-]+$)
    if (userData.username) {
      const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
      if (!usernameRegex.test(userData.username)) {
        throw new Error("Le nom d'utilisateur ne peut contenir que des lettres, chiffres, points, tirets et underscores");
      }
      if (userData.username.length < 3 || userData.username.length > 50) {
        throw new Error("Le nom d'utilisateur doit contenir entre 3 et 50 caractères");
      }
    }

    const payload = {
      organizationId: DEFAULT_ORG_ID,
      username: userData.username,
      email: userData.email,
      phone: userData.phone || null, // Envoyer null si vide
      password: userData.password,
      role: "USER",
      isActive: true
    };

    console.log("📤 Register Payload:", payload);

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ API Error:", errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.message || "Erreur lors de l'inscription");
      } catch (e) {
        throw new Error(`Erreur serveur (${res.status}): ${errorText}`);
      }
    }

    const newUser = await res.json();
    return newUser;
  }

  async login(credentials: { email: string, password: string }): Promise<AppUser> {

    // --- DÉBUT COMPTE STATIQUE ADMIN ---
    if (credentials.email === "admin@navigoo.com" && credentials.password === "Admin@Navigoo2026") {
        const adminUser: AppUser = {
            userId: "00000000-0000-0000-0000-000000000000",
            organizationId: "83ce5943-d920-454f-908d-3248a73aafdf", // ID par défaut de votre système
            username: "Administrateur",
            email: "admin@navigoo.com",
            role: "SUPER_ADMIN", // Très important pour le routage
            isActive: true,
            createdAt: new Date().toISOString()
        };
        this.saveSession(adminUser);
        return adminUser;
    }
    const checkRes = await fetch(`${API_BASE_URL}/api/users/check-email/${encodeURIComponent(credentials.email)}`);
    const exists = await checkRes.json();

    if (!exists) {
      throw new Error("Cet email n'existe pas.");
    }

    const userRes = await fetch(`${API_BASE_URL}/api/users/email/${encodeURIComponent(credentials.email)}`);
    
    if (!userRes.ok) {
       throw new Error("Impossible de récupérer le profil utilisateur.");
    }

    const user: AppUser = await userRes.json();
    this.saveSession(user);
    return user;
  }

  saveSession(user: AppUser) {
    if (typeof window !== 'undefined') {
      localStorage.setItem("navigoo_user", JSON.stringify(user));
    }
  }

  getSession(): AppUser | null {
    if (typeof window !== 'undefined') {
      const u = localStorage.getItem("navigoo_user");
      return u ? JSON.parse(u) : null;
    }
    return null;
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("navigoo_user");
      window.location.href = "/signin";
    }
  }
}

export const authService = new AuthService();