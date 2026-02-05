"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export const FloatingCreateButton = () => {
  const router = useRouter();

  return (
    <motion.button
      data-create-poi
      onClick={() => router.push("/add-poi")}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-8 right-8 z-[60] w-16 h-16 bg-gradient-to-r from-primary to-purple-600 rounded-full shadow-2xl flex items-center justify-center group"
    >
      <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-20" />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 border-4 border-dashed border-white/30 rounded-full"
      />
      <Plus className="text-white relative z-10" size={32} />
      
      {/* Tooltip */}
      <div className="absolute right-full mr-4 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Créer un point d'intérêt
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full w-0 h-0 border-l-8 border-l-zinc-900 border-t-4 border-t-transparent border-b-4 border-b-transparent" />
      </div>
    </motion.button>
  );
};