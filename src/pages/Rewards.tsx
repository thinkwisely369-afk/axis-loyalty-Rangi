import { useState } from "react";
import { GlassNavigation } from "@/components/GlassNavigation";
import { RewardCard } from "@/components/RewardCard";
import { 
  Plane, 
  Hotel, 
  ShoppingBag, 
  Utensils, 
  Gem, 
  Gift,
  Car,
  Sparkles,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const categories = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "travel", label: "Travel", icon: Plane },
  { id: "hotels", label: "Hotels", icon: Hotel },
  { id: "shopping", label: "Shopping", icon: ShoppingBag },
  { id: "dining", label: "Dining", icon: Utensils },
  { id: "luxury", label: "Luxury", icon: Gem },
  { id: "experiences", label: "Experiences", icon: Gift },
];

const rewards = [
  {
    id: 1,
    title: "Business Class Flight to Europe",
    brand: "Emirates",
    points: 85000,
    category: "travel",
    icon: Plane,
  },
  {
    id: 2,
    title: "2-Night Stay at The Ritz",
    brand: "Ritz-Carlton",
    points: 45000,
    category: "hotels",
    icon: Hotel,
  },
  {
    id: 3,
    title: "$500 Shopping Credit",
    brand: "Neiman Marcus",
    points: 25000,
    category: "shopping",
    icon: ShoppingBag,
  },
  {
    id: 4,
    title: "Private Chef Experience",
    brand: "Eleven Madison",
    points: 35000,
    category: "dining",
    icon: Utensils,
  },
  {
    id: 5,
    title: "Cartier Love Bracelet",
    brand: "Cartier",
    points: 150000,
    category: "luxury",
    icon: Gem,
  },
  {
    id: 6,
    title: "Spa Day for Two",
    brand: "Four Seasons",
    points: 18000,
    category: "experiences",
    icon: Gift,
  },
  {
    id: 7,
    title: "First Class to Tokyo",
    brand: "Japan Airlines",
    points: 120000,
    category: "travel",
    icon: Plane,
  },
  {
    id: 8,
    title: "Luxury Car Rental Weekend",
    brand: "Porsche",
    points: 28000,
    category: "experiences",
    icon: Car,
  },
  {
    id: 9,
    title: "Suite Upgrade Voucher",
    brand: "Mandarin Oriental",
    points: 15000,
    category: "hotels",
    icon: Hotel,
  },
  {
    id: 10,
    title: "Fine Dining for Four",
    brand: "Le Bernardin",
    points: 22000,
    category: "dining",
    icon: Utensils,
  },
  {
    id: 11,
    title: "Designer Handbag",
    brand: "Louis Vuitton",
    points: 95000,
    category: "luxury",
    icon: ShoppingBag,
  },
  {
    id: 12,
    title: "VIP Concert Experience",
    brand: "Live Nation",
    points: 40000,
    category: "experiences",
    icon: Gift,
  },
];

const Rewards = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [pointsRange, setPointsRange] = useState([0, 150000]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredRewards = rewards.filter((reward) => {
    const matchesCategory = selectedCategory === "all" || reward.category === selectedCategory;
    const matchesPoints = reward.points >= pointsRange[0] && reward.points <= pointsRange[1];
    return matchesCategory && matchesPoints;
  });

  const formatPoints = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  return (
    <div className="min-h-screen pb-28 relative">
      {/* Background gradient */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at top, hsl(191 100% 50% / 0.03) 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 px-4 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Rewards</h1>
            <p className="text-sm text-muted-foreground">Redeem your points for exclusive rewards</p>
          </div>
          
          {/* Filter Button */}
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="glass border-border/50">
                <Filter className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="glass border-border/50">
              <SheetHeader>
                <SheetTitle>Filter Rewards</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div>
                  <label className="text-sm font-medium text-foreground mb-4 block">
                    Points Range
                  </label>
                  <div className="px-2">
                    <Slider
                      value={pointsRange}
                      onValueChange={setPointsRange}
                      min={0}
                      max={150000}
                      step={5000}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatPoints(pointsRange[0])} pts</span>
                      <span>{formatPoints(pointsRange[1])} pts</span>
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Category Tabs */}
        <div className="mb-6 -mx-4 px-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "glass text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-4">
          {filteredRewards.length} reward{filteredRewards.length !== 1 ? "s" : ""} available
        </p>

        {/* Rewards Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filteredRewards.map((reward) => (
            <RewardCard
              key={reward.id}
              title={reward.title}
              brand={reward.brand}
              points={reward.points}
              category={reward.category}
              icon={reward.icon}
            />
          ))}
        </div>

        {filteredRewards.length === 0 && (
          <div className="text-center py-12">
            <Gem className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No rewards match your filters</p>
          </div>
        )}
      </div>

      <GlassNavigation />
    </div>
  );
};

export default Rewards;
