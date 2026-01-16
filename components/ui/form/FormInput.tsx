import { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import clsx from "clsx";

interface BaseProps {
  label: string;
  icon: ReactNode;
  className?: string;
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement>, BaseProps {
  as?: "input";
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, BaseProps {
  as: "textarea";
}

type FormInputProps = InputProps | TextareaProps;

export const FormInput = (props: FormInputProps) => {
  const { label, icon, className, ...rest } = props;
  const isTextarea = props.as === "textarea";

  const containerStyles = "relative flex items-center group";
  const iconStyles = "absolute left-4 text-zinc-400 group-focus-within:text-primary transition-colors";
  
  const inputStyles = clsx(
    "w-full pl-12 pr-4 py-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black/50 text-zinc-900 dark:text-zinc-100",
    "outline-none transition-all font-medium placeholder:text-zinc-400/70",
    "focus:ring-2 focus:ring-primary/20 focus:border-primary",
    isTextarea ? "min-h-[120px] resize-none py-4" : "h-14"
  );

  return (
    <div className={className}>
      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-1 block">
        {label}
      </label>
      <div className={containerStyles}>
        <div className={iconStyles}>{icon}</div>
        {isTextarea ? (
          <textarea className={inputStyles} {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)} />
        ) : (
          <input className={inputStyles} {...(rest as InputHTMLAttributes<HTMLInputElement>)} />
        )}
      </div>
    </div>
  );
};