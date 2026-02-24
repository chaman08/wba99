import { useAppStore } from "../../store/useAppStore";
import { DataTable, type Column } from "../../components/common/DataTable";
import type { User, UserRole } from "../../types";
import { Shield, User as UserIcon, MoreHorizontal } from "lucide-react";
import { toast } from "react-hot-toast";

export const AdminUsers = () => {
  const users = useAppStore((state) => state.users);
  const updateUserRole = useAppStore((state) => state.updateUserRole);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await updateUserRole(userId, newRole);
      toast.success(`Role updated to ${newRole}`);
    } catch (error) {
      toast.error("Failed to update role");
      console.error(error);
    }
  };

  const getRoleLabel = (role: string) => {
    if (role === 'clinician') return 'Physio';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const columns: Column<User>[] = [
    {
      key: "name",
      header: "User",
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold overflow-hidden">
            {user.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-900">{user.name || 'Anonymous'}</span>
            <span className="text-xs text-slate-500">{user.email || 'No email provided'}</span>
          </div>
        </div>
      )
    },
    {
      key: "role",
      header: "Role",
      render: (user: User) => (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${user.role === 'admin'
            ? 'bg-purple-50 text-purple-700 ring-purple-600/20'
            : 'bg-blue-50 text-blue-700 ring-blue-600/20'
          }`}>
          {user.role === 'admin' ? <Shield className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
          <span>{getRoleLabel(user.role)}</span>
        </div>
      )
    },
    {
      key: "uid",
      header: "Change Role",
      render: (user: User) => (
        <div className="flex items-center gap-2">
          <select
            value={user.role}
            onChange={(e) => handleRoleChange(user.uid, e.target.value as UserRole)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1.5 outline-none hover:border-slate-300 transition-colors text-slate-900 font-medium shadow-sm"
          >
            <option value="clinician">Physio</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      )
    },
    {
      key: "actions",
      header: "Actions",
      render: () => (
        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A]">User Access</h2>
          <p className="text-sm text-slate-500">Manage user permissions and system access levels.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={users}
          uniqueKey="uid"
          pageSize={10}
        />
      </div>
    </div>
  );
};
