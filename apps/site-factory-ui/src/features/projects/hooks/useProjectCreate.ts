// apps/site-factory-ui/src/features/projects/hooks/useProjectCreate.ts
"use client";

import * as React from "react";

import { ndjsonLines, parseNDJSONLine, parseCount } from "@sf/shared/ndjson";
import {
  ProjectCreateRequestSchema,
  ProjectCreateEvtSchema,
  type ProjectCreateEvt,
} from "@sf/shared/projects";

type State = {
  loading: boolean;
  done: boolean;
  error: string | null;
  events: ProjectCreateEvt[];
};

type CreateArgs = {
  client: string;
  site: string;
  tech?: "wordpress" | "next";
  headless?: boolean;
};

type CreatedInfo = { id?: string; slug?: string; path?: string };

type CreateResult = { ok: true; created?: CreatedInfo } | { ok: false; error: string };

function lastEvent<T extends ProjectCreateEvt["type"]>(
  events: ProjectCreateEvt[],
  type: T
): Extract<ProjectCreateEvt, { type: T }> | null {
  for (let i = events.length - 1; i >= 0; i--) {
    const e = events[i];
    if (e?.type === type) return e as Extract<ProjectCreateEvt, { type: T }>;
  }
  return null;
}

export function useProjectCreate() {
  const [state, setState] = React.useState<State>({
    loading: false,
    done: false,
    error: null,
    events: [],
  });

  const reset = React.useCallback(() => {
    setState({ loading: false, done: false, error: null, events: [] });
  }, []);

  const createProject = React.useCallback(
    async ({ client, site, tech, headless }: CreateArgs): Promise<CreateResult> => {
      reset();

      const parsedReq = ProjectCreateRequestSchema.safeParse({
        client: client.trim(),
        site: site.trim(),
        tech,
        headless,
      });

      if (!parsedReq.success) {
        const msg = parsedReq.error.issues[0]?.message ?? "Payload invalide";
        setState(s => ({ ...s, error: msg }));
        return { ok: false, error: msg };
      }

      setState(s => ({ ...s, loading: true }));

      let hadError = false;
      const collected: ProjectCreateEvt[] = [];
      let created: CreatedInfo | undefined;

      // ✅ buffer pour limiter les re-render
      let buffer: ProjectCreateEvt[] = [];
      let flushScheduled = false;

      const flush = () => {
        flushScheduled = false;
        if (buffer.length === 0) return;

        const batch = buffer;
        buffer = [];

        setState(s => {
          let nextError = s.error;
          let nextDone = s.done;

          for (const evt of batch) {
            if (evt.type === "error") nextError = evt.message;
            if (evt.type === "done") nextDone = true;
          }

          return {
            ...s,
            events: [...s.events, ...batch],
            error: nextError,
            done: nextDone,
          };
        });
      };

      const enqueue = (evt: ProjectCreateEvt) => {
        buffer.push(evt);
        if (!flushScheduled) {
          flushScheduled = true;
          queueMicrotask(flush);
        }
      };

      try {
        const res = await fetch("/api/projects/create", {
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

          const parsedEvt = ProjectCreateEvtSchema.safeParse(base);
          if (!parsedEvt.success) continue;

          const evt = parsedEvt.data;
          collected.push(evt);
          enqueue(evt);

          if (evt.type === "error") hadError = true;
          if (evt.type === "created") {
            created = { id: evt.id, slug: evt.slug, path: evt.path };
          }
        }

        // flush final (si microtask pas passée)
        flush();

        if (hadError) {
          const lastErr = lastEvent(collected, "error");
          return { ok: false, error: lastErr?.message ?? "Échec de la création" };
        }

        if (!created) {
          const c = lastEvent(collected, "created");
          if (c) created = { id: c.id, slug: c.slug, path: c.path };
        }

        return { ok: true, created };
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Erreur inconnue";
        setState(s => ({ ...s, error: msg }));
        return { ok: false, error: msg };
      } finally {
        // flush au cas où
        flush();
        setState(s => ({ ...s, loading: false }));
      }
    },
    [reset]
  );

  const createdEvt = React.useMemo(() => lastEvent(state.events, "created"), [state.events]);

  const doneCount = React.useMemo(() => {
    const d = lastEvent(state.events, "done");
    return d ? parseCount(d.count) : undefined;
  }, [state.events]);

  return {
    ...state,
    createProject,
    reset,
    createdEvt,
    doneCount,
  };
}
