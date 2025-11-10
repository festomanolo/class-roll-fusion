import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "hover" | "interactive" | "elevated";
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "minimal-card bg-white border border-gray-200 rounded-xl p-4 transition-all duration-200",
          "dark:bg-gray-800 dark:border-gray-700",
          {
            "hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600": variant === "hover",
            "hover:shadow-lg hover:border-gray-300 hover:-translate-y-0.5 cursor-pointer dark:hover:border-gray-600": variant === "interactive",
            "shadow-lg border-gray-300 dark:border-gray-600": variant === "elevated",
          },
          className
        )}
        {...props}
      />
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };