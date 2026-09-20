"use client";

import Link from "next/link";
import { LogOut, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "@/lib/auth/client";

export function AdminHeader() {
  const { data: session } = useSession();

  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-6">
      <div>
        <p className="text-sm text-zinc-500">Welcome back</p>
        <p className="font-semibold text-zinc-900">
          {session?.user?.name ?? session?.user?.email ?? "Administrator"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/" target="_blank">
            <ExternalLink className="h-4 w-4" />
            View Site
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            signOut({
              fetchOptions: {
                onSuccess: () => {
                  window.location.href = "/admin/login";
                },
              },
            })
          }
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </header>
  );
}
