"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { ProjectDetails } from "./ProjectDetails";

function decodeSafe(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

export function ProjectDetailsPanel() {
  const pathname = usePathname();

  const slug = React.useMemo(() => {
    const m = pathname.match(/^\/projects\/([^/]+)\/([^/]+)\/?$/);
    if (!m) return null;
    const client = decodeSafe(m[1]);
    const site = decodeSafe(m[2]);
    return `${client}/${site}`;
  }, [pathname]);

  return <ProjectDetails slug={slug} />;
}
