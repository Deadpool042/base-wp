"use client";

import * as React from "react";

import { ndjsonLines, parseNDJSONLine } from "@sf/shared/ndjson";

import {
  ClientRenameRequestSchema,
  ClientRenameEvtSchema,
  type ClientRenameEvt,
} from "@sf/shared/clients";

type State = {
  loading: boolean;
  done: boolean;
  error: string | null;
  events: ClientRenameEvt[];
};

type RenameResult = { ok: true } | { ok: false; error: string };

function lastEvent<T extends ClientRenameEvt["type"]>(
  events: ClientRenameEvt[],
  type: T
): Extract<ClientRenameEvt, { type: T }> | null {
  for (let i = events.length - 1; i >= 0; i--) {
    const e = events[i];
    if (e?.type === type) return e as Extract<ClientRenameEvt, { type: T }>;
  }
  return null;
}

export function useClientRename() {
  const [state, setState] = React.useState<State>({
    loading: false,
    done: false,
    error: null,
    events: [],
  });

  const reset = React.useCallback(() => {
    setState({ loading: false, done: false, error: null, events: [] });
  }, []);

  const renameClient = React.useCallback(
    async (from: string, to: string): Promise<RenameResult> => {
      reset();

      const parsedReq = ClientRenameRequestSchema.safeParse({
        from: from.trim(),
        to: to.trim(),
      });

      if (!parsedReq.success) {
        const msg = parsedReq.error.issues[0]?.message ?? "Requête invalide";
        setState(s => ({ ...s, error: msg }));
        return { ok: false, error: msg };
      }

      setState(s => ({ ...s, loading: true }));

      let hadError = false;
      const collected: ClientRenameEvt[] = [];

      try {
        const res = await fetch("/api/clients/rename", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(parsedReq.data),
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          const msg = txt || `HTTP ${res.status}`;
          setState(s => ({ ...s, error: msg }));
          return { ok: false, error: msg };
        }
        if (!res.body) {
          const msg = "Flux NDJSON manquant";
          setState(s => ({ ...s, error: msg }));
          return { ok: false, error: msg };
        }

        for await (const line of ndjsonLines(res.body)) {
          const base = parseNDJSONLine(line);
          if (!base) continue;

          const parsedEvt = ClientRenameEvtSchema.safeParse(base);
          if (!parsedEvt.success) continue;

          const evt = parsedEvt.data;
          collected.push(evt);

          setState(s => ({
            ...s,
            events: [...s.events, evt],
            done: s.done || evt.type === "done",
            error: evt.type === "error" ? evt.message : s.error,
          }));

          if (evt.type === "error") hadError = true;
        }

        if (hadError) {
          const lastErr = lastEvent(collected, "error");
          return { ok: false, error: lastErr?.message ?? "Échec du renommage" };
        }

        return { ok: true };
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Erreur inconnue";
        setState(s => ({ ...s, error: msg }));
        return { ok: false, error: msg };
      } finally {
        setState(s => ({ ...s, loading: false }));
      }
    },
    [reset]
  );

  const movedCount = React.useMemo(
    () => state.events.filter(e => e.type === "project").length,
    [state.events]
  );

  return {
    ...state,
    movedCount,
    renameClient,
    reset,
  };
}
