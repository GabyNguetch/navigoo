import { POI } from "@/types";

const MAPTILER_API_KEY = "Lr72DkH8TYyjpP7RNZS9";

// Cache pour éviter les requêtes redondantes
const geocodeCache = new Map<string, Partial<POI>>();

// Détermine la catégorie en fonction du type de lieu
const determineCategoryFromType = (placeType: string): string => {
  const typeMap: Record<string, string> = {
    'restaurant': 'FOOD_DRINK',
    'cafe': 'FOOD_DRINK',
    'bar': 'FOOD_DRINK',
    'fast_food': 'FOOD_DRINK',
    'food_court': 'FOOD_DRINK',
    'hotel': 'ACCOMMODATION',
    'motel': 'ACCOMMODATION',
    'hostel': 'ACCOMMODATION',
    'guest_house': 'ACCOMMODATION',
    'shop': 'SHOPPING_RETAIL',
    'supermarket': 'SHOPPING_RETAIL',
    'mall': 'SHOPPING_RETAIL',
    'marketplace': 'SHOPPING_RETAIL',
    'boutique': 'SHOPPING_RETAIL',
    'hospital': 'HEALTH_WELLNESS',
    'clinic': 'HEALTH_WELLNESS',
    'pharmacy': 'HEALTH_WELLNESS',
    'doctors': 'HEALTH_WELLNESS',
    'dentist': 'HEALTH_WELLNESS',
    'veterinary': 'HEALTH_WELLNESS',
    'school': 'EDUCATION',
    'university': 'EDUCATION',
    'college': 'EDUCATION',
    'kindergarten': 'EDUCATION',
    'library': 'EDUCATION',
    'bank': 'FINANCE',
    'atm': 'FINANCE',
    'bureau_de_change': 'FINANCE',
    'church': 'WORSHIP_SPIRITUALITY',
    'mosque': 'WORSHIP_SPIRITUALITY',
    'temple': 'WORSHIP_SPIRITUALITY',
    'chapel': 'WORSHIP_SPIRITUALITY',
    'museum': 'LEISURE_CULTURE',
    'cinema': 'LEISURE_CULTURE',
    'theater': 'LEISURE_CULTURE',
    'theatre': 'LEISURE_CULTURE',
    'park': 'LEISURE_CULTURE',
    'zoo': 'LEISURE_CULTURE',
    'stadium': 'LEISURE_CULTURE',
    'bus_stop': 'TRANSPORTATION',
    'bus_station': 'TRANSPORTATION',
    'train_station': 'TRANSPORTATION',
    'airport': 'TRANSPORTATION',
    'taxi_stand': 'TRANSPORTATION',
    'fuel': 'TRANSPORTATION',
    'parking': 'TRANSPORTATION',
    'town_hall': 'PUBLIC_ADMIN_SERVICES',
    'police': 'PUBLIC_ADMIN_SERVICES',
    'fire_station': 'PUBLIC_ADMIN_SERVICES',
    'post_office': 'PUBLIC_ADMIN_SERVICES',
    'government': 'PUBLIC_ADMIN_SERVICES',
  };
  
  const lowerType = placeType.toLowerCase();
  return typeMap[lowerType] || 'LEISURE_CULTURE';
};

// Génère une description contextuelle enrichie
const generateDescription = (
  placeName: string, 
  placeType: string, 
  city: string,
  additionalInfo?: any
): string => {
  const baseDescriptions: Record<string, string> = {
    'FOOD_DRINK': `établissement de restauration`,
    'ACCOMMODATION': `hébergement`,
    'SHOPPING_RETAIL': `commerce`,
    'HEALTH_WELLNESS': `établissement de santé`,
    'EDUCATION': `établissement d'enseignement`,
    'FINANCE': `établissement financier`,
    'WORSHIP_SPIRITUALITY': `lieu de culte`,
    'LEISURE_CULTURE': `lieu culturel et de loisirs`,
    'TRANSPORTATION': `point de transport`,
    'PUBLIC_ADMIN_SERVICES': `service public`
  };
  
  const category = determineCategoryFromType(placeType);
  const baseDesc = baseDescriptions[category] || 'établissement';
  
  let description = `${placeName} est un ${baseDesc} situé à ${city}.`;
  
  // Ajouter des informations contextuelles si disponibles
  if (additionalInfo) {
    if (additionalInfo.address) {
      description += ` Adresse: ${additionalInfo.address}.`;
    }
    if (additionalInfo.opening_hours) {
      description += ` Horaires: ${additionalInfo.opening_hours}.`;
    }
    if (additionalInfo.phone) {
      description += ` Contact: ${additionalInfo.phone}.`;
    }
  }
  
  description += ` Partagez votre expérience sur Navigoo.`;
  
  return description;
};

// Sélectionne une image appropriée selon la catégorie
const getCategoryImage = (category: string): string => {
  const imageMap: Record<string, string> = {
    'FOOD_DRINK': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800',
    'ACCOMMODATION': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800',
    'SHOPPING_RETAIL': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800',
    'HEALTH_WELLNESS': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800',
    'EDUCATION': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800',
    'FINANCE': 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?q=80&w=800',
    'WORSHIP_SPIRITUALITY': 'https://images.unsplash.com/photo-1548625361-5b2e24e3f179?q=80&w=800',
    'LEISURE_CULTURE': 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=800',
    'TRANSPORTATION': 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800',
    'PUBLIC_ADMIN_SERVICES': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800'
  };
  
  return imageMap[category] || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800';
};

// Extrait les équipements depuis les tags OSM
const extractAmenitiesFromTags = (tags: any): string[] => {
  const amenities: string[] = [];
  
  if (!tags) return amenities;
  
  // Mapping des tags OSM vers amenities Navigoo
  const amenityMap: Record<string, string> = {
    'wifi': 'Wi-Fi',
    'internet_access': 'Wi-Fi',
    'parking': 'Parking',
    'wheelchair': 'Handicap',
    'air_conditioning': 'Climatisé',
    'outdoor_seating': 'Terrasse',
    'delivery': 'Livraison',
    'takeaway': 'À emporter',
    'toilets': 'Toilettes',
    'smoking': 'Fumeur',
    'payment:mobile_money': 'Mobile Money',
  };
  
  Object.keys(tags).forEach(key => {
    if (amenityMap[key] && tags[key] === 'yes') {
      amenities.push(amenityMap[key]);
    }
  });
  
  // Ajouter selon le type
  if (tags.cuisine) amenities.push(`Cuisine: ${tags.cuisine}`);
  if (tags.stars) amenities.push(`${tags.stars} étoiles`);
  if (tags.opening_hours) amenities.push('Horaires disponibles');
  
  return amenities;
};

// NOUVELLE FONCTION: Recherche détaillée via Overpass API (OpenStreetMap)
const fetchFromOverpassAPI = async (lat: number, lon: number, radius: number = 50): Promise<any> => {
  try {
    // Query Overpass pour récupérer les POIs dans un rayon
    const query = `
      [out:json][timeout:25];
      (
        node["name"](around:${radius},${lat},${lon});
        way["name"](around:${radius},${lat},${lon});
        relation["name"](around:${radius},${lat},${lon});
      );
      out body;
      >;
      out skel qt;
    `;
    
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    if (!response.ok) {
      console.warn('Overpass API error:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    if (data.elements && data.elements.length > 0) {
      // Trouver l'élément le plus proche
      let closest = null;
      let minDistance = Infinity;
      
      data.elements.forEach((element: any) => {
        if (element.tags && element.tags.name) {
          const elLat = element.lat || element.center?.lat;
          const elLon = element.lon || element.center?.lon;
          
          if (elLat && elLon) {
            const distance = Math.sqrt(
              Math.pow(elLat - lat, 2) + Math.pow(elLon - lon, 2)
            );
            
            if (distance < minDistance) {
              minDistance = distance;
              closest = element;
            }
          }
        }
      });
      
      return closest;
    }
    
    return null;
  } catch (error) {
    console.error('Overpass API error:', error);
    return null;
  }
};

// NOUVELLE FONCTION: Enrichir avec Nominatim (détails complets)
const enrichWithNominatim = async (lat: number, lon: number): Promise<any> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&extratags=1&namedetails=1`,
      {
        headers: {
          'User-Agent': 'POI-Navigoo/1.0',
        },
      }
    );
    
    if (!response.ok) return null;
    
    return await response.json();
  } catch (error) {
    console.error('Nominatim error:', error);
    return null;
  }
};

// FONCTION PRINCIPALE: Géocodage Inverse Multi-Sources
export const reverseGeocode = async (lat: number, lon: number): Promise<Partial<POI> | null> => {
  const cacheKey = `${lat.toFixed(5)},${lon.toFixed(5)}`;
  
  // Vérifier le cache
  if (geocodeCache.has(cacheKey)) {
    console.log('✅ Cache hit:', cacheKey);
    return geocodeCache.get(cacheKey)!;
  }

  console.log('🔍 Recherche multi-sources pour:', lat, lon);

  try {
    // ÉTAPE 1: MapTiler (rapide, info de base)
    const maptilerPromise = fetch(
      `https://api.maptiler.com/geocoding/${lon},${lat}.json?key=${MAPTILER_API_KEY}&limit=1`
    ).then(res => res.ok ? res.json() : null);
    
    // ÉTAPE 2: Overpass API (données OSM riches)
    const overpassPromise = fetchFromOverpassAPI(lat, lon, 50);
    
    // ÉTAPE 3: Nominatim (détails d'adresse)
    const nominatimPromise = enrichWithNominatim(lat, lon);
    
    // Exécution parallèle pour optimiser le temps
    const [maptilerData, overpassData, nominatimData] = await Promise.all([
      maptilerPromise,
      overpassPromise,
      nominatimPromise,
    ]);
    
    console.log('📊 Données récupérées:', {
      maptiler: !!maptilerData,
      overpass: !!overpassData,
      nominatim: !!nominatimData,
    });
    
    // FUSION DES DONNÉES
    let placeName = 'Lieu inconnu';
    let placeType = 'unknown';
    let city = 'Ville inconnue';
    let region = '';
    let country = 'Cameroun';
    let address = '';
    let phone = '';
    let website = '';
    let opening_hours = '';
    let amenities: string[] = [];
    let keywords: string[] = [];
    let imageUrl = '';
    
    // Priorité 1: Overpass (données les plus riches)
    if (overpassData && overpassData.tags) {
      const tags = overpassData.tags;
      placeName = tags.name || tags['name:fr'] || tags['name:en'] || placeName;
      placeType = tags.amenity || tags.shop || tags.leisure || tags.tourism || placeType;
      phone = tags.phone || tags['contact:phone'] || phone;
      website = tags.website || tags['contact:website'] || website;
      opening_hours = tags.opening_hours || opening_hours;
      
      // Extraire les équipements
      amenities = extractAmenitiesFromTags(tags);
      
      // Keywords depuis les tags
      if (tags.cuisine) keywords.push(tags.cuisine);
      if (tags.brand) keywords.push(tags.brand);
      if (tags.operator) keywords.push(tags.operator);
      
      console.log('✨ Overpass data:', {
        name: placeName,
        type: placeType,
        tags: Object.keys(tags),
      });
    }
    
    // Priorité 2: Nominatim (adresse complète)
    if (nominatimData) {
      address = nominatimData.display_name || address;
      
      if (nominatimData.address) {
        const addr = nominatimData.address;
        city = addr.city || addr.town || addr.village || addr.municipality || city;
        region = addr.state || addr.region || region;
        country = addr.country || country;
        
        // Si pas de nom depuis Overpass, utiliser Nominatim
        if (placeName === 'Lieu inconnu') {
          placeName = nominatimData.name || 
                     addr.amenity || 
                     addr.shop || 
                     addr.building || 
                     placeName;
        }
      }
      
      // Type depuis Nominatim si non trouvé
      if (placeType === 'unknown') {
        placeType = nominatimData.type || 
                   nominatimData.class || 
                   placeType;
      }
      
      // Tags extra de Nominatim
      if (nominatimData.extratags) {
        const extra = nominatimData.extratags;
        if (extra.phone && !phone) phone = extra.phone;
        if (extra.website && !website) website = extra.website;
        if (extra.opening_hours && !opening_hours) opening_hours = extra.opening_hours;
      }
      
      console.log('🏠 Nominatim data:', {
        name: placeName,
        address: city,
        type: placeType,
      });
    }
    
    // Priorité 3: MapTiler (fallback)
    if (maptilerData && maptilerData.features && maptilerData.features.length > 0) {
      const feature = maptilerData.features[0];
      const context = feature.context || [];
      
      if (placeName === 'Lieu inconnu') {
        placeName = feature.text || placeName;
      }
      
      const placeContext = context.find((c: any) => c.id?.includes('place'));
      const regionContext = context.find((c: any) => c.id?.includes('region'));
      const countryContext = context.find((c: any) => c.id?.includes('country'));
      
      if (!city || city === 'Ville inconnue') city = placeContext?.text || city;
      if (!region) region = regionContext?.text || region;
      if (!country || country === 'Cameroun') country = countryContext?.text || country;
      
      if (placeType === 'unknown') {
        placeType = feature.properties?.category || placeType;
      }
      
      console.log('🗺️ MapTiler data:', {
        name: placeName,
        city,
        type: placeType,
      });
    }
    
    // Déterminer la catégorie
    const category = determineCategoryFromType(placeType);
    
    // Image par défaut selon catégorie
    imageUrl = getCategoryImage(category);
    
    // Mots-clés finaux
    keywords = Array.from(new Set([...keywords, placeType, city, category])).filter(Boolean);
    
    // Construire le POI final
    const poi: Partial<POI> = {
      poi_id: `external-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      poi_name: placeName,
      address_informal: address || `${city}, ${country}`,
      address_city: city,
      address_state_province: region,
      address_country: country,
      location: { latitude: lat, longitude: lon },
      poi_category: category,
      poi_description: generateDescription(placeName, placeType, city, {
        address,
        opening_hours,
        phone,
      }),
      poi_images_urls: [imageUrl],
      rating: 0,
      review_count: 0,
      popularity_score: 0,
      poi_amenities: amenities,
      poi_keywords: keywords,
      poi_contacts: {
        phone: phone,
        website: website,
        email: '',
      },
      is_active: false, // Lieu externe non vérifié
    };
    
    console.log('✅ POI final créé:', {
      name: poi.poi_name,
      category: poi.poi_category,
      amenities: poi.poi_amenities?.length,
      hasPhone: !!phone,
      hasWebsite: !!website,
    });
    
    // Mise en cache
    if (geocodeCache.size > 100) {
      const firstKey = geocodeCache.keys().next().value;
      if (firstKey) { // <-- Ajoutez cette vérification
        geocodeCache.delete(firstKey);
      }
    }
    geocodeCache.set(cacheKey, poi);
    
    return poi;
    
  } catch (error) {
    console.error('❌ Erreur geocoding:', error);
    return null;
  }
};

// FONCTION BONUS: Recherche par nom de lieu
export const searchPlaceByName = async (name: string, lat?: number, lon?: number): Promise<Partial<POI>[]> => {
  try {
    const nominatimUrl = lat && lon
      ? `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name)}&format=json&limit=5&lat=${lat}&lon=${lon}&addressdetails=1&extratags=1`
      : `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name)}&format=json&limit=5&addressdetails=1&extratags=1`;
    
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'POI-Navigoo/1.0',
      },
    });
    
    if (!response.ok) return [];
    
    const results = await response.json();
    
    return results.map((result: any) => {
      const category = determineCategoryFromType(result.type || result.class);
      
      return {
        poi_id: `search-${result.osm_id}`,
        poi_name: result.display_name.split(',')[0],
        address_informal: result.display_name,
        address_city: result.address?.city || result.address?.town || '',
        address_country: result.address?.country || '',
        location: {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
        },
        poi_category: category,
        poi_description: `${result.display_name}`,
        poi_images_urls: [getCategoryImage(category)],
        rating: 0,
        review_count: 0,
      };
    });
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
};