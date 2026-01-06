"use client";

import * as React from "react";
import type { ClientItem } from "@sf/shared/clients";
import { apiClientsList } from "@/lib/api/clients/client";

type RefreshOpts = { silent?: boolean };

type State = {
  q: string;
  setQ: (v: string) => void;

  items: ClientItem[];
  loadingList: boolean;
  listError: string | null;

  refreshList: (opts?: RefreshOpts) => Promise<void>;

  optimisticRemoveClients: (names: string[]) => void;
  optimisticBumpProjectsCount: (client: string, delta: number) => void;
  optimisticUpsertClient: (item: { name: string; projectsCount?: number }) => void;
};

const ClientsCtx = React.createContext<State | null>(null);

export function ClientsProvider({ children }: { children: React.ReactNode }) {
  const [q, setQ] = React.useState("");
  const [items, setItems] = React.useState<ClientItem[]>([]);
  const [loadingList, setLoadingList] = React.useState(true);
  const [listError, setListError] = React.useState<string | null>(null);

  const refreshList = React.useCallback(async (opts?: RefreshOpts) => {
    if (!opts?.silent) setLoadingList(true);
    setListError(null);
    try {
      const data = await apiClientsList();
      setItems(data);
    } catch (e) {
      setListError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      if (!opts?.silent) setLoadingList(false);
    }
  }, []);

  const optimisticRemoveClients = React.useCallback((names: string[]) => {
    if (!names.length) return;
    const remove = new Set(names);
    setItems(prev => prev.filter(c => !remove.has(c.name)));
  }, []);

  const optimisticBumpProjectsCount = React.useCallback((client: string, delta: number) => {
    if (!client || !Number.isFinite(delta) || delta === 0) return;
    setItems(prev =>
      prev.map(c => {
        if (c.name !== client) return c;
        const current = typeof c.projectsCount === "number" ? c.projectsCount : undefined;
        if (typeof current !== "number") return c;
        const next = Math.max(0, current + delta);
        return next === current ? c : { ...c, projectsCount: next };
      })
    );
  }, []);

  const optimisticUpsertClient = React.useCallback((item: { name: string; projectsCount?: number }) => {
    const name = item.name.trim();
    if (!name) return;

    setItems(prev => {
      const next = [...prev];
      const idx = next.findIndex(c => c.name === name);
      const entry: ClientItem = {
        name,
        projectsCount: typeof item.projectsCount === "number" ? item.projectsCount : (idx >= 0 ? next[idx]?.projectsCount : undefined),
      };

      if (idx >= 0) next[idx] = entry;
      else next.push(entry);

      next.sort((a, b) => a.name.localeCompare(b.name));
      return next;
    });
  }, []);

  React.useEffect(() => {
    void refreshList();
  }, [refreshList]);

  const value: State = {
    q,
    setQ,
    items ,
    loadingList,
    listError,
    refreshList,
    optimisticRemoveClients,
    optimisticBumpProjectsCount,
    optimisticUpsertClient,
  };
  return <ClientsCtx.Provider value={value}>{children}</ClientsCtx.Provider>;
}

export function useClientsCtx() {
  const ctx = React.useContext(ClientsCtx);
  if (!ctx) throw new Error("useClientsCtx doit être utilisé dans ClientsProvider");
  return ctx;
}
