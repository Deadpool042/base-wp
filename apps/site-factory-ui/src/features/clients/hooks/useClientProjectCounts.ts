"use client";

import * as React from "react";
import { useProjectsCtx } from "@/features/projects/ProjectsProvider";

export function useClientProjectCounts() {
  const { items } = useProjectsCtx();

  return React.useMemo(() => {
    const map = new Map<string, number>();
    for (const p of items) map.set(p.client, (map.get(p.client) ?? 0) + 1);
    return map; // Map<client, count>
  }, [items]);
}
