"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, FolderKanban, Plus, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { NAV_ITEMS, ROUTE_LABEL, SECTION_LABEL, SECTION_HREF } from "./nav";

type MenuItem =
  | { kind: "link"; href: string; label: string; icon?: React.ReactNode }
  | { kind: "sep" };

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function linkClass(active: boolean) {
  return cn(
    "px-2 py-1 rounded-md transition",
    "hover:bg-muted",
    active ? "bg-muted font-medium text-foreground" : "text-muted-foreground"
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  return (
    <Link
      href={href}
      className={linkClass(isActive(pathname, href))}>
      {label}
    </Link>
  );
}

function NavMenu({
  baseHref,
  label,
  items,
}: {
  baseHref: string;
  label: string;
  items: MenuItem[];
}) {
  const pathname = usePathname();
  const active = isActive(pathname, baseHref);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className={cn(
            "h-auto px-2 py-1 rounded-md text-sm",
            "hover:bg-muted",
            active ? "bg-muted font-medium text-foreground" : "text-muted-foreground"
          )}>
          <span>{label}</span>
          <ChevronDown className="ml-1.5 h-4 w-4 opacity-70" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="min-w-52">
        {items.map((it, idx) => {
          if (it.kind === "sep") return <DropdownMenuSeparator key={`sep-${idx}`} />;
          return (
            <DropdownMenuItem
              key={it.href}
              asChild>
              <Link
                href={it.href}
                className="flex items-center gap-2">
                {it.icon ? <span className="shrink-0">{it.icon}</span> : null}
                <span>{it.label}</span>
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TopNav() {
  // ✅ liens simples depuis NAV_ITEMS
  const links = NAV_ITEMS.filter(i => !i.hidden).map(i => ({ href: i.href, label: i.label }));

  // ✅ menus (Projects + Clients)
  const projectsMenu: { baseHref: string; label: string; items: MenuItem[] } = {
    baseHref: SECTION_HREF.projects,
    label: SECTION_LABEL.projects,
    items: [
      {
        kind: "link",
        href: SECTION_HREF.projects,
        label: `Voir les ${SECTION_LABEL.projects.toLowerCase()}`,
        icon: <FolderKanban className="h-4 w-4" />,
      },
      { kind: "sep" },
      {
        kind: "link",
        href: `/${"projects/new" as const}`,
        label: ROUTE_LABEL["projects/new"],
        icon: <Plus className="h-4 w-4" />,
      },
    ],
  };

  const clientsMenu: { baseHref: string; label: string; items: MenuItem[] } = {
    baseHref: SECTION_HREF.clients,
    label: SECTION_LABEL.clients,
    items: [
      {
        kind: "link",
        href: SECTION_HREF.clients,
        label: `Voir les ${SECTION_LABEL.clients.toLowerCase()}`,
        icon: <Users className="h-4 w-4" />,
      },
      { kind: "sep" },
      {
        kind: "link",
        href: `/${"clients/new" as const}`,
        label: ROUTE_LABEL["clients/new"],
        icon: <Plus className="h-4 w-4" />,
      },
    ],
  };

  // 💡 Ici tu choisis l’ordre exact :
  // - Tableau de bord (lien)
  // - Projects (menu)
  // - Clients (menu)
  // - puis le reste depuis NAV_ITEMS (clients/settings etc.)
  //
  // Comme tu as déjà "Clients" dans NAV_ITEMS, on l’enlève des links simples
  // pour éviter le doublon (menu + link).
  const linksWithoutClients = links.filter(l => l.href !== SECTION_HREF.clients);
  const linksWithoutProjects = linksWithoutClients.filter(l => l.href !== SECTION_HREF.projects);

  return (
    <nav className="text-sm flex items-center gap-2">
      {/* Menus */}
      {linksWithoutProjects.map(l => (
        <NavLink
          key={l.href}
          href={l.href}
          label={l.label}
        />
      ))}
      <NavMenu {...projectsMenu} />
      <NavMenu {...clientsMenu} />
      {/* Tableau de bord, etc. (sans clients/projets car menus dédiés) */}

      {/* Si tu veux remettre Settings après les menus, laisse NAV_ITEMS gérer, sinon move */}
      {/* Exemple: on laisse Settings si présent dans NAV_ITEMS et pas déjà rendu */}
      {/* (dans ton cas Settings est déjà dans linksWithoutProjects, donc rien de plus) */}
    </nav>
  );
}
