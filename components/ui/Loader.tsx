import { MapPin } from "lucide-react";
import { clsx } from "clsx";

export const Loader = ({ className }: { className?: string }) => {
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center h-full w-full bg-zinc-50 dark:bg-black z-50 absolute inset-0 overflow-hidden",
        className
      )}
    >
      {/* Fond décoratif style "Carte Grille" (Skeleton feeling) */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" 
           style={{ 
             backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)", 
             backgroundSize: "40px 40px" 
           }} 
      />

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* CARTE DU CAMEROUN SVG */}
        <div className="relative w-32 h-48 md:w-40 md:h-60 animate-pulse">
          {/* Le SVG dessine la forme approximative du Cameroun */}
          <svg
            viewBox="0 0 420 590"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-[0_0_15px_rgba(148,0,211,0.4)]"
          >
            <path
              d="M190.5 5.5C200 10 230 45 235 60C240 75 242 120 238 140C234 160 250 170 270 170C290 170 330 180 350 200C370 220 400 240 410 260C420 280 405 320 380 340C355 360 330 380 325 400C320 420 340 450 345 470C350 490 340 520 330 540C320 560 300 580 270 585C240 590 180 585 160 580C140 575 110 570 100 560C90 550 85 520 85 500C85 480 70 450 60 440C50 430 20 410 10 400C0 390 0 350 10 320C20 290 40 250 50 220C60 190 55 160 50 140C45 120 60 90 80 80C100 70 140 60 160 40C180 20 185 10 190.5 5.5Z"
              className="fill-primary/20 stroke-primary stroke-[8]"
            />
            {/* Petit marqueur clignotant au centre (Yaoundé approx) */}
            <circle cx="180" cy="420" r="12" className="fill-primary animate-ping" />
          </svg>
        </div>

        {/* Texte de chargement */}
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-white flex items-center gap-2">
            <span className="text-zinc-400">Chargement</span>
            <span className="text-primary">Navigoo</span>
          </h3>
          <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest animate-pulse">
            Exploration en cours...
          </p>
        </div>
      </div>
    </div>
  );
};