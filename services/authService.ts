import { AppUserDTO } from "@/types";

// L'URL du backend définie dans .env.local ou par défaut
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Fonction helper pour logger les détails
const logTraffic = (method: string, url: string, payload: any, response: any) => {
    console.group(`🚀 API REQUEST: [${method}] ${url}`);
    if (payload) {
        console.log("%cRequest Payload:", "color: orange; font-weight: bold;", JSON.stringify(payload, null, 2));
    } else {
        console.log("%cNo Payload", "color: gray");
    }
    console.log("%cResponse Data:", "color: green; font-weight: bold;", response);
    console.groupEnd();
};

class AuthService {

  // --- INSCRIPTION (REGISTER) ---
  // Route: POST /api/users
  async register(userData: Partial<any>): Promise<any> {
    const endpoint = `${API_URL}/api/users`;

    // Structure exacte demandée par le README Backend
    const payload = {
        organizationId: "83ce5943-d920-454f-908d-3248a73aafdf", // Organisation par défaut
        username: userData.username,
        email: userData.email,
        phone: userData.phone,     // Exemple README: "+237670000000"
        password: userData.password,
        role: "USER",              // Rôle par défaut
        isActive: true
        // Note: pas de 'createdAt', 'userId' -> géré par le backend
    };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let responseData;
      const text = await res.text();
      try { responseData = JSON.parse(text); } catch { responseData = text; }

      // LOG DANS LA CONSOLE
      logTraffic("POST", endpoint, payload, responseData);

      if (!res.ok) {
          // Gestion basique d'erreurs (ex: username déjà pris)
          throw new Error(responseData.message || `Erreur ${res.status}: Inscription impossible.`);
      }
      
      return responseData;
    } catch (error) {
      console.error("Erreur Auth Register:", error);
      throw error;
    }
  }

  // --- CONNEXION (LOGIN) ---
  // Actuellement, nous utilisons "check-email" pour simuler une connexion car l'endpoint login n'est pas explicite dans le README.
  // Idéalement: POST /api/auth/login
  async login(credentials: { email: string, password: string }): Promise<any> {
    
    // Utilisation de l'endpoint Check Email pour vérifier l'existence (Simulation)
    const endpoint = `${API_URL}/api/users/check-email/${encodeURIComponent(credentials.email)}`;
    // Note: Pour une vraie sécurité, il faudra remplacer par POST /api/login plus tard.

    try {
      const res = await fetch(endpoint, {
        method: "GET", 
        headers: { "Content-Type": "application/json" }
      });

      // Le backend renvoie "true" ou "false" (boolean) selon la doc "Additional Endpoints"
      const userExists = await res.json();
      
      // On simule une réponse de succès si l'user existe
      // DANS UN VRAI LOGIN : C'est ici qu'on reçoit le token JWT
      const responseData = userExists 
        ? { status: "success", message: "User found (Login Simulated)", user: credentials.email }
        : { status: "error", message: "Utilisateur inconnu ou mot de passe incorrect." };

      // LOG EXPLICITE
      logTraffic("GET (Check Email Login)", endpoint, { email: credentials.email }, responseData);

      if (!res.ok || !userExists) {
          throw new Error("Identifiants incorrects ou compte inexistant.");
      }
      
      // Stocker l'état "connecté" dans le navigateur
      if (typeof window !== 'undefined') {
          localStorage.setItem("navigoo_user", JSON.stringify({ email: credentials.email })); 
      }
      
      return responseData;
    } catch (error) {
       console.error("Erreur Auth Login:", error);
       throw error;
    }
  }

  // --- LOGOUT ---
  logout() {
      if (typeof window !== 'undefined') {
          localStorage.removeItem("navigoo_user");
          // On force un rechargement pour mettre à jour l'UI (Navbar) ou on utilise un Context
          window.location.href = "/";
      }
  }
}

export const authService = new AuthService();