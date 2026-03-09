import { Crown, Diamond, Watch, Plane, ShoppingBag } from "lucide-react";
import { MilestoneRing } from "@/components/MilestoneRing";
import { PrivilegeCard } from "@/components/PrivilegeCard";
import { GlassNavigation } from "@/components/GlassNavigation";
import { UserHeader } from "@/components/UserHeader";
import { QuickActions } from "@/components/QuickActions";
import { RecentActivity } from "@/components/RecentActivity";

const privilegeCards = [
  {
    brand: "Louis Vuitton",
    offer: "20% Off Exclusive Collection",
    description: "Members-only access to the Spring 2024 collection with complimentary gift wrapping",
    icon: ShoppingBag,
    variant: "gold" as const,
    expiresIn: "5 days left",
  },
  {
    brand: "Rolex",
    offer: "VIP Private Viewing",
    description: "Exclusive invitation to preview the new Oyster Perpetual collection",
    icon: Watch,
    variant: "platinum" as const,
    expiresIn: "2 weeks",
  },
  {
    brand: "Emirates",
    offer: "Complimentary Lounge Access",
    description: "Unlimited first-class lounge access for you and a guest at all airports",
    icon: Plane,
    variant: "emerald" as const,
  },
  {
    brand: "Tiffany & Co",
    offer: "Double Points Weekend",
    description: "Earn 2x points on all jewelry purchases this weekend only",
    icon: Diamond,
    variant: "rose" as const,
    expiresIn: "3 days",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <UserHeader name="Rangika" />

      {/* Milestone Progress Ring */}
      <section className="px-6">
        <MilestoneRing
          progress={68}
          currentPoints={12450}
          nextMilestone={20000}
          tier="Gold Member"
        />
      </section>

      {/* Quick Actions */}
      <QuickActions />

      {/* Privilege Cards Section */}
      <section className="mt-6">
        <div className="flex items-center justify-between px-6 mb-4">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-gold" />
            <h2 className="text-lg font-bold text-foreground">Your Privileges</h2>
          </div>
          <button className="text-sm font-medium text-primary hover:text-primary-glow transition-colors">
            View All
          </button>
        </div>

        {/* Horizontal scroll container */}
        <div 
          className="flex gap-4 overflow-x-auto px-6 pb-4 scrollbar-hide"
          style={{
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {privilegeCards.map((card, index) => (
            <div
              key={card.brand}
              className="animate-slide-in"
              style={{ 
                scrollSnapAlign: "start",
                animationDelay: `${index * 100}ms`,
              }}
            >
              <PrivilegeCard {...card} />
            </div>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <RecentActivity />

      {/* Bottom Navigation */}
      <GlassNavigation />
    </div>
  );
};

export default Index;
