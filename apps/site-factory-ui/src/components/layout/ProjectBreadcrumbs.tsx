"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function decodeSafe(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

export function ProjectBreadcrumbs() {
  const pathname = usePathname();

  // "/" or "/projects" => pas de crumbs
  const parts = React.useMemo(() => pathname.split("/").filter(Boolean), [pathname]);

  if (parts[0] !== "projects") return null;

  const client = parts[1] ? decodeSafe(parts[1]) : null;
  const site = parts[2] ? decodeSafe(parts[2]) : null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">Dashboard</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator />

        <BreadcrumbItem>
          {client ? (
            <BreadcrumbLink asChild>
              <Link href="/projects">Projects</Link>
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage>Projects</BreadcrumbPage>
          )}
        </BreadcrumbItem>

        {client && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {site ? (
                <BreadcrumbLink asChild>
                  <Link href={`/projects/${encodeURIComponent(client)}`}>{client}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{client}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </>
        )}

        {client && site && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{site}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
