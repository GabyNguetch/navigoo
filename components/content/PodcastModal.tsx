"use client";

import { useState, useEffect, useRef } from "react";
import { X, Mic, Save, Loader2, ImagePlus, Type, AlignLeft, Upload, Clock, Play, Pause, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { authService } from "@/services/authService";
import { contentService } from "@/services/contentService";
import { POI } from "@/types";
import Image from "next/image";

interface PodcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPoi?: POI | null;
  onSuccess?: () => void;
}

export const PodcastModal = ({ isOpen, onClose, selectedPoi, onSuccess }: PodcastModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [availablePois, setAvailablePois] = useState<POI[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    poi_id: "",
    title: "",
    description: "",
    audio_file_url: "",
    cover_image_url: "",
    duration_seconds: 0,
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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      setDuration(audio.duration);
      setFormData(prev => ({ ...prev, duration_seconds: Math.floor(audio.duration) }));
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, [audioPreview]);

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

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAudioFile(file);
    const url = URL.createObjectURL(file);
    setAudioPreview(url);
    
    // Simuler upload (en production, uploader vers CDN)
    setFormData(prev => ({ ...prev, audio_file_url: url }));
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.userId) {
      alert("Vous devez être connecté");
      return;
    }

    if (!formData.poi_id || !formData.title || !formData.audio_file_url || formData.duration_seconds === 0) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsLoading(true);

    try {
      await contentService.createPodcast({
        user_id: user.userId,
        poi_id: formData.poi_id,
        title: formData.title,
        description: formData.description || "",
        cover_image_url: formData.cover_image_url || "",
        audio_file_url: formData.audio_file_url,
        duration_seconds: formData.duration_seconds,
      });
      
      alert("✅ Podcast créé avec succès !");
      handleClose();
      if (onSuccess) onSuccess();
    } catch (error: any) {
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
        audio_file_url: "",
        cover_image_url: "",
        duration_seconds: 0,
      });
      setAudioFile(null);
      setAudioPreview(null);
      setIsPlaying(false);
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
            <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
              
              {/* HEADER */}
              <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-700 rounded-2xl">
                    <Mic size={28} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white">
                      Créer un Podcast
                    </h2>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Partagez une expérience audio
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
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* AUDIO PLAYER */}
                {audioPreview ? (
                  <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-4 mb-4">
                      <button
                        type="button"
                        onClick={togglePlayPause}
                        className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-lg hover:scale-105 active:scale-95 transition-transform"
                      >
                        {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                      </button>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-purple-900 dark:text-purple-100">
                            {audioFile?.name || 'Audio.mp3'}
                          </span>
                          <button
                            type="button"
                            onClick={() => { setAudioPreview(null); setAudioFile(null); }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="relative w-full h-2 bg-purple-200 dark:bg-purple-800 rounded-full overflow-hidden">
                          <div
                            className="absolute h-full bg-gradient-to-r from-purple-500 to-pink-600 rounded-full transition-all"
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-purple-700 dark:text-purple-300 mt-1">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <audio ref={audioRef} src={audioPreview} className="hidden" />
                  </div>
                ) : (
                  <div
                    onClick={() => audioInputRef.current?.click()}
                    className="relative h-30 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border-2 border-dashed border-purple-300 dark:border-purple-700 flex flex-col items-center justify-center cursor-pointer group hover:border-purple-500 transition-all"
                  >
                    <div className="p-2 bg-white dark:bg-zinc-800 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                      <Upload size={28} className="text-purple-500" />
                    </div>
                    <p className="mt-4 text-sm font-bold text-purple-900 dark:text-purple-100">
                      Parcourir et importer un fichier audio
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                      MP3, WAV, M4A (max 50MB)
                    </p>
                    <input
                      ref={audioInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioUpload}
                      className="hidden"
                    />
                  </div>
                )}

                {/* POI Selection */}
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
                    Point d'intérêt *
                  </label>
                  <select
                    name="poi_id"
                    value={formData.poi_id}
                    onChange={handleChange}
                    required
                    disabled={!!selectedPoi}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black/50 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="">-- Sélectionner un POI --</option>
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
                    Titre du podcast *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Ex: Histoire culinaire de Yaoundé"
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black/50 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={1}
                    placeholder="Résumé du contenu audio (optionnel)"
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black/50 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  />
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
                  className="flex-1 gap-2 bg-purple-700 hover:bg-purple-800"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Publication...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Publier le Podcast
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