import { Shield, Activity, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import hnbaLogo from "../HNBA-LOGO.png";
import { useAuthStore } from "@/stores/authStore";

export const DigitalPolicyCard = () => {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const primaryPolicy = user?.policies?.[0]?.policy_number ?? user?.policy_number ?? "—";
    const holderName = user?.policies?.[0]?.customer_name ?? user?.name ?? "";
    const maturityValue = user?.policies?.[0]?.maturity_value ?? null;

    return (
        <div className="relative overflow-hidden rounded-[2rem] bg-[#111821]/80 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.2)] p-6 mx-6 mt-2 mb-8 group">
            {/* Glossy overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-transparent pointer-events-none" />

            {/* Header: logo left, label right */}
            <div className="flex items-center justify-between mb-4 px-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    Digital Policy Card
                </span>
                <img
                    src={hnbaLogo}
                    alt="HNBA"
                    className="h-10 w-auto object-contain opacity-90"
                />
            </div>

            <div className="flex items-start gap-5 mb-6">
                {/* Large Shield Icon */}
                <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full" />
                    <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0a0f16] border border-cyan-400/30 shadow-inner">
                        <Shield className="w-10 h-10 text-cyan-400" strokeWidth={1.5} />
                        <Activity className="w-5 h-5 text-cyan-200 absolute animate-pulse" />
                    </div>
                </div>

                {/* Policy Identification */}
                <div className="flex flex-col pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400 mb-1">
                        Active Policy
                    </span>
                    <div className="font-mono text-2xl tracking-[0.1em] font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                        {primaryPolicy}
                    </div>
                    {holderName && (
                        <span className="text-[11px] text-gray-400 mt-1">{holderName}</span>
                    )}
                </div>
            </div>

            {/* Grid Info */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-6 px-1">
                <div>
                    <span className="text-[9px] uppercase tracking-[0.2em] text-cyan-100/30 block mb-1">Type</span>
                    <span className="text-sm font-bold text-gray-200">Life Protect</span>
                </div>
                <div>
                    <span className="text-[9px] uppercase tracking-[0.2em] text-cyan-100/30 block mb-1">Maturity Value</span>
                    <span className="text-sm font-bold text-white">{maturityValue ?? "—"}</span>
                </div>
            </div>

            {/* Bottom Progress Bar & CTA */}
            <div className="relative mt-8">
                <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-[10px] font-bold text-cyan-100/50">Next Due: 15 OCT (60%)</span>
                    <button onClick={() => navigate("/policy-certificate")} className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors group">
                        <span className="text-[10px] font-bold uppercase tracking-wider">View Full Certificate</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Progress bar container */}
                <div className="h-[3px] w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-cyan-300 shadow-[0_0_10px_rgba(34,211,238,1)]"
                        style={{ width: '60%' }}
                    />
                </div>
            </div>
        </div>
    );
};
