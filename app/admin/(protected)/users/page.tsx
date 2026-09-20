import { PageHeader } from "@/components/admin/page-header";
import { UserManager } from "@/components/users/user-manager";
import { getAdminUsers } from "@/lib/actions/users";
import { redirect } from "next/navigation";
import { getServerSession, hasPermission } from "@/lib/auth/server";

export default async function UsersPage() {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/admin/login");

  const canRead = await hasPermission(session.user.id, "user", "read");
  if (!canRead) redirect("/admin");

  const users = await getAdminUsers();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage roles and access. SUPER_ADMIN only."
      />
      <UserManager users={users} />
    </div>
  );
}
