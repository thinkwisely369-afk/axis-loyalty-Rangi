import { LucideIcon } from "lucide-react";

interface RewardCardProps {
  title: string;
  brand: string;
  points: number;
  image?: string;
  icon: LucideIcon;
  category: string;
}

export const RewardCard = ({
  title,
  brand,
  points,
  icon: Icon,
}: RewardCardProps) => {
  return (
    <div 
      className="relative rounded-2xl overflow-hidden group cursor-pointer"
      style={{
        boxShadow: "0 4px 24px -4px rgba(0, 0, 0, 0.5)",
      }}
    >
      {/* Card background */}
      <div className="absolute inset-0 card-gradient" />
      <div 
        className="absolute inset-0 rounded-2xl"
        style={{
          border: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      />

      {/* Content */}
      <div className="relative p-4 flex flex-col h-full min-h-[180px]">
        {/* Icon */}
        <div className="p-3 rounded-xl bg-primary/10 w-fit mb-3 group-hover:bg-primary/20 transition-colors">
          <Icon className="w-6 h-6 text-primary" />
        </div>

        {/* Brand */}
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
          {brand}
        </span>

        {/* Title */}
        <h3 className="text-sm font-bold text-foreground mb-auto leading-tight">
          {title}
        </h3>

        {/* Points */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-primary">{points.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground">pts</span>
          </div>
          <button 
            className="text-xs font-semibold text-primary hover:text-primary-glow transition-colors px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20"
          >
            Redeem
          </button>
        </div>
      </div>
    </div>
  );
};
