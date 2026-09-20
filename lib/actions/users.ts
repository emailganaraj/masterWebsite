"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getClientIp } from "@/lib/audit/client-ip";
import { logAudit } from "@/lib/audit/log";
import { requirePermission } from "@/lib/auth/require-permission";
import { getServerSession } from "@/lib/auth/server";
import type { AppRole } from "@/lib/auth/permissions";
import { fail, ok, type ActionResult } from "@/lib/actions/types";
import { db } from "@/lib/db";
import { roles, userRoles, users } from "@/lib/db/schema";
import { listUsersForAdmin } from "@/lib/queries/users";

const VALID_ROLES: AppRole[] = ["SUPER_ADMIN", "EDITOR", "AUTHOR", "ANALYST"];

export async function getAdminUsers() {
  const perm = await requirePermission("user", "read");
  if (!perm.ok) return [];

  return listUsersForAdmin();
}

export async function updateUserRole(
  userId: string,
  role: AppRole,
): Promise<ActionResult> {
  const perm = await requirePermission("user", "update");
  if (!perm.ok) return perm;

  if (!VALID_ROLES.includes(role)) {
    return fail("Invalid role.");
  }

  const session = await getServerSession();
  if (session?.user?.id === userId && role !== "SUPER_ADMIN") {
    const current = await listUsersForAdmin();
    const self = current.find((u) => u.id === userId);
    if (self?.role === "SUPER_ADMIN") {
      return fail("You cannot remove your own SUPER_ADMIN role.");
    }
  }

  try {
    const [roleRow] = await db
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.name, role))
      .limit(1);

    if (!roleRow) return fail("Role not found in database.");

    await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, userId));

    await db.delete(userRoles).where(eq(userRoles.userId, userId));
    await db.insert(userRoles).values({
      userId,
      roleId: roleRow.id,
      assignedBy: perm.data.userId,
    });

    const ip = await getClientIp();
    await logAudit({
      userId: perm.data.userId,
      action: "role_change",
      entityType: "user",
      entityId: userId,
      metadata: { role },
      ipAddress: ip,
    });

    revalidatePath("/admin/users");
    return ok(undefined);
  } catch {
    return fail("Could not update user role.");
  }
}

export async function setUserBanned(
  userId: string,
  banned: boolean,
  reason?: string,
): Promise<ActionResult> {
  const perm = await requirePermission("user", "ban");
  if (!perm.ok) return perm;

  if (perm.data.userId === userId) {
    return fail("You cannot ban yourself.");
  }

  try {
    await db
      .update(users)
      .set({
        banned,
        banReason: banned ? reason?.trim() || "Banned by admin" : null,
        banExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    const ip = await getClientIp();
    await logAudit({
      userId: perm.data.userId,
      action: banned ? "update" : "restore",
      entityType: "user",
      entityId: userId,
      metadata: { banned, reason: reason ?? null },
      ipAddress: ip,
    });

    revalidatePath("/admin/users");
    return ok(undefined);
  } catch {
    return fail("Could not update ban status.");
  }
}
