"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function TopNav() {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    [
      "px-2 py-1 rounded-md transition",
      "hover:bg-muted",
      isActive(pathname, href) ? "bg-muted font-medium" : "text-muted-foreground",
    ].join(" ");

  return (
    <nav className="text-sm flex items-center gap-2">
      <Link
        href="/"
        className={linkClass("/")}>
        Dashboard
      </Link>
      <Link
        href="/projects"
        className={linkClass("/projects")}>
        Projects
      </Link>
    </nav>
  );
}
