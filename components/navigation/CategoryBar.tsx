import { clsx } from "clsx";
import { CATEGORIES } from "@/data/categories";

interface CategoryBarProps {
  onSelect: (cat: string) => void;
  selected: string;
}

export const CategoryBar = ({ onSelect, selected }: CategoryBarProps) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2 px-1 h-full mask-gradient-right">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={clsx(
            "flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all shadow-sm border whitespace-nowrap bg-white dark:bg-zinc-800",
            selected === cat.id
              ? "bg-zinc-900 text-white dark:bg-white dark:text-purple-400 border-transparent shadow-md" // Style "actif" google noir/blanc
              : "text-zinc-700 dark:text-zinc-200 border-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 dark:border-zinc-700"
          )}
        >
          {cat.icon}
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  );
};