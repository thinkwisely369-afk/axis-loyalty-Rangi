import { Crown } from "lucide-react";
import { MilestoneRing } from "@/components/MilestoneRing";
import { PrivilegeCard } from "@/components/PrivilegeCard";
import { GlassNavigation } from "@/components/GlassNavigation";
import { UserHeader } from "@/components/UserHeader";
import { QuickActions } from "@/components/QuickActions";
import { RecentActivity } from "@/components/RecentActivity";
import { QRScanner } from "@/components/QRScanner";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { apiCall } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useWalletStore } from "@/stores/walletStore";
import { PromotionModal } from "@/components/PromotionModal";
import { DigitalPolicyCard } from "@/components/DigitalPolicyCard";


const Index = () => {
  const user = useAuthStore((s) => s.user);
  const { loyaltyPoints, redeemablePoints, fetchWallet } = useWalletStore();
  const totalPoints = loyaltyPoints + redeemablePoints;

  const getDisplayName = (user: any) => {
    if (user?.name && user.name.trim() !== "") return user.name;
    switch (user?.role) {
      case 'admin': return 'Admin';
      case 'management': return 'Management';
      case 'staff': return 'Staff Member';
      default: return 'User';
    }
  };

  const userName = getDisplayName(user);
  const isFirstLogin = localStorage.getItem("is_first_login") === "true";
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [privileges, setPrivileges] = useState<any[]>([]);
  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const [promoData, setPromoData] = useState({ image: "", name: "" });


  useEffect(() => {
    fetchWallet();

    const fetchPrivileges = async () => {
      try {
        const response = await apiCall("/privileges");
        const data = await response.json();
        if (data.success) {
          setPrivileges(data.privileges.filter((p: any) => p.is_active));
        }
      } catch (error) {
        console.error("Failed to fetch privileges", error);
      }
    };
    fetchPrivileges();
  }, []);

  const handleScanSuccess = async (decodedText: string) => {
    setIsScannerOpen(false);
    const loadingToast = toast.loading("Processing scan...");

    setTimeout(() => {
      toast.dismiss(loadingToast);

      const decodedLower = decodedText.toLowerCase();

      // Find if any privilege matches the scanned text
      const matchedPrivilege = privileges.find(p => {
        // Exact or case-insensitive scan_code match
        if (p.scan_code) {
          const scanLower = p.scan_code.toLowerCase();
          if (decodedText === p.scan_code || decodedLower === scanLower) return true;
          // Partial match: scan_code contained in scanned text or vice versa
          if (decodedLower.includes(scanLower) || scanLower.includes(decodedLower)) return true;
        }
        // Brand / merchant / offer keyword match
        if (p.brand && decodedLower.includes(p.brand.toLowerCase())) return true;
        if (p.merchant_name && decodedLower.includes(p.merchant_name.toLowerCase())) return true;
        if (p.offer && decodedLower.includes(p.offer.toLowerCase())) return true;
        return false;
      });

      // If scanned text is a POL- code, also try matching by privilege ID
      let polMatchedPrivilege = matchedPrivilege;
      if (!polMatchedPrivilege && decodedText.startsWith("POL-")) {
        const polId = decodedText.replace("POL-", "").trim();
        polMatchedPrivilege = privileges.find(p =>
          String(p.id) === polId
        );
      }

      if (polMatchedPrivilege) {
        setPromoData({
          image: polMatchedPrivilege.banner_image || "/promotions/malay-restaurant.jpg",
          name: polMatchedPrivilege.brand
        });
        setIsPromoOpen(true);
        toast.success(`${polMatchedPrivilege.brand} Promotion Verified!`);
      } else if (
        decodedLower.includes("malay") ||
        decodedLower.includes("restaurant") ||
        decodedLower.includes("ch17") ||
        decodedLower.includes("dehiwala") ||
        decodedText.includes("5016001090001435")
      ) {
        setPromoData({
          image: "/promotions/malay-restaurant.jpg",
          name: "Malay Restaurant"
        });
        setIsPromoOpen(true);
        toast.success("Promotion Verified!");
      } else if (decodedText.startsWith("POL-")) {
        toast.info(`No promotion found for code: ${decodedText}`);
      } else {
        toast.info(`Scanned code: ${decodedText}`);
      }
    }, 1000);
  };


  return (
    <div className="min-h-screen bg-background pb-24">
      <UserHeader
        name={userName}
        greeting={isFirstLogin ? "Welcome" : "Welcome back"}
        onScanClick={() => setIsScannerOpen(true)}
      />

      <section className="px-6">
        <MilestoneRing
          currentPoints={totalPoints}
          role={user?.role}
          policyDuration={(user as any)?.policies?.[0]?.policy_duration ?? null}
          startedDate={(user as any)?.policies?.[0]?.started_date ?? null}
          maturityValue={(user as any)?.policies?.[0]?.maturity_value ?? null}
        />
      </section>

      <DigitalPolicyCard />

      <QuickActions />

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

        <div
          className="flex gap-4 overflow-x-auto px-6 pb-4 scrollbar-hide"
          style={{
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {privileges.map((card, index) => (
            <div
              key={card.id || index}
              className="animate-slide-in"
              style={{
                scrollSnapAlign: "start",
                animationDelay: `${index * 100}ms`,
              }}
            >
              <PrivilegeCard
                brand={card.brand}
                merchantName={card.merchant_name}
                offer={card.offer}
                description={card.description}
                icon={card.icon}
                variant={card.variant as any}
                expiresIn={card.expires_in}
                promotionTime={card.promotion_time}
                logo={card.logo}
                bannerImage={card.banner_image}
              />
            </div>
          ))}
        </div>
      </section>

      <RecentActivity />

      <GlassNavigation />

      <QRScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />

      <PromotionModal
        isOpen={isPromoOpen}
        onClose={() => setIsPromoOpen(false)}
        imagePath={promoData.image}
        merchantName={promoData.name}
      />

    </div>
  );
};

export default Index;
