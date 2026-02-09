"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ArrowLeft, Save, Loader2, Camera, MapPin, 
  Hash, Globe, Phone, Building2, Flag, Mail, 
  ScanLine, Type, Sparkles, CheckCircle2, CircleDashed,
  Target, ImagePlus, LocateFixed, Maximize, Check, Upload, X
} from "lucide-react";

// Imports pour la carte
import Map, { Marker, NavigationControl, ScaleControl, MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

import { POI, Location } from "@/types";
import { useUserData } from "@/hooks/useUserData";
import { CATEGORIES } from "@/data/categories";
import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/ui/form/FormInput";
import { FormSelect } from "@/components/ui/form/FormSelect";
import Image from "next/image";
import { clsx } from "clsx";
import { poiService } from "@/services/poiService";
import { mediaService } from "@/services/mediaService";

// Clé API MapTiler
const MAPTILER_API_KEY = "Lr72DkH8TYyjpP7RNZS9"; 

const AMENITIES_OPTIONS = [
  "Wi-Fi", "Parking", "Climatisé", "Terrasse", "Mobile Money", 
  "Traiteur", "Sécurité", "Vue", "Handicap", "Bar", "24h/24"
];

function AddPoiContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addMyPoi, updateMyPoi, myPois } = useUserData();
  
  // States
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [postalCode, setPostalCode] = useState(""); 
  const [keywordsString, setKeywordsString] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const editId = searchParams.get("id");

  // Données du formulaire
  const [formData, setFormData] = useState<Partial<POI>>({
    poi_name: "",
    poi_category: "",
    poi_description: "",
    poi_amenities: [],
    location: { latitude: 3.86667, longitude: 11.51667 },
    address_informal: "",
    address_city: "Yaoundé",
    address_country: "Cameroun",
    poi_contacts: { phone: "", website: "" },
    poi_images_urls: [],
    poi_keywords: []
  });

  // State temporaire pour la carte plein écran
  const [tempLocation, setTempLocation] = useState<Location>({ latitude: 0, longitude: 0 });
  const mapRef = useRef<MapRef>(null);

  // Initialisation
  useEffect(() => {
    if (editId) {
      const existing = myPois.find(p => p.poi_id === editId);
      if (existing) {
        setFormData(existing);
        setTempLocation(existing.location);
        if (existing.poi_images_urls && existing.poi_images_urls[0]) {
          setPreviewImage(existing.poi_images_urls[0]);
        }
        setKeywordsString(existing.poi_keywords?.join(", ") || "");
      }
    } else {
      // Géolocalisation navigateur au chargement
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((pos) => {
          const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          setFormData(prev => ({ ...prev, location: loc }));
          setTempLocation(loc);
        });
      }
    }
    setIsLoading(false);
  }, [editId, myPois]);

  // --- HANDLERS ---

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "phone" || name === "website") {
        setFormData(prev => ({ ...prev, poi_contacts: { ...prev.poi_contacts, [name]: value } }));
    } else if (name === "latitude" || name === "longitude") {
        const val = parseFloat(value) || 0;
        setFormData(prev => ({ ...prev, location: { ...prev.location!, [name]: val } }));
        setTempLocation(prev => ({ ...prev, [name]: val }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    const current = formData.poi_amenities || [];
    const newAmenities = current.includes(amenity)
        ? current.filter(a => a !== amenity)
        : [...current, amenity];
    setFormData(prev => ({ ...prev, poi_amenities: newAmenities }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setIsUploadingImage(true);
        
        // Créer un preview local immédiatement
        const localPreview = URL.createObjectURL(file);
        setPreviewImage(localPreview);
        
        try {
            // 1. Upload vers Media Service
            const media = await mediaService.uploadFile(file, "pois_galleries");
            
            // 2. Récupérer l'URL propre
            const imageUrl = mediaService.getMediaUrl(media.id);
            
            // Conversion localhost -> URL Réelle si nécessaire
            const finalUrl = imageUrl.replace('http://localhost:3000/media-api', 'https://media-service.pynfi.com');

            // Révoquer l'URL locale et utiliser l'URL finale
            URL.revokeObjectURL(localPreview);
            setPreviewImage(finalUrl);
            
            setFormData(prev => ({ 
                ...prev, 
                poi_images_urls: [finalUrl]
            }));

            console.log("📸 Image liée avec succès:", finalUrl);
        } catch (error) {
            console.error("Erreur upload:", error);
            alert("Erreur lors de l'upload de l'image");
            setPreviewImage(null);
        } finally {
            setIsUploadingImage(false);
        }
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setFormData(prev => ({ ...prev, poi_images_urls: [] }));
  };

  // Gestion Carte
  const handleMapClick = (evt: any) => {
    setTempLocation({
        latitude: evt.lngLat.lat,
        longitude: evt.lngLat.lng
    });
  };

  const handleDragEnd = (evt: any) => {
    setTempLocation({
        latitude: evt.lngLat.lat,
        longitude: evt.lngLat.lng
    });
  };

  const saveMapLocation = () => {
    setFormData(prev => ({
        ...prev,
        location: tempLocation
    }));
    setIsMapOpen(false);
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation des champs requis
    if (!formData.poi_name?.trim()) {
        alert("❌ Le nom du lieu est requis.");
        return;
    }

    if (!formData.poi_category) {
        alert("❌ La catégorie est requise.");
        return;
    }

    if (!formData.location?.latitude || !formData.location?.longitude) {
        alert("❌ Veuillez définir la position sur la carte.");
        return;
    }

    setIsSubmitting(true);

    try {
        // Nettoyage des mots-clés
        const cleanKeywords = keywordsString
            .split(/[,\s]+/) // Split par virgule OU espace
            .map(k => k.trim())
            .filter(k => k.length > 0);

        // Préparation du payload avec tous les champs requis
        const submissionData = {
            poi_name: formData.poi_name.trim(),
            poi_category: formData.poi_category,
            poi_type: formData.poi_type || "OTHER",
            poi_description: formData.poi_description || "",
            location: formData.location,
            address_informal: formData.address_informal || "",
            address_city: formData.address_city || "Ngaoundéré",
            address_state_province: "Adamaoua", // REQUIS par le backend
            address_country: formData.address_country || "Cameroun",
            poi_contacts: {
                phone: formData.poi_contacts?.phone || "",
                website: formData.poi_contacts?.website || ""
            },
            poi_images_urls: formData.poi_images_urls || [],
            poi_amenities: formData.poi_amenities || [],
            poi_keywords: cleanKeywords,
            postalCode: postalCode || "0000"
        };

        console.log("📤 Données à envoyer:", submissionData);

        // Appel au service
        const result = await poiService.createPoi(submissionData);
        
        console.log("✅ POI créé:", result);
        
        // Message de succès
        alert("🎉 Félicitations ! Votre lieu a été créé avec succès.\n\nIl sera visible sur la carte après validation par notre équipe.");
        
        // Redirection automatique au profil
        router.push("/profile");
        router.refresh(); 

    } catch (err: any) {
        console.error("❌ Erreur lors de la création:", err);
        
        // Message d'erreur détaillé
        const errorMessage = err.message || "Une erreur inconnue est survenue";
        alert(`❌ Échec de la création du lieu :\n\n${errorMessage}\n\nVeuillez réessayer ou contacter le support.`);
    } finally {
        setIsSubmitting(false);
    }
};
  
  if (isLoading) {
    return (
      <div className="h-screen w-full bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin text-violet-600 mx-auto" size={48}/>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-zinc-50 via-violet-50/30 to-zinc-100 dark:from-black dark:via-violet-950/20 dark:to-zinc-950 font-sans overflow-y-auto">
      
      {/* HEADER FIXE */}
      <div className="sticky top-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 z-40 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button 
                      onClick={() => router.back()} 
                      className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all duration-200 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 hover:scale-105 active:scale-95"
                    >
                        <ArrowLeft size={20} className="text-zinc-600 dark:text-zinc-400" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2.5">
                            <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider bg-violet-100 dark:bg-violet-900/30 px-2.5 py-1 rounded-full">
                                {editId ? "Édition" : "Nouveau"}
                            </span>
                            <h1 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white leading-none">
                                Bienvenue, Explorateur
                            </h1>
                        </div>
                        <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-1.5">
                            <Sparkles size={12} className="text-amber-500 fill-amber-500" /> 
                            Partagez vos meilleures découvertes et enrichissez la carte.
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-end">
                    <Button 
                        onClick={handleSubmit} 
                        disabled={isSubmitting || isUploadingImage}
                        variant="primary" 
                        className="px-6 py-2.5 h-12 text-sm font-bold shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-2.5 bg-gradient-to-r from-violet-600 to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Envoi en cours...
                          </>
                        ) : (
                          <>
                            <Save size={18} /> 
                            {editId ? "Mettre à jour" : "Publier le lieu"}
                          </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 pb-24">
        <form className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

            {/* GAUCHE : INFOS */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-lg shadow-zinc-200/50 dark:shadow-zinc-950/50 space-y-6 transition-all duration-300 hover:shadow-xl hover:shadow-zinc-300/50 dark:hover:shadow-zinc-900/50">
                <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="p-2.5 bg-gradient-to-br from-violet-100 to-violet-50 dark:from-violet-900/30 dark:to-violet-800/20 rounded-xl text-violet-600 dark:text-violet-400">
                        <ScanLine size={20} />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-100">Informations Générales</h2>
                        <p className="text-[11px] text-zinc-500">Détails essentiels pour identifier le lieu.</p>
                    </div>
                </div>

                {/* Upload Photo avec Preview Amélioré */}
                <div className="relative h-48 w-full bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-900 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 overflow-hidden group transition-all duration-300 hover:border-violet-400 dark:hover:border-violet-600 hover:shadow-lg">
                    {previewImage ? (
                        <>
                            {/* Image avec effet de chargement */}
                            <div className="relative w-full h-full">
                                <Image 
                                  src={previewImage} 
                                  alt="Cover" 
                                  fill 
                                  className={clsx(
                                    "object-cover transition-all duration-500",
                                    isUploadingImage ? "blur-md scale-105" : "blur-0 scale-100"
                                  )} 
                                />
                                
                                {/* Overlay de chargement */}
                                {isUploadingImage && (
                                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center z-10 animate-in fade-in duration-300">
                                    <Loader2 className="animate-spin text-white mb-3" size={40} />
                                    <p className="text-white text-sm font-semibold">Upload en cours...</p>
                                  </div>
                                )}
                                
                                {/* Bouton de suppression */}
                                {!isUploadingImage && (
                                  <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute top-3 right-3 p-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-all duration-200 hover:scale-110 active:scale-95 z-20 opacity-0 group-hover:opacity-100"
                                  >
                                    <X size={16} />
                                  </button>
                                )}

                                {/* Badge de succès */}
                                {!isUploadingImage && (
                                  <div className="absolute bottom-3 left-3 bg-green-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <CheckCircle2 size={14} />
                                    Image chargée
                                  </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 cursor-pointer">
                            <div className="p-4 bg-violet-100 dark:bg-violet-900/30 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300">
                              <ImagePlus size={28} className="text-violet-600 dark:text-violet-400" />
                            </div>
                            <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">Ajouter une photo de couverture</span>
                            <span className="text-xs text-zinc-400 mt-1">Cliquez ou glissez une image</span>
                        </div>
                    )}
                    <input 
                      type="file" 
                      onChange={handleImageChange} 
                      accept="image/*" 
                      disabled={isUploadingImage}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed" 
                    />
                </div>

                <div className="space-y-5">
                    <FormInput 
                        label="Nom du lieu" 
                        name="poi_name" 
                        value={formData.poi_name} 
                        onChange={handleChange} 
                        icon={<Type size={16}/>} 
                        className="h-12 transition-all duration-200 focus-within:ring-2 focus-within:ring-violet-500/20" 
                        placeholder="Ex: Restaurant Le Délice"
                        required
                    />
                    
                    <FormSelect 
                        label="Catégorie" 
                        name="poi_category" 
                        value={formData.poi_category} 
                        onChange={handleChange}
                        icon={<Hash size={16}/>}
                        options={CATEGORIES.map(c => ({ id: c.id, label: c.label }))}
                        required
                    />

                    <FormInput 
                        as="textarea" 
                        label="Courte description" 
                        name="poi_description"
                        value={formData.poi_description} 
                        onChange={handleChange} 
                        icon={<Type size={16}/>} 
                        style={{ minHeight: '100px', maxHeight: '150px' }}
                        placeholder="Décrivez brièvement ce lieu..."
                        className="transition-all duration-200 focus-within:ring-2 focus-within:ring-violet-500/20"
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <FormInput 
                            label="Téléphone" 
                            name="phone" 
                            value={formData.poi_contacts?.phone} 
                            onChange={handleChange}
                            icon={<Phone size={16}/>} 
                            className="h-12" 
                            placeholder="+237 6XX XXX XXX"
                        />
                        <FormInput 
                            label="Site Web" 
                            name="website" 
                            value={formData.poi_contacts?.website} 
                            onChange={handleChange}
                            icon={<Globe size={16}/>} 
                            className="h-12" 
                            placeholder="www.exemple.com"
                        />
                    </div>

                    <FormInput 
                        label="Mots-clés" 
                        name="keywords" 
                        value={keywordsString} 
                        onChange={(e) => setKeywordsString(e.target.value)}
                        icon={<Hash size={16}/>} 
                        className="h-12" 
                        placeholder="restaurant, africain, bastos..."
                    />

                    <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-3 ml-1 block">Équipements & Services</label>
                        <div className="flex flex-wrap gap-2">
                            {AMENITIES_OPTIONS.map(am => (
                                <button 
                                  key={am} 
                                  type="button" 
                                  onClick={() => handleAmenityToggle(am)}
                                  className={clsx(
                                      "px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95",
                                      formData.poi_amenities?.includes(am)
                                      ? "bg-gradient-to-r from-violet-600 to-violet-500 text-white border-violet-600 shadow-md shadow-violet-600/20" 
                                      : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-violet-300 dark:hover:border-violet-600"
                                  )}
                                >
                                    {formData.poi_amenities?.includes(am) ? (
                                      <CheckCircle2 size={14} className="shrink-0"/>
                                    ) : (
                                      <CircleDashed size={14} className="shrink-0"/>
                                    )}
                                    {am}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* DROITE : COORDONNÉES */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-lg shadow-zinc-200/50 dark:shadow-zinc-950/50 space-y-6 h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-zinc-300/50 dark:hover:shadow-zinc-900/50">
                <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="p-2.5 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl text-blue-600 dark:text-blue-400">
                        <MapPin size={20} />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-100">Localisation</h2>
                        <p className="text-[11px] text-zinc-500">Définissez la position exacte sur la carte.</p>
                    </div>
                </div>

                {/* VUE MINIATURE AVEC BOUTON */}
                <div className="relative w-full h-52 rounded-2xl overflow-hidden border-2 border-zinc-200 dark:border-zinc-800 shadow-inner group">
                    <div className="absolute inset-0 grayscale-[40%] group-hover:grayscale-0 transition-all duration-500">
                        <Map
                            initialViewState={{
                                longitude: formData.location?.longitude || 11.5,
                                latitude: formData.location?.latitude || 3.8,
                                zoom: 14
                            }}
                            mapStyle={`https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_API_KEY}`}
                            scrollZoom={false}
                            dragPan={false}
                            doubleClickZoom={false}
                            attributionControl={false}
                        >
                            <Marker longitude={formData.location?.longitude || 0} latitude={formData.location?.latitude || 0}>
                                <MapPin size={36} className="text-violet-600 fill-violet-600/20 drop-shadow-lg animate-bounce" />
                            </Marker>
                        </Map>
                    </div>

                    {/* Overlay d'Action */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent group-hover:from-black/60 transition-all duration-300 flex items-center justify-center pointer-events-none">
                        <div className="pointer-events-auto transform transition-all duration-300 group-hover:scale-105">
                            <button 
                                type="button"
                                onClick={() => { setTempLocation(formData.location!); setIsMapOpen(true); }}
                                className="bg-white text-zinc-800 px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2.5 text-sm border-2 border-violet-200 hover:border-violet-400 transition-all duration-200 hover:shadow-violet-400/30"
                            >
                                <Maximize size={18} className="text-violet-600"/> 
                                Ouvrir la carte
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-5 pt-2 flex-1">
                    {/* Bloc info GPS */}
                    <div className="p-4 bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl flex items-center justify-between transition-all duration-300 hover:border-violet-300 dark:hover:border-violet-700">
                        <div className="flex items-center gap-2.5">
                            <Target size={18} className="text-violet-600 dark:text-violet-400"/>
                            <div className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                                {formData.location?.latitude.toFixed(6)}, {formData.location?.longitude.toFixed(6)}
                            </div>
                        </div>
                        <span className="text-[10px] text-green-600 font-bold bg-green-100 dark:bg-green-900/30 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></div>
                            Synchronisé
                        </span>
                    </div>

                    <FormInput 
                        label="Adresse / Lieu-dit" 
                        name="address_informal"
                        value={formData.address_informal} 
                        onChange={handleChange} 
                        icon={<MapPin size={16}/>} 
                        className="h-12" 
                        placeholder="Ex: Bastos, Face ambassade USA..."
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <FormInput 
                            label="Ville" 
                            name="address_city"
                            value={formData.address_city} 
                            onChange={handleChange} 
                            icon={<Building2 size={16}/>} 
                            className="h-12"
                        />
                        <FormInput 
                            label="Pays" 
                            name="address_country"
                            value={formData.address_country} 
                            onChange={handleChange} 
                            icon={<Flag size={16}/>} 
                            className="h-12"
                        />
                    </div>

                    <FormInput 
                        label="Code Postal" 
                        name="postalCode"
                        value={postalCode} 
                        onChange={(e) => setPostalCode(e.target.value)} 
                        icon={<Mail size={16}/>} 
                        className="h-12"
                        placeholder="Optionnel"
                    />
                </div>
            </div>

        </form>
      </div>

      {/* MODALE CARTE PLEIN ÉCRAN */}
      {isMapOpen && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-0 md:p-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-white dark:bg-zinc-900 w-full h-full md:rounded-3xl overflow-hidden relative shadow-2xl flex flex-col">
                
                {/* En-tête Modal */}
                <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none gap-3">
                    <div className="bg-white/95 dark:bg-zinc-800/95 backdrop-blur-lg px-5 py-3 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-700 pointer-events-auto max-w-md">
                        <h3 className="text-sm font-bold flex items-center gap-2.5 text-zinc-800 dark:text-zinc-100">
                            <MapPin size={18} className="text-violet-600"/>
                            Positionnez le marqueur
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1">Glissez le marqueur ou cliquez sur la carte</p>
                    </div>
                    <button 
                        onClick={() => setIsMapOpen(false)}
                        className="bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 p-3 rounded-full shadow-xl pointer-events-auto hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all duration-200 hover:scale-110 active:scale-95 border border-zinc-200 dark:border-zinc-700"
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Map Interactive */}
                <div className="flex-1 w-full h-full relative bg-zinc-100">
                    <Map
                        initialViewState={{
                            longitude: tempLocation.longitude,
                            latitude: tempLocation.latitude,
                            zoom: 15
                        }}
                        mapStyle={`https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_API_KEY}`}
                        onClick={handleMapClick}
                    >
                        <NavigationControl position="bottom-left" showCompass={false} />
                        <ScaleControl position="bottom-right" />

                        {/* Draggable Marker */}
                        <Marker 
                            longitude={tempLocation.longitude} 
                            latitude={tempLocation.latitude} 
                            draggable
                            onDragEnd={handleDragEnd}
                            anchor="bottom"
                        >
                            <div className="flex flex-col items-center cursor-move hover:scale-110 transition-transform duration-200 animate-bounce">
                                <Flag size={44} className="text-red-600 fill-red-600 drop-shadow-2xl filter" strokeWidth={2.5} />
                                <div className="w-3 h-3 bg-black/50 rounded-full blur-[3px] mt-[-4px]"></div>
                            </div>
                        </Marker>
                    </Map>
                </div>

                {/* Footer Modal */}
                <div className="bg-white dark:bg-zinc-900 border-t-2 border-zinc-200 dark:border-zinc-800 p-5 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
                    <div className="flex items-center gap-3 text-zinc-500 text-xs font-mono bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                       <LocateFixed size={16} className="text-violet-600"/>
                       <span className="font-bold text-zinc-700 dark:text-zinc-300">
                         {tempLocation.latitude.toFixed(6)}, {tempLocation.longitude.toFixed(6)}
                       </span>
                    </div>
                    
                    <div className="flex gap-3 w-full md:w-auto">
                        <Button 
                          variant="secondary" 
                          onClick={() => {
                            if ("geolocation" in navigator) {
                              navigator.geolocation.getCurrentPosition(p => {
                                setTempLocation({
                                  latitude: p.coords.latitude, 
                                  longitude: p.coords.longitude
                                });
                              });
                            }
                          }}
                          size="md" 
                          className="flex-1 md:flex-none h-12 gap-2 font-bold"
                        >
                            <LocateFixed size={18} /> Ma position
                        </Button>
                        <Button 
                          onClick={saveMapLocation} 
                          variant="primary" 
                          size="md" 
                          className="flex-1 md:flex-none font-bold gap-2.5 h-12 bg-gradient-to-r from-violet-600 to-violet-500 shadow-lg shadow-violet-600/30"
                        >
                            <Check size={18} strokeWidth={3} /> Valider la position
                        </Button>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}

// Wrapper Suspense pour Next.js 
export default function AddPoiPage() {
    return (
        <Suspense fallback={
          <div className="h-screen w-full bg-white dark:bg-black flex items-center justify-center">
            <Loader2 className="animate-spin text-violet-600" size={48} />
          </div>
        }>
            <AddPoiContent />
        </Suspense>
    )
}