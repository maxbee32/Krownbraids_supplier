// components/ui/Input.tsx
import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Mail, Lock, User, Building, Phone, Search, DollarSign, LucideIcon } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: "mail" | "lock" | "user" | "building" | "phone" | "search" | "dollar";
  label?: string;
  error?: string;
  hint?: string;
}

const iconMap: Record<string, LucideIcon> = {
  mail: Mail,
  lock: Lock,
  user: User,
  building: Building,
  phone: Phone,
  search: Search,
  dollar: DollarSign,
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, label, error, hint, ...props }, ref) => {
    const Icon = icon ? iconMap[icon] : null;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-neutral-900 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5 pointer-events-none" />
          )}
          <input
            type={type}
            className={cn(
              "w-full px-4 py-3 rounded-lg border bg-white",
              "border-neutral-200 text-neutral-900",
              "placeholder:text-neutral-400",
              "focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent",
              "transition-all duration-200",
              "disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed",
              icon && "pl-10",
              error && "border-red-500 focus:ring-red-500",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-neutral-500">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";