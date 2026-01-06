"use client";

import * as React from "react";
import { apiClientMeta, type ClientMeta } from "@/lib/api/clients/client";

type RefreshOpts = { silent?: boolean };

export function useClientMeta(client: string | null) {
  const [meta, setMeta] = React.useState<ClientMeta | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(
    async (opts?: RefreshOpts) => {
      if (!client) {
        setMeta(null);
        setError(null);
        setLoading(false);
        return;
      }

      if (!opts?.silent) setLoading(true);
      setError(null);

      try {
        const m = await apiClientMeta(client);
        setMeta(m ?? null);
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

  return { meta, loading, error, refresh };
}
