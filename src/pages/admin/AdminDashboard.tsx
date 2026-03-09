import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiCall } from "@/lib/api";
import { 
    Users, 
    Shield, 
    Gift, 
    TrendingUp, 
    ArrowUpRight, 
    ArrowDownRight,
    Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Stats {
    total_users: number;
    customers: number;
    staff: number;
    management: number;
    admins: number;
    active_privileges: number;
}

const AdminDashboard = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await apiCall("/admin/stats");
                const data = await response.json();
                if (data.success) {
                    setStats(data.stats);
                }
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        { title: "Total Users", value: stats?.total_users || 0, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10", trend: "+12%", trendUp: true },
        { title: "System Admins", value: stats?.admins || 0, icon: Shield, color: "text-red-400", bg: "bg-red-400/10", trend: "Main", trendUp: true },
        { title: "Staff Members", value: stats?.staff || 0, icon: Activity, color: "text-purple-400", bg: "bg-purple-400/10", trend: "Active", trendUp: true },
        { title: "Active Privileges", value: stats?.active_privileges || 0, icon: Gift, color: "text-amber-400", bg: "bg-amber-400/10", trend: "+2", trendUp: true },
    ];

    return (
        <AdminLayout title="Dashboard Overview">
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-white/5 rounded-2xl" />
                    ))}
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {statCards.map((stat, index) => (
                            <Card key={index} className="bg-white/5 border-white/10 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-3 rounded-xl ${stat.bg}`}>
                                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                        </div>
                                        <div className={`flex items-center gap-1 text-xs font-medium ${stat.trendUp ? "text-emerald-400" : "text-red-400"}`}>
                                            {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                            {stat.trend}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                        <h3 className="text-2xl font-bold mt-1 tracking-tight">{stat.value}</h3>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Chart / Main Section Placeholder */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2 bg-white/5 border-white/10 rounded-2xl min-h-[400px]">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-primary" />
                                    Growth Overview
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center text-muted-foreground">
                                <div className="text-center">
                                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p>Activity visualization will appear here</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/5 border-white/10 rounded-2xl">
                             <CardHeader>
                                <CardTitle className="text-lg">System Health</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {[
                                    { label: "API Latency", value: "24ms", status: "emerald" },
                                    { label: "Database Load", value: "12%", status: "emerald" },
                                    { label: "Storage", value: "82%", status: "amber" },
                                    { label: "Uptime", value: "99.9%", status: "emerald" },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">{item.label}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium">{item.value}</span>
                                            <div className={`w-2 h-2 rounded-full bg-${item.status}-400 shadow-[0_0_8px_rgba(var(--${item.status}),0.5)]`} />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminDashboard;
