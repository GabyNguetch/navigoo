"use client";

import { useEffect, useState } from "react";
import { apiService, Blog } from "@/services/apiService";
import { ArrowLeft, BookOpen, Clock, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    apiService.getAllBlogs()
      .then(setBlogs)
      .catch(err => console.error("Error fetching blogs:", err))
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
          <BookOpen className="text-primary" /> Nos Blogs (Blocs)
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-12">Découvrez les dernières actualités et histoires de nos points d'intérêt.</p>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid gap-8">
            {blogs.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 p-12 rounded-3xl text-center border border-zinc-200 dark:border-zinc-800">
                <p className="text-zinc-500">Aucun blog disponible pour le moment.</p>
              </div>
            ) : (
              blogs.map(blog => (
                <article key={blog.blogId} className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                  {blog.imageUrl && (
                    <div className="relative h-64 w-full">
                      <Image src={blog.imageUrl} alt={blog.title} fill className="object-cover" />
                    </div>
                  )}
                  <div className="p-8">
                    <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
                      <span className="flex items-center gap-1"><Clock size={14} /> {new Date(blog.createdAt).toLocaleDateString()}</span>
                      {blog.tags?.map(tag => (
                        <span key={tag} className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full text-primary font-medium">
                          <Tag size={12} /> {tag}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">{blog.title}</h2>
                    <p className="text-zinc-600 dark:text-zinc-400 line-clamp-3 mb-6">{blog.content}</p>
                    <button className="text-primary font-bold hover:underline">Lire la suite</button>
                  </div>
                </article>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
