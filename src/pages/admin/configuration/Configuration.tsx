import { useParams, useNavigate } from "react-router-dom";
import {
    FileText,
    Dumbbell,
    Target,
    BookOpen,
    Plus,
    Clock,
    ChevronRight
} from "lucide-react";
import { DataTable } from "../../../components/common/DataTable";

interface ConfigItem {
    id: string;
    name: string;
    type: string;
    lastModified: string;
    duration?: string;
}

const mockTemplates: ConfigItem[] = [
    { id: "t1", name: "Elite Athlete Mobility", type: "Mobility", lastModified: "2024-02-20" },
    { id: "t2", name: "Post-ACL Surgery Phase 1", type: "Rehab", lastModified: "2024-02-15" },
    { id: "t3", name: "Youth Movement Quality", type: "Assessment", lastModified: "2024-01-10" },
];

const mockDrills: ConfigItem[] = [
    { id: "d1", name: "Glute Activation", type: "Warm-up", lastModified: "2024-02-18", duration: "5 min" },
    { id: "d2", name: "Lateral Plyometrics", type: "Power", lastModified: "2024-02-10", duration: "10 min" },
    { id: "d3", name: "Thoracic Rotation", type: "Mobility", lastModified: "2023-12-05", duration: "3 min" },
];

export const Configuration = () => {
    const { tab } = useParams();
    const navigate = useNavigate();
    const activeTab = tab || "templates";

    const tabs = [
        { id: "templates", label: "Templates", icon: FileText },
        { id: "training", label: "Training", icon: Dumbbell },
        { id: "drills", label: "Drills", icon: Target },
        { id: "education", label: "Education", icon: BookOpen },
    ];

    const columns = [
        {
            key: "name" as const, header: "Resolution Name", sortable: true, render: (item: ConfigItem) => (
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                        {activeTab === 'templates' && <FileText className="h-4 w-4" />}
                        {activeTab === 'training' && <Dumbbell className="h-4 w-4" />}
                        {activeTab === 'drills' && <Target className="h-4 w-4" />}
                        {activeTab === 'education' && <BookOpen className="h-4 w-4" />}
                    </div>
                    <span className="font-medium text-[#0F172A]">{item.name}</span>
                </div>
            )
        },
        { key: "type" as const, header: "Category", sortable: true },
        { key: "lastModified" as const, header: "Last Modified", sortable: true },
        { key: "actions" as const, header: "" }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-[#0F172A]">Configuration</h2>
                    <p className="text-sm text-slate-500">Define global templates and protocol building blocks.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm">
                    <Plus className="h-4 w-4" />
                    Create New
                </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-200">
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => navigate(`/app/admin/configuration/${t.id}`)}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all relative ${activeTab === t.id
                            ? "text-[#0F172A]"
                            : "text-slate-500 hover:text-slate-700"
                            }`}
                    >
                        <t.icon className="h-4 w-4" />
                        {t.label}
                        {activeTab === t.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F172A] rounded-t-full" />
                        )}
                    </button>
                ))}
            </div>

            <div className="pt-2">
                {activeTab === "templates" && (
                    <DataTable columns={columns} data={mockTemplates} uniqueKey="id" />
                )}
                {activeTab === "training" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm group hover:border-[#0F172A] transition-all cursor-pointer">
                                <div className="h-40 w-full bg-slate-50 rounded-xl mb-4 flex items-center justify-center">
                                    <Dumbbell className="h-12 w-12 text-slate-200" />
                                </div>
                                <h3 className="font-bold text-[#0F172A]">Advanced Plyometrics {i}</h3>
                                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 45 min</span>
                                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                                    <span>8 Videos</span>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded">Performance</span>
                                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#0F172A] transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {activeTab === "drills" && (
                    <DataTable columns={columns} data={mockDrills} uniqueKey="id" />
                )}
                {activeTab === "education" && (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-[#0F172A] transition-all cursor-pointer">
                                <div className="h-16 w-16 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <BookOpen className="h-8 w-8 text-slate-200" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-[#0F172A]">Injury Prevention Basics - Module {i}</h3>
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">Essential guide for young athletes to prevent common injuries through mobility and awareness.</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                                        <p className="text-xs font-bold text-green-600">Published</p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#0F172A] transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
