import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { roles, userRoles, users } from "@/lib/db/schema";
import type { AppRole } from "./permissions";
import { roleMap, statement } from "./permissions";

export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

export async function getUserRoles(userId: string): Promise<AppRole[]> {
  const rows = await db
    .select({ name: roles.name })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, userId));

  const fromJoin = rows.map((r) => r.name as AppRole);
  if (fromJoin.length > 0) return fromJoin;

  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user?.role ? [user.role as AppRole] : [];
}

export async function requireAuth(redirectTo = "/admin/login") {
  const session = await getServerSession();
  if (!session?.user) {
    redirect(redirectTo);
  }
  return session;
}

export async function requireAdminRole(
  allowedRoles: AppRole[] = ["SUPER_ADMIN", "EDITOR", "AUTHOR", "ANALYST"],
) {
  const session = await requireAuth();
  const userRolesList = await getUserRoles(session.user.id);

  const hasAccess = userRolesList.some((role) => allowedRoles.includes(role));

  // Better Auth admin plugin also stores role on user — check both
  const baRole = (session.user as { role?: string }).role as AppRole | undefined;
  const hasBaRole = baRole && allowedRoles.includes(baRole);

  if (!hasAccess && !hasBaRole) {
    redirect("/admin/login?error=unauthorized");
  }

  return { session, roles: userRolesList.length ? userRolesList : baRole ? [baRole] : [] };
}

export async function requireSuperAdmin() {
  return requireAdminRole(["SUPER_ADMIN"]);
}

export async function hasPermission(
  userId: string,
  resource: keyof typeof statement,
  action: string,
): Promise<boolean> {
  const userRolesList = await getUserRoles(userId);
  const permissions = { [resource]: [action] } as Record<string, string[]>;

  type AuthorizeFn = (
    request: Record<string, string[]>,
  ) => { success: boolean } | undefined;

  for (const roleName of userRolesList) {
    const role = roleMap[roleName] as { authorize?: AuthorizeFn } | undefined;
    if (role?.authorize?.(permissions)?.success) {
      return true;
    }
  }

  return false;
}
