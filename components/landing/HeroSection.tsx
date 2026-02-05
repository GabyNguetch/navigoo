"use client";

import { motion } from "framer-motion";
import { ArrowRight, MapPin, Star, Users, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] mt-0 flex items-center overflow-hidden bg-gradient-to-br from-zinc-50 via-white to-purple-50 dark:from-black dark:via-zinc-950 dark:to-purple-950/20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-purple-500/5 rounded-full blur-3xl"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6"
            >
              <TrendingUp size={16} className="text-primary" />
              <span className="text-sm font-bold text-primary">
                La plateforme N°1 de navigation au Cameroun
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
              Explorez le{" "}
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Cameroun
              </span>{" "}
              comme jamais
            </h1>

            <p className="text-xl text-zinc-600 dark:text-zinc-300 mb-8 leading-relaxed">
              Découvrez, partagez et naviguez vers les meilleurs restaurants, hôtels et attractions.
              Rejoignez des milliers d'explorateurs camerounais.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/">
                <Button className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white px-8 py-6 text-lg gap-2 shadow-xl shadow-primary/20">
                  Commencer l'exploration
                  <ArrowRight size={20} />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto px-8 py-6 text-lg"
                >
                  Voir les tarifs
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={20} className="text-primary" />
                  <span className="text-3xl font-black text-zinc-900 dark:text-white">500+</span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Points d'intérêt</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Users size={20} className="text-primary" />
                  <span className="text-3xl font-black text-zinc-900 dark:text-white">10K+</span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Utilisateurs</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Star size={20} className="text-primary fill-primary" />
                  <span className="text-3xl font-black text-zinc-900 dark:text-white">4.8</span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Note moyenne</p>
              </div>
            </div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <div className="relative z-10">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 rounded-3xl rotate-6 opacity-20 blur-2xl" />
              <div className="relative bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                <img
                  src="/images/image3.png"
                  alt="Navigoo Preview"
                  className="w-full h-auto"
                  onError={(e) => {
                    // Fallback si l'image n'existe pas
                    const target = e.target as HTMLImageElement;
                    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect fill='%23f4f4f5' width='800' height='600'/%3E%3Ctext fill='%2371717a' font-family='sans-serif' font-size='24' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle'%3ENavigoo Map%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}; 