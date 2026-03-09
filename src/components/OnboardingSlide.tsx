import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingSlideProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  iconColor: string;
  isActive: boolean;
}

export const OnboardingSlide = ({
  icon: Icon,
  title,
  description,
  gradient,
  iconColor,
  isActive,
}: OnboardingSlideProps) => {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-12 text-center min-h-[60vh]">
      {/* Animated Icon Container */}
      <div
        className={cn(
          "relative mb-8 transition-all duration-700 ease-out",
          isActive ? "scale-100 opacity-100" : "scale-75 opacity-0"
        )}
      >
        {/* Glow Effect */}
        <div
          className={cn(
            "absolute inset-0 rounded-full blur-3xl opacity-30 transition-opacity duration-500",
            gradient
          )}
          style={{ transform: "scale(1.5)" }}
        />
        
        {/* Icon Circle */}
        <div
          className={cn(
            "relative w-32 h-32 rounded-full flex items-center justify-center",
            "bg-gradient-to-br",
            gradient,
            "shadow-2xl"
          )}
        >
          <Icon className={cn("w-16 h-16", iconColor)} strokeWidth={1.5} />
        </div>
      </div>

      {/* Title */}
      <h2
        className={cn(
          "text-2xl font-bold text-foreground mb-4 transition-all duration-500 delay-100",
          isActive ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        )}
      >
        {title}
      </h2>

      {/* Description */}
      <p
        className={cn(
          "text-muted-foreground text-base leading-relaxed max-w-xs transition-all duration-500 delay-200",
          isActive ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        )}
      >
        {description}
      </p>
    </div>
  );
};
