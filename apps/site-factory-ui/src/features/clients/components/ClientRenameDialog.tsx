// apps/site-factory-ui/src/features/clients/components/ClientRenameDialog.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useProjectsCtx } from "@/features/projects/ProjectsProvider";
import { useClientsCtx } from "../ClientsProvider";

import { parseCount } from "@sf/shared/ndjson";
import type { ClientRenameEvt } from "@sf/shared/clients";
import { useClientRename } from "../hooks/useClientRename";

type Props = {
  client: string;
  projectsCount: number;
};

function useMounted(): boolean {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted;
}

function getSanitizedToFromEvents(events: ClientRenameEvt[]): string | null {
  // 1) start.to
  for (let i = events.length - 1; i >= 0; i--) {
    const e = events[i];
    if (e?.type === "start" && typeof e.to === "string" && e.to.trim()) {
      return e.to.trim();
    }
  }

  // 2) fallback: project.new_slug => "to/site"
  for (let i = events.length - 1; i >= 0; i--) {
    const e = events[i];
    if (e?.type === "project" && typeof e.new_slug === "string" && e.new_slug.includes("/")) {
      const to = e.new_slug.split("/")[0]?.trim();
      if (to) return to;
    }
  }

  return null;
}

export function ClientRenameDialog({ client, projectsCount }: Props) {
  const router = useRouter();
  const mounted = useMounted();

  const { refreshList: refreshClients } = useClientsCtx();
  const { refreshList: refreshProjects } = useProjectsCtx();

  const [open, setOpen] = React.useState(false);
  const [nextClient, setNextClient] = React.useState("");
  const [targetClient, setTargetClient] = React.useState<string | null>(null);

  const { renameClient, loading, done, error, events, movedCount, reset } = useClientRename();

  const sanitizedTo = React.useMemo(() => getSanitizedToFromEvents(events), [events]);

  const canSubmit = React.useMemo(() => {
    const to = nextClient.trim();
    return !!to && to !== client && !loading && !done;
  }, [nextClient, client, loading, done]);

  const movedLabel = React.useMemo(() => {
    if (!projectsCount) return String(movedCount);
    return `${movedCount}/${projectsCount}`;
  }, [movedCount, projectsCount]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const to = nextClient.trim();
    if (!to || to === client) return;

    setTargetClient(to);

    const res = await renameClient(client, to);
    if (res.ok) {
      // ✅ refresh les 2 sources de vérité
      await Promise.all([refreshClients({ silent: true }), refreshProjects({ silent: true })]);
      // ✅ ne pas fermer ici (tu veux garder la modal)
    }
  }

  React.useEffect(() => {
    if (!open) {
      setNextClient("");
      setTargetClient(null);
      reset();
    }
  }, [open, reset]);

  const doneEvt = React.useMemo(() => {
    for (let i = events.length - 1; i >= 0; i--) {
      const e = events[i];
      if (e?.type === "done") return e;
    }
    return null;
  }, [events]);

  const renderEvent = React.useCallback((evt: ClientRenameEvt, i: number) => {
    switch (evt.type) {
      case "start":
        return (
          <div
            key={i}
            className="text-muted-foreground">
            Démarrage… <span className="font-medium">{evt.op}</span>
          </div>
        );

      case "project":
        return (
          <div
            key={i}
            className="flex items-center justify-between gap-3">
            <div className="text-muted-foreground">
              {evt.old_slug} → <span className="text-foreground">{evt.new_slug}</span>
            </div>
            {evt.id ? <Badge variant="secondary">{evt.id.slice(0, 8)}</Badge> : null}
          </div>
        );

      case "stderr":
        return (
          <div
            key={i}
            className="text-muted-foreground">
            {evt.message}
          </div>
        );

      case "error":
        return (
          <div
            key={i}
            className="text-red-600">
            {evt.code ? `[${evt.code}] ` : ""}
            {evt.message}
          </div>
        );

      case "done": {
        const count = parseCount(evt.count);
        return (
          <div
            key={i}
            className="text-green-600">
            Terminé ✅ {count != null ? `(déplacés : ${count})` : ""}
          </div>
        );
      }

      default:
        return (
          <div
            key={i}
            className="text-muted-foreground">
            {JSON.stringify(evt)}
          </div>
        );
    }
  }, []);

  const closeLabel = done ? "Fermer" : "Annuler";

  // ✅ destination finale: priorité au sanitizedTo, sinon fallback
  const goClientSlug = sanitizedTo ?? targetClient ?? (nextClient.trim() || null);

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}>
      {mounted ? (
        <DialogTrigger asChild>
          <Button variant="outline">
            Renommer le client
            <Badge
              className="ml-2"
              variant="secondary">
              {projectsCount}
            </Badge>
          </Button>
        </DialogTrigger>
      ) : (
        <Button
          variant="outline"
          disabled
          aria-disabled="true">
          Renommer le client
          <Badge
            className="ml-2"
            variant="secondary">
            {projectsCount}
          </Badge>
        </Button>
      )}

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Renommer le client</DialogTitle>
          <DialogDescription>
            Cette action va renommer <span className="font-medium">{client}</span> et déplacer tous
            ses projets.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={onSubmit}
          className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Actuel</Label>
              <Input
                value={client}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextClient">Nouveau client</Label>
              <Input
                id="nextClient"
                value={nextClient}
                onChange={e => setNextClient(e.target.value)}
                placeholder="acme-inc"
                disabled={loading || done}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Slug sûr (lettres, chiffres, tiret). Il sera aussi normalisé côté serveur.
              </p>
            </div>
          </div>

          {error ? <div className="text-sm text-red-600">Erreur : {error}</div> : null}

          {(loading || events.length > 0) && (
            <div className="rounded-xl border p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Progression</div>
                <Badge variant="outline">{movedLabel}</Badge>
              </div>

              <div className="mt-2">
                <ScrollArea className="h-44 rounded-lg border bg-muted/30">
                  <div className="space-y-2 p-3 text-xs">{events.map(renderEvent)}</div>
                </ScrollArea>
              </div>

              {doneEvt ? (
                <div className="mt-2 text-xs text-muted-foreground">
                  Flux terminé. ok={String(doneEvt.ok)}
                  {sanitizedTo ? (
                    <>
                      {" "}· renommé en{" "}
                      <span className="font-medium text-foreground">{sanitizedTo}</span>
                    </>
                  ) : null}
                </div>
              ) : null}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={loading}>
              {closeLabel}
            </Button>

            {done && goClientSlug ? (
              <Button
                type="button"
                onClick={() => {
                  router.push(`/projects/${encodeURIComponent(goClientSlug)}`);
                  // optionnel: si tu relies des Server Components
                  router.refresh();
                  setOpen(false);
                }}>
                Aller au client
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!canSubmit}>
                {loading ? "Renommage…" : "Renommer"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
