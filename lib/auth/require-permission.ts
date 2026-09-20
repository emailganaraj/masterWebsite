import { fail } from "@/lib/actions/types";
import { getServerSession, hasPermission } from "@/lib/auth/server";
import type { statement } from "@/lib/auth/permissions";

type Resource = keyof typeof statement;

/** Shared server-side permission gate — must NOT live in a "use server" file. */
export async function requirePermission(resource: Resource, action: string) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return fail<{ userId: string }>("You must be signed in.");
  }

  const allowed = await hasPermission(session.user.id, resource, action);
  if (!allowed) {
    return fail<{ userId: string }>("You do not have permission for this action.");
  }

  return { ok: true as const, data: { userId: session.user.id } };
}
