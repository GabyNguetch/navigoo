"use client";

import { useEffect, useState } from "react";
import { apiService, Podcast } from "@/services/apiService";
import { ArrowLeft, Mic, Play, Clock, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function PodcastsPage() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    apiService.getAllPodcasts()
      .then(setPodcasts)
      .catch(err => console.error("Error fetching podcasts:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 mb-8 hover:text-primary transition-colors"
        >
          <ArrowLeft size={20} /> Retour à la carte
        </button>

        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2 flex items-center gap-3">
          <Mic className="text-primary" /> Nos Podcasts (Potcasts)
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-12">Écoutez les guides et les récits de voyage en audio.</p>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid gap-6">
            {podcasts.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 p-12 rounded-3xl text-center border border-zinc-200 dark:border-zinc-800">
                <p className="text-zinc-500">Aucun podcast disponible pour le moment.</p>
              </div>
            ) : (
              podcasts.map(podcast => (
                <div key={podcast.podcastId} className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm flex gap-6 items-center">
                  <div className="relative h-24 w-24 shrink-0 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center">
                    {podcast.imageUrl ? (
                      <Image src={podcast.imageUrl} alt={podcast.title} fill className="object-cover" />
                    ) : (
                      <Mic className="text-primary" size={32} />
                    )}
                    <button className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Play className="text-white fill-white" size={24} />
                    </button>
                  </div>

                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">{podcast.title}</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1 mb-3">{podcast.description}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1 text-zinc-400 font-mono tracking-tighter uppercase"><Clock size={14} /> {Math.floor((podcast.duration || 0) / 60)} min</span>
                      <div className="flex gap-2">
                        {podcast.tags?.map(tag => (
                          <span key={tag} className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-500">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                    <Play size={20} className="ml-1" fill="currentColor" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
