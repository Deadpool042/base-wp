// features/projects/components/ProjectDeleteDialog.tsx
"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import type { ProjectDeleteEvt } from "@sf/shared/projects";
import { useProjectDelete } from "../hooks/useProjectDelete";

type Props = {
  projectId: string; // uuid complet
  displayId?: string; // affichage (8 chars) optionnel
  slug?: string; // client/site
  siteName?: string;

  triggerVariant?: "ghost" | "outline" | "default" | "destructive";
  triggerLabel?: string;
  triggerClassName?: string;

  defaultForce?: boolean;
  onDeleted?: (payload: { id: string; slug?: string }) => void | Promise<void>;
  onOpenChange?: (open: boolean) => void;
};

function toneClass(tone?: "muted" | "ok" | "error") {
  if (tone === "error") return "bg-red-500/10 text-red-600";
  if (tone === "ok") return "text-foreground font-medium";
  return "text-muted-foreground";
}

function renderDeleteEvent(evt: ProjectDeleteEvt) {
  switch (evt.type) {
    case "start":
      return { icon: "🧨", label: `Démarrage (${evt.op})`, tone: "muted" as const };

    case "found":
      return {
        icon: "🔎",
        label: `Trouvé : ${evt.slug ?? evt.id}`,
        tone: "muted" as const,
      };

    case "deleted":
      return {
        icon: "🗑️",
        label: `Supprimé : ${evt.slug ?? evt.id}`,
        tone: "ok" as const,
      };

    case "stderr":
      return { icon: "⋯", label: evt.message, tone: "muted" as const };

    case "error":
      return {
        icon: "❌",
        label: `${evt.code ? `[${evt.code}] ` : ""}${evt.message}`,
        tone: "error" as const,
      };

    case "done":
      return { icon: "✅", label: "Terminé", tone: "ok" as const };
  }
}

function lastDeleted(events: ProjectDeleteEvt[]) {
  for (let i = events.length - 1; i >= 0; i--) {
    const e = events[i];
    if (e.type === "deleted") return { id: e.id, slug: e.slug };
  }
  return null;
}

export function ProjectDeleteDialog({
  projectId,
  displayId,
  slug,
  siteName,
  triggerVariant = "outline",
  triggerLabel = "Supprimer",
  triggerClassName,
  defaultForce = true,
  onDeleted,
  onOpenChange,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [force, setForce] = React.useState(defaultForce);

  const { deleteProject, loading, done, error, events, reset } = useProjectDelete();

  const computedSlug = slug ?? "—";
  const deletedInfo = lastDeleted(events);

  const confirmDisabled = loading || done;
  const closeLabel = done ? "Fermer" : "Annuler";

  async function onConfirm() {
    const res = await deleteProject({ id: projectId, force });
    if (res.ok) {
      await onDeleted?.({
        id: deletedInfo?.id ?? projectId,
        slug: deletedInfo?.slug ?? slug,
      });
    }
  }

  React.useEffect(() => {
    onOpenChange?.(open);
    if (!open) {
      reset();
      setForce(defaultForce);
    }
  }, [open, onOpenChange, reset, defaultForce]);

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={triggerVariant}
          className={cn(
            triggerVariant === "destructive"
              ? ""
              : "border border-red-500/20 text-red-600 hover:bg-red-500/10 hover:text-red-700",
            triggerClassName
          )}>
          <Trash2 className="mr-2 h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-3">
            <span>Supprimer le projet</span>
            <Badge
              variant="outline"
              className="font-mono">
              {displayId ?? projectId.slice(0, 8)}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Cette action supprime définitivement le dossier du projet et ses fichiers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border p-3 bg-muted/20">
            <div className="text-xs text-muted-foreground">Cible</div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                {computedSlug}
              </Badge>
              {siteName ? (
                <span className="text-sm text-muted-foreground">· {siteName}</span>
              ) : null}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              ID: <span className="font-mono">{projectId}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="force"
              checked={force}
              onCheckedChange={v => setForce(Boolean(v))}
              disabled={confirmDisabled}
            />
            <div className="space-y-1 leading-none">
              <Label
                htmlFor="force"
                className="cursor-pointer">
                Forcer la suppression
              </Label>
              <div className="text-xs text-muted-foreground">
                Supprime le dossier même s’il contient des fichiers.
              </div>
            </div>
          </div>

          {error ? (
            <div className="text-sm text-red-600">
              Erreur : <span className="font-medium">{error}</span>
            </div>
          ) : null}

          {loading || events.length > 0 ? (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Progression</div>
                  <Badge variant="secondary">{events.length}</Badge>
                </div>

                <ScrollArea className="h-44 rounded-xl border bg-muted/20">
                  <div className="space-y-1 p-3 text-sm">
                    {events.map((evt, i) => {
                      const r = renderDeleteEvent(evt);
                      return (
                        <div
                          key={i}
                          className={cn(
                            "flex items-start gap-2 rounded-md px-2 py-1",
                            toneClass(r.tone)
                          )}>
                          <span className="mt-px">{r.icon}</span>
                          <span className="leading-snug">{r.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>

                {done ? (
                  <div className="text-xs text-muted-foreground">
                    Flux terminé · supprimé{" "}
                    <span className="font-medium text-foreground">
                      {deletedInfo?.slug ?? computedSlug}
                    </span>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={loading}>
            {closeLabel}
          </Button>

          {done ? null : (
            <Button
              type="button"
              variant="destructive"
              onClick={onConfirm}
              disabled={confirmDisabled}>
              {loading ? "Suppression…" : "Supprimer le projet"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
