import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiCall } from "@/lib/api";
import {
    Plus,
    Trash2,
    Settings2,
    Gift,
    ShoppingBag,
    Watch,
    Plane,
    Diamond,
    Save,
    X,
    Pencil,
    Image as ImageIcon
} from "lucide-react";

import ImageCropper from "@/components/ImageCropper";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Privilege {
    id: number;
    brand: string;
    merchant_name: string | null;
    offer: string;
    description: string;
    logo: string | null;
    icon: string;
    variant: 'gold' | 'platinum' | 'emerald' | 'rose';
    expires_in: string | null;
    promotion_time: string | null;
    banner_image: string | null;
    qr_code: string | null;
    scan_code: string | null;
    is_active: boolean;
}


const iconMap: Record<string, any> = {
    ShoppingBag,
    Watch,
    Plane,
    Diamond,
    Gift
};

const PrivilegeList = () => {
    const [privileges, setPrivileges] = useState<Privilege[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);


    const [formData, setFormData] = useState<Partial<Privilege>>({
        brand: "",
        merchant_name: "",
        offer: "",
        description: "",
        icon: "Gift",
        variant: "gold",
        expires_in: "",
        promotion_time: "",
        logo: null,
        banner_image: null,
        qr_code: null,
        scan_code: ""
    });


    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [croppingType, setCroppingType] = useState<"logo" | "banner" | null>(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);

    const fetchPrivileges = async () => {
        try {
            const response = await apiCall("/admin/privileges");
            const data = await response.json();
            if (data.success) {
                setPrivileges(data.privileges);
            }
        } catch (error) {
            toast.error("Failed to fetch privileges");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrivileges();
    }, []);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "banner") => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
                setCroppingType(type);
                setIsCropperOpen(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleQRSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, qr_code: reader.result as string });
                toast.success(`${file.type === 'application/pdf' ? 'PDF' : 'Image'} QR uploaded successfully`);
            };
            reader.readAsDataURL(file);
        }
    };


    const handleCropComplete = (croppedImage: string) => {
        if (croppingType === "logo") {
            setFormData({ ...formData, logo: croppedImage });
        } else if (croppingType === "banner") {
            setFormData({ ...formData, banner_image: croppedImage });
        }
        setIsCropperOpen(false);
        setSelectedImage(null);
        setCroppingType(null);
    };

    const handleEdit = (e: React.MouseEvent, privilege: Privilege) => {
        e.preventDefault();
        e.stopPropagation();
        setFormData({
            brand: privilege.brand,
            merchant_name: privilege.merchant_name,
            offer: privilege.offer,
            description: privilege.description,
            icon: privilege.icon,
            variant: privilege.variant,
            expires_in: privilege.expires_in,
            promotion_time: privilege.promotion_time,
            logo: privilege.logo,
            banner_image: privilege.banner_image,
            qr_code: privilege.qr_code,
            scan_code: privilege.scan_code || ""
        });
        setEditingId(privilege.id);
        setIsAddOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const url = editingId ? `/admin/privileges/${editingId}` : "/admin/privileges";
            const method = editingId ? "PATCH" : "POST";

            const response = await apiCall(url, {
                method,
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (data.success) {
                toast.success(`Privilege ${editingId ? "updated" : "created"} successfully`);
                setIsAddOpen(false);
                setEditingId(null);
                setFormData({
                    brand: "",
                    merchant_name: "",
                    offer: "",
                    description: "",
                    icon: "Gift",
                    variant: "gold",
                    expires_in: "",
                    promotion_time: "",
                    logo: null,
                    banner_image: null,
                    qr_code: null,
                    scan_code: ""
                });
                fetchPrivileges();
            }
        } catch (error) {
            toast.error(`Failed to ${editingId ? "update" : "create"} privilege`);
        }
    };


    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this privilege?")) return;

        try {
            const response = await apiCall(`/admin/privileges/${id}`, {
                method: "DELETE"
            });
            const data = await response.json();
            if (data.success) {
                toast.success("Privilege deleted");
                fetchPrivileges();
            }
        } catch (error) {
            toast.error("Failed to delete privilege");
        }
    };

    const handleStatusToggle = async (id: number, currentStatus: boolean) => {
        try {
            const response = await apiCall(`/admin/privileges/${id}`, {
                method: "PATCH",
                body: JSON.stringify({ is_active: !currentStatus })
            });
            const data = await response.json();
            if (data.success) {
                fetchPrivileges();
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    return (
        <AdminLayout title="Privilege Management">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <p className="text-muted-foreground text-sm">Manage offers and privileges shown on the user dashboard.</p>
                    <Dialog open={isAddOpen} onOpenChange={(open) => {
                        setIsAddOpen(open);
                        if (!open) {
                            setEditingId(null);
                            setFormData({
                                brand: "",
                                merchant_name: "",
                                offer: "",
                                description: "",
                                icon: "Gift",
                                variant: "gold",
                                expires_in: "",
                                promotion_time: "",
                                logo: null,
                                banner_image: null,
                                qr_code: null,
                                scan_code: ""
                            });
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button className="rounded-xl bg-primary hover:bg-primary-glow text-primary-foreground shadow-lg shadow-primary/20">
                                <Plus className="w-4 h-4 mr-2" />
                                New Privilege
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#0A0A0B] border-white/10 text-foreground max-w-lg">
                            <DialogHeader>
                                <DialogTitle>{editingId ? "Edit Privilege" : "Add New Privilege"}</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Brand Name</label>
                                        <Input
                                            placeholder="e.g., Louis Vuitton"
                                            className="bg-white/5 border-white/10 rounded-xl focus:ring-primary"
                                            value={formData.brand}
                                            onChange={e => setFormData({ ...formData, brand: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Merchant Name</label>
                                        <Input
                                            placeholder="e.g., LV Official"
                                            className="bg-white/5 border-white/10 rounded-xl focus:ring-primary"
                                            value={formData.merchant_name || ""}
                                            onChange={e => setFormData({ ...formData, merchant_name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Offer Headline</label>
                                    <Input
                                        placeholder="e.g., 20% Off"
                                        className="bg-white/5 border-white/10 rounded-xl focus:ring-primary"
                                        value={formData.offer}
                                        onChange={e => setFormData({ ...formData, offer: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground font-bold">Secret Scan Code</label>
                                    <Input
                                        placeholder="Paste QR content here..."
                                        className="bg-white/5 border-white/10 rounded-xl focus:ring-primary font-mono text-xs"
                                        value={formData.scan_code || ""}
                                        onChange={e => setFormData({ ...formData, scan_code: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Icon</label>
                                        <Select value={formData.icon} onValueChange={v => setFormData({ ...formData, icon: v })}>
                                            <SelectTrigger className="bg-white/5 border-white/10 rounded-xl">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#0A0A0B] border-white/10">
                                                <SelectItem value="Gift">Gift</SelectItem>
                                                <SelectItem value="ShoppingBag">Shopping Bag</SelectItem>
                                                <SelectItem value="Watch">Watch</SelectItem>
                                                <SelectItem value="Plane">Plane</SelectItem>
                                                <SelectItem value="Diamond">Diamond</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Variant (Color)</label>
                                        <Select value={formData.variant} onValueChange={(v: any) => setFormData({ ...formData, variant: v })}>
                                            <SelectTrigger className="bg-white/5 border-white/10 rounded-xl">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#0A0A0B] border-white/10">
                                                <SelectItem value="gold">Gold</SelectItem>
                                                <SelectItem value="platinum">Platinum</SelectItem>
                                                <SelectItem value="emerald">Emerald</SelectItem>
                                                <SelectItem value="rose">Rose</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Expires In (Label)</label>
                                        <Input
                                            placeholder="e.g., 5 days left"
                                            className="bg-white/5 border-white/10 rounded-xl focus:ring-primary"
                                            value={formData.expires_in || ""}
                                            onChange={e => setFormData({ ...formData, expires_in: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Promotion Time</label>
                                        <Input
                                            placeholder="e.g., 10 AM - 10 PM"
                                            className="bg-white/5 border-white/10 rounded-xl focus:ring-primary"
                                            value={formData.promotion_time || ""}
                                            onChange={e => setFormData({ ...formData, promotion_time: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-muted-foreground block">Brand Logo</label>
                                        <div className="flex flex-col items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 group relative">
                                            {formData.logo ? (
                                                <div className="relative w-20 h-20">
                                                    <img src={formData.logo} className="w-full h-full rounded-xl object-cover border border-white/10" />
                                                    <button onClick={() => setFormData({ ...formData, logo: null })} className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white shadow-lg"><X className="w-3 h-3" /></button>
                                                </div>
                                            ) : (
                                                <div className="w-20 h-20 rounded-xl bg-white/5 flex items-center justify-center border border-dashed border-white/10">
                                                    <ImageIcon className="w-8 h-8 opacity-20" />
                                                </div>
                                            )}
                                            <Button variant="secondary" size="sm" className="w-full h-8 text-[11px] font-semibold" onClick={() => document.getElementById('logo-upload')?.click()}>
                                                Upload Logo
                                            </Button>
                                            <input id="logo-upload" type="file" className="hidden" accept="image/*" onChange={e => handleImageSelect(e, 'logo')} />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-muted-foreground block">Promotion Banner (618x900)</label>
                                        <div className="flex flex-col items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 group relative">
                                            {formData.banner_image ? (
                                                <div className="relative w-20 h-28">
                                                    <img src={formData.banner_image} className="w-full h-full rounded-xl object-cover border border-white/10" />
                                                    <button onClick={() => setFormData({ ...formData, banner_image: null })} className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white shadow-lg"><X className="w-3 h-3" /></button>
                                                </div>
                                            ) : (
                                                <div className="w-20 h-28 rounded-xl bg-white/5 flex items-center justify-center border border-dashed border-white/10">
                                                    <ImageIcon className="w-8 h-8 opacity-20" />
                                                </div>
                                            )}
                                            <Button variant="secondary" size="sm" className="w-full h-8 text-[11px] font-semibold" onClick={() => document.getElementById('banner-upload')?.click()}>
                                                Upload Banner
                                            </Button>
                                            <input id="banner-upload" type="file" className="hidden" accept="image/*" onChange={e => handleImageSelect(e, 'banner')} />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-muted-foreground block">QR Code (Image/PDF)</label>
                                        <div className="flex flex-col items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 group relative">
                                            {formData.qr_code ? (
                                                <div className="relative w-20 h-20">
                                                    {formData.qr_code.includes('application/pdf') ? (
                                                        <div className="w-full h-full rounded-xl bg-primary/10 flex flex-col items-center justify-center border border-white/10">
                                                            <Save className="w-8 h-8 text-primary" />
                                                            <span className="text-[10px] mt-1">PDF</span>
                                                        </div>
                                                    ) : (
                                                        <img src={formData.qr_code} className="w-full h-full rounded-xl object-cover border border-white/10" />
                                                    )}
                                                    <button onClick={() => setFormData({ ...formData, qr_code: null })} className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white shadow-lg"><X className="w-3 h-3" /></button>
                                                </div>
                                            ) : (
                                                <div className="w-20 h-20 rounded-xl bg-white/5 flex items-center justify-center border border-dashed border-white/10">
                                                    <Save className="w-8 h-8 opacity-20" />
                                                </div>
                                            )}
                                            <Button variant="secondary" size="sm" className="w-full h-8 text-[11px] font-semibold" onClick={() => document.getElementById('qr-upload')?.click()}>
                                                Upload QR
                                            </Button>
                                            <input id="qr-upload" type="file" className="hidden" accept="image/*,application/pdf" onChange={handleQRSelect} />
                                        </div>
                                    </div>

                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                                    <Textarea
                                        placeholder="Describe the offer details..."
                                        className="bg-white/5 border-white/10 rounded-xl min-h-[100px] focus:ring-primary"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter className="mt-2">
                                <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="rounded-xl">Cancel</Button>
                                <Button onClick={handleSubmit} className="rounded-xl bg-primary hover:bg-primary-glow text-primary-foreground font-bold px-8">
                                    {editingId ? "Update Privilege" : "Save Privilege"}
                                </Button>
                            </DialogFooter>

                        </DialogContent>
                    </Dialog>

                    {/* Cropper Modal */}
                    {isCropperOpen && selectedImage && (
                        <ImageCropper
                            image={selectedImage}
                            isOpen={isCropperOpen}
                            onCancel={() => {
                                setIsCropperOpen(false);
                                setSelectedImage(null);
                                setCroppingType(null);
                            }}
                            onCropComplete={handleCropComplete}
                            aspect={croppingType === "logo" ? 1 : 618 / 900}
                            targetWidth={croppingType === "logo" ? undefined : 618}
                            targetHeight={croppingType === "logo" ? undefined : 900}
                            cropShape={croppingType === "logo" ? "round" : "rect"}
                            title={croppingType === "logo" ? "Crop Brand Logo" : "Crop Banner Image (618x900)"}
                        />
                    )}

                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        [1, 2, 3].map(i => <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />)
                    ) : privileges.length === 0 ? (
                        <div className="col-span-full h-60 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl text-muted-foreground">
                            <Gift className="w-12 h-12 mb-4 opacity-20" />
                            <p>No privileges configured yet</p>
                        </div>
                    ) : (
                        privileges.map((p) => {
                            const Icon = iconMap[p.icon] || Gift;
                            return (
                                <Card key={p.id} className={`bg-white/5 border-white/10 rounded-2xl overflow-hidden group hover:border-white/20 transition-all duration-300 ${!p.is_active ? 'grayscale opacity-60' : ''}`}>
                                    <CardHeader className="pb-4">
                                        <div className="flex justify-between items-start">
                                            {p.logo ? (
                                                <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10">
                                                    <img src={p.logo} alt={p.brand} className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className={`p-3 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors`}>
                                                    <Icon className="w-5 h-5 text-primary" />
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                    onClick={(e) => handleEdit(e, p)}
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                    onClick={() => handleStatusToggle(p.id, p.is_active)}
                                                    title={p.is_active ? "Deactivate" : "Activate"}
                                                >
                                                    <Settings2 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-red-400"
                                                    onClick={() => handleDelete(p.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>

                                        </div>
                                        <div className="mt-4">
                                            <CardTitle className="text-lg">{p.brand}</CardTitle>
                                            <CardDescription className="text-primary font-medium">{p.offer}</CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                            {p.description}
                                        </p>
                                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                                                Variant: <span className="text-foreground">{p.variant}</span>
                                            </span>
                                            <span className="text-[10px] font-medium text-muted-foreground">
                                                {p.expires_in || "No expiry"}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default PrivilegeList;
