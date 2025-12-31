"use client";

import * as React from "react";
import type { ProjectItem } from "@sf/shared/projects";
import { apiProjectsList } from "@/lib/api/projects/projects";

type State = {
  q: string;
  setQ: (v: string) => void;

  items: ProjectItem[];
  loadingList: boolean;
  listError: string | null;
  refreshList: () => Promise<void>;
};

const ProjectsCtx = React.createContext<State | null>(null);

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [q, setQ] = React.useState("");
  const [items, setItems] = React.useState<ProjectItem[]>([]);
  const [loadingList, setLoadingList] = React.useState(true);
  const [listError, setListError] = React.useState<string | null>(null);

  const refreshList = React.useCallback(async () => {
    setLoadingList(true);
    setListError(null);
    try {
      const data = await apiProjectsList();
      setItems(data);
    } catch (e) {
      setListError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoadingList(false);
    }
  }, []);

  React.useEffect(() => {
    void refreshList();
  }, [refreshList]);

  const value: State = { q, setQ, items, loadingList, listError, refreshList };

  return <ProjectsCtx.Provider value={value}>{children}</ProjectsCtx.Provider>;
}

export function useProjectsCtx() {
  const ctx = React.useContext(ProjectsCtx);
  if (!ctx) throw new Error("useProjectsCtx must be used within ProjectsProvider");
  return ctx;
}
