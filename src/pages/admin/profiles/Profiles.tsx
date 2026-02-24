import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Upload, Filter } from "lucide-react";
import { DataTable } from "../../../components/common/DataTable";
import { useAppStore } from "../../../store/useAppStore";
import type { Profile } from "../../../types";

export const Profiles = () => {
    const navigate = useNavigate();
    const { profiles, groups, users } = useAppStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGroup, setSelectedGroup] = useState("all");

    const columns = [
        {
            key: "fullName" as const,
            header: "Profile Name",
            sortable: true,
            render: (p: Profile) => (
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-medium text-xs">
                        {p.fullName.split(" ").map(n => n[0]).join("")}
                    </div>
                    <span className="font-medium text-[#0F172A]">{p.fullName}</span>
                </div>
            )
        },
        { key: "email" as const, header: "Email", sortable: true },
        {
            key: "dob" as const,
            header: "Date of Birth",
            sortable: true,
            render: (p: Profile) => {
                if (!p.dob) return "-";
                if (typeof p.dob === 'string') return p.dob;
                return new Date(p.dob.seconds * 1000).toLocaleDateString();
            }
        },
        {
            key: "weightKg" as const,
            header: "Weight",
            render: (p: Profile) => p.weightKg ? `${p.weightKg}kg` : "-"
        },
        {
            key: "heightCm" as const,
            header: "Height",
            render: (p: Profile) => p.heightCm ? `${p.heightCm}cm` : "-"
        },
        {
            key: "groupId" as const,
            header: "Assigned Group",
            render: (p: Profile) => {
                const group = groups.find(g => g.id === p.groupId);
                return (
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
                        {group?.name || "Unassigned"}
                    </span>
                );
            }
        },
        {
            key: "assignedClinicianIds" as const,
            header: "Clinician",
            render: (p: Profile) => {
                if (!p.assignedClinicianIds?.length) return "-";
                const clinician = users.find(u => u.uid === p.assignedClinicianIds[0]);
                return clinician?.name || "-";
            }
        },
        { key: "actions" as const, header: "" }
    ];

    const filteredProfiles = useMemo(() => {
        return profiles.filter(p =>
            (p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || p.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (selectedGroup === "all" || p.groupId === selectedGroup)
        );
    }, [profiles, searchTerm, selectedGroup]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-[#0F172A]">Profiles</h2>
                    <p className="text-sm text-slate-500">Manage and monitor all client/athlete profiles.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                        <Upload className="h-4 w-4" />
                        Bulk Upload
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm">
                        <Plus className="h-4 w-4" />
                        Create Profile
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <select
                            className="pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all appearance-none cursor-pointer"
                            value={selectedGroup}
                            onChange={(e) => setSelectedGroup(e.target.value)}
                        >
                            <option value="all">All Groups</option>
                            {groups.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={filteredProfiles}
                uniqueKey="id"
                selectable
                onSelectionChange={(ids: string[]) => console.log("Selected:", ids)}
                onRowClick={(p: Profile) => navigate(`/admin/profiles/${p.id}`)}
            />
        </div>
    );
};
