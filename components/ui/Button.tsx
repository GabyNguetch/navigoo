import { ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = ({ className, variant = "primary", size = "md", ...props }: ButtonProps) => {
  const baseStyles = "inline-flex items-center justify-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-dark shadow-md",
    secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100",
    outline: "border-2 border-primary text-primary hover:bg-primary/10",
    ghost: "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800",
  };

  const sizes = {
    sm: "h-8 px-4 text-xs",
    md: "h-10 px-6 text-sm",
    lg: "h-12 px-8 text-base",
  };

  return <button className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))} {...props} />;
};