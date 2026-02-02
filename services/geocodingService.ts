import { POI } from "@/types";

const MAPTILER_API_KEY = "Lr72DkH8TYyjpP7RNZS9"; 

export const reverseGeocode = async (lat: number, lon: number): Promise<Partial<POI> | null> => {
  try {
    const response = await fetch(
      `https://api.maptiler.com/geocoding/${lon},${lat}.json?key=${MAPTILER_API_KEY}`
    );
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const best = data.features[0];
      
      // On simule un objet POI à partir des données de la carte
      return {
        poi_id: `external-${Date.now()}`,
        poi_name: best.text || "Lieu inconnu",
        address_informal: best.place_name,
        address_city: best.context?.find((c: any) => c.id.includes('place'))?.text || "",
        location: { latitude: lat, longitude: lon },
        poi_category: "OTHER",
        poi_description: "Informations récupérées via satellite. Ce lieu n'est pas encore répertorié officiellement sur Navigoo.",
        poi_images_urls: ["https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800"], // Image par défaut (Terre/Espace)
        rating: 0,
        review_count: 0
      };
    }
    return null;
  } catch (error) {
    console.error("Geocoding error", error);
    return null;
  }
};