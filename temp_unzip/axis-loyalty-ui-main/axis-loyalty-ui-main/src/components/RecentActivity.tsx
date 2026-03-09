import { TrendingUp, TrendingDown, Gift, Star } from "lucide-react";

interface Transaction {
  id: string;
  type: "earned" | "redeemed" | "bonus" | "tier";
  title: string;
  description: string;
  points: number;
  date: string;
}

const transactions: Transaction[] = [
  {
    id: "1",
    type: "earned",
    title: "Store Purchase",
    description: "Luxury Boutique",
    points: 450,
    date: "Today",
  },
  {
    id: "2",
    type: "redeemed",
    title: "Reward Claimed",
    description: "Free Coffee",
    points: -200,
    date: "Yesterday",
  },
  {
    id: "3",
    type: "bonus",
    title: "Welcome Bonus",
    description: "New Member Reward",
    points: 1000,
    date: "3 days ago",
  },
];

const typeConfig = {
  earned: {
    icon: TrendingUp,
    iconBg: "bg-emerald/10",
    iconColor: "text-emerald",
    pointsColor: "text-emerald",
    prefix: "+",
  },
  redeemed: {
    icon: TrendingDown,
    iconBg: "bg-rose/10",
    iconColor: "text-rose",
    pointsColor: "text-rose",
    prefix: "",
  },
  bonus: {
    icon: Gift,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    pointsColor: "text-primary",
    prefix: "+",
  },
  tier: {
    icon: Star,
    iconBg: "bg-gold/10",
    iconColor: "text-gold",
    pointsColor: "text-gold",
    prefix: "+",
  },
};

export const RecentActivity = () => {
  return (
    <div className="px-6 py-4 pb-32">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Recent Activity</h2>
        <button className="text-sm font-medium text-primary hover:text-primary-glow transition-colors">
          See All
        </button>
      </div>

      {/* Transaction list */}
      <div className="space-y-3">
        {transactions.map((tx, index) => {
          const config = typeConfig[tx.type];
          const Icon = config.icon;

          return (
            <div
              key={tx.id}
              className="flex items-center gap-4 p-4 rounded-2xl bg-card/50 border border-border/50
                        hover:border-border transition-all duration-300 animate-fade-in"
              style={{ 
                animationDelay: `${index * 100}ms`,
                boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.02)",
              }}
            >
              {/* Icon */}
              <div className={`p-3 rounded-xl ${config.iconBg}`}>
                <Icon className={`w-5 h-5 ${config.iconColor}`} />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{tx.title}</h3>
                <p className="text-sm text-muted-foreground truncate">{tx.description}</p>
              </div>

              {/* Points & Date */}
              <div className="text-right flex-shrink-0">
                <span className={`font-bold ${config.pointsColor}`}>
                  {config.prefix}{tx.points.toLocaleString()}
                </span>
                <p className="text-xs text-muted-foreground">{tx.date}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
