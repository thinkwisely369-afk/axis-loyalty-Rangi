import { ArrowLeft, Star, Wallet as WalletIcon, TrendingUp, TrendingDown, Gift, Inbox } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { GlassNavigation } from "@/components/GlassNavigation";
import { useWalletStore } from "@/stores/walletStore";

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
  admin: {
    icon: Star,
    iconBg: "bg-gold/10",
    iconColor: "text-gold",
    pointsColor: "text-gold",
    prefix: "+",
  },
};

const WalletPage = () => {
  const navigate = useNavigate();
  const { loyaltyPoints, redeemablePoints, transactions, loading, fetchWallet } = useWalletStore();

  useEffect(() => {
    fetchWallet();
  }, []);

  const totalPoints = loyaltyPoints + redeemablePoints;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-xl bg-card/50 border border-border/50 hover:bg-card/80 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">My Wallet</h1>
        </div>

        {/* Total Points Banner */}
        <div
          className="p-6 rounded-2xl border border-border/50 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, hsl(240 6% 10%), hsl(240 4% 16%))",
          }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background: "radial-gradient(circle at 80% 20%, hsl(191 100% 50%), transparent 60%)",
            }}
          />
          <div className="relative z-10">
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Total Points</p>
            <p className="text-4xl font-bold text-foreground">{totalPoints.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Points Cards */}
      <section className="px-6 mb-6">
        <div className="grid grid-cols-2 gap-3">
          {/* Loyalty Points */}
          <div className="p-4 rounded-2xl bg-card/50 border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-gold/10">
                <Star className="w-4 h-4 text-gold" />
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Loyalty</p>
            </div>
            <p className="text-2xl font-bold text-gold">
              {loyaltyPoints.toLocaleString()}
            </p>
          </div>

          {/* Redeemable Points */}
          <div className="p-4 rounded-2xl bg-card/50 border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-emerald/10">
                <WalletIcon className="w-4 h-4 text-emerald" />
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Redeemable</p>
            </div>
            <p className="text-2xl font-bold text-emerald">
              {redeemablePoints.toLocaleString()}
            </p>
          </div>
        </div>
      </section>

      {/* Transaction History */}
      <section className="px-6">
        <h2 className="text-lg font-bold text-foreground mb-4">Transaction History</h2>

        <div className="space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-sm">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Inbox className="w-12 h-12 mb-3 opacity-40" />
              <p className="text-sm font-medium">No transactions yet</p>
              <p className="text-xs mt-1">Your points activity will appear here</p>
            </div>
          ) : (
            transactions.map((tx, index) => {
              const config = typeConfig[tx.type] || typeConfig.bonus;
              const Icon = config.icon;

              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-card/50 border border-border/50
                            hover:border-border transition-all duration-300 animate-fade-in"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.02)",
                  }}
                >
                  <div className={`p-3 rounded-xl ${config.iconBg}`}>
                    <Icon className={`w-5 h-5 ${config.iconColor}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{tx.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{tx.description}</p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className={`font-bold ${config.pointsColor}`}>
                      {config.prefix}{tx.points.toLocaleString()}
                    </span>
                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <GlassNavigation />
    </div>
  );
};

export default WalletPage;
