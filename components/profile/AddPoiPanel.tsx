"use client";

import { useState, useEffect, useRef } from "react";
import { X, Save, Loader2, Camera, MapPin, Hash, Globe, Phone, Type, Sparkles, CheckCircle2, CircleDashed, ImagePlus, LocateFixed, Maximize, Check } from "lucide-react";
import Map, { Marker, NavigationControl, ScaleControl, MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { POI, Location } from "@/types";
import { CATEGORIES } from "@/data/categories";
import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/ui/form/FormInput";
import { FormSelect } from "@/components/ui/form/FormSelect";
import Image from "next/image";
import { clsx } from "clsx";
import { poiService } from "@/services/poiService";
import { motion } from "framer-motion";

const MAPTILER_API_KEY = "Lr72DkH8TYyjpP7RNZS9";

const AMENITIES_OPTIONS = [
  "Wi-Fi", "Parking", "Climatisé", "Terrasse", "Mobile Money",
  "Traiteur", "Sécurité", "Vue", "Handicap", "Bar", "24h/24"
];

interface AddPoiPanelProps {
  onClose: () => void;
  poiId?: string;
  onSuccess?: () => void; // Optionnel pour notifier le succès
}

export const AddPoiPanel = ({ onClose, poiId, onSuccess }: AddPoiPanelProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [keywordsString, setKeywordsString] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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

  const [tempLocation, setTempLocation] = useState<Location>({ latitude: 3.86667, longitude: 11.51667 });
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        setFormData(prev => ({ ...prev, location: loc }));
        setTempLocation(loc);
      });
    }
  }, []);

    // Charger les données si mode édition (poiId présent)
  useEffect(() => {
    if (poiId) {
      const fetchPoi = async () => {
        setIsLoading(true);
        try {
          const data = await poiService.getPoiById(poiId);
          setFormData(data);
          if (data.location) {
            setTempLocation(data.location);
          }
          if (data.poi_images_urls && data.poi_images_urls.length > 0) {
            setPreviewImage(data.poi_images_urls[0]);
          }
          if (data.poi_keywords) {
            setKeywordsString(data.poi_keywords.join(', '));
          }
        } catch (error) {
          console.error("Erreur chargement POI:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchPoi();
    } else if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        setFormData(prev => ({ ...prev, location: loc }));
        setTempLocation(loc);
      });
    }
  }, [poiId]);

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

  const handleMapClick = (evt: any) => {
    setTempLocation({ latitude: evt.lngLat.lat, longitude: evt.lngLat.lng });
  };

  const handleDragEnd = (evt: any) => {
    setTempLocation({ latitude: evt.lngLat.lat, longitude: evt.lngLat.lng });
  };

  const saveMapLocation = () => {
    setFormData(prev => ({ ...prev, location: tempLocation }));
    setIsMapOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.poi_name || !formData.poi_category) {
      alert("Veuillez renseigner au moins le nom et la catégorie.");
      return;
    }

    setIsLoading(true);

    try {
      const dataToSubmit = {
        ...formData,
        poi_keywords: keywordsString
          ? keywordsString.split(',').map(k => k.trim()).filter(k => k.length > 0)
          : [],
        address_state_province: "Adamaoua"
      };

      await poiService.createPoi(dataToSubmit);
      alert("Nouveau point d'intérêt publié sur Navigoo !");
      onClose();
    } catch (err: any) {
      console.error("❌ Erreur Backend:", err);
      alert(`Erreur lors de l'enregistrement : ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
    >
      {/* HEADER */}
      <div className="bg-gradient-to-r from-primary to-purple-600 p-6 text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black">Nouveau Point d'Intérêt</h2>
              <p className="text-sm opacity-90">Partagez votre découverte avec la communauté</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
            <X size={24} />
          </button>
        </div>
      </div>

      {/* FORMULAIRE */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* GAUCHE : INFOS */}
          <div className="space-y-6">
            {/* Upload Photo */}
            <div className="relative h-48 w-full bg-zinc-100 dark:bg-zinc-800 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 overflow-hidden group cursor-pointer">
              {previewImage ? (
                <Image src={previewImage} alt="Cover" fill className="object-cover group-hover:scale-105 transition-transform" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400">
                  <ImagePlus size={32} className="mb-2" />
                  <span className="text-sm font-semibold">Ajouter une couverture</span>
                </div>
              )}
              <input type="file" onChange={handleImageChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" />
            </div>

            <FormInput
              label="Nom du lieu"
              name="poi_name"
              value={formData.poi_name}
              onChange={handleChange}
              icon={<Type size={16} />}
              placeholder="Ex: Restaurant Le Délice"
            />

            <FormSelect
              label="Catégorie"
              name="poi_category"
              value={formData.poi_category}
              onChange={handleChange}
              icon={<Hash size={16} />}
              options={CATEGORIES.map(c => ({ id: c.id, label: c.label }))}
            />

            <FormInput
              as="textarea"
              label="Description"
              name="poi_description"
              value={formData.poi_description}
              onChange={handleChange}
              icon={<Type size={16} />}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormInput
                label="Téléphone"
                name="phone"
                value={formData.poi_contacts?.phone}
                onChange={handleChange}
                icon={<Phone size={16} />}
              />
              <FormInput
                label="Site Web"
                name="website"
                value={formData.poi_contacts?.website}
                onChange={handleChange}
                icon={<Globe size={16} />}
              />
            </div>

            <FormInput
              label="Mots-clés"
              name="keywords"
              value={keywordsString}
              onChange={(e) => setKeywordsString(e.target.value)}
              icon={<Hash size={16} />}
              placeholder="tag1, tag2..."
            />

            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Équipements</label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES_OPTIONS.map(am => (
                  <button
                    key={am}
                    type="button"
                    onClick={() => handleAmenityToggle(am)}
                    className={clsx(
                      "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                      formData.poi_amenities?.includes(am)
                        ? "bg-primary text-white border-primary"
                        : "bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700"
                    )}
                  >
                    {formData.poi_amenities?.includes(am) ? <CheckCircle2 size={12} className="inline mr-1" /> : <CircleDashed size={12} className="inline mr-1" />}
                    {am}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* DROITE : CARTE */}
          <div className="space-y-6">
            <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 group cursor-pointer" onClick={() => setIsMapOpen(true)}>
              <Map
                initialViewState={{
                  longitude: formData.location?.longitude || 11.5,
                  latitude: formData.location?.latitude || 3.8,
                  zoom: 14
                }}
                mapStyle={`https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_API_KEY}`}
                scrollZoom={false}
                dragPan={false}
                attributionControl={false}
              >
                <Marker longitude={formData.location?.longitude || 0} latitude={formData.location?.latitude || 0}>
                  <MapPin size={32} className="text-primary fill-primary/20" />
                </Marker>
              </Map>
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <button type="button" className="bg-white px-5 py-2.5 rounded-full font-bold shadow-xl flex items-center gap-2 border-2 border-primary/20">
                  <Maximize size={16} className="text-primary" />
                  Choisir sur la carte
                </button>
              </div>
            </div>

            <FormInput
              label="Adresse"
              name="address_informal"
              value={formData.address_informal}
              onChange={handleChange}
              icon={<MapPin size={16} />}
              placeholder="Ex: Bastos, Face ambassade..."
            />

            <div className="grid grid-cols-2 gap-3">
              <FormInput
                label="Ville"
                name="address_city"
                value={formData.address_city}
                onChange={handleChange}
                icon={<MapPin size={16} />}
              />
              <FormInput
                label="Pays"
                name="address_country"
                value={formData.address_country}
                onChange={handleChange}
                icon={<Globe size={16} />}
              />
            </div>
          </div>
        </div>
      </form>

      {/* FOOTER */}
      <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 flex gap-3">
        <Button onClick={onClose} variant="outline" className="flex-1">
          Annuler
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading} className="flex-1 gap-2">
          {isLoading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Publier</>}
        </Button>
      </div>

      {/* MODAL CARTE PLEIN ÉCRAN */}
      {isMapOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full h-full rounded-3xl overflow-hidden relative shadow-2xl flex flex-col">
            <div className="absolute top-4 left-4 right-4 z-10 flex justify-between pointer-events-none">
              <div className="bg-white/90 dark:bg-zinc-800/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-zinc-200 dark:border-zinc-700 pointer-events-auto">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <MapPin size={16} className="text-primary" />
                  Glissez le marqueur ou cliquez
                </h3>
              </div>
              <button onClick={() => setIsMapOpen(false)} className="bg-white p-2 rounded-full shadow-lg pointer-events-auto hover:bg-zinc-100">
                <X className="w-5 h-5" />
              </button>
            </div>

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
                <Marker
                  longitude={tempLocation.longitude}
                  latitude={tempLocation.latitude}
                  draggable
                  onDragEnd={handleDragEnd}
                  anchor="bottom"
                >
                  <MapPin size={40} className="text-red-600 fill-red-600 cursor-move" />
                </Marker>
              </Map>
            </div>

            <div className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 p-4 flex justify-between items-center">
              <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono">
                <LocateFixed size={14} />
                Lat: <span className="text-zinc-800 dark:text-zinc-200 font-bold">{tempLocation.latitude.toFixed(6)}</span>
                Lon: <span className="text-zinc-800 dark:text-zinc-200 font-bold">{tempLocation.longitude.toFixed(6)}</span>
              </div>
              <Button onClick={saveMapLocation} className="gap-2">
                <Check size={18} /> Valider
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};