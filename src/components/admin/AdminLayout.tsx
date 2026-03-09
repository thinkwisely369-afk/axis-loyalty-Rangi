import { useNavigate, useLocation, Link } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    Gift,
    LogOut,
    ChevronLeft,
    Menu,
    X,
    Shield,
    Receipt,
    ShieldCheck
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AdminLayoutProps {
    children: React.ReactNode;
    title: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        toast.success("Logged out successfully");
        navigate("/login");
    };

    const navItems = [
        { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
        { name: "User Management", path: "/admin/users", icon: Users },
        { name: "Policy Numbers", path: "/admin/policies", icon: ShieldCheck },
        { name: "Privilege Cards", path: "/admin/privileges", icon: Gift },
        { name: "SnapCash Bills", path: "/admin/bills", icon: Receipt },
    ];

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-foreground flex">
            {/* Sidebar Desktop */}
            <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-black/40 backdrop-blur-xl">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <span className="font-bold text-xl tracking-tight">HNBA <span className="text-primary text-xs ml-1">ADMIN</span></span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${location.pathname === item.path
                                ? "bg-primary/20 text-primary shadow-[0_0_20px_rgba(var(--primary),0.1)]"
                                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium text-sm">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-all duration-300"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium text-sm">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                {/* Header */}
                <header className="h-20 border-b border-white/5 bg-black/20 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </Button>
                        <h1 className="text-xl font-bold tracking-tight">{title}</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" onClick={() => navigate("/")} className="hidden sm:flex rounded-xl border-white/10 hover:bg-white/5">
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            User View
                        </Button>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-secondary/40 border border-white/10 flex items-center justify-center overflow-hidden">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-6">
                    {children}
                </div>
            </main>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                    <aside className="absolute inset-y-0 left-0 w-72 bg-[#0A0A0B] border-r border-white/5 flex flex-col animate-slide-in">
                        <div className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Shield className="w-6 h-6 text-primary" />
                                <span className="font-bold text-lg">HNBA ADMIN</span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                                <X className="w-6 h-6" />
                            </Button>
                        </div>

                        <nav className="flex-1 px-4 py-6 space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${location.pathname === item.path
                                        ? "bg-primary/20 text-primary"
                                        : "text-muted-foreground hover:bg-white/5"
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            ))}
                        </nav>

                        <div className="p-4 border-t border-white/5">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-300"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="font-medium text-sm">Logout</span>
                            </button>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
};

export default AdminLayout;
