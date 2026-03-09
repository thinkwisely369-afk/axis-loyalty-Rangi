import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiCall } from "@/lib/api";
import { 
    Search, 
    Filter, 
    MoreVertical, 
    Shield, 
    User as UserIcon, 
    CheckCircle2, 
    XCircle,
    Edit2,
    UserPlus
} from "lucide-react";
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
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface User {
    id: number;
    name: string;
    mobile_number: string;
    role: string;
    policy_number: string | null;
    is_verified: boolean;
    created_at: string;
}

const UserList = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newUser, setNewUser] = useState({
        name: "",
        mobile_number: "",
        role: "staff"
    });

    const fetchUsers = async () => {
        try {
            const response = await apiCall(`/admin/users?search=${search}`);
            const data = await response.json();
            if (data.success) {
                setUsers(data.users.data);
            }
        } catch (error) {
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const handleRoleUpdate = async (userId: number, newRole: string) => {
        try {
            const response = await apiCall(`/admin/users/${userId}`, {
                method: "PATCH",
                body: JSON.stringify({ role: newRole })
            });
            const data = await response.json();
            if (data.success) {
                toast.success("User role updated");
                fetchUsers();
            }
        } catch (error) {
            toast.error("Failed to update user");
        }
    };

    const handleVerifyUpdate = async (userId: number, isVerified: boolean) => {
        try {
            const response = await apiCall(`/admin/users/${userId}`, {
                method: "PATCH",
                body: JSON.stringify({ is_verified: isVerified })
            });
            const data = await response.json();
            if (data.success) {
                toast.success(isVerified ? "User verified" : "User verification removed");
                fetchUsers();
            }
        } catch (error) {
            toast.error("Failed to update user");
        }
    };

    const handleAddUser = async () => {
        if (!newUser.name || !newUser.mobile_number) {
            toast.error("Please fill in all fields");
            return;
        }
        try {
            const response = await apiCall("/admin/users", {
                method: "POST",
                body: JSON.stringify(newUser)
            });
            const data = await response.json();
            if (data.success) {
                toast.success(data.message);
                setIsAddOpen(false);
                setNewUser({ name: "", mobile_number: "", role: "staff" });
                fetchUsers();
            } else {
                toast.error(data.errors?.mobile_number?.[0] || "Failed to add user");
            }
        } catch (error) {
            toast.error("An error occurred while adding user");
        }
    };

    return (
        <AdminLayout title="User Management">
            <div className="space-y-6">
                {/* Actions Bar */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search by name, phone or policy..." 
                            className="pl-10 bg-white/5 border-white/10 rounded-xl focus:ring-primary/20"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                            <DialogTrigger asChild>
                                <Button className="rounded-xl bg-primary hover:bg-primary-glow text-primary-foreground shadow-lg shadow-primary/20">
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Add Member
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-[#0A0A0B] border-white/10 text-foreground max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Add New Staff/Management</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Full Name</label>
                                        <Input 
                                            placeholder="e.g., John Doe" 
                                            className="bg-white/5 border-white/10 rounded-xl"
                                            value={newUser.name}
                                            onChange={e => setNewUser({...newUser, name: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Mobile Number</label>
                                        <Input 
                                            placeholder="e.g., 0771234567" 
                                            className="bg-white/5 border-white/10 rounded-xl"
                                            value={newUser.mobile_number}
                                            onChange={e => setNewUser({...newUser, mobile_number: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Role</label>
                                        <Select 
                                            value={newUser.role} 
                                            onValueChange={(v: any) => setNewUser({...newUser, role: v})}
                                        >
                                            <SelectTrigger className="bg-white/5 border-white/10 rounded-xl">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#0A0A0B] border-white/10">
                                                <SelectItem value="staff">Staff Member</SelectItem>
                                                <SelectItem value="management">Management</SelectItem>
                                                <SelectItem value="admin">System Admin</SelectItem>
                                                <SelectItem value="customer">Customer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="rounded-xl">Cancel</Button>
                                    <Button onClick={handleAddUser} className="rounded-xl bg-primary hover:bg-primary-glow">Create Account</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/5">
                            <Filter className="w-4 h-4 mr-2" />
                            Filters
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                    <Table>
                        <TableHeader className="bg-white/5">
                            <TableRow className="border-white/10 hover:bg-transparent">
                                <TableHead className="text-muted-foreground font-medium py-4">User</TableHead>
                                <TableHead className="text-muted-foreground font-medium">Policy Number</TableHead>
                                <TableHead className="text-muted-foreground font-medium">Role</TableHead>
                                <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                                <TableHead className="text-muted-foreground font-medium">Joined Date</TableHead>
                                <TableHead className="text-muted-foreground font-medium text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <TableRow key={i} className="border-white/10">
                                        <TableCell colSpan={6} className="h-20 animate-pulse bg-white/5" />
                                    </TableRow>
                                ))
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-60 text-center text-muted-foreground">
                                        No users found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id} className="border-white/10 hover:bg-white/5 transition-colors">
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center">
                                                    <UserIcon className="w-5 h-5 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-sm text-foreground">{user.name}</div>
                                                    <div className="text-xs text-muted-foreground">{user.mobile_number}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm font-mono text-muted-foreground">
                                                {user.policy_number || "—"}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                user.role === 'admin' ? 'bg-red-500/15 text-red-500' :
                                                user.role === 'management' ? 'bg-primary/15 text-primary' :
                                                user.role === 'staff' ? 'bg-purple-500/15 text-purple-400' :
                                                'bg-blue-500/15 text-blue-400'
                                            }`}>
                                                <Shield className="w-3 h-3" />
                                                {user.role}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {user.is_verified ? (
                                                <div className="flex items-center gap-1.5 text-emerald-400 text-sm">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Verified
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                                                    <XCircle className="w-4 h-4" />
                                                    Unverified
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="hover:bg-white/10">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-[#0A0A0B] border-white/10 text-foreground">
                                                    <DropdownMenuItem onClick={() => handleRoleUpdate(user.id, 'admin')} className="cursor-pointer hover:bg-white/5 text-red-400">
                                                        Make Admin
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleRoleUpdate(user.id, 'management')} className="cursor-pointer hover:bg-white/5">
                                                        Make Management
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleRoleUpdate(user.id, 'staff')} className="cursor-pointer hover:bg-white/5">
                                                        Make Staff
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleRoleUpdate(user.id, 'customer')} className="cursor-pointer hover:bg-white/5">
                                                        Make Customer
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        onClick={() => handleVerifyUpdate(user.id, !user.is_verified)}
                                                        className="cursor-pointer hover:bg-white/5 text-primary"
                                                    >
                                                        {user.is_verified ? "Unverify User" : "Verify User"}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default UserList;
