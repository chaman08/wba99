import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Calendar,
    Weight,
    Ruler,
    Phone,
    MapPin,
    User,
    Users,
    ClipboardList,
    FileText,
    Activity,
    MessageSquare
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartCard } from "../../../components/common/ChartCard";

const trendData = [
    { name: 'Jan', value: 65 },
    { name: 'Feb', value: 72 },
    { name: 'Mar', value: 68 },
    { name: 'Apr', value: 85 },
    { name: 'May', value: 78 },
    { name: 'Jun', value: 92 },
];


export const ProfileDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("overview");

    // Mock data for the profile
    const profile = {
        id,
        name: "John Doe",
        email: "john@example.com",
        phone: "+91 98765 43210",
        dob: "1990-05-15",
        weight: "75kg",
        height: "180cm",
        group: "Performance A",
        clinician: "Dr. Smith",
        location: "Bangalore, India",
        address: "123, 5th Main, HSR Layout"
    };

    const tabs = [
        { id: "overview", label: "Overview", icon: User },
        { id: "assessments", label: "Assessments", icon: Activity },
        { id: "reports", label: "Reports", icon: FileText },
        { id: "programs", label: "Programs", icon: ClipboardList },
        { id: "notes", label: "Notes", icon: MessageSquare },
    ];

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-[#0F172A]">{profile.name}</h2>
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                        <span>ID: {profile.id}</span>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <span>{profile.group}</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-200">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all relative ${activeTab === tab.id
                            ? "text-[#0F172A]"
                            : "text-slate-500 hover:text-slate-700"
                            }`}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F172A] rounded-t-full" />
                        )}
                    </button>
                ))}
            </div>

            {activeTab === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Basic Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                            <div className="flex flex-col items-center">
                                <div className="h-24 w-24 rounded-3xl bg-[#0F172A]/5 flex items-center justify-center text-[#0F172A] font-bold text-3xl mb-4">
                                    JD
                                </div>
                                <h3 className="font-bold text-xl text-[#0F172A]">{profile.name}</h3>
                                <p className="text-sm text-slate-500">{profile.email}</p>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                        <Calendar className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase text-slate-400 font-bold">Date of Birth</p>
                                        <p className="text-sm font-medium text-[#0F172A]">{profile.dob}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                        <Weight className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase text-slate-400 font-bold">Weight</p>
                                        <p className="text-sm font-medium text-[#0F172A]">{profile.weight}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                        <Ruler className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase text-slate-400 font-bold">Height</p>
                                        <p className="text-sm font-medium text-[#0F172A]">{profile.height}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                        <Phone className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase text-slate-400 font-bold">Contact</p>
                                        <p className="text-sm font-medium text-[#0F172A]">{profile.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                        <MapPin className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase text-slate-400 font-bold">Location</p>
                                        <p className="text-sm font-medium text-[#0F172A] line-clamp-1">{profile.location}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h4 className="text-sm font-bold text-[#0F172A] mb-4">Assigned Team</h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                                            <Users className="h-4 w-4 text-[#0F172A]" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-[#0F172A]">{profile.group}</p>
                                            <p className="text-[10px] text-slate-500">Primary Group</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                                            <User className="h-4 w-4 text-[#0F172A]" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-[#0F172A]">{profile.clinician}</p>
                                            <p className="text-[10px] text-slate-500">Assigned Clinician</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Dynamic Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-sm font-bold text-[#0F172A]">Last Assessment Summary</h3>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mt-0.5">Feb 24, 2026 • Movement Risk Assessment</p>
                                </div>
                                <button className="text-[10px] font-bold text-[#0F172A] hover:underline uppercase">Full Report</button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Risk Score</p>
                                    <div className="flex items-end gap-2">
                                        <span className="text-2xl font-bold text-green-600">85</span>
                                        <span className="text-[10px] text-slate-400 mb-1">/100</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-1 font-medium">Low Risk</p>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Posture Symmetry</p>
                                    <div className="flex items-end gap-2">
                                        <span className="text-2xl font-bold text-[#0F172A]">92%</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-1 font-medium">Excellent</p>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Knee Valgus</p>
                                    <div className="flex items-end gap-2">
                                        <span className="text-2xl font-bold text-orange-500">12°</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-1 font-medium">Borderline</p>
                                </div>
                            </div>
                        </div>

                        <ChartCard
                            title="Performance Trend"
                            averageValue="77.5%"
                            subtitle="Overall movement quality score trend over time"
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94A3B8', fontSize: 10 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        hide={true}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#0F172A"
                                        strokeWidth={3}
                                        dot={{ fill: '#0F172A', r: 4 }}
                                        activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm px-0">
                            <div className="px-6 pb-4 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-[#0F172A]">Recent Assessments</h3>
                                <button className="text-[10px] font-bold text-[#0F172A] hover:underline uppercase">View All</button>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center">
                                                <Activity className="h-5 w-5 text-[#0F172A]" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-[#0F172A]">Movement Risk Assessment</p>
                                                <p className="text-xs text-slate-500">Performed by Dr. Smith • Feb 24, 2026</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right mr-4">
                                                <p className="text-xs font-bold text-green-600">85/100</p>
                                                <p className="text-[10px] text-slate-400">Low Risk</p>
                                            </div>
                                            <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
                                                <ArrowLeft className="h-4 w-4 rotate-180" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
