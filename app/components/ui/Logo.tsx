// components/ui/Logo.tsx
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showSupplier?: boolean;
  variant?: "default" | "light";
}

export function Logo({ 
  className, 
  showSupplier = true,
  variant = "default" 
}: LogoProps) {
  const textColor = variant === "light" ? "text-white" : "text-neutral-900";
  const subtextColor = variant === "light" ? "text-neutral-400" : "text-neutral-500";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center shadow-sm">
        <span className="text-white font-bold text-xl">K</span>
      </div>
      <div className="flex flex-col leading-none">
        <span className={cn("font-bold text-xl tracking-tight", textColor)}>
          KrownBraids
        </span>
        {showSupplier && (
          <span className={cn("text-[10px] font-medium tracking-wider uppercase mt-0.5", subtextColor)}>
            Supplier Platform
          </span>
        )}
      </div>
    </div>
  );
}