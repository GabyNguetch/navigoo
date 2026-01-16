import { Location, RouteStats, TransportMode } from "@/types";

export const getRoute = async (
  start: Location,
  end: Location,
  mode: TransportMode = "driving",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  apiKey: string // On garde le paramètre pour compatibilité mais OSRM public n'en a pas besoin
): Promise<RouteStats | null> => {
  try {
    // 1. Conversion du mode de transport pour OSRM
    // OSRM supporte: 'driving', 'walking', 'cycling' (syntaxe exacte diffère légèrement parfois)
    let profile = "driving";
    if (mode === "cycling") profile = "bike"; // OSRM utilise souvent 'bike'
    if (mode === "walking") profile = "foot"; // OSRM utilise souvent 'foot'

    // 2. Utilisation de l'API publique OSRM (Router Project)
    // Note: C'est un service de démo gratuit, parfait pour le développement.
    const url = `https://router.project-osrm.org/route/v1/${profile}/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`;

    console.log("Fetching Route:", url); // Pour le debug

    const response = await fetch(url);

    // 3. Gestion correcte des erreurs HTTP (le 404 "Not Found")
    if (!response.ok) {
      console.error(`Erreur API Route: ${response.status} ${response.statusText}`);
      return null;
    }

    // 4. Parsing sécurisé
    const data = await response.json();

    // 5. Vérification du format de réponse OSRM
    if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
      console.warn("Pas de route trouvée par OSRM");
      return null;
    }

    const route = data.routes[0];

    return {
      distance: route.distance, // En mètres
      duration: route.duration, // En secondes
      geometry: route.geometry, // GeoJSON LineString
    };

  } catch (error) {
    console.error("Exception service routage:", error);
    return null;
  }
};