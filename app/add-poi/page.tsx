"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ArrowLeft, Save, Loader2, Camera, MapPin, 
  Hash, Globe, Phone, Building2, Flag, Mail, 
  ScanLine, Type, Sparkles, CheckCircle2, CircleDashed,
  Target, ImagePlus, LocateFixed, Maximize, Check
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

// Clé API MapTiler (la même que dans page.tsx)
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
  const [isMapOpen, setIsMapOpen] = useState(false); // Modal Carte
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
    location: { latitude: 3.86667, longitude: 11.51667 }, // Défaut: Yaoundé
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
        // @ts-expect-error type fallback
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const res = reader.result as string;
            setPreviewImage(res);
            setFormData(prev => ({ ...prev, poi_images_urls: [res] }));
        };
        reader.readAsDataURL(file);
    }
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

  // Soumission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.poi_name || !formData.poi_category) return alert("Nom et Catégorie requis.");

    const finalPoi: POI = {
        ...formData as POI,
        poi_id: editId || Date.now().toString(),
        // @ts-expect-error compatibility
        poi_keywords: keywordsString.split(",").map(s => s.trim()).filter(Boolean),
        rating: formData.rating || 4.5,
        review_count: formData.review_count || 0,
        popularity_score: 10
    };

    if (editId) updateMyPoi(finalPoi);
    else addMyPoi(finalPoi);
    router.push("/");
  };

  if (isLoading) return <div className="h-screen w-full bg-zinc-50 dark:bg-black flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={40}/></div>;

  return (
    <div className="h-screen w-full bg-zinc-50 dark:bg-black font-sans overflow-y-auto">
      
      {/* HEADER FIXE */}
      <div className="sticky top-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 z-40 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700">
                        <ArrowLeft size={20} className="text-zinc-600 dark:text-zinc-400" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-full">
                                {editId ? "Édition" : "Nouveau"}
                            </span>
                            <h1 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white leading-none">
                                Bienvenue, Explorateur
                            </h1>
                        </div>
                        <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-1">
                            <Sparkles size={12} className="text-yellow-500 fill-yellow-500" /> 
                            Partagez vos meilleures découvertes et enrichissez la carte.
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-end">
                    <Button 
                        onClick={handleSubmit} 
                        variant="primary" 
                        className="px-6 py-2 h-11 text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center gap-2"
                    >
                        <Save size={18} /> {editId ? "Mettre à jour" : "Publier le lieu"}
                    </Button>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 pb-24">
        <form className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

            {/* GAUCHE : INFOS */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="p-2.5 bg-violet-100 dark:bg-violet-900/30 rounded-xl text-primary">
                        <ScanLine size={20} />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-100">Informations Générales</h2>
                        <p className="text-[11px] text-zinc-500">Détails essentiels pour identifier le lieu.</p>
                    </div>
                </div>

                {/* Upload Photo */}
                <div className="relative h-40 w-full bg-zinc-100 dark:bg-zinc-800 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 overflow-hidden group cursor-pointer transition-colors hover:border-primary hover:bg-primary/5">
                    {previewImage ? (
                        <Image src={previewImage} alt="Cover" fill className="object-cover transition-transform group-hover:scale-105" />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400">
                            <ImagePlus size={24} className="mb-2 group-hover:text-primary" />
                            <span className="text-xs font-semibold">Ajouter une couverture</span>
                        </div>
                    )}
                    <input type="file" onChange={handleImageChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                </div>

                <div className="space-y-12">
                    <FormInput 
                        label="Nom du lieu" name="poi_name" 
                        value={formData.poi_name} onChange={handleChange} 
                        icon={<Type size={16}/>} className="h-11" placeholder="Ex: Restaurant Le Délice"
                    />
                    
                    <FormSelect 
                        label="Catégorie" name="poi_category" 
                        value={formData.poi_category} onChange={handleChange}
                        icon={<Hash size={16}/>}
                        options={CATEGORIES.map(c => ({ id: c.id, label: c.label }))}
                    />

                    <FormInput 
                        as="textarea" label="Courte description" name="poi_description"
                        value={formData.poi_description} onChange={handleChange} 
                        icon={<Type size={16}/>} style={{ minHeight: '80px', maxHeight: '120px' }}
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <FormInput 
                            label="Téléphone" name="phone" 
                            value={formData.poi_contacts?.phone} onChange={handleChange}
                            icon={<Phone size={16}/>} className="h-11" 
                        />
                        <FormInput 
                            label="Site Web" name="website" 
                            value={formData.poi_contacts?.website} onChange={handleChange}
                            icon={<Globe size={16}/>} className="h-11" placeholder="facultatif"
                        />
                    </div>

                    <FormInput 
                        label="Mots-clés" name="keywords" 
                        value={keywordsString} onChange={(e) => setKeywordsString(e.target.value)}
                        icon={<Hash size={16}/>} className="h-11" placeholder="tag1, tag2..."
                    />

                    <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-1 block">Équipements</label>
                        <div className="flex flex-wrap gap-1.5">
                            {AMENITIES_OPTIONS.map(am => (
                                <button key={am} type="button" onClick={() => handleAmenityToggle(am)}
                                    className={clsx(
                                        "px-3 py-1.5 rounded-lg text-[11px] font-bold border flex items-center gap-1.5 transition-all",
                                        formData.poi_amenities?.includes(am)
                                        ? "bg-zinc-800 text-white border-zinc-800 dark:bg-white dark:text-black shadow-sm" 
                                        : "bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50"
                                    )}
                                >
                                    {formData.poi_amenities?.includes(am) ? <CheckCircle2 size={12}/> : <CircleDashed size={12}/>}
                                    {am}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* DROITE : COORDONNÉES */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5 h-full flex flex-col">
                <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600">
                        <MapPin size={20} />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-100">Coordonnées</h2>
                        <p className="text-[11px] text-zinc-500">Sélectionnez la position exacte sur la carte.</p>
                    </div>
                </div>

                {/* --- VUE MINIATURE AVEC BOUTON --- */}
                <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-inner group">
                    {/* Carte Miniature Statique (MapLibre avec interactivité désactivée) */}
                    <div className="absolute inset-0 grayscale-[50%] group-hover:grayscale-0 transition-all duration-500">
                       {/* Note: Pour éviter trop de lourdeur, on peut aussi utiliser une image statique, 
                           mais ici j'utilise la Map désactivée pour la précision visuelle */}
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
                                <MapPin size={32} className="text-primary fill-primary/20 drop-shadow-md" />
                            </Marker>
                        </Map>
                    </div>

                    {/* Overlay d'Action */}
                    <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-colors flex items-center justify-center pointer-events-none">
                        <div className="pointer-events-auto transform transition-transform group-hover:scale-105">
                            <button 
                                type="button"
                                onClick={() => { setTempLocation(formData.location!); setIsMapOpen(true); }}
                                className="bg-white text-zinc-800 px-5 py-2.5 rounded-full font-bold shadow-xl flex items-center gap-2 text-sm border-2 border-primary/20 hover:border-primary transition-all"
                            >
                                <Maximize size={16} className="text-primary"/> 
                                Choisir sur la carte
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-12 pt-2 flex-1">
                    {/* Bloc info GPS Rapide */}
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Target size={16} className="text-zinc-400"/>
                            <div className="text-xs font-mono font-bold text-zinc-600 dark:text-zinc-300">
                                {formData.location?.latitude.toFixed(6)}, {formData.location?.longitude.toFixed(6)}
                            </div>
                        </div>
                        <span className="text-[10px] text-green-600 font-bold bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-md">
                            Synchronisé
                        </span>
                    </div>

                    <FormInput 
                        label="Adresse / Lieu-dit" name="address_informal"
                        value={formData.address_informal} onChange={handleChange} 
                        icon={<MapPin size={16}/>} className="h-11" placeholder="Ex: Bastos, Face ambassade..."
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <FormInput 
                            label="Ville" name="address_city"
                            value={formData.address_city} onChange={handleChange} 
                            icon={<Building2 size={16}/>} className="h-11"
                        />
                        <FormInput 
                            label="Pays" name="address_country"
                            value={formData.address_country} onChange={handleChange} 
                            icon={<Flag size={16}/>} className="h-11"
                        />
                    </div>

                    <FormInput 
                        label="Code Postal" name="postalCode"
                        value={postalCode} onChange={(e) => setPostalCode(e.target.value)} 
                        icon={<Mail size={16}/>} className="h-11"
                    />
                </div>
            </div>

        </form>
      </div>

      {/* --- MODALE CARTE PLEIN ÉCRAN --- */}
      {isMapOpen && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white dark:bg-zinc-900 w-full h-full rounded-3xl overflow-hidden relative shadow-2xl flex flex-col">
                
                {/* En-tête Modal */}
                <div className="absolute top-4 left-4 right-4 z-10 flex justify-between pointer-events-none">
                    <div className="bg-white/90 dark:bg-zinc-800/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-zinc-200 dark:border-zinc-700 pointer-events-auto">
                        <h3 className="text-sm font-bold flex items-center gap-2">
                            <MapPin size={16} className="text-primary"/>
                            Glissez le marqueur ou cliquez pour définir
                        </h3>
                    </div>
                    <button 
                        onClick={() => setIsMapOpen(false)}
                        className="bg-white text-zinc-800 p-2 rounded-full shadow-lg pointer-events-auto hover:bg-zinc-100"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
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
                            <div className="flex flex-col items-center cursor-move hover:scale-110 transition-transform">
                                <Flag size={40} className="text-red-600 fill-red-600 drop-shadow-xl filter" strokeWidth={2} />
                                <div className="w-2.5 h-2.5 bg-black/50 rounded-full blur-[2px] mt-[-2px]"></div>
                            </div>
                        </Marker>
                    </Map>
                </div>

                {/* Footer Modal avec Actions */}
                <div className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 p-4 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
                    <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono">
                       <LocateFixed size={14}/>
                       Lat: <span className="text-zinc-800 dark:text-zinc-200 font-bold">{tempLocation.latitude.toFixed(6)}</span> 
                       Lon: <span className="text-zinc-800 dark:text-zinc-200 font-bold">{tempLocation.longitude.toFixed(6)}</span>
                    </div>
                    
                    <div className="flex gap-3 w-full md:w-auto">
                        <Button variant="secondary" onClick={() => navigator.geolocation.getCurrentPosition(p => setTempLocation({latitude: p.coords.latitude, longitude: p.coords.longitude}))} size="md" className="flex-1 md:flex-none">
                            <LocateFixed size={18} /> Ma position
                        </Button>
                        <Button onClick={saveMapLocation} variant="primary" size="md" className="flex-1 md:flex-none font-bold gap-2">
                            <Check size={18} /> Valider la position
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
        <Suspense fallback={<div className="h-screen w-full bg-white dark:bg-black" />}>
            <AddPoiContent />
        </Suspense>
    )
}