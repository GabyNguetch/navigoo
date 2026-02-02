"use client";

import { useState, useEffect } from "react";
import { X, FileText, Save, Loader2, ImagePlus, Type, AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/ui/form/FormInput";
import { motion, AnimatePresence } from "framer-motion";
import { authService } from "@/services/authService";
import { contentService } from "@/services/contentService";
import { POI } from "@/types";

interface BlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPoi?: POI | null;
  onSuccess?: () => void;
}

export const BlogModal = ({ isOpen, onClose, selectedPoi, onSuccess }: BlogModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [availablePois, setAvailablePois] = useState<POI[]>([]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.userId) {
      alert("Vous devez être connecté");
      return;
    }

    if (!formData.poi_id || !formData.title || !formData.content) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsLoading(true);

    try {
      const blogData = {
        user_id: user.userId,
        poi_id: formData.poi_id,
        title: formData.title,
        description: formData.description || "",
        cover_image_url: formData.cover_image_url || "",
        content: formData.content,
      };

      await contentService.createBlog(blogData);
      
      alert("✅ Blog créé avec succès !");
      
      // Reset form
      setFormData({
        poi_id: "",
        title: "",
        description: "",
        content: "",
        cover_image_url: "",
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Erreur création blog:", error);
      alert(`❌ Erreur: ${error.message}`);
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
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
              
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-950/30 dark:to-violet-950/30">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500 rounded-2xl">
                    <FileText size={28} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white">
                      Créer un Blog
                    </h2>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Partagez votre expérience sur un lieu
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors disabled:opacity-50"
                >
                  <X size={24} className="text-zinc-600 dark:text-zinc-400" />
                </button>
              </div>

              {/* Body */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* POI Selection */}
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-1 block">
                    Point d'intérêt * {selectedPoi && <span className="text-primary">(Pré-sélectionné)</span>}
                  </label>
                  <select
                    name="poi_id"
                    value={formData.poi_id}
                    onChange={handleChange}
                    required
                    disabled={!!selectedPoi}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black/50 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-60"
                  >
                    <option value="">-- Sélectionner un POI --</option>
                    {availablePois.map(poi => (
                      <option key={poi.poi_id} value={poi.poi_id}>
                        {poi.poi_name} ({poi.address_city})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <FormInput
                  label="Titre du blog *"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  icon={<Type size={18} />}
                  placeholder="Ex: Mon expérience au Restaurant Le Délice"
                  required
                />

                {/* Description */}
                <FormInput
                  label="Description courte"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  icon={<AlignLeft size={18} />}
                  placeholder="Résumé en quelques mots (optionnel)"
                />

                {/* Cover Image URL */}
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-1 block">
                    URL Image de couverture
                  </label>
                  <div className="relative">
                    <ImagePlus className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input
                      type="url"
                      name="cover_image_url"
                      value={formData.cover_image_url}
                      onChange={handleChange}
                      placeholder="https://example.com/image.jpg (optionnel)"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black/50 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                {/* Content */}
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-1 block">
                    Contenu de l'article *
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    required
                    rows={12}
                    placeholder="Rédigez votre article ici... Partagez votre expérience, vos impressions, vos recommandations..."
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black/50 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  />
                  <p className="text-xs text-zinc-500 mt-1 ml-1">
                    {formData.content.length} caractères
                  </p>
                </div>
              </form>

              {/* Footer */}
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
                  className="flex-1 gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Publication...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Publier le Blog
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