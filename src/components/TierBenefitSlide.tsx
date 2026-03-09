import { Crown, Star, Diamond, Gem } from "lucide-react";
import { cn } from "@/lib/utils";

interface TierBenefitSlideProps {
  isActive: boolean;
}

const tiers = [
  {
    name: "Silver",
    icon: Star,
    points: "0 - 5,000",
    benefits: ["2% cashback", "Birthday bonus"],
    color: "from-slate-400 to-slate-500",
    textColor: "text-slate-300",
  },
  {
    name: "Gold",
    icon: Crown,
    points: "5,000 - 15,000",
    benefits: ["5% cashback", "Priority support", "Exclusive offers"],
    color: "from-gold to-amber-600",
    textColor: "text-gold",
  },
  {
    name: "Platinum",
    icon: Diamond,
    points: "15,000 - 50,000",
    benefits: ["8% cashback", "VIP lounges", "Concierge service"],
    color: "from-cyan-400 to-teal-500",
    textColor: "text-cyan-400",
  },
  {
    name: "Diamond",
    icon: Gem,
    points: "50,000+",
    benefits: ["12% cashback", "Personal advisor", "Unlimited perks"],
    color: "from-purple-400 to-pink-500",
    textColor: "text-purple-400",
  },
];

export const TierBenefitSlide = ({ isActive }: TierBenefitSlideProps) => {
  return (
    <div className="flex flex-col items-center px-6 py-8 min-h-[60vh]">
      <h2
        className={cn(
          "text-2xl font-bold text-foreground mb-2 transition-all duration-500",
          isActive ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        )}
      >
        Membership Tiers
      </h2>
      <p
        className={cn(
          "text-muted-foreground text-sm mb-6 transition-all duration-500 delay-100",
          isActive ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        )}
      >
        Unlock exclusive benefits as you earn
      </p>

      <div className="w-full space-y-3">
        {tiers.map((tier, index) => (
          <div
            key={tier.name}
            className={cn(
              "relative p-4 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50",
              "transition-all duration-500",
              isActive
                ? "translate-x-0 opacity-100"
                : "translate-x-8 opacity-0"
            )}
            style={{ transitionDelay: `${150 + index * 100}ms` }}
          >
            <div className="flex items-center gap-3">
              {/* Tier Icon */}
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  "bg-gradient-to-br",
                  tier.color
                )}
              >
                <tier.icon className="w-5 h-5 text-white" />
              </div>

              {/* Tier Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className={cn("font-semibold", tier.textColor)}>
                    {tier.name}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {tier.points} pts
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {tier.benefits.join(" • ")}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
