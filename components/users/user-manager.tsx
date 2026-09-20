"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AppRole } from "@/lib/auth/permissions";
import type { AdminUserRow } from "@/lib/queries/users";
import { setUserBanned, updateUserRole } from "@/lib/actions/users";
import { formatDateTime } from "@/lib/utils";

const ROLES: AppRole[] = ["SUPER_ADMIN", "EDITOR", "AUTHOR", "ANALYST"];

export function UserManager({ users }: { users: AdminUserRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [banReason, setBanReason] = useState<Record<string, string>>({});

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) {
        setError(result.error ?? "Action failed");
        return;
      }
      router.refresh();
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All users ({users.length})</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b text-left text-zinc-500">
              <th className="pb-2 pr-4 font-medium">User</th>
              <th className="pb-2 pr-4 font-medium">Role</th>
              <th className="pb-2 pr-4 font-medium">Status</th>
              <th className="pb-2 pr-4 font-medium">Joined</th>
              <th className="pb-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-zinc-100 align-top">
                <td className="py-3 pr-4">
                  <div className="font-medium text-zinc-900">{user.name}</div>
                  <div className="text-zinc-500">{user.email}</div>
                </td>
                <td className="py-3 pr-4">
                  <select
                    className="rounded border border-zinc-200 px-2 py-1 text-sm"
                    value={user.role}
                    disabled={pending}
                    onChange={(e) =>
                      run(() => updateUserRole(user.id, e.target.value as AppRole))
                    }
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-3 pr-4">
                  {user.banned ? (
                    <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                      Banned
                    </span>
                  ) : (
                    <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      Active
                    </span>
                  )}
                  {user.banReason ? (
                    <p className="mt-1 text-xs text-zinc-400">{user.banReason}</p>
                  ) : null}
                </td>
                <td className="py-3 pr-4 whitespace-nowrap text-zinc-600">
                  {formatDateTime(user.createdAt)}
                </td>
                <td className="py-3">
                  {user.banned ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={pending}
                      onClick={() => run(() => setUserBanned(user.id, false))}
                    >
                      Unban
                    </Button>
                  ) : (
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <Input
                        placeholder="Ban reason"
                        className="h-8 max-w-[160px]"
                        value={banReason[user.id] ?? ""}
                        onChange={(e) =>
                          setBanReason((prev) => ({
                            ...prev,
                            [user.id]: e.target.value,
                          }))
                        }
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={pending}
                        onClick={() =>
                          run(() =>
                            setUserBanned(user.id, true, banReason[user.id]),
                          )
                        }
                      >
                        Ban
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
