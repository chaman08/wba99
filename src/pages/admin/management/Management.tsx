import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Plus,
    Users,
    Settings,
    ShieldCheck,
    Building2,
    Link2,
    Layers
} from "lucide-react";
import { DataTable } from "../../../components/common/DataTable";
import { EmptyState } from "../../../components/common/EmptyState";
import { Modal } from "../../../components/common/Modal";

interface Category {
    id: string;
    name: string;
    description: string;
    profileCount: number;
}

interface Group {
    id: string;
    name: string;
    category: string;
    profileCount: number;
    assignedUsers: string;
}

interface UserAccess {
    id: string;
    name: string;
    groups: string;
    email: string;
    dateCreated: string;
    role: string;
}

const mockCategories: Category[] = [
    { id: "1", name: "Performance", description: "High-level athletic performance tracking", profileCount: 24 },
    { id: "2", name: "Rehabilitation", description: "Injury recovery and physiotherapy", profileCount: 15 },
    { id: "3", name: "Clinical", description: "Standard clinical assessments", profileCount: 42 },
];

const mockGroups: Group[] = [
    { id: "1", name: "Junior Squad", category: "Performance", profileCount: 12, assignedUsers: "Dr. Smith, Coach Mike" },
    { id: "2", name: "ACL Recovery", category: "Rehabilitation", profileCount: 8, assignedUsers: "Dr. Jones" },
    { id: "3", name: "Corporate Fitness", category: "Performance", profileCount: 20, assignedUsers: "Dr. Smith" },
];

const mockUsers: UserAccess[] = [
    { id: "1", name: "Dr. Alan Smith", groups: "Junior Squad, Corporate Fitness", email: "alan@wba99.com", dateCreated: "2024-01-10", role: "Clinician" },
    { id: "2", name: "Sarah Miller", groups: "All Groups", email: "sarah@wba99.com", dateCreated: "2023-11-05", role: "Admin" },
    { id: "3", name: "Coach Mike", groups: "Junior Squad", email: "mike@wba99.com", dateCreated: "2024-02-15", role: "Assistant" },
];

export const Management = () => {
    const { tab } = useParams();
    const navigate = useNavigate();
    const currentTab = tab || "categories";
    const [isModalOpen, setIsModalOpen] = useState(false);

    const tabs = [
        { id: "categories", label: "Categories", icon: Layers },
        { id: "groups", label: "Groups", icon: Users },
        { id: "user-access", label: "User Access", icon: ShieldCheck },
        { id: "settings", label: "Settings", icon: Settings },
        { id: "organisation", label: "Organisation", icon: Building2 },
        { id: "integration", label: "Integration", icon: Link2 },
    ];

    const categoryColumns = [
        { key: "name" as const, header: "Category Name", sortable: true },
        { key: "description" as const, header: "Description" },
        { key: "profileCount" as const, header: "Number of Profiles", sortable: true },
        { key: "actions" as const, header: "" }
    ];

    const groupColumns = [
        { key: "name" as const, header: "Group Name", sortable: true },
        { key: "category" as const, header: "Category", sortable: true },
        { key: "profileCount" as const, header: "Number of Profiles", sortable: true },
        { key: "assignedUsers" as const, header: "Assigned Users" },
        { key: "actions" as const, header: "" }
    ];

    const userColumns = [
        { key: "name" as const, header: "User Name", sortable: true },
        {
            key: "role" as const, header: "Role", render: (u: UserAccess) => (
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${u.role === 'Admin' ? 'bg-purple-50 text-purple-600' :
                    u.role === 'Clinician' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-600'
                    }`}>
                    {u.role}
                </span>
            )
        },
        { key: "groups" as const, header: "Assigned Groups" },
        { key: "email" as const, header: "Email" },
        { key: "dateCreated" as const, header: "Date Created", sortable: true },
        { key: "actions" as const, header: "" }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-[#0F172A]">Management</h2>
                    <p className="text-sm text-slate-500">Manage your organisation's structure and access.</p>
                </div>
                {currentTab === 'categories' && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        Create Category
                    </button>
                )}
                {currentTab === 'groups' && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        Create Group
                    </button>
                )}
                {currentTab === 'user-access' && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        Create User
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto scrollbar-none">
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => navigate(`/app/admin/management/${t.id}`)}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all relative whitespace-nowrap ${currentTab === t.id
                            ? "text-[#0F172A]"
                            : "text-slate-500 hover:text-slate-700"
                            }`}
                    >
                        <t.icon className="h-4 w-4" />
                        {t.label}
                        {currentTab === t.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F172A] rounded-t-full" />
                        )}
                    </button>
                ))}
            </div>

            <div className="pt-2">
                {currentTab === "categories" && (
                    mockCategories.length > 0 ? (
                        <DataTable columns={categoryColumns} data={mockCategories} uniqueKey="id" />
                    ) : (
                        <EmptyState
                            title="No Categories Yet"
                            description="Categories help you organize your profiles into logical buckets."
                            actionLabel="Create First Category"
                        />
                    )
                )}

                {currentTab === "groups" && (
                    mockGroups.length > 0 ? (
                        <DataTable columns={groupColumns} data={mockGroups} uniqueKey="id" />
                    ) : (
                        <EmptyState
                            title="No Groups Yet"
                            description="Groups allow you to monitor performance for specific squads or teams."
                            actionLabel="Create First Group"
                        />
                    )
                )}

                {currentTab === "user-access" && (
                    <DataTable columns={userColumns} data={mockUsers} uniqueKey="id" />
                )}

                {currentTab === "settings" && (
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
                                <Settings className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-bold text-[#0F172A]">System Settings</h3>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Date Format</label>
                                <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200">
                                    <option>DD/MM/YYYY</option>
                                    <option>MM/DD/YYYY</option>
                                    <option>YYYY-MM-DD</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Measurement System</label>
                                <div className="flex gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input type="radio" name="unit" className="w-4 h-4 text-[#0F172A] border-slate-300 focus:ring-[#0F172A]" defaultChecked />
                                        <span className="text-sm font-medium text-slate-700 group-hover:text-[#0F172A] transition-colors">Metric (kg, cm, Celsius)</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input type="radio" name="unit" className="w-4 h-4 text-[#0F172A] border-slate-300 focus:ring-[#0F172A]" />
                                        <span className="text-sm font-medium text-slate-700 group-hover:text-[#0F172A] transition-colors">Imperial (lb, in, Fahrenheit)</span>
                                    </label>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Push Notifications</label>
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <div>
                                        <p className="text-sm font-medium text-slate-700">Enable Desktop Alerts</p>
                                        <p className="text-[10px] text-slate-500">Get notified about new assessment submissions</p>
                                    </div>
                                    <div className="w-10 h-6 bg-[#0F172A] rounded-full relative cursor-pointer">
                                        <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full shadow-sm" />
                                    </div>
                                </div>
                            </div>
                            <button className="w-full sm:w-auto px-8 py-3 bg-[#0F172A] text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-md active:scale-[0.98]">
                                Save Changes
                            </button>
                        </div>
                    </div>
                )}

                {currentTab === "organisation" && (
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
                                <Building2 className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-bold text-[#0F172A]">Organisation Details</h3>
                        </div>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Organisation Name</label>
                                    <input type="text" defaultValue="WBA99 Pro Performance" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Type</label>
                                    <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200">
                                        <option>Sports Team / Academy</option>
                                        <option>Private Clinic</option>
                                        <option>Hospital / Medical Center</option>
                                        <option>Research Institute</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Primary Address</label>
                                <textarea rows={2} defaultValue="123 Elite Way, Performance Park, London, UK" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Website</label>
                                    <input type="url" defaultValue="https://wba99.pro" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Contact Email</label>
                                    <input type="email" defaultValue="contact@wba99.pro" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Organisation Logo</label>
                                <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                    <div className="h-16 w-16 bg-white rounded-xl flex items-center justify-center border border-slate-200 text-[#0F172A] font-bold text-xl">
                                        WBA
                                    </div>
                                    <div className="space-y-1">
                                        <button className="text-sm font-bold text-[#0F172A] hover:underline">Click to upload</button>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">PNG, JPG up to 5MB (400x400 recommended)</p>
                                    </div>
                                </div>
                            </div>
                            <button className="w-full sm:w-auto px-8 py-3 bg-[#0F172A] text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-md active:scale-[0.98]">
                                Update Organisation
                            </button>
                        </div>
                    </div>
                )}

                {currentTab === "integration" && (
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
                                <Link2 className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-bold text-[#0F172A]">Third-Party Integrations</h3>
                        </div>
                        <div className="space-y-4">
                            {[
                                { name: "Google Calendar", desc: "Sync assessment schedules with your team.", status: "Connected", icon: "GC" },
                                { name: "TrainingPeaks", desc: "Export exercise protocols directly to athlete accounts.", status: "Disconnected", icon: "TP" },
                                { name: "Electronic Health Records (EHR)", desc: "Sync clinical data with standard hospital systems.", status: "Setup Required", icon: "EH" }
                            ].map((integration) => (
                                <div key={integration.name} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-400">
                                            {integration.icon}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-[#0F172A]">{integration.name}</p>
                                            <p className="text-xs text-slate-500">{integration.desc}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${integration.status === 'Connected' ? 'bg-green-100 text-green-700' :
                                            integration.status === 'Disconnected' ? 'bg-slate-200 text-slate-600' : 'bg-orange-100 text-orange-700'
                                        }`}>
                                        {integration.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={
                    currentTab === 'categories' ? 'Create New Category' :
                        currentTab === 'groups' ? 'Create New Group' :
                            'Invite New User'
                }
                footer={
                    <>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="px-6 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            className="px-6 py-2 bg-[#0F172A] text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
                            onClick={() => setIsModalOpen(false)}
                        >
                            {currentTab === 'user-access' ? 'Send Invitation' : 'Create'}
                        </button>
                    </>
                }
            >
                {currentTab === 'categories' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Category Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Performance Elite"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Description</label>
                            <textarea
                                rows={3}
                                placeholder="Briefly describe what this category covers..."
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
                            />
                        </div>
                    </div>
                )}

                {currentTab === 'groups' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Group Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Junior Squad A"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Category</label>
                            <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all appearance-none cursor-pointer">
                                <option>Performance</option>
                                <option>Rehabilitation</option>
                                <option>Clinical</option>
                            </select>
                        </div>
                    </div>
                )}

                {currentTab === 'user-access' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Full Name</label>
                            <input
                                type="text"
                                placeholder="John Doe"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Email Address</label>
                            <input
                                type="email"
                                placeholder="john@example.com"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Role</label>
                            <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all appearance-none cursor-pointer">
                                <option>Clinician</option>
                                <option>Admin</option>
                                <option>Assistant</option>
                                <option>Owner</option>
                            </select>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
