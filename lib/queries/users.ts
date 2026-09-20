import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { roles, userRoles, users } from "@/lib/db/schema";
import type { AppRole } from "@/lib/auth/permissions";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  banned: boolean;
  banReason: string | null;
  createdAt: Date;
};

export async function listUsersForAdmin(): Promise<AdminUserRow[]> {
  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      banned: users.banned,
      banReason: users.banReason,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  const roleRows = await db
    .select({ userId: userRoles.userId, roleName: roles.name })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id));

  const roleByUser = new Map(roleRows.map((r) => [r.userId, r.roleName as AppRole]));

  return allUsers.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: roleByUser.get(user.id) ?? (user.role as AppRole) ?? "AUTHOR",
    banned: user.banned ?? false,
    banReason: user.banReason,
    createdAt: user.createdAt,
  }));
}
