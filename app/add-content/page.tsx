"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { contentService } from "@/services/contentService";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/ui/form/FormInput";
import { FileText, Mic, Save, ArrowLeft, Loader2 } from "lucide-react";

function ContentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type"); // blog | podcast
  const poiId = searchParams.get("poiId");
  const user = authService.getSession();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    url: "", // audio ou cover
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poiId || !user) return;
    setLoading(true);

    try {
        if (type === "blog") {
            await contentService.createBlog({
                user_id: user.userId,
                poi_id: poiId,
                title: formData.title,
                content: formData.content,
                is_active: true
            });
        } else {
            await contentService.createPodcast({
                user_id: user.userId,
                poi_id: poiId,
                title: formData.title,
                audio_file_url: formData.url,
                duration_seconds: 120, // simulation
                is_active: true
            });
        }
        alert("Publication réussie !");
        router.back();
    } catch (err) {
        alert("Erreur lors de la publication.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 pt-20">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-500 mb-8">
        <ArrowLeft size={20}/> Retour
      </button>
      
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] shadow-xl border border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-primary/10 rounded-2xl text-primary">
            {type === 'blog' ? <FileText size={32}/> : <Mic size={32}/>}
          </div>
          <div>
            <h1 className="text-2xl font-black dark:text-white">Créer un {type}</h1>
            <p className="text-sm text-zinc-500">Ajouter du contenu riche pour ce lieu.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput 
                label="Titre" icon={<Mic size={18}/>} 
                value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} 
            />
            
            {type === 'blog' ? (
                <FormInput 
                    as="textarea" label="Contenu de l'article" icon={<FileText size={18}/>} 
                    value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})}
                />
            ) : (
                <FormInput 
                    label="URL du fichier audio" icon={<Mic size={18}/>} 
                    placeholder="https://..."
                    value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})}
                />
            )}

            <Button disabled={loading} className="w-full h-14 rounded-2xl gap-2 font-bold text-lg">
                {loading ? <Loader2 className="animate-spin" /> : <><Save size={20}/> Publier maintenant</>}
            </Button>
        </form>
      </div>
    </div>
  );
}

export default function AddContentPage() {
    return (
        <Suspense><ContentForm/></Suspense>
    )
}