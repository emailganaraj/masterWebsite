"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  DollarSign,
  FileText,
  FolderTree,
  Image,
  LayoutDashboard,
  PenLine,
  Search,
  Settings,
  Shield,
  Tags,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/articles", label: "Articles", icon: FileText },
  { href: "/admin/articles/new", label: "Create Article", icon: PenLine },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/tags", label: "Tags", icon: Tags },
  { href: "/admin/media", label: "Media", icon: Image },
  { href: "/admin/authors", label: "Authors", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/adsense", label: "AdSense", icon: DollarSign },
  { href: "/admin/seo", label: "SEO", icon: Search },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: Shield },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-zinc-200 bg-zinc-950 text-zinc-100">
      <div className="border-b border-zinc-800 px-5 py-5">
        <Link href="/admin" className="block">
          <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
            Master Admin
          </span>
          <span className="mt-1 block text-lg font-bold text-white">
            {process.env.NEXT_PUBLIC_SITE_NAME ?? "Publishing CMS"}
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`);

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-blue-600 text-white"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-zinc-800 px-5 py-4 text-xs text-zinc-500">
        Phase 3 — Public Site
      </div>
    </aside>
  );
}
