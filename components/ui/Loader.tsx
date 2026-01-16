"use client";

import { clsx } from "clsx";

export const Loader = ({ className }: { className?: string }) => {
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center h-full w-full bg-zinc-50 dark:bg-black fixed inset-0 z-[100] overflow-hidden",
        className
      )}
    >
      {/* --- ARRIÈRE PLAN GRILLE --- */}
      {/* Donne un effet technique de cartographie */}
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
           style={{ 
             backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)", 
             backgroundSize: "40px 40px" 
           }} 
      />

      <div className="relative z-10 flex flex-col items-center gap-8">
        
        {/* --- CARTE DU CAMEROUN (DESSIN EXACT) --- */}
        <div className="relative w-48 h-64 md:w-56 md:h-80 drop-shadow-2xl">
          <svg
            viewBox="0 0 350 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {/* L'ombre/Glow violet derrière la carte */}
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Silhouette Principale du Cameroun (Retracée selon ton image) */}
            <path
              d="M210 10 C218 8 230 18 232 30 
                 C236 45 225 60 230 65 
                 C240 75 255 82 260 78 
                 C270 70 290 85 292 95 
                 C295 115 282 140 288 150 
                 C300 165 325 185 330 205 
                 C335 230 320 250 315 270 
                 C315 290 330 315 335 340 
                 C340 370 310 400 305 430 
                 C300 460 320 480 325 500 
                 C330 520 345 540 345 550 
                 C345 570 250 590 180 585 
                 C120 580 100 560 90 530 
                 C80 500 70 480 55 470 
                 C40 460 25 440 20 420 
                 C15 400 35 385 40 365 
                 C45 345 30 335 35 320 
                 C40 305 55 295 70 280 
                 C90 260 125 220 135 190 
                 C145 160 160 120 170 85 
                 C180 50 195 25 210 10 Z"
              className="fill-primary/15 dark:fill-primary/20 stroke-primary stroke-[3] animate-pulse"
              filter="url(#glow)"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Localisation Clignotante (Symbolise Yaoundé / Le cœur de l'app) */}
            {/* Coordonnées ajustées pour être dans la partie Centre-Sud */}
            <circle cx="200" cy="420" r="6" className="fill-primary animate-ping opacity-75" />
            <circle cx="200" cy="420" r="3" className="fill-white dark:fill-zinc-950" />
          </svg>
        </div>

        {/* --- TEXTE --- */}
        <div className="flex flex-col items-center gap-3">
          <div className="h-2 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-primary w-2/3 animate-[shimmer_1.5s_infinite] rounded-full" 
                 style={{ 
                   backgroundImage: "linear-gradient(to right, transparent, rgba(255,255,255,0.5), transparent)" 
                 }} 
            />
          </div>
          
          <h3 className="text-xl md:text-2xl font-black tracking-tight text-zinc-800 dark:text-white flex items-center gap-1.5 font-sans">
            <span className="text-zinc-300 dark:text-zinc-600">Chargement</span>
            <span className="text-primary animate-pulse">Navigoo</span>
          </h3>
        </div>

      </div>
    </div>
  );
};