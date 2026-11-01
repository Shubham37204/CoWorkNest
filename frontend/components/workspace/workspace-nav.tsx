"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useWorkspace } from "@/components/workspace/workspace-provider";
import { cn } from "@/lib/utils";

export function WorkspaceNav() {
  const { workspace } = useWorkspace();
  const pathname = usePathname();
  const base = `/workspaces/${workspace.id}`;

  const items = [
    { label: "Documents", href: base, active: pathname === base },
    {
      label: "Settings",
      href: `${base}/settings`,
      active: pathname.startsWith(`${base}/settings`),
    },
  ];

  return (
    <aside className="w-full shrink-0 space-y-4 md:w-52">
      <Link
        href="/dashboard"
        className="text-sm text-muted-foreground underline underline-offset-4"
      >
        All workspaces
      </Link>

      <nav aria-label="Workspace" className="flex flex-row gap-1 md:flex-col">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={item.active ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-2 text-sm transition hover:bg-muted",
              item.active && "bg-muted font-medium",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
//Role:"Sidebar, with the dead “Members (soon)” item removed"