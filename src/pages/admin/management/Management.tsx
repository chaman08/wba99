import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Plus,
    Users,
    Settings,
    ShieldCheck,
    Building2,
    Link2,
    Layers,
    Loader2
} from "lucide-react";
import { DataTable } from "../../../components/common/DataTable";
import { EmptyState } from "../../../components/common/EmptyState";
import { Modal } from "../../../components/common/Modal";
import { useAppStore } from "../../../store/useAppStore";
import { toast } from "react-hot-toast";
import type { Category, Group, UserRole } from "../../../types";

export const Management = () => {
    const { tab } = useParams();
    const navigate = useNavigate();
    const {
        users,
        categories,
        groups,
        profiles,
        organisation,
        organisations,
        addCategory,
        addGroup,
        createInvite,
        updateOrganisation,
        updateOrganisationSettings
    } = useAppStore();

    const currentTab = tab || "categories";
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form states
    const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
    const [groupForm, setGroupForm] = useState({ name: "", categoryId: "" });
    const [userForm, setUserForm] = useState({ name: "", email: "", role: "clinician" as UserRole });
    const [orgForm, setOrgForm] = useState({
        name: organisation?.name || "",
        address1: organisation?.address1 || "",
        contactEmail: organisation?.contactEmail || ""
    });
    const [settingsForm, setSettingsForm] = useState({
        dateFormat: organisation?.settings?.dateFormat || "DD/MM/YYYY",
        measurementSystem: organisation?.settings?.measurementSystem || "metric"
    });

    const usersWithOrg = useMemo(() => {
        return users.map(u => {
            const org = organisations.find(o => o.id === u.orgId) || (u.orgId === organisation?.id ? organisation : null);
            return {
                ...u,
                organisationName: org?.name || 'Unknown Organisation'
            };
        });
    }, [users, organisations, organisation]);

    const tabs = [
        { id: "categories", label: "Categories", icon: Layers },
        { id: "groups", label: "Groups", icon: Users },
        { id: "user-access", label: "User Access", icon: ShieldCheck },
        { id: "settings", label: "Settings", icon: Settings },
        { id: "organisation", label: "Organisation", icon: Building2 },
        { id: "integration", label: "Integration", icon: Link2 },
    ];

    const handleCreateCategory = async () => {
        if (!categoryForm.name) return toast.error("Name is required");
        setIsSubmitting(true);
        try {
            await addCategory(categoryForm.name, categoryForm.description);
            toast.success("Category created successfully");
            setIsModalOpen(false);
            setCategoryForm({ name: "", description: "" });
        } catch (error) {
            toast.error("Failed to create category");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateGroup = async () => {
        if (!groupForm.name || !groupForm.categoryId) return toast.error("All fields are required");
        setIsSubmitting(true);
        try {
            await addGroup(groupForm.name, groupForm.categoryId);
            toast.success("Group created successfully");
            setIsModalOpen(false);
            setGroupForm({ name: "", categoryId: "" });
        } catch (error) {
            toast.error("Failed to create group");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInviteUser = async () => {
        if (!userForm.name || !userForm.email) return toast.error("All fields are required");
        setIsSubmitting(true);
        try {
            const inviteLink = await createInvite(userForm.email, userForm.role);
            // In a real app, this would send an email via Firebase/SendGrid. 
            // For now we'll just show the link or success.
            await navigator.clipboard.writeText(inviteLink);
            toast.success("Invite link copied to clipboard");
            setIsModalOpen(false);
            setUserForm({ name: "", email: "", role: "clinician" });
        } catch (error) {
            toast.error("Failed to create invite");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateOrg = async () => {
        setIsSubmitting(true);
        try {
            await updateOrganisation(orgForm);
            toast.success("Organisation updated");
        } catch (error) {
            toast.error("Update failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateSettings = async () => {
        setIsSubmitting(true);
        try {
            await updateOrganisationSettings(settingsForm as any);
            toast.success("Settings updated");
        } catch (error) {
            toast.error("Update failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const categoryColumns = [
        { key: "name" as const, header: "Category Name", sortable: true },
        { key: "description" as const, header: "Description" },
        {
            key: "id" as const, // We use ID to calculate count
            header: "Number of Profiles",
            sortable: true,
            render: (c: Category) => {
                const count = profiles.filter(p => p.categoryId === c.id).length;
                return count.toString();
            }
        },
        { key: "actions" as const, header: "" }
    ];

    const groupColumns = [
        { key: "name" as const, header: "Group Name", sortable: true },
        {
            key: "categoryId" as const,
            header: "Category",
            sortable: true,
            render: (g: Group) => {
                const cat = categories.find(c => c.id === g.categoryId);
                return cat?.name || "Uncategorized";
            }
        },
        {
            key: "profileCount" as const,
            header: "Number of Profiles",
            sortable: true,
            render: (g: Group) => {
                const count = profiles.filter(p => p.groupId === g.id).length;
                return count.toString();
            }
        },
        {
            key: "assignedUserIds" as const,
            header: "Assigned Users",
            render: (g: Group) => {
                if (!g.assignedUserIds?.length) return "None";
                return g.assignedUserIds
                    .map(uid => users.find(u => u.uid === uid)?.name || "Unknown")
                    .join(", ");
            }
        },
        { key: "actions" as const, header: "" }
    ];

    const userColumns = [
        { key: "name" as const, header: "User Name", sortable: true },
        {
            key: "organisationName" as const,
            header: "Organisation",
            sortable: true
        },
        {
            key: "role" as const, header: "Role", render: (u: any) => (
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${u.role === 'owner' || u.role === 'admin' ? 'bg-purple-50 text-purple-600' :
                    u.role === 'clinician' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-600'
                    }`}>
                    {u.role}
                </span>
            )
        },
        {
            key: "allowedGroupIds" as const,
            header: "Assigned Groups",
            render: (u: any) => {
                if (u.allowedGroupIds?.includes("*")) return "All Groups";
                if (!u.allowedGroupIds?.length) return "None";
                return u.allowedGroupIds
                    .map((gid: string) => groups.find(g => g.id === gid)?.name || gid)
                    .join(", ");
            }
        },
        { key: "email" as const, header: "Email" },
        {
            key: "createdAt" as const,
            header: "Date Created",
            sortable: true,
            render: (u: any) => {
                if (!u.createdAt) return "-";
                const date = typeof u.createdAt === 'string' ? new Date(u.createdAt) : new Date(u.createdAt.seconds * 1000);
                return date.toLocaleDateString();
            }
        },
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
                        Invite User
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="relative group">
                <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto scrollbar-none pr-8">
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => navigate(`/admin/management/${t.id}`)}
                            className={`flex items-center gap-2 px-4 sm:px-6 py-4 text-sm font-medium transition-all relative whitespace-nowrap ${currentTab === t.id
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
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#F8FAFC] to-transparent pointer-events-none md:hidden" />
            </div>

            <div className="pt-2">
                {currentTab === "categories" && (
                    categories.length > 0 ? (
                        <DataTable columns={categoryColumns} data={categories} uniqueKey="id" />
                    ) : (
                        <EmptyState
                            title="No Categories Yet"
                            description="Categories help you organize your profiles into logical buckets."
                            actionLabel="Create First Category"
                            onAction={() => setIsModalOpen(true)}
                        />
                    )
                )}

                {currentTab === "groups" && (
                    groups.length > 0 ? (
                        <DataTable columns={groupColumns} data={groups} uniqueKey="id" />
                    ) : (
                        <EmptyState
                            title="No Groups Yet"
                            description="Groups allow you to monitor performance for specific squads or teams."
                            actionLabel="Create First Group"
                            onAction={() => setIsModalOpen(true)}
                        />
                    )
                )}

                {currentTab === "user-access" && (
                    <DataTable columns={userColumns} data={usersWithOrg} uniqueKey="uid" />
                )}

                {currentTab === "settings" && (
                    <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-sm max-w-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
                                <Settings className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-bold text-[#0F172A]">System Settings</h3>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Date Format</label>
                                <select
                                    value={settingsForm.dateFormat}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, dateFormat: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                                >
                                    <option>DD/MM/YYYY</option>
                                    <option>MM/DD/YYYY</option>
                                    <option>YYYY-MM-DD</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Measurement System</label>
                                <div className="flex gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="unit"
                                            className="w-4 h-4 text-[#0F172A] border-slate-300 focus:ring-[#0F172A]"
                                            checked={settingsForm.measurementSystem === 'metric'}
                                            onChange={() => setSettingsForm({ ...settingsForm, measurementSystem: 'metric' })}
                                        />
                                        <span className="text-sm font-medium text-slate-700 group-hover:text-[#0F172A] transition-colors">Metric (kg, cm, Celsius)</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="unit"
                                            className="w-4 h-4 text-[#0F172A] border-slate-300 focus:ring-[#0F172A]"
                                            checked={settingsForm.measurementSystem === 'imperial'}
                                            onChange={() => setSettingsForm({ ...settingsForm, measurementSystem: 'imperial' })}
                                        />
                                        <span className="text-sm font-medium text-slate-700 group-hover:text-[#0F172A] transition-colors">Imperial (lb, in, Fahrenheit)</span>
                                    </label>
                                </div>
                            </div>
                            <button
                                onClick={handleUpdateSettings}
                                disabled={isSubmitting}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-[#0F172A] text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
                            >
                                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                )}

                {currentTab === "organisation" && (
                    <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-sm max-w-2xl">
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
                                    <input
                                        type="text"
                                        value={orgForm.name}
                                        onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                                    />
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
                                <textarea
                                    rows={2}
                                    value={orgForm.address1}
                                    onChange={(e) => setOrgForm({ ...orgForm, address1: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Website</label>
                                    <input type="url" placeholder="https://wba99.pro" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Contact Email</label>
                                    <input
                                        type="email"
                                        value={orgForm.contactEmail}
                                        onChange={(e) => setOrgForm({ ...orgForm, contactEmail: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleUpdateOrg}
                                disabled={isSubmitting}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-[#0F172A] text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
                            >
                                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
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
                            className="flex items-center gap-2 px-6 py-2 bg-[#0F172A] text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
                            disabled={isSubmitting}
                            onClick={
                                currentTab === 'categories' ? handleCreateCategory :
                                    currentTab === 'groups' ? handleCreateGroup :
                                        handleInviteUser
                            }
                        >
                            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
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
                                value={categoryForm.name}
                                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                placeholder="e.g. Performance Elite"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Description</label>
                            <textarea
                                rows={3}
                                value={categoryForm.description}
                                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
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
                                value={groupForm.name}
                                onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                                placeholder="e.g. Junior Squad A"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Category</label>
                            <select
                                value={groupForm.categoryId}
                                onChange={(e) => setGroupForm({ ...groupForm, categoryId: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">Select Category</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
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
                                value={userForm.name}
                                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                                placeholder="John Doe"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Email Address</label>
                            <input
                                type="email"
                                value={userForm.email}
                                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                                placeholder="john@example.com"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Role</label>
                            <select
                                value={userForm.role}
                                onChange={(e) => setUserForm({ ...userForm, role: e.target.value as UserRole })}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all appearance-none cursor-pointer"
                            >
                                <option value="clinician">Clinician</option>
                                <option value="admin">Admin</option>
                                <option value="assistant">Assistant</option>
                                <option value="owner">Owner</option>
                            </select>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
