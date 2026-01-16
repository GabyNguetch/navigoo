import { ReactNode } from "react";
import { motion } from "framer-motion";

interface FormSectionProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  delay?: number;
}

export const FormSection = ({ children, title, subtitle, delay = 0 }: FormSectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm p-6 md:p-8 rounded-3xl border border-zinc-200/50 dark:border-zinc-800 shadow-xl dark:shadow-none h-full flex flex-col"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">{title}</h2>
        {subtitle && <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">{subtitle}</p>}
      </div>
      <div className="space-y-3 flex-1">
        {children}
      </div>
    </motion.div>
  );
};