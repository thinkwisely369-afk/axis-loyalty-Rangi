import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiCall } from "@/lib/api";
import {
    Search,
    FileText,
    ShieldCheck,
    CheckCircle2,
    Copy,
    Trash2,
    Plus,
    X,
    Pencil,
    Check
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Policy {
    id: number;
    policy_number: string;
    customer_name: string;
    policy_duration?: string;
    maturity_value?: string;
    started_date?: string;
}

const PolicyList = () => {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [newPolicyNumber, setNewPolicyNumber] = useState("");
    const [newCustomerName, setNewCustomerName] = useState("");
    const [newDuration, setNewDuration] = useState("");
    const [newMaturityValue, setNewMaturityValue] = useState("");
    const [newStartedDate, setNewStartedDate] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editFields, setEditFields] = useState({ customer_name: "", policy_duration: "", maturity_value: "", started_date: "" });

    const fetchPolicies = async () => {
        try {
            const response = await apiCall("/admin/policies/demo");
            const data = await response.json();
            if (data.success) {
                setPolicies(data.policies);
            }
        } catch {
            toast.error("Failed to fetch policies");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPolicies();
    }, []);

    const filteredPolicies = policies.filter(p =>
        p.policy_number.toLowerCase().includes(search.toLowerCase()) ||
        p.customer_name.toLowerCase().includes(search.toLowerCase())
    );

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied: " + text);
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPolicyNumber.trim() || !newCustomerName.trim()) return;
        setSubmitting(true);
        try {
            const response = await apiCall("/admin/policies", {
                method: "POST",
                body: JSON.stringify({
                    policy_number: newPolicyNumber.trim(),
                    customer_name: newCustomerName.trim(),
                    policy_duration: newDuration.trim() || null,
                    maturity_value: newMaturityValue.trim() || null,
                    started_date: newStartedDate || null,
                }),
            });
            const data = await response.json();
            if (data.success) {
                toast.success("Policy added successfully");
                setPolicies(prev => [data.policy, ...prev]);
                setNewPolicyNumber("");
                setNewCustomerName("");
                setNewDuration("");
                setNewMaturityValue("");
                setNewStartedDate("");
                setShowForm(false);
            } else {
                const msg = data.errors?.policy_number?.[0] || data.message || "Failed to add policy";
                toast.error(msg);
            }
        } catch {
            toast.error("Failed to add policy");
        } finally {
            setSubmitting(false);
        }
    };

    const startEdit = (policy: Policy) => {
        setEditingId(policy.id);
        setEditFields({
            customer_name: policy.customer_name,
            policy_duration: policy.policy_duration || "",
            maturity_value: policy.maturity_value || "",
            started_date: policy.started_date || "",
        });
    };

    const saveEdit = async (policy: Policy) => {
        try {
            const response = await apiCall(`/admin/policies/${policy.id}`, {
                method: "PATCH",
                body: JSON.stringify(editFields),
            });
            const data = await response.json();
            if (data.success) {
                toast.success("Policy updated");
                setPolicies(prev => prev.map(p => p.id === policy.id ? { ...p, ...data.policy } : p));
                setEditingId(null);
            } else {
                toast.error(data.message || "Failed to update policy");
            }
        } catch {
            toast.error("Failed to update policy");
        }
    };

    const handleDelete = async (policy: Policy) => {
        if (!confirm(`Delete policy ${policy.policy_number}?`)) return;
        try {
            const response = await apiCall(`/admin/policies/${policy.id}`, { method: "DELETE" });
            const data = await response.json();
            if (data.success) {
                toast.success("Policy deleted");
                setPolicies(prev => prev.filter(p => p.id !== policy.id));
            } else {
                toast.error("Failed to delete policy");
            }
        } catch {
            toast.error("Failed to delete policy");
        }
    };

    return (
        <AdminLayout title="Policy Number Reference">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
                    <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex items-start gap-4 max-w-2xl">
                        <div className="p-2 bg-primary/20 rounded-lg">
                            <ShieldCheck className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-primary text-sm">Policy Numbers</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                                These policy numbers are recognized by the system for customer login. Add real or demo policy numbers here.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search policies..."
                                className="pl-10 bg-white/5 border-white/10 rounded-xl focus:ring-primary/20"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button
                            onClick={() => setShowForm(v => !v)}
                            className="rounded-xl bg-primary hover:bg-primary/90 shrink-0"
                        >
                            {showForm ? <X className="w-4 h-4 mr-1.5" /> : <Plus className="w-4 h-4 mr-1.5" />}
                            {showForm ? "Cancel" : "Add Policy"}
                        </Button>
                    </div>
                </div>

                {/* Add Policy Form */}
                {showForm && (
                    <form onSubmit={handleAdd} className="bg-white/5 border border-primary/20 rounded-2xl p-5 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-muted-foreground mb-1.5 block font-medium uppercase tracking-wider">Policy Number *</label>
                                <Input placeholder="e.g. HNBA-1234" className="bg-white/5 border-white/10 rounded-xl" value={newPolicyNumber} onChange={(e) => setNewPolicyNumber(e.target.value.toUpperCase())} required />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground mb-1.5 block font-medium uppercase tracking-wider">Customer Name *</label>
                                <Input placeholder="e.g. John Silva" className="bg-white/5 border-white/10 rounded-xl" value={newCustomerName} onChange={(e) => setNewCustomerName(e.target.value)} required />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground mb-1.5 block font-medium uppercase tracking-wider">Policy Duration</label>
                                <Input placeholder="e.g. 10 Years" className="bg-white/5 border-white/10 rounded-xl" value={newDuration} onChange={(e) => setNewDuration(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground mb-1.5 block font-medium uppercase tracking-wider">Maturity Value</label>
                                <Input placeholder="e.g. LKR 2,500,000" className="bg-white/5 border-white/10 rounded-xl" value={newMaturityValue} onChange={(e) => setNewMaturityValue(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground mb-1.5 block font-medium uppercase tracking-wider">Started Date</label>
                                <Input type="date" className="bg-white/5 border-white/10 rounded-xl" value={newStartedDate} onChange={(e) => setNewStartedDate(e.target.value)} />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={submitting} className="rounded-xl bg-primary hover:bg-primary/90">
                                {submitting ? "Adding..." : "Add Policy"}
                            </Button>
                        </div>
                    </form>
                )}

                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                    <Table>
                        <TableHeader className="bg-white/5">
                            <TableRow className="border-white/10 hover:bg-transparent">
                                <TableHead className="text-muted-foreground font-medium py-4">Policy Number</TableHead>
                                <TableHead className="text-muted-foreground font-medium">Customer Name</TableHead>
                                <TableHead className="text-muted-foreground font-medium">Duration</TableHead>
                                <TableHead className="text-muted-foreground font-medium">Maturity Value</TableHead>
                                <TableHead className="text-muted-foreground font-medium">Started</TableHead>
                                <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                                <TableHead className="text-muted-foreground font-medium text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <TableRow key={i} className="border-white/10">
                                        <TableCell colSpan={7} className="h-16 animate-pulse bg-white/5" />
                                    </TableRow>
                                ))
                            ) : filteredPolicies.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-40 text-center text-muted-foreground">
                                        No policies found matching your search
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredPolicies.map((policy) => {
                                    const isEditing = editingId === policy.id;
                                    return (
                                    <TableRow key={policy.id} className={`border-white/10 transition-colors group ${isEditing ? "bg-white/5" : "hover:bg-white/5"}`}>
                                        <TableCell className="py-3 font-mono font-medium text-primary">
                                            {policy.policy_number}
                                        </TableCell>
                                        <TableCell>
                                            {isEditing ? (
                                                <Input className="h-7 text-xs bg-white/5 border-white/10 rounded-lg w-36" value={editFields.customer_name} onChange={e => setEditFields(f => ({ ...f, customer_name: e.target.value }))} />
                                            ) : policy.customer_name}
                                        </TableCell>
                                        <TableCell>
                                            {isEditing ? (
                                                <Input className="h-7 text-xs bg-white/5 border-white/10 rounded-lg w-28" placeholder="e.g. 10 Years" value={editFields.policy_duration} onChange={e => setEditFields(f => ({ ...f, policy_duration: e.target.value }))} />
                                            ) : <span className="text-muted-foreground text-sm">{policy.policy_duration || <span className="text-white/20">—</span>}</span>}
                                        </TableCell>
                                        <TableCell>
                                            {isEditing ? (
                                                <Input className="h-7 text-xs bg-white/5 border-white/10 rounded-lg w-32" placeholder="e.g. LKR 2.5M" value={editFields.maturity_value} onChange={e => setEditFields(f => ({ ...f, maturity_value: e.target.value }))} />
                                            ) : <span className="text-muted-foreground text-sm">{policy.maturity_value || <span className="text-white/20">—</span>}</span>}
                                        </TableCell>
                                        <TableCell>
                                            {isEditing ? (
                                                <Input type="date" className="h-7 text-xs bg-white/5 border-white/10 rounded-lg w-36" value={editFields.started_date} onChange={e => setEditFields(f => ({ ...f, started_date: e.target.value }))} />
                                            ) : <span className="text-muted-foreground text-sm">{policy.started_date ? new Date(policy.started_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : <span className="text-white/20">—</span>}</span>}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Active
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {isEditing ? (
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="ghost" className="h-8 rounded-lg hover:bg-emerald-500/20 text-emerald-400" onClick={() => saveEdit(policy)}>
                                                        <Check className="w-3.5 h-3.5 mr-1" /> Save
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="h-8 rounded-lg hover:bg-white/10 text-muted-foreground" onClick={() => setEditingId(null)}>
                                                        <X className="w-3.5 h-3.5 mr-1" /> Cancel
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button size="sm" variant="ghost" className="h-8 rounded-lg hover:bg-primary/20 text-primary" onClick={() => copyToClipboard(policy.policy_number)}>
                                                        <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="h-8 rounded-lg hover:bg-yellow-500/20 text-yellow-400" onClick={() => startEdit(policy)}>
                                                        <Pencil className="w-3.5 h-3.5 mr-1" /> Modify
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="h-8 rounded-lg hover:bg-red-500/20 text-red-400" onClick={() => handleDelete(policy)}>
                                                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-4">
                    <FileText className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div className="text-xs text-muted-foreground">
                        <p className="font-semibold text-yellow-500 mb-1">Tip:</p>
                        Any policy number starting with <code className="text-white bg-white/10 px-1 rounded">DEMO-</code> is also accepted by the system automatically for testing.
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default PolicyList;
