import { QrCode, Wallet, ArrowUpRight, History } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRScanner } from "./QRScanner";
import { SnapCashModal } from "./SnapCashModal";
import { PromotionModal } from "./PromotionModal";
import { toast } from "sonner";
import { apiCall } from "@/lib/api";


const actions = [
  { id: "scan", icon: QrCode, label: "Scan" },
  { id: "wallet", icon: Wallet, label: "Wallet" },
  { id: "transfer", icon: ArrowUpRight, label: "SnapCash" },
  { id: "history", icon: History, label: "History" },
];

export const QuickActions = () => {
  const navigate = useNavigate();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSnapCashOpen, setIsSnapCashOpen] = useState(false);
  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const [promoData, setPromoData] = useState({ image: "", name: "" });
  const [privileges, setPrivileges] = useState<any[]>([]);

  useEffect(() => {
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

  const handleActionClick = (id: string) => {
    if (id === "scan") {
      setIsScannerOpen(true);
    } else if (id === "transfer") {
      setIsSnapCashOpen(true);
    } else if (id === "wallet") {
      navigate("/wallet");
    } else {
      const action = actions.find(a => a.id === id);
      toast.info(`${action?.label || id} feature coming soon!`);
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    setIsScannerOpen(false);

    const loadingToast = toast.loading("Processing scan...");

    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.dismiss(loadingToast);

    const decodedLower = decodedText.toLowerCase();

    // Find matching privilege by scan_code, brand, merchant_name, or offer
    let matchedPrivilege = privileges.find(p => {
      if (p.scan_code) {
        const scanLower = p.scan_code.toLowerCase();
        if (decodedText === p.scan_code || decodedLower === scanLower) return true;
        if (decodedLower.includes(scanLower) || scanLower.includes(decodedLower)) return true;
      }
      if (p.brand && decodedLower.includes(p.brand.toLowerCase())) return true;
      if (p.merchant_name && decodedLower.includes(p.merchant_name.toLowerCase())) return true;
      if (p.offer && decodedLower.includes(p.offer.toLowerCase())) return true;
      return false;
    });

    // If scanned text is a POL- code, also try matching by privilege ID
    if (!matchedPrivilege && decodedText.startsWith("POL-")) {
      const polId = decodedText.replace("POL-", "").trim();
      matchedPrivilege = privileges.find(p => String(p.id) === polId);
    }

    if (matchedPrivilege) {
      setPromoData({
        image: matchedPrivilege.banner_image || "/promotions/malay-restaurant.jpg",
        name: matchedPrivilege.brand
      });
      setIsPromoOpen(true);
      toast.success(`${matchedPrivilege.brand} Promotion Verified!`);
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
      toast.info(`Scanned: ${decodedText}`);
    }
  };

  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between">
        {actions.map((action, index) => {
          const Icon = action.icon;

          return (
            <button
              key={action.id}
              onClick={() => handleActionClick(action.id)}
              className="group flex flex-col items-center gap-2.5 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className="relative p-5 rounded-[1.2rem] bg-[#0a0f16] border border-cyan-400/30 
                          group-hover:border-cyan-400 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]
                          transition-all duration-300"
              >
                {/* Internal glow */}
                <div className="absolute inset-0 rounded-[1.2rem] bg-cyan-400/5 group-hover:bg-cyan-400/10 transition-colors" />
                <Icon className="relative w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest group-hover:text-cyan-400 transition-colors">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>

      <QRScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
      <SnapCashModal
        isOpen={isSnapCashOpen}
        onClose={() => setIsSnapCashOpen(false)}
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
