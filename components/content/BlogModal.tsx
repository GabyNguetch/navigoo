"use client";

import { useState, useEffect, useRef } from "react";
import { X, FileText, Save, Loader2, Video, Image as ImageIcon, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { authService } from "@/services/authService";
import { contentService } from "@/services/contentService";
import { mediaService } from "@/services/mediaService";
import { poiService } from "@/services/poiService";
import { POI } from "@/types";
import Image from "next/image";
import { clsx } from "clsx";

interface BlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPoi?: POI | null;
  onSuccess?: () => void;
}

export const BlogModal = ({ isOpen, onClose, onSuccess }: BlogModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [pois, setPois] = useState<POI[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [uploadedMediaId, setUploadedMediaId] = useState<string | null>(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoadingPois, setIsLoadingPois] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({ 
    poi_id: "", 
    title: "", 
    description: "",
    content: "", 
    cover_image_url: "" 
  });

  const filteredPois = pois.filter(p => 
    p.poi_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const user = authService.getSession();

  useEffect(() => {
    if (isOpen) {
      loadPois();
      // Reset form when modal opens
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      poi_id: "",
      title: "",
      description: "",
      content: "",
      cover_image_url: ""
    });
    setMediaPreview(null);
    setUploadedMediaId(null);
    setError(null);
    setSuccess(null);
    setSearchTerm("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const loadPois = async () => {
    setIsLoadingPois(true);
    setError(null);
    
    try {
      const allPois = await poiService.getAllPois();
      setPois(allPois);
      console.log(`✅ Loaded ${allPois.length} POIs`);
    } catch (error: any) {
      console.error("❌ Failed to load POIs:", error);
      setError(`Impossible de charger les POIs: ${error.message}`);
    } finally {
      setIsLoadingPois(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(null);

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("Le fichier est trop volumineux (max 50MB)");
      return;
    }

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    
    if (mediaType === 'image' && !validImageTypes.includes(file.type)) {
      setError("Format d'image non supporté. Utilisez JPG, PNG, GIF ou WebP");
      return;
    }
    
    if (mediaType === 'video' && !validVideoTypes.includes(file.type)) {
      setError("Format vidéo non supporté. Utilisez MP4, WebM ou MOV");
      return;
    }

    // Preview
    const objectUrl = URL.createObjectURL(file);
    setMediaPreview(objectUrl);
    setUploadedMediaId(null);
    setIsUploadingMedia(true);

    try {
      console.log(`⬆️ Uploading ${mediaType} file...`);
      const context = mediaType === 'video' ? 'blogs_videos' : 'blogs_images';
      const media = await mediaService.uploadFile(file, context);
      
      setUploadedMediaId(media.id);
      
      // Get the full URL
      const fullUrl = mediaService.getMediaUrl(media.id);
      setFormData(prev => ({ ...prev, cover_image_url: fullUrl }));
      
      console.log("✅ Media uploaded successfully!");
      console.log("  - Media ID:", media.id);
      console.log("  - Full URL:", fullUrl);
      
      setSuccess(`${mediaType === 'image' ? 'Image' : 'Vidéo'} uploadée avec succès!`);
      
    } catch (error: any) {
      console.error("❌ Upload failed:", error);
      setError(`Erreur d'upload: ${error.message}`);
      setMediaPreview(null);
      setUploadedMediaId(null);
      setFormData(prev => ({ ...prev, cover_image_url: "" }));
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const validateForm = (): string | null => {
    if (!user?.userId) {
      return "Session expirée. Veuillez vous reconnecter.";
    }

    if (!formData.poi_id) {
      return "Veuillez sélectionner un point d'intérêt.";
    }

    if (!formData.title.trim()) {
      return "Le titre est requis.";
    }

    if (formData.title.trim().length < 3) {
      return "Le titre doit contenir au moins 3 caractères.";
    }

    if (!formData.content.trim()) {
      return "Le contenu est requis.";
    }

    if (formData.content.trim().length < 10) {
      return "Le contenu doit contenir au moins 10 caractères.";
    }

    if (!uploadedMediaId || !formData.cover_image_url) {
      return "Veuillez uploader une image ou vidéo de couverture.";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    // Client-side validation
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      console.group("📝 [Blog Submission]");
      console.log("User ID:", user!.userId);
      console.log("POI ID:", formData.poi_id);
      console.log("Title:", formData.title);
      console.log("Description:", formData.description);
      console.log("Content length:", formData.content.length);
      console.log("Media URL:", formData.cover_image_url);
      
      const result = await contentService.createBlog({
        user_id: user!.userId,
        poi_id: formData.poi_id,
        title: formData.title,
        content: formData.content,
        cover_image_url: formData.cover_image_url
      });

      console.log("✅ Blog created:", result);
      console.groupEnd();

      // Success
      setSuccess("Blog publié avec succès!");
      
      // Wait a bit to show success message
      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 1500);
      
    } catch (err: any) {
      console.error("❌ Submission failed:", err);
      console.groupEnd();
      
      // Parse error message
      let errorMessage = "Une erreur est survenue lors de la publication.";
      
      if (err.message) {
        if (err.message.includes("POI")) {
          errorMessage = "Le point d'intérêt sélectionné n'existe pas ou n'est plus disponible.";
        } else if (err.message.includes("user")) {
          errorMessage = "Votre session a expiré. Veuillez vous reconnecter.";
        } else if (err.message.includes("token")) {
          errorMessage = "Session expirée. Veuillez vous reconnecter.";
        } else if (err.message.includes("réseau") || err.message.includes("connexion")) {
          errorMessage = "Erreur de connexion. Vérifiez votre connexion internet.";
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading && !isUploadingMedia) {
      resetForm();
      onClose();
    }
  };

  const removeMedia = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }
    setMediaPreview(null);
    setUploadedMediaId(null);
    setFormData(prev => ({ ...prev, cover_image_url: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setSuccess(null);
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
                  disabled={isLoading || isUploadingMedia}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors disabled:opacity-50"
                >
                  <X size={24} className="text-zinc-600 dark:text-zinc-400" />
                </button>
              </div>

              {/* ERROR BANNER */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3"
                >
                  <AlertCircle size={20} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      {error}
                    </p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              )}

              {/* SUCCESS BANNER */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mx-6 mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-start gap-3"
                >
                  <CheckCircle size={20} className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      {success}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* BODY */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                  
                  {/* LEFT: MEDIA */}
                  <div className="relative bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center min-h-[400px] md:min-h-full">
                    {mediaPreview ? (
                      <div className="relative w-full h-full">
                        {mediaType === 'image' ? (
                          <Image 
                            src={mediaPreview} 
                            alt="Preview" 
                            fill 
                            className="object-contain" 
                          />
                        ) : (
                          <video 
                            src={mediaPreview} 
                            controls 
                            className="w-full h-full object-contain" 
                          />
                        )}
                        
                        {/* Upload overlay */}
                        {isUploadingMedia && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-10">
                            <div className="bg-white dark:bg-zinc-800 px-6 py-3 rounded-full flex items-center gap-3 shadow-lg">
                              <Loader2 className="animate-spin text-purple-600" size={20} />
                              <span className="text-sm font-bold text-zinc-800 dark:text-white">
                                Envoi en cours...
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Success overlay */}
                        {uploadedMediaId && !isUploadingMedia && (
                          <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg z-20">
                            <CheckCircle size={16} />
                            <span className="text-xs font-bold">Uploadé</span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={removeMedia}
                          disabled={isUploadingMedia}
                          className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 z-20 disabled:opacity-50"
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
                              mediaType === 'image' 
                                ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" 
                                : "border-zinc-300 dark:border-zinc-700 hover:border-purple-300"
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
                              mediaType === 'video' 
                                ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" 
                                : "border-zinc-300 dark:border-zinc-700 hover:border-purple-300"
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
                          ou glissez votre fichier ici (max 50MB)
                        </p>
                      </div>
                    )}
                  </div>

                  {/* RIGHT: FORM */}
                  <div className="p-6 space-y-4 overflow-y-auto">
                    
                    {/* POI Selection */}
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
                        Point d'intérêt concerné *
                      </label>
                      {isLoadingPois ? (
                        <div className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black/50 flex items-center gap-2">
                          <Loader2 className="animate-spin" size={16} />
                          <span className="text-sm text-zinc-500">Chargement des POIs...</span>
                        </div>
                      ) : (
                        <select 
                          name="poi_id"
                          value={formData.poi_id} 
                          onChange={handleChange}
                          required
                          disabled={isLoading}
                          className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black/50 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all disabled:opacity-50"
                        >
                          <option value="">Sélectionner un lieu ({pois.length} disponibles)</option>
                          {pois.map(poi => (
                            <option key={poi.poi_id} value={poi.poi_id}>
                              {poi.poi_name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Title */}
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
                        Titre * (min. 3 caractères)
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        minLength={3}
                        maxLength={200}
                        placeholder="Ex: Une soirée mémorable..."
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black/50 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-zinc-900 dark:text-white disabled:opacity-50"
                      />
                      <p className="text-xs text-zinc-400 mt-1">
                        {formData.title.length}/200 caractères
                      </p>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
                        Légende (optionnel)
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        disabled={isLoading}
                        rows={2}
                        maxLength={500}
                        placeholder="Ajoutez une légende courte..."
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black/50 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none text-zinc-900 dark:text-white disabled:opacity-50"
                      />
                      <p className="text-xs text-zinc-400 mt-1">
                        {formData.description.length}/500 caractères
                      </p>
                    </div>

                    {/* Content */}
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
                        Contenu détaillé * (min. 10 caractères)
                      </label>
                      <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        rows={6}
                        minLength={10}
                        maxLength={5000}
                        placeholder="Racontez votre expérience en détail..."
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black/50 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none text-zinc-900 dark:text-white disabled:opacity-50"
                      />
                      <p className="text-xs text-zinc-400 mt-1">
                        {formData.content.length}/5000 caractères
                      </p>
                    </div>
                  </div>
                </div>
              </form>

              {/* FOOTER */}
              <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 flex gap-3">
                <Button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading || isUploadingMedia}
                  variant="outline"
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || isUploadingMedia || !uploadedMediaId}
                  className="flex-1 gap-2 bg-purple-700 hover:bg-purple-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
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