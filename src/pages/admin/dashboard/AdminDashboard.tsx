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

const data = [
    { name: 'Mon', value: 40 },
    { name: 'Tue', value: 30 },
    { name: 'Wed', value: 60 },
    { name: 'Thu', value: 45 },
    { name: 'Fri', value: 75 },
    { name: 'Sat', value: 55 },
    { name: 'Sun', value: 80 },
];

const distributionData = [
    { name: 'Perf', value: 45 },
    { name: 'Rehab', value: 30 },
    { name: 'Clinical', value: 25 },
];

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
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#0F172A]">Good Morning, Admin</h2>
                    <p className="text-sm text-slate-500">Here's what's happening with your organisation today.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 text-sm font-medium text-slate-600 shadow-sm">
                    <Calendar className="h-4 w-4" />
                    Feb 24, 2026 - Mar 02, 2026
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Profiles"
                    value="1,284"
                    change="+12.5%"
                    isPositive={true}
                    icon={Users}
                    color="bg-blue-500"
                />
                <MetricCard
                    title="Active Assessments"
                    value="452"
                    change="+5.2%"
                    isPositive={true}
                    icon={Activity}
                    color="bg-purple-500"
                />
                <MetricCard
                    title="Reports Generated"
                    value="182"
                    change="-2.4%"
                    isPositive={false}
                    icon={FileText}
                    color="bg-orange-500"
                />
                <MetricCard
                    title="Avg. Performance"
                    value="78.4%"
                    change="+4.1%"
                    isPositive={true}
                    icon={TrendingUp}
                    color="bg-green-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ChartCard
                        title="Activity Over Time"
                        subtitle="Assessment submissions per day"
                        averageValue="54 / day"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
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
                                <YAxis hide={true} />
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
                    <h3 className="text-lg font-bold text-[#0F172A]">Pending Actions</h3>
                    <button className="text-sm font-bold text-[#0F172A] hover:underline uppercase">Process All</button>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                    <AlertCircle className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-[#0F172A]">Signature Required: ACL Recovery Group</p>
                                    <p className="text-xs text-slate-500">Dr. Smith requested oversight approval for 12 new assessments.</p>
                                </div>
                            </div>
                            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-[#0F172A] hover:bg-slate-50 transition-colors">
                                Review
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
