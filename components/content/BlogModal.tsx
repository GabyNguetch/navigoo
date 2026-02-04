"use client";

import { useState, useEffect, useRef } from "react";
import { X, FileText, Save, Loader2, ImagePlus, Type, AlignLeft, Video, Camera, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { authService } from "@/services/authService";
import { contentService } from "@/services/contentService";
import { POI } from "@/types";
import Image from "next/image";
import { clsx } from "clsx";

interface BlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPoi?: POI | null;
  onSuccess?: () => void;
}

export const BlogModal = ({ isOpen, onClose, selectedPoi, onSuccess }: BlogModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [availablePois, setAvailablePois] = useState<POI[]>([]);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    poi_id: "",
    title: "",
    description: "",
    content: "",
    cover_image_url: "",
  });

  const user = authService.getSession();

  useEffect(() => {
    if (isOpen) {
      loadUserPois();
      if (selectedPoi) {
        setFormData(prev => ({ ...prev, poi_id: selectedPoi.poi_id }));
      }
    }
  }, [isOpen, selectedPoi]);

  const loadUserPois = async () => {
    if (!user?.userId) return;
    
    try {
      const response = await fetch(`https://poi-navigoo.pynfi.com/api/pois/user/${user.userId}`);
      if (response.ok) {
        const data = await response.json();
        setAvailablePois(data || []);
      }
    } catch (error) {
      console.error("Erreur chargement POIs:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setMediaPreview(result);
      setFormData(prev => ({ ...prev, cover_image_url: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.poi_id || !formData.title || !formData.content) {
      alert("Champs obligatoires manquants");
      return;
    }
    
    setIsLoading(true);
    try {
      await contentService.createBlog({
        ...formData,
        user_id: user?.userId
      });
      if (onSuccess) onSuccess();
      handleClose();
    } catch (error) {
      alert("Erreur lors de la création");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        poi_id: "",
        title: "",
        description: "",
        content: "",
        cover_image_url: "",
      });
      setMediaPreview(null);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              
              {/* HEADER */}
              <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-700 rounded-2xl">
                    <FileText size={28} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white">
                      Créer un blog
                    </h2>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Photo et Vidéo
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                >
                  <X size={24} className="text-zinc-600 dark:text-zinc-400" />
                </button>
              </div>

              {/* BODY */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                  
                  {/* GAUCHE : MÉDIA */}
                  <div className="relative bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center min-h-[400px] md:min-h-full">
                    {mediaPreview ? (
                      <div className="relative w-full h-full">
                        {mediaType === 'image' ? (
                          <Image src={mediaPreview} alt="Preview" fill className="object-contain" />
                        ) : (
                          <video src={mediaPreview} controls className="w-full h-full object-contain" />
                        )}
                        <button
                          type="button"
                          onClick={() => { setMediaPreview(null); setFormData(prev => ({ ...prev, cover_image_url: '' })); }}
                          className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-6 p-8">
                        <div className="flex gap-4">
                          <button
                            type="button"
                            onClick={() => { setMediaType('image'); fileInputRef.current?.click(); }}
                            className={clsx(
                              "flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed transition-all",
                              mediaType === 'image' ? "border-primary bg-primary/5" : "border-zinc-300 dark:border-zinc-700"
                            )}
                          >
                            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
                              <ImageIcon size={32} className="text-blue-600" />
                            </div>
                            <span className="font-bold text-sm">Photo</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => { setMediaType('video'); fileInputRef.current?.click(); }}
                            className={clsx(
                              "flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed transition-all",
                              mediaType === 'video' ? "border-primary bg-primary/5" : "border-zinc-300 dark:border-zinc-700"
                            )}
                          >
                            <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-2xl">
                              <Video size={32} className="text-purple-600" />
                            </div>
                            <span className="font-bold text-sm">Vidéo</span>
                          </button>
                        </div>
                        
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept={mediaType === 'image' ? 'image/*' : 'video/*'}
                          onChange={handleMediaUpload}
                          className="hidden"
                        />
                        
                        <p className="text-sm text-zinc-500 text-center">
                          ou glissez votre fichier ici
                        </p>
                      </div>
                    )}
                  </div>

                  {/* DROITE : FORMULAIRE */}
                  <div className="p-6 space-y-4 overflow-y-auto">
                    
                    {/* POI Selection */}
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
                        Lieu *
                      </label>
                      <select
                        name="poi_id"
                        value={formData.poi_id}
                        onChange={handleChange}
                        required
                        disabled={!!selectedPoi}
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black/50 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      >
                        <option value="">-- Sélectionner --</option>
                        {availablePois.map(poi => (
                          <option key={poi.poi_id} value={poi.poi_id}>
                            {poi.poi_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Titre */}
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
                        Titre *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="Ex: Une soirée mémorable..."
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black/50 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
                        Légende
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={2}
                        placeholder="Ajoutez une légende..."
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black/50 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                      />
                    </div>

                    {/* Contenu */}
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
                        Contenu détaillé *
                      </label>
                      <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        required
                        rows={2}
                        placeholder="Racontez votre expérience..."
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black/50 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              </form>

              {/* FOOTER */}
              <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 flex gap-3">
                <Button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  variant="outline"
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 gap-2 bg-purple-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Publication...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Publier
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};