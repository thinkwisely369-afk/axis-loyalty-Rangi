import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiCall } from "@/lib/api";
import { toast } from "sonner";
import { Trash2, Receipt, MapPin, Store, Coins, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Bill {
    id: number;
    user_id: number;
    merchant_name: string;
    location: string | null;
    total_amount: number;
    points_earned: number;
    has_ch17_discount: boolean;
    bill_image_url: string | null;
    bill_image_path: string | null;
    status: 'approved' | 'revoked' | 'pending';
    rejection_reason: string | null;
    raw_ocr_text: string | null;
    created_at: string;
    user?: { id: number; name: string; mobile_number: string };
}

const statusBadge = (status: Bill['status']) => {
    if (status === 'approved') return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">
            <CheckCircle2 className="w-3 h-3" /> Approved
        </span>
    );
    if (status === 'revoked') return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase">
            <XCircle className="w-3 h-3" /> Revoked
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase">
            <AlertCircle className="w-3 h-3" /> Pending
        </span>
    );
};

const BillList = () => {
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [revoking, setRevoking] = useState<number | null>(null);
    const [expandedImage, setExpandedImage] = useState<string | null>(null);
    const [expandedText, setExpandedText] = useState<number | null>(null);

    const fetchBills = async () => {
        try {
            const response = await apiCall("/admin/bills");
            const data = await response.json();
            if (data.success) {
                setBills(data.bills.data ?? data.bills);
            }
        } catch (error) {
            toast.error("Failed to fetch bills");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBills();
    }, []);

    const handleRevoke = async (bill: Bill) => {
        if (!confirm(`Revoke ${bill.points_earned} points from ${bill.user?.name || 'this user'} for the ${bill.merchant_name} bill?`)) return;

        setRevoking(bill.id);
        try {
            const response = await apiCall(`/admin/bills/${bill.id}/revoke`, {
                method: "PATCH",
                body: JSON.stringify({ reason: "Issue detected by admin" })
            });
            const data = await response.json();
            if (data.success) {
                toast.success(data.message);
                fetchBills();
            } else {
                toast.error(data.message || "Failed to revoke");
            }
        } catch (error) {
            toast.error("Failed to revoke bill");
        } finally {
            setRevoking(null);
        }
    };

    return (
        <AdminLayout title="SnapCash Bills">
            <div className="space-y-4">
                <p className="text-muted-foreground text-sm">
                    All submitted bills. Points are awarded automatically at 5% of the bill total. Use the remove button if you detect any issue.
                </p>

                {/* Image lightbox */}
                {expandedImage && (
                    <div
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setExpandedImage(null)}
                    >
                        <img src={expandedImage} alt="Bill" className="max-h-[90vh] max-w-full rounded-xl object-contain shadow-2xl" />
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-64 bg-white/5 rounded-2xl animate-pulse" />)}
                    </div>
                ) : bills.length === 0 ? (
                    <div className="h-60 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl text-muted-foreground">
                        <Receipt className="w-12 h-12 mb-4 opacity-20" />
                        <p>No bills submitted yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {bills.map((bill) => (
                            <div
                                key={bill.id}
                                className={`bg-white/5 border rounded-2xl overflow-hidden transition-all ${
                                    bill.status === 'revoked' ? 'border-red-500/20 opacity-60' : 'border-white/10'
                                }`}
                            >
                                {/* Bill Image */}
                                {bill.bill_image_url ? (
                                    <div
                                        className="aspect-[4/3] bg-black/40 overflow-hidden cursor-pointer group relative"
                                        onClick={() => setExpandedImage(bill.bill_image_url!)}
                                    >
                                        <img
                                            src={bill.bill_image_url}
                                            alt="Bill"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                            <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium bg-black/60 px-3 py-1 rounded-full transition-opacity">
                                                Click to enlarge
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="aspect-[4/3] bg-white/5 flex items-center justify-center">
                                        <Receipt className="w-12 h-12 opacity-10" />
                                    </div>
                                )}

                                {/* Bill Data */}
                                <div className="p-4 space-y-3">
                                    {/* Header */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <Store className="w-3.5 h-3.5 text-primary shrink-0" />
                                                <p className="font-bold text-sm text-foreground leading-tight">{bill.merchant_name}</p>
                                            </div>
                                            {bill.location && (
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                                                    <p className="text-xs text-muted-foreground">{bill.location}</p>
                                                </div>
                                            )}
                                        </div>
                                        {statusBadge(bill.status)}
                                    </div>

                                    {/* Amount + Points */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-white/5 rounded-xl p-2.5 text-center">
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Bill Total</p>
                                            <p className="text-sm font-bold text-foreground mt-0.5">
                                                LKR {Number(bill.total_amount).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="bg-emerald-500/10 rounded-xl p-2.5 text-center">
                                            <p className="text-[10px] text-emerald-400 uppercase tracking-wider flex items-center justify-center gap-1">
                                                <Coins className="w-3 h-3" /> Points
                                            </p>
                                            <p className="text-sm font-bold text-emerald-400 mt-0.5">
                                                +{bill.points_earned?.toLocaleString() ?? 0}
                                            </p>
                                        </div>
                                    </div>

                                    {/* User */}
                                    {bill.user && (
                                        <div className="text-xs text-muted-foreground border-t border-white/5 pt-2">
                                            <span className="font-medium text-foreground">{bill.user.name || 'Unknown'}</span>
                                            <span className="mx-1">·</span>
                                            {bill.user.mobile_number}
                                        </div>
                                    )}

                                    {/* Submitted date */}
                                    <p className="text-[10px] text-muted-foreground/60">
                                        {new Date(bill.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>

                                    {/* OCR text toggle */}
                                    {bill.raw_ocr_text && (
                                        <div>
                                            <button
                                                onClick={() => setExpandedText(expandedText === bill.id ? null : bill.id)}
                                                className="text-[10px] text-primary hover:text-primary-glow transition-colors"
                                            >
                                                {expandedText === bill.id ? 'Hide' : 'Show'} raw text
                                            </button>
                                            {expandedText === bill.id && (
                                                <pre className="mt-2 text-[10px] text-muted-foreground bg-black/40 rounded-lg p-2 max-h-32 overflow-y-auto whitespace-pre-wrap font-mono">
                                                    {bill.raw_ocr_text}
                                                </pre>
                                            )}
                                        </div>
                                    )}

                                    {/* Revoke button */}
                                    {bill.status !== 'revoked' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full h-9 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20"
                                            onClick={() => handleRevoke(bill)}
                                            disabled={revoking === bill.id}
                                        >
                                            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                            {revoking === bill.id ? 'Revoking...' : `Remove ${bill.points_earned} Points`}
                                        </Button>
                                    )}
                                    {bill.status === 'revoked' && (
                                        <p className="text-[11px] text-red-400 text-center pt-1">
                                            Points revoked · {bill.rejection_reason}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default BillList;
