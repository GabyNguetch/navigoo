import { ReactNode } from "react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  isExpanded: boolean; // Nouvelle prop pour savoir si on affiche le texte
  onClick?: () => void;
  isActive?: boolean;
}

export const SidebarItem = ({ icon, label, isExpanded, onClick, isActive }: SidebarItemProps) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center w-full p-3 transition-colors rounded-lg group relative",
        // En mode fermé, on centre. En ouvert, aligné à gauche.
        isExpanded ? "justify-start px-4 gap-4" : "justify-center px-0", 
        isActive 
          ? "bg-primary/10 text-primary" 
          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-primary"
      )}
    >
      {/* Icone : taille fixe */}
      <span className={clsx(
        "shrink-0 transition-transform duration-200", 
        isActive ? "scale-110" : "group-hover:scale-110"
      )}>
        {icon}
      </span>

      {/* Libellé : Animation d'apparition */}
      <AnimatePresence>
        {isExpanded && (
          <motion.span
            initial={{ opacity: 0, x: -10, width: 0 }}
            animate={{ opacity: 1, x: 0, width: "auto" }}
            exit={{ opacity: 0, x: -10, width: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="text-sm font-medium whitespace-nowrap overflow-hidden"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Tooltip si fermé (UX Bonus) : permet de savoir ce que c'est sans ouvrir */}
      {!isExpanded && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
          {label}
        </div>
      )}
    </button>
  );
};