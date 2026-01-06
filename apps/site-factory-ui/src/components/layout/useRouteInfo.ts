"use client";

import { usePathname } from "next/navigation";
import type { AppSection } from "./nav";

function decodeSafe(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

export type RouteInfo = {
  pathname: string;
  segments: string[]; // decoded
  section: AppSection | null;
  rest: string[]; // decoded
};

const SECTION_BY_SEGMENT: Record<string, AppSection> = {
  projects: "projects",
  clients: "clients",
};

export function useRouteInfo(): RouteInfo {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean).map(decodeSafe);

  if (segments.length === 0) {
    return { pathname, segments: [], section: "dashboard", rest: [] };
  }

  const first = segments[0];
  const section = SECTION_BY_SEGMENT[first] ?? null;
  const rest = segments.slice(1);

  return { pathname, segments, section, rest };
}
