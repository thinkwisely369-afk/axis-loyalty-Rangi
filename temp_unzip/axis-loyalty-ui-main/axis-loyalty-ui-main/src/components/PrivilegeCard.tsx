import { LucideIcon } from "lucide-react";

interface PrivilegeCardProps {
  brand: string;
  offer: string;
  description: string;
  icon: LucideIcon;
  variant: "gold" | "platinum" | "emerald" | "rose";
  expiresIn?: string;
}

const variantStyles = {
  gold: {
    gradient: "from-amber-600/20 via-yellow-500/10 to-orange-600/20",
    accent: "bg-gold",
    iconBg: "bg-gold/10",
    iconColor: "text-gold",
  },
  platinum: {
    gradient: "from-slate-400/20 via-zinc-300/10 to-slate-500/20",
    accent: "bg-platinum",
    iconBg: "bg-platinum/10",
    iconColor: "text-platinum",
  },
  emerald: {
    gradient: "from-emerald-600/20 via-teal-500/10 to-green-600/20",
    accent: "bg-emerald",
    iconBg: "bg-emerald/10",
    iconColor: "text-emerald",
  },
  rose: {
    gradient: "from-rose-600/20 via-pink-500/10 to-red-600/20",
    accent: "bg-rose",
    iconBg: "bg-rose/10",
    iconColor: "text-rose",
  },
};

export const PrivilegeCard = ({
  brand,
  offer,
  description,
  icon: Icon,
  variant,
  expiresIn,
}: PrivilegeCardProps) => {
  const styles = variantStyles[variant];

  return (
    <div 
      className="relative flex-shrink-0 w-72 rounded-2xl overflow-hidden"
      style={{
        boxShadow: "0 4px 24px -4px rgba(0, 0, 0, 0.5)",
      }}
    >
      {/* Card background with gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${styles.gradient}`} />
      <div className="absolute inset-0 card-gradient opacity-90" />
      
      {/* Border glow effect */}
      <div 
        className="absolute inset-0 rounded-2xl"
        style={{
          border: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      />

      {/* Content */}
      <div className="relative p-5 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${styles.iconBg}`}>
            <Icon className={`w-6 h-6 ${styles.iconColor}`} />
          </div>
          {expiresIn && (
            <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg">
              {expiresIn}
            </span>
          )}
        </div>

        {/* Brand */}
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
          {brand}
        </span>

        {/* Offer */}
        <h3 className="text-lg font-bold text-foreground mb-2 leading-tight">
          {offer}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {description}
        </p>

        {/* CTA */}
        <div className="mt-auto flex items-center justify-between">
          <button className="text-sm font-semibold text-primary hover:text-primary-glow transition-colors">
            Claim Reward →
          </button>
          <div className={`w-8 h-1 rounded-full ${styles.accent}`} />
        </div>
      </div>
    </div>
  );
};
