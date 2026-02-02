// app/add-content/page.tsx
"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/ui/form/FormInput";
import { FileText, Mic, Save, ArrowLeft, Loader2, Upload, Image as ImageIcon } from "lucide-react";

function ContentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type"); // blog | podcast
  const poiId = searchParams.get("poiId");
  const user = authService.getSession();
  
  const { createBlog, createPodcast, myPois } = useUserProfile();

  const [loading, setLoading] = useState(false);
  const [selectedPoiId, setSelectedPoiId] = useState(poiId || "");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    coverImage: "",
    audioUrl: "",
    duration: 0,
  });

  useEffect(() => {
    if (!user) {
      router.push("/signin");
      return;
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPoiId) {
      alert("Veuillez sélectionner un POI");
      return;
    }
    if (!formData.title) {
      alert("Veuillez renseigner un titre");
      return;
    }

    setLoading(true);

    try {
        if (type === "blog") {
            if (!formData.content) {
              alert("Le contenu du blog est requis");
              setLoading(false);
              return;
            }
            
            await createBlog(
              selectedPoiId,
              formData.title,
              formData.content,
              formData.description,
              formData.coverImage
            );
            alert("Blog créé avec succès !");
        } else if (type === "podcast") {
            if (!formData.audioUrl || formData.duration === 0) {
              alert("L'URL audio et la durée sont requises");
              setLoading(false);
              return;
            }
            
            await createPodcast(
              selectedPoiId,
              formData.title,
              formData.audioUrl,
              formData.duration,
              formData.description,
              formData.coverImage
            );
            alert("Podcast créé avec succès !");
        }
        
        router.push("/profile");
    } catch (err: any) {
        console.error("❌ Erreur création contenu:", err);
        alert(`Erreur : ${err.message}`);
    } finally {
        setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black pt-20 pb-20">
      <div className="max-w-3xl mx-auto p-4 md:p-8">
        
        {/* Header */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-500 hover:text-primary mb-6 transition-colors">
          <ArrowLeft size={20}/> Retour
        </button>
        
        <div className="bg-white dark:bg-zinc-900 p-6 md:p-10 rounded-[2.5rem] shadow-xl border border-zinc-200 dark:border-zinc-800">
          
          {/* Title Section */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-zinc-100 dark:border-zinc-800">
            <div className={`p-4 rounded-2xl ${type === 'blog' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
              {type === 'blog' ? <FileText size={32}/> : <Mic size={32}/>}
            </div>
            <div>
              <h1 className="text-3xl font-black text-zinc-900 dark:text-white">
                {type === 'blog' ? 'Créer un Blog' : 'Créer un Podcast'}
              </h1>
              <p className="text-sm text-zinc-500 mt-1">Partagez du contenu enrichi sur un lieu</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Sélection POI */}
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-1 block">
                Point d'intérêt associé *
              </label>
              <select 
                value={selectedPoiId}
                onChange={(e) => setSelectedPoiId(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black/50 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="">-- Sélectionner un POI --</option>
                {myPois.map(poi => (
                  <option key={poi.poi_id} value={poi.poi_id}>
                    {poi.poi_name} ({poi.address_city})
                  </option>
                ))}
              </select>
            </div>

            {/* Titre */}
            <FormInput 
              label="Titre *" 
              icon={<FileText size={18}/>} 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              placeholder="Ex: Découverte culinaire à Yaoundé"
              required
            />

            {/* Description */}
            <FormInput 
              label="Description courte" 
              icon={<FileText size={18}/>} 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              placeholder="Résumé en quelques mots"
            />

            {/* Image de couverture */}
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-1 block">
                Image de couverture (URL)
              </label>
              <div className="relative">
                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18}/>
                <input 
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({...formData, coverImage: e.target.value})}
                  placeholder="https://..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black/50 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Champs spécifiques */}
            {type === 'blog' ? (
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-1 block">
                  Contenu de l'article *
                </label>
                <textarea 
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  required
                  rows={10}
                  placeholder="Rédigez votre article ici..."
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black/50 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-1 block">
                    URL du fichier audio *
                  </label>
                  <div className="relative">
                    <Upload className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18}/>
                    <input 
                      type="url"
                      value={formData.audioUrl}
                      onChange={(e) => setFormData({...formData, audioUrl: e.target.value})}
                      required
                      placeholder="https://example.com/audio.mp3"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black/50 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-1 block">
                    Durée (en secondes) *
                  </label>
                  <input 
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 0})}
                    required
                    placeholder="120"
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black/50 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <p className="text-xs text-zinc-500 mt-1 ml-1">
                    {formData.duration > 0 && `≈ ${Math.floor(formData.duration / 60)} min ${formData.duration % 60} sec`}
                  </p>
                </div>
              </>
            )}

            {/* Submit */}
            <div className="pt-4">
              <Button 
                disabled={loading} 
                className="w-full h-14 rounded-2xl gap-2 font-bold text-lg shadow-lg"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <Save size={20}/> Publier {type === 'blog' ? 'le blog' : 'le podcast'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AddContentPage() {
    return (
        <Suspense fallback={<div className="h-screen w-full bg-white dark:bg-black flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={40}/></div>}>
            <ContentForm/>
        </Suspense>
    )
}