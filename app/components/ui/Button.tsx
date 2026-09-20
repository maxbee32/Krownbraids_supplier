// components/ui/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, isLoading, variant = "primary", size = "md", ...props }, ref) => {
    const variants = {
      primary: "bg-neutral-900 text-white hover:bg-neutral-800 shadow-sm hover:shadow-md",
      secondary: "bg-neutral-100 text-neutral-900 hover:bg-neutral-200",
      outline: "border-2 border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400",
      ghost: "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
      danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "rounded-lg font-semibold transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "inline-flex items-center justify-center gap-2",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading...
          </div>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";