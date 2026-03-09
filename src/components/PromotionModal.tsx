import { X, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";

interface PromotionModalProps {
    isOpen: boolean;
    onClose: () => void;
    imagePath: string;
    merchantName: string;
}

export const PromotionModal = ({ isOpen, onClose, imagePath, merchantName }: PromotionModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-background/95 backdrop-blur-md animate-in fade-in duration-300 p-4">
            {/* Background Image Layer */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
                <img
                    src={imagePath}
                    alt=""
                    className="w-full h-full object-cover scale-110 blur-2xl"
                />
            </div>

            <div className="bg-card border border-white/10 rounded-3xl w-full max-w-sm overflow-hidden relative shadow-2xl backdrop-blur-2xl animate-in scale-in duration-300 z-10">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors text-white"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Content */}
                <div className="flex flex-col">
                    <div className="relative aspect-[3/4] overflow-hidden">
                        <img
                            src={imagePath}
                            alt={merchantName}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    </div>

                    <div className="p-6 text-center space-y-4 -mt-12 relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 animate-bounce">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="text-sm font-bold uppercase tracking-wider">Validated</span>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">Congratulations!</h3>
                            <p className="text-muted-foreground text-sm">
                                You are eligible for this promotion at <span className="text-white font-medium">{merchantName}</span>.
                            </p>
                        </div>

                        <Button
                            onClick={onClose}
                            className="w-full py-6 rounded-2xl bg-primary hover:bg-primary-glow text-primary-foreground font-bold shadow-lg shadow-primary/20"
                        >
                            Claim Now
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
