"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import type { ProjectItem } from "@sf/shared/projects";
import { apiProjectsList } from "@/lib/api/projects/projects";

type State = {
  q: string;
  setQ: (v: string) => void;

  items: ProjectItem[];
  loadingList: boolean;
  listError: string | null;
  refreshList: (opts?: { silent?: boolean }) => Promise<void>;

  optimisticRemoveProjects: (ids: string[]) => void;
};

const ProjectsCtx = React.createContext<State | null>(null);

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [q, setQ] = React.useState("");
  const [items, setItems] = React.useState<ProjectItem[]>([]);
  const [loadingList, setLoadingList] = React.useState(true);
  const [listError, setListError] = React.useState<string | null>(null);

  const refreshList = React.useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent ?? false;

    if (!silent) setLoadingList(true);
    setListError(null);

    try {
      const data = await apiProjectsList();
      setItems(data);
    } catch (e) {
      setListError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      if (!silent) setLoadingList(false);
    }
  }, []);

  const optimisticRemoveProjects = React.useCallback((ids: string[]) => {
    if (!ids.length) return;
    const remove = new Set(ids);
    setItems(prev => prev.filter(p => !remove.has(p.id)));
  }, []);

  // initial load
  React.useEffect(() => {
    void refreshList();
  }, [refreshList]);

  // ✅ B) auto refresh on navigation within /projects/*
  React.useEffect(() => {
    if (!pathname.startsWith("/projects")) return;
    void refreshList({ silent: true });
  }, [pathname, refreshList]);

  const value: State = {
    q,
    setQ,
    items,
    loadingList,
    listError,
    refreshList,
    optimisticRemoveProjects,
  };

  return <ProjectsCtx.Provider value={value}>{children}</ProjectsCtx.Provider>;
}

export function useProjectsCtx() {
  const ctx = React.useContext(ProjectsCtx);
  if (!ctx) throw new Error("useProjectsCtx doit être utilisé dans ProjectsProvider");
  return ctx;
}
