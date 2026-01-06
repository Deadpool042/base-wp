"use client";

import * as React from "react";
import type { ProjectItem } from "@sf/shared/projects";
import { apiClientProjects } from "@/lib/api/clients/client";

type RefreshOpts = { silent?: boolean };

export function useClientProjects(client: string | null) {
  const [items, setItems] = React.useState<ProjectItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(
    async (opts?: RefreshOpts) => {
      if (!client) {
        setItems([]);
        setError(null);
        setLoading(false);
        return;
      }

      if (!opts?.silent) setLoading(true);
      setError(null);

      try {
        const list = await apiClientProjects(client);
        setItems(list);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur inconnue");
      } finally {
        if (!opts?.silent) setLoading(false);
      }
    },
    [client]
  );

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  return { items, loading, error, refresh };
}
