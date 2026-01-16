import { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface Option {
  id: string;
  label: string;
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  icon: ReactNode;
  options: Option[];
}

export const FormSelect = ({ label, icon, options, ...props }: FormSelectProps) => {
  return (
    <div>
      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-1 block">
        {label}
      </label>
      <div className="relative flex items-center group">
        <div className="absolute left-4 text-zinc-400 group-focus-within:text-primary transition-colors">
          {icon}
        </div>
        <select
          {...props}
          className="w-full pl-12 pr-10 h-14 appearance-none rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black/50 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium cursor-pointer"
        >
          <option value="" disabled>Sélectionner...</option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 text-zinc-400 pointer-events-none">
          <ChevronDown size={20} />
        </div>
      </div>
    </div>
  );
};