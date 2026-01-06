"use client";

import * as React from "react";
import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { useRouteInfo } from "./useRouteInfo";
import { ROUTE_LABEL, SECTION_LABEL, type AppSection } from "./nav";

type Crumb = { label: string; href?: string };

function buildCrumbs(section: AppSection, rest: string[]): Crumb[] {
  const crumbs: Crumb[] = [];

  const pushLink = (label: string, href: string) => crumbs.push({ label, href });
  const pushPage = (label: string) => crumbs.push({ label });

  // Toujours démarrer depuis le tableau de bord
  pushLink(SECTION_LABEL.dashboard, "/");

  if (section === "dashboard") return crumbs;

  if (section === "projects") {
    pushLink(SECTION_LABEL.projects, "/projects");

    const [a, b] = rest;

    // /projects/new
    if (a === "new") {
      pushPage(ROUTE_LABEL["projects/new"]);
      return crumbs;
    }

    // /projects/<client>/<site> => "client/site"
    if (a && b) {
      pushPage(`${a}/${b}`);
      return crumbs;
    }

    return crumbs;
  }

  if (section === "clients") {
    pushLink(SECTION_LABEL.clients, "/clients");

    const [a] = rest;

    // /clients/new
    if (a === "new") {
      pushPage(ROUTE_LABEL["clients/new"]);
      return crumbs;
    }

    // /clients/<client>
    if (a) {
      pushPage(a);
      return crumbs;
    }

    return crumbs;
  }

  // Other sections (users, settings, etc.)
  pushPage(SECTION_LABEL[section] ?? section);
  return crumbs;
}

export function AppBreadcrumbs() {
  const { section, rest } = useRouteInfo();

  const crumbs = React.useMemo(() => {
    if (!section) return null;
    return buildCrumbs(section, rest);
  }, [section, rest]);

  if (!crumbs) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((c, idx) => {
          const isLast = idx === crumbs.length - 1;

          return (
            <React.Fragment key={`${c.label}-${idx}`}>
              <BreadcrumbItem>
                {isLast || !c.href ? (
                  <BreadcrumbPage>{c.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={c.href}>{c.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>

              {!isLast ? <BreadcrumbSeparator /> : null}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
