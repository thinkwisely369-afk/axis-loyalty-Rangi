import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, CheckCircle2, Calendar, Clock, TrendingUp, User, Phone, Hash } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import hnbaLogo from "../HNBA-LOGO.png";

function parseDate(dateStr: string | undefined): Date | null {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
}

function formatDate(date: Date): string {
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

function addYears(date: Date, years: number): Date {
    const d = new Date(date);
    d.setFullYear(d.getFullYear() + years);
    return d;
}

function extractYears(duration: string | undefined): number | null {
    if (!duration) return null;
    const match = duration.match(/(\d+)/);
    return match ? parseInt(match[1]) : null;
}

function getProgress(start: Date, end: Date): number {
    const now = Date.now();
    const total = end.getTime() - start.getTime();
    const elapsed = now - start.getTime();
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

export default function PolicyCertificate() {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const policy = user?.policies?.[0];

    const policyNumber = policy?.policy_number ?? user?.policy_number ?? "—";
    const holderName = policy?.customer_name ?? user?.name ?? "—";
    const duration = policy?.policy_duration;
    const maturityValue = policy?.maturity_value ?? "—";
    const startedDate = parseDate(policy?.started_date);
    const durationYears = extractYears(duration);
    const maturityDate = startedDate && durationYears ? addYears(startedDate, durationYears) : null;
    const progress = startedDate && maturityDate ? getProgress(startedDate, maturityDate) : null;

    return (
        <div className="min-h-screen bg-[#060b12] text-white">
            {/* Top bar */}
            <div className="flex items-center justify-between px-5 pt-10 pb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-sm font-medium">Back</span>
                </button>
                <img src={hnbaLogo} alt="HNBA" className="h-8 w-auto object-contain opacity-90" />
                <div className="w-16" />
            </div>

            <div className="px-5 pb-24 space-y-4">
                {/* Certificate card */}
                <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#0d1a2a] via-[#111821] to-[#0a0f16] shadow-[0_0_60px_rgba(6,182,212,0.15)] p-6">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

                    {/* Header */}
                    <div className="flex items-start justify-between mb-6 relative z-10">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400/70 mb-1">
                                HNB Assurance PLC
                            </p>
                            <h1 className="text-xl font-black text-white tracking-tight">
                                Insurance Certificate
                            </h1>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Active</span>
                        </div>
                    </div>

                    {/* Shield + policy number */}
                    <div className="flex items-center gap-4 mb-6 relative z-10">
                        <div className="relative flex-shrink-0">
                            <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full" />
                            <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0a0f16] border border-cyan-400/30">
                                <Shield className="w-9 h-9 text-cyan-400" strokeWidth={1.5} />
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1">Policy Number</p>
                            <p className="font-mono text-2xl font-black text-white tracking-[0.1em] drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                                {policyNumber}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">Life Protection Plan</p>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-cyan-500/20 via-white/10 to-transparent mb-6 relative z-10" />

                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-4 relative z-10">
                        <DetailItem
                            icon={<User className="w-4 h-4" />}
                            label="Policy Holder"
                            value={holderName}
                        />
                        <DetailItem
                            icon={<Hash className="w-4 h-4" />}
                            label="Policy Type"
                            value="Life Protect"
                        />
                        <DetailItem
                            icon={<Clock className="w-4 h-4" />}
                            label="Duration"
                            value={duration ?? "—"}
                        />
                        <DetailItem
                            icon={<TrendingUp className="w-4 h-4" />}
                            label="Maturity Value"
                            value={maturityValue}
                            highlight
                        />
                        <DetailItem
                            icon={<Calendar className="w-4 h-4" />}
                            label="Commencement Date"
                            value={startedDate ? formatDate(startedDate) : "—"}
                        />
                        <DetailItem
                            icon={<Calendar className="w-4 h-4" />}
                            label="Maturity Date"
                            value={maturityDate ? formatDate(maturityDate) : "—"}
                        />
                        {user?.phone && (
                            <DetailItem
                                icon={<Phone className="w-4 h-4" />}
                                label="Contact"
                                value={user.phone}
                            />
                        )}
                    </div>

                    {/* Progress section */}
                    {progress !== null && startedDate && maturityDate && (
                        <div className="mt-6 relative z-10">
                            <div className="h-px bg-gradient-to-r from-cyan-500/20 via-white/10 to-transparent mb-5" />
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Policy Progress</span>
                                <span className="text-[10px] font-bold text-cyan-400">{Math.round(progress)}% elapsed</span>
                            </div>
                            <div className="h-[3px] w-full bg-white/5 rounded-full overflow-hidden mb-3">
                                <div
                                    className="h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-cyan-300 shadow-[0_0_10px_rgba(34,211,238,1)] rounded-full transition-all duration-700"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[9px] text-gray-600">{formatDate(startedDate)}</span>
                                <span className="text-[9px] text-gray-600">{formatDate(maturityDate)}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer note */}
                <p className="text-center text-[10px] text-gray-600 px-4 leading-relaxed">
                    This digital certificate is issued by HNB Assurance PLC and is valid as proof of active coverage.
                    For queries, contact your nearest HNBA branch.
                </p>
            </div>
        </div>
    );
}

function DetailItem({
    icon,
    label,
    value,
    highlight = false,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    highlight?: boolean;
}) {
    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-gray-500">
                <span className="text-cyan-400/50">{icon}</span>
                <span className="text-[9px] uppercase tracking-[0.15em]">{label}</span>
            </div>
            <p className={`text-sm font-bold ${highlight ? "text-cyan-300" : "text-white"}`}>
                {value}
            </p>
        </div>
    );
}
