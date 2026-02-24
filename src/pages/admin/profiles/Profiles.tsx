import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Upload, Filter } from "lucide-react";
import { DataTable } from "../../../components/common/DataTable";

interface Profile {
    id: string;
    name: string;
    email: string;
    dob: string;
    weight: string;
    height: string;
    group: string;
    clinician: string;
}

const mockProfiles: Profile[] = [
    { id: "1", name: "John Doe", email: "john@example.com", dob: "1990-05-15", weight: "75kg", height: "180cm", group: "Performance A", clinician: "Dr. Smith" },
    { id: "2", name: "Jane Smith", email: "jane@example.com", dob: "1992-08-20", weight: "62kg", height: "165cm", group: "Rehab Alpha", clinician: "Dr. Jones" },
    { id: "3", name: "Mike Ross", email: "mike@example.com", dob: "1988-12-10", weight: "85kg", height: "188cm", group: "Performance A", clinician: "Dr. Smith" },
    { id: "4", name: "Sarah Connor", email: "sarah@example.com", dob: "1985-03-25", weight: "58kg", height: "160cm", group: "Clinical Alpha", clinician: "Dr. Brown" },
    { id: "5", name: "Harvey Specter", email: "harvey@example.com", dob: "1980-01-01", weight: "80kg", height: "185cm", group: "Executive", clinician: "Dr. Smith" },
];

export const Profiles = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGroup, setSelectedGroup] = useState("all");

    const columns = [
        {
            key: "name" as const,
            header: "Profile Name",
            sortable: true,
            render: (p: Profile) => (
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-medium text-xs">
                        {p.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <span className="font-medium text-[#0F172A]">{p.name}</span>
                </div>
            )
        },
        { key: "email" as const, header: "Email", sortable: true },
        { key: "dob" as const, header: "Date of Birth", sortable: true },
        { key: "weight" as const, header: "Weight" },
        { key: "height" as const, header: "Height" },
        {
            key: "group" as const,
            header: "Assigned Group",
            render: (p: Profile) => (
                <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
                    {p.group}
                </span>
            )
        },
        { key: "clinician" as const, header: "Clinician" },
        { key: "actions" as const, header: "" }
    ];

    const filteredProfiles = mockProfiles.filter(p =>
        (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedGroup === "all" || p.group === selectedGroup)
    );

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
                            <option value="Performance A">Performance A</option>
                            <option value="Rehab Alpha">Rehab Alpha</option>
                            <option value="Clinical Alpha">Clinical Alpha</option>
                            <option value="Executive">Executive</option>
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
