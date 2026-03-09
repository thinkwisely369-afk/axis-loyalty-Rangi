import { useState } from "react";
import { LucideIcon, ShoppingBag, Watch, Plane, Diamond, Gift, Clock, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const iconMap: Record<string, LucideIcon> = {
  ShoppingBag,
  Watch,
  Plane,
  Diamond,
  Gift
};

interface PrivilegeCardProps {
  brand: string;
  merchantName?: string;
  offer: string;
  description: string;
  icon: string | LucideIcon;
  variant: "gold" | "platinum" | "emerald" | "rose";
  expiresIn?: string;
  promotionTime?: string;
  logo?: string;
  bannerImage?: string;
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
  merchantName,
  offer,
  description,
  icon,
  variant,
  expiresIn,
  promotionTime,
  logo,
  bannerImage,
}: PrivilegeCardProps) => {
  const [showBanner, setShowBanner] = useState(false);
  const styles = variantStyles[variant];
  const Icon = typeof icon === 'string' ? (iconMap[icon] || Gift) : icon;

  return (
    <>
      <div
        className="relative flex-shrink-0 w-72 rounded-2xl overflow-hidden cursor-pointer group transition-transform hover:scale-[1.02]"
        style={{
          boxShadow: "0 4px 24px -4px rgba(0, 0, 0, 0.5)",
        }}
        onClick={() => bannerImage && setShowBanner(true)}
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
            <div className="flex gap-3">
              {logo ? (
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10">
                  <img src={logo} alt={brand} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className={`p-3 rounded-xl ${styles.iconBg}`}>
                  <Icon className={`w-6 h-6 ${styles.iconColor}`} />
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              {expiresIn && (
                <span className="text-[10px] font-medium text-muted-foreground bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                  {expiresIn}
                </span>
              )}
              {promotionTime && (
                <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {promotionTime}
                </span>
              )}
            </div>
          </div>

          {/* Brand */}
          <div className="flex flex-col mb-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {brand}
            </span>
            {merchantName && (
              <span className="text-[10px] text-muted-foreground/60">
                {merchantName}
              </span>
            )}
          </div>

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
            <span className="text-sm font-semibold text-primary group-hover:text-primary-glow transition-colors">
              View Offer →
            </span>
            <div className={`w-8 h-1 rounded-full ${styles.accent}`} />
          </div>
        </div>
      </div>

      {/* Banner Modal */}
      <Dialog open={showBanner} onOpenChange={setShowBanner}>
        <DialogContent className="p-0 border-none bg-transparent max-w-[618px] w-[90vw] overflow-hidden">
          <div className="relative aspect-[618/900] w-full">
            <img
              src={bannerImage}
              alt="Promotion Banner"
              className="w-full h-full object-contain rounded-2xl shadow-2xl"
            />
            <button
              onClick={() => setShowBanner(false)}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
