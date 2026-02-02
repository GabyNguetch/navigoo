import { Location, RouteStats, TransportMode } from "@/types";

// Vitesses moyennes en km/h
const AVERAGE_SPEEDS = {
  driving: 40,    // Voiture en ville
  cycling: 15,    // Vélo
  walking: 5      // Marche
};

interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  location: [number, number];
}

export interface EnrichedRouteStats extends RouteStats {
  steps: RouteStep[];
  averageSpeed: number;
}

export const getRoute = async (
  start: Location,
  end: Location,
  mode: TransportMode = "driving",
  apiKey: string
): Promise<EnrichedRouteStats | null> => {
  try {
    // Conversion du mode pour OSRM
    let profile = "driving";
    if (mode === "cycling") profile = "bike";
    if (mode === "walking") profile = "foot";

    // Requête OSRM avec steps=true pour obtenir les instructions
    const url = `https://router.project-osrm.org/route/v1/${profile}/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson&steps=true`;

    console.log("🚗 Fetching Route:", url);

    const response = await fetch(url);

    if (!response.ok) {
      console.error(`❌ Erreur API Route: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
      console.warn("⚠️ Pas de route trouvée par OSRM");
      return null;
    }

    const route = data.routes[0];
    const legs = route.legs || [];
    
    // Extraction des étapes détaillées
    const steps: RouteStep[] = [];
    
    legs.forEach((leg: any) => {
      leg.steps?.forEach((step: any) => {
        steps.push({
          instruction: step.maneuver?.type 
            ? formatInstruction(step.maneuver.type, step.name)
            : "Continuer tout droit",
          distance: step.distance,
          duration: step.duration,
          location: step.maneuver?.location || [0, 0]
        });
      });
    });

    // Recalcul de la durée selon la vitesse moyenne réelle
    const averageSpeed = AVERAGE_SPEEDS[mode];
    const distanceKm = route.distance / 1000;
    const recalculatedDuration = (distanceKm / averageSpeed) * 3600; // en secondes

    return {
      distance: route.distance,
      duration: recalculatedDuration,
      geometry: route.geometry,
      steps,
      averageSpeed
    };

  } catch (error) {
    console.error("❌ Exception service routage:", error);
    return null;
  }
};

// Formatage des instructions de navigation
const formatInstruction = (type: string, streetName?: string): string => {
  const instructions: Record<string, string> = {
    'turn': `Tourner ${streetName ? `vers ${streetName}` : ''}`,
    'new name': `Continuer sur ${streetName || 'la route'}`,
    'depart': `Partir ${streetName ? `vers ${streetName}` : ''}`,
    'arrive': `Arrivée à destination`,
    'merge': 'Se rabattre',
    'on ramp': 'Prendre la bretelle',
    'off ramp': 'Sortir de la bretelle',
    'fork': 'Bifurquer',
    'end of road': 'Bout de route',
    'continue': `Continuer ${streetName ? `sur ${streetName}` : 'tout droit'}`,
    'roundabout': 'Au rond-point',
    'rotary': 'Au carrefour giratoire',
    'roundabout turn': 'Au rond-point, tourner',
  };

  return instructions[type] || `Continuer ${streetName || 'tout droit'}`;
};

// Calculer la distance entre deux points (Haversine)
export const calculateDistance = (point1: Location, point2: Location): number => {
  const R = 6371e3; // Rayon de la Terre en mètres
  const φ1 = point1.latitude * Math.PI / 180;
  const φ2 = point2.latitude * Math.PI / 180;
  const Δφ = (point2.latitude - point1.latitude) * Math.PI / 180;
  const Δλ = (point2.longitude - point1.longitude) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance en mètres
};