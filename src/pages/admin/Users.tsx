import { useForm } from "react-hook-form";
import { useAppStore } from "../../store/useAppStore";

export const AdminUsers = () => {
  const users = useAppStore((state) => state.users);
  const signup = useAppStore((state) => state.signup);
  const updateUserRole = useAppStore((state) => state.updateUserRole);
  const { register, handleSubmit, reset } = useForm<{
    name: string;
    email: string;
    role: "physio" | "expert" | "admin";
    password: string;
  }>({ defaultValues: { password: "demo" } });

  const onSubmit = (values: { name: string; email: string; role: "physio" | "expert" | "admin"; password: string }) => {
    signup(values.name, values.email, values.role, values.password);
    reset();
  };

  return (
    <section className="space-y-6 rounded-3xl bg-surface/70 p-6 shadow-soft-light animate-fade-in">
      <header>
        <h2 className="text-xl font-semibold text-text">User management</h2>
        <p className="text-sm text-text-muted">Seed the workspace with trusted collaborators.</p>
      </header>

      <form className="flex flex-wrap gap-3 rounded-3xl border border-white/10 bg-background/20 p-4" onSubmit={handleSubmit(onSubmit)}>
        <input {...register("name", { required: true })} placeholder="Name" className="rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm text-text outline-none" />
        <input {...register("email", { required: true })} placeholder="Email" className="rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm text-text outline-none" />
        <input {...register("password", { required: true })} type="password" placeholder="Password" className="rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm text-text outline-none" />
        <select {...register("role")} className="rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm text-text outline-none">
          <option value="physio">Physio</option>
          <option value="expert">Expert</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" className="rounded-2xl bg-gradient-to-r from-primary to-secondary px-4 py-2 text-xs font-semibold text-white transition hover:scale-105">
          Add user
        </button>
      </form>

      <div className="space-y-3">
        {users.map((user) => (
          <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-background/30 p-4">
            <div>
              <p className="font-semibold text-text">{user.name}</p>
              <p className="text-xs text-text-muted">{user.email}</p>
            </div>
            <select value={user.role} onChange={(event) => updateUserRole(user.id, event.target.value as "physio" | "expert" | "admin")} className="rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-xs text-text outline-none">
              <option value="physio">Physio</option>
              <option value="expert">Expert</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        ))}
      </div>
    </section>
  );
};
