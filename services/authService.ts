import { AppUser } from "@/types";
import { mediaService } from "./mediaService"; // Import nécessaire pour l'upload préalable

// URL des PROXYS (configurés dans next.config.ts)
const POI_PROXY = "/remote-api";
const AUTH_PROXY = "/auth-api";

export const DEFAULT_ORG_ID = "83ce5943-d920-454f-908d-3248a73aafdf"; 

export interface Organization {
  organizationId: string;
  organizationName: string;
  orgCode?: string;
  isActive: boolean;
}

class AuthService {
  
  /**
   * Récupère la liste des organisations depuis le Backend POI
   */
  async getOrganizations(): Promise<Organization[]> {
    try {
      const res = await fetch(`${POI_PROXY}/api/organizations`);
      if (!res.ok) throw new Error("Erreur chargement organisations");
      const data = await res.json();
      return data.filter((org: Organization) => org.isActive !== false);
    } catch (error) {
      console.error("❌ [AuthService] Erreur Organizations:", error);
      return [];
    }
  }

  /**
   * Orchestration complète de l'inscription :
   * 1. Upload de la photo vers MediaService (si présente)
   * 2. Injection de l'ID de la photo dans le payload
   * 3. Envoi de l'inscription à AuthService
   */
  async register(userData: {
    username: string;
    email: string;
    password: string;
    phone?: string;
    firstName: string;
    lastName: string;
    organizationId: string;
    file?: File | null;
  }): Promise<AppUser> {
    
    // --- 1. Validation Regex Stricte ---
    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!pwdRegex.test(userData.password)) {
      throw new Error("Le mot de passe doit contenir: 8 chars min, 1 Maj, 1 Min, 1 Chiffre, 1 Spécial (@$!%*?&)");
    }

    if (userData.phone) {
      const phoneRegex = /^[+]?[0-9]{10,15}$/;
      if (!phoneRegex.test(userData.phone)) {
        throw new Error("Le téléphone doit contenir entre 10 et 15 chiffres (+ optionnel au début)");
      }
    }

    if (userData.username) {
      const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
      if (!usernameRegex.test(userData.username) || userData.username.length < 3) {
        throw new Error("Nom d'utilisateur invalide (3-50 caractères, alphanumérique, _ . -)");
      }
    }

    // --- 2. Upload préalable de la photo (Le changement est ICI) ---
    let uploadedPhotoId: string | null = null;
    let uploadedPhotoUri: string | null = null;

    if (userData.file) {
      console.log("⬆️ [AuthService] Upload de la photo de profil vers Media Service...");
      try {
        // On upload vers le bucket "users"
        const media = await mediaService.uploadFile(userData.file, "users");
        uploadedPhotoId = media.id;
        uploadedPhotoUri = media.uri;
        console.log("✅ [AuthService] Photo uploadée avec succès. ID:", uploadedPhotoId);
      } catch (mediaError) {
        console.error("⚠️ [AuthService] Echec de l'upload photo, continuation sans photo:", mediaError);
        // On ne bloque pas l'inscription si l'image échoue, mais on log l'erreur
      }
    }

    // --- 3. Préparation du Payload Auth ---
    // On injecte photoId et photoUri récupérés du Media Service
    const registerPayload = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      phone: userData.phone || null,
      firstName: userData.firstName,
      lastName: userData.lastName,
      organizationId: userData.organizationId || DEFAULT_ORG_ID,
      
      // Champs spécifiques pour lier l'image
      photoId: uploadedPhotoId, 
      photoUri: uploadedPhotoUri, 

      service: "NAVIGOO",
      roles: ["USER"],
      isActive: true
    };

    console.log("📤 [AuthService] Envoi Payload Register:", registerPayload);

    // --- 4. Envoi Multipart à l'API Auth ---
    const endpoint = `${AUTH_PROXY}/api/auth/register`;
    const formData = new FormData();

    // Partie 'data' : Le JSON contenant les infos utilisateur + l'ID de la photo
    formData.append(
      "data", 
      new Blob([JSON.stringify(registerPayload)], { type: "application/json" })
    );

    // Partie 'file' :
    // Même si on a déjà uploadé l'image, l'API Auth attend souvent obligatoirement une part 'file' 
    // si elle est définie en @RequestPart("file") strict.
    // On renvoie le fichier pour satisfaire la signature du contrôleur Java, 
    // ou un fichier vide si pas de photo.
    if (userData.file) {
      formData.append("file", userData.file);
    } else {
      // Astuce: créer un blob vide si le backend plante sans la partie 'file'
      // Si le backend gère le @RequestPart(required=false), ceci n'est pas nécessaire.
      // Dans le doute avec Swagger, on laisse vide si null.
    }

    const res = await fetch(endpoint, {
      method: "POST",
      body: formData, // Le navigateur gère le Boundary automatiquement
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ [AuthService] Error ${res.status}:`, errorText);
      try {
        const jsonError = JSON.parse(errorText);
        throw new Error(jsonError.message || jsonError.error || "Erreur lors de l'inscription");
      } catch (e) {
        throw new Error(`Erreur serveur (${res.status}) lors de l'inscription`);
      }
    }

    const newUser = await res.json();
    console.log("✅ [AuthService] Inscription réussie :", newUser);
    
    // Si l'inscription réussit mais que l'API Auth ne nous connecte pas directement,
    // l'utilisateur devra se connecter manuellement à l'étape suivante.
    return newUser;
  }

  /**
   * Connexion Standard
   */
  async login(credentials: { email: string, password: string }): Promise<AppUser> {
    
    // Backdoor Admin (Pour le développement uniquement)
    if (credentials.email === "admin@navigoo.com" && credentials.password === "Admin@Navigoo2026") {
        console.log("🚀 [AuthService] Connexion Admin Statique");
        const adminUser = {
            id: "00000000-0000-0000-0000-000000000000",
            organizationId: DEFAULT_ORG_ID,
            username: "Administrateur",
            email: "admin@navigoo.com",
            role: "SUPER_ADMIN",
            firstName: "Super",
            lastName: "Admin",
            service: "NAVIGOO",
            isActive: true,
            createdAt: new Date().toISOString(),
            accessToken: "mock-token-admin",
            permissions: ["ALL"]
        } as AppUser;
        this.saveSession(adminUser);
        return adminUser;
    }

    // Connexion Réelle
    const res = await fetch(`${AUTH_PROXY}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            identifier: credentials.email,
            password: credentials.password
        })
    });

    if (!res.ok) {
        throw new Error("Identifiants incorrects");
    }

    const data = await res.json();
    
    // Mapping robuste AuthResponse -> AppUser
    const user: AppUser = {
        ...data.user,
        accessToken: data.accessToken,
        // Assurance que l'org ID est présent pour le service POI
        organizationId: data.user.organizationId || DEFAULT_ORG_ID 
    };

    this.saveSession(user);
    console.log("✅ [AuthService] Utilisateur connecté:", user.username);
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

  getToken(): string | undefined {
    return this.getSession()?.accessToken;
  }

  logout() {
    if (typeof window !== 'undefined') {
      const user = this.getSession();
      // Tentative de logout propre côté serveur
      if (user && user.id) {
        fetch(`${AUTH_PROXY}/api/auth/logout/${user.id}`, { method: 'POST' }).catch(() => {});
      }
      localStorage.removeItem("navigoo_user");
      window.location.href = "/signin";
    }
  }
}

export const authService = new AuthService();