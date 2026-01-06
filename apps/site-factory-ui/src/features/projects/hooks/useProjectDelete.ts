// features/projects/hooks/useDeleteProject.ts
"use client";

import * as React from "react";
import type { ProjectDeleteEvt } from "@sf/shared/projects";
import { apiProjectsDelete } from "@/lib/api/projects/projects";

type DeleteReq = { id: string; force?: boolean };

export function useProjectDelete() {
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [events, setEvents] = React.useState<ProjectDeleteEvt[]>([]);

  const reset = React.useCallback(() => {
    setLoading(false);
    setDone(false);
    setError(null);
    setEvents([]);
  }, []);

  const deleteProject = React.useCallback(async ({ id, force }: DeleteReq) => {
    setLoading(true);
    setDone(false);
    setError(null);
    setEvents([]);

    try {
      await apiProjectsDelete(id, {
        force,
        onEvent: evt => setEvents(prev => [...prev, evt]),
      });
      setDone(true);
      return { ok: true as const };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erreur inconnue";
      setError(msg);
      return { ok: false as const, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteProject, loading, done, error, events, reset };
}
