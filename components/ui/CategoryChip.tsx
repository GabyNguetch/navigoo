import { clsx } from "clsx";

interface ChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}

export const CategoryChip = ({ label, active, onClick, icon }: ChipProps) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm border whitespace-nowrap",
        active
          ? "bg-primary text-white border-primary"
          : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800"
      )}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {label}
    </button>
  );
};