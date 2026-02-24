import { useMemo } from "react";
import {
    Users,
    Activity,
    TrendingUp,
    AlertCircle,
    FileText,
    Calendar
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { ChartCard } from "../../../components/common/ChartCard";
import { useAppStore } from "../../../store/useAppStore";

interface MetricCardProps {
    title: string;
    value: string | number;
    change: string;
    isPositive: boolean;
    icon: any;
    color: string;
}

const MetricCard = ({ title, value, change, isPositive, icon: Icon, color }: MetricCardProps) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-start justify-between">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {isPositive ? <TrendingUp className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                {change}
            </div>
        </div>
        <div className="mt-4">
            <h3 className="text-sm font-medium text-slate-500">{title}</h3>
            <p className="text-2xl font-bold text-[#0F172A] mt-1">{value}</p>
        </div>
    </div>
);

export const AdminDashboard = () => {
    const { profiles, assessments, reports, categories, authUser } = useAppStore();

    const metrics = useMemo(() => {
        const totalProfiles = profiles.length;
        const activeAssessments = assessments.filter(a => a.status === 'Submitted' || a.status === 'In Review' || a.status === 'Assigned').length;
        const reportsGenerated = reports.length;

        // Calculate average score if possible, otherwise mock it for now but based on real data existence
        const avgScore = profiles.reduce((acc, p) => acc + (p.summary?.latestScores?.postureScore || 0), 0) / (profiles.length || 1);

        return {
            totalProfiles,
            activeAssessments,
            reportsGenerated,
            avgScore: profiles.length ? `${Math.round(avgScore)}%` : "N/A"
        };
    }, [profiles, assessments, reports]);

    const distributionData = useMemo(() => {
        return categories.map(cat => {
            const count = profiles.filter(p => p.categoryId === cat.id).length;
            const percentage = profiles.length ? Math.round((count / profiles.length) * 100) : 0;
            return {
                name: cat.name.substring(0, 10),
                value: percentage
            };
        }).filter(d => d.value > 0);
    }, [categories, profiles]);

    // Mock trend for the chart but keep it static for now as we don't have historical data in the store directly
    const activityTrend = [
        { name: 'Mon', value: 10 },
        { name: 'Tue', value: 20 },
        { name: 'Wed', value: 15 },
        { name: 'Thu', value: 30 },
        { name: 'Fri', value: 25 },
        { name: 'Sat', value: 40 },
        { name: 'Sun', value: Math.max(assessments.length, 5) },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#0F172A]">Good Morning, {authUser?.name?.split(' ')[0] || 'Admin'}</h2>
                    <p className="text-sm text-slate-500">Here's what's happening with your organisation today.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 text-sm font-medium text-slate-600 shadow-sm">
                    <Calendar className="h-4 w-4" />
                    {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Profiles"
                    value={metrics.totalProfiles.toLocaleString()}
                    change="+0%"
                    isPositive={true}
                    icon={Users}
                    color="bg-blue-500"
                />
                <MetricCard
                    title="Active Assessments"
                    value={metrics.activeAssessments.toLocaleString()}
                    change="+0%"
                    isPositive={true}
                    icon={Activity}
                    color="bg-purple-500"
                />
                <MetricCard
                    title="Reports Generated"
                    value={metrics.reportsGenerated.toLocaleString()}
                    change="+0%"
                    isPositive={true}
                    icon={FileText}
                    color="bg-orange-500"
                />
                <MetricCard
                    title="Avg. Posture Score"
                    value={metrics.avgScore}
                    change="+0%"
                    isPositive={true}
                    icon={TrendingUp}
                    color="bg-green-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ChartCard
                        title="Activity Overview"
                        subtitle="Recent assessment submissions"
                        averageValue={`${assessments.length} total`}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={activityTrend}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0F172A" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#0F172A" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94A3B8', fontSize: 12 }}
                                    dy={10}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#0F172A"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>

                <div className="lg:col-span-1">
                    <ChartCard
                        title="Category Distribution"
                        subtitle="Percentage share of profiles"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={distributionData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                                <XAxis type="number" hide={true} />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
                                />
                                <Tooltip
                                    formatter={(value) => [`${value}%`, 'Share']}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" fill="#0F172A" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-[#0F172A]">Recent Activity</h3>
                    <p className="text-sm text-slate-500 uppercase font-bold tracking-wider">Historical Log</p>
                </div>
                <div className="space-y-4">
                    {assessments.slice(0, 3).map((a) => (
                        <div key={a.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <Activity className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-[#0F172A]">{a.type.toUpperCase()} Assessment: {a.id.substring(0, 8)}</p>
                                    <p className="text-xs text-slate-500">Status: {a.status}</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                                {typeof a.createdAt === 'string' ? new Date(a.createdAt).toLocaleDateString() : new Date(a.createdAt.seconds * 1000).toLocaleDateString()}
                            </span>
                        </div>
                    ))}
                    {assessments.length === 0 && (
                        <p className="text-center py-8 text-slate-400 text-sm italic">No recent assessment activity found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
