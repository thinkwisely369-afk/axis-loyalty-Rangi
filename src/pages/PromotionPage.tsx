import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, Gift, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiCall } from "@/lib/api";

interface Privilege {
    id: number;
    brand: string;
    merchant_name: string | null;
    offer: string;
    description: string;
    logo: string | null;
    banner_image: string | null;
    expires_in: string | null;
    promotion_time: string | null;
    is_active: boolean;
}

const PromotionPage = () => {
    const { id } = useParams<{ id: string }>();
    const [privilege, setPrivilege] = useState<Privilege | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPromotion = async () => {
            try {
                const response = await apiCall(`/promotions/${id}`);
                const data = await response.json();
                if (data.success && data.privilege) {
                    setPrivilege(data.privilege);
                } else {
                    setError("Promotion not found");
                }
            } catch (err) {
                setError("Failed to load promotion");
            } finally {
                setLoading(false);
            }
        };
        fetchPromotion();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-muted-foreground text-sm">Loading promotion...</p>
                </div>
            </div>
        );
    }

    if (error || !privilege) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <div className="text-center space-y-4 max-w-sm">
                    <Gift className="w-16 h-16 text-muted-foreground/30 mx-auto" />
                    <h2 className="text-xl font-bold text-foreground">Promotion Not Found</h2>
                    <p className="text-muted-foreground text-sm">
                        This promotion may have expired or is no longer available.
                    </p>
                    <Button
                        onClick={() => window.location.href = "/"}
                        className="rounded-2xl bg-primary hover:bg-primary-glow text-primary-foreground font-bold px-8"
                    >
                        Go to Home
                    </Button>
                </div>
            </div>
        );
    }

    if (!privilege.is_active) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <div className="text-center space-y-4 max-w-sm">
                    <Clock className="w-16 h-16 text-muted-foreground/30 mx-auto" />
                    <h2 className="text-xl font-bold text-foreground">Promotion Expired</h2>
                    <p className="text-muted-foreground text-sm">
                        This promotion from {privilege.brand} is no longer active.
                    </p>
                    <Button
                        onClick={() => window.location.href = "/"}
                        className="rounded-2xl bg-primary hover:bg-primary-glow text-primary-foreground font-bold px-8"
                    >
                        Go to Home
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            {/* Background blur layer */}
            {privilege.banner_image && (
                <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
                    <img
                        src={privilege.banner_image}
                        alt=""
                        className="w-full h-full object-cover scale-110 blur-2xl"
                    />
                </div>
            )}

            <div className="bg-card border border-white/10 rounded-3xl w-full max-w-sm overflow-hidden relative shadow-2xl backdrop-blur-2xl z-10 animate-in scale-in duration-300">
                {/* Banner Image */}
                {privilege.banner_image && (
                    <div className="relative aspect-[3/4] overflow-hidden">
                        <img
                            src={privilege.banner_image}
                            alt={privilege.brand}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    </div>
                )}

                {/* Content */}
                <div className={`p-6 text-center space-y-4 relative z-10 ${privilege.banner_image ? '-mt-12' : 'pt-10'}`}>
                    {/* Logo */}
                    {!privilege.banner_image && privilege.logo && (
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 mx-auto mb-4">
                            <img src={privilege.logo} alt={privilege.brand} className="w-full h-full object-cover" />
                        </div>
                    )}

                    {/* Validated Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 animate-bounce">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-sm font-bold uppercase tracking-wider">Validated</span>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">Congratulations!</h3>
                        <p className="text-muted-foreground text-sm">
                            You are <span className="text-emerald-400 font-semibold">eligible</span> for this promotion at{" "}
                            <span className="text-white font-medium">{privilege.brand}</span>.
                        </p>
                    </div>

                    {/* Offer Details */}
                    <div className="bg-white/5 rounded-2xl p-4 space-y-2 text-left">
                        <p className="text-primary font-bold text-lg">{privilege.offer}</p>
                        {privilege.description && (
                            <p className="text-muted-foreground text-sm">{privilege.description}</p>
                        )}
                        {(privilege.merchant_name || privilege.promotion_time || privilege.expires_in) && (
                            <div className="flex flex-wrap gap-3 pt-2 border-t border-white/5">
                                {privilege.merchant_name && (
                                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                        <MapPin className="w-3 h-3" /> {privilege.merchant_name}
                                    </span>
                                )}
                                {privilege.promotion_time && (
                                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="w-3 h-3" /> {privilege.promotion_time}
                                    </span>
                                )}
                                {privilege.expires_in && (
                                    <span className="text-xs text-amber-400 font-medium">{privilege.expires_in}</span>
                                )}
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={() => window.location.href = "/login"}
                        className="w-full py-6 rounded-2xl bg-primary hover:bg-primary-glow text-primary-foreground font-bold shadow-lg shadow-primary/20"
                    >
                        Claim Now
                    </Button>

                    <p className="text-[11px] text-muted-foreground/60">
                        Powered by Axis Loyalty
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PromotionPage;
