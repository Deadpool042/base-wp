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

import type { ClientDeleteEvt } from "@sf/shared/clients";
import { apiClientsDelete } from "@/lib/api/clients/client";

type Props = {
  clients: string[];
  triggerVariant?: "ghost" | "outline" | "default" | "destructive";
  triggerLabel?: string;
  triggerClassName?: string;
  defaultForce?: boolean;
  onDeleted?: (payload: { deleted: string[] }) => void | Promise<void>;
  onOpenChange?: (open: boolean) => void;
};

type Line = { tone: "muted" | "ok" | "error"; text: string };

function pushLine(setLines: React.Dispatch<React.SetStateAction<Line[]>>, line: Line) {
  setLines(prev => [...prev, line]);
}

function renderEvt(evt: ClientDeleteEvt): Line | null {
  switch (evt.type) {
    case "start":
      return { tone: "muted", text: `Démarrage (${evt.op})` };
    case "deleted":
      return { tone: "ok", text: `Supprimé : ${evt.client}` };
    case "stderr":
      return { tone: "muted", text: evt.message };
    case "error":
      return { tone: "error", text: `${evt.code ? `[${evt.code}] ` : ""}${evt.message}` };
    case "done":
      return { tone: "ok", text: "Terminé" };
  }
}

function toneClass(tone: Line["tone"]) {
  if (tone === "error") return "bg-red-500/10 text-red-600";
  if (tone === "ok") return "text-foreground font-medium";
  return "text-muted-foreground";
}

export function ClientsBulkDeleteDialog({
  clients,
  triggerVariant = "outline",
  triggerLabel = "Supprimer la sélection",
  triggerClassName,
  defaultForce = true,
  onDeleted,
  onOpenChange,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [force, setForce] = React.useState(defaultForce);
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [lines, setLines] = React.useState<Line[]>([]);

  const confirmDisabled = loading || done || clients.length === 0;
  const closeLabel = done ? "Fermer" : "Annuler";

  async function onConfirm() {
    if (clients.length === 0) return;

    setLoading(true);
    setDone(false);
    setError(null);
    setLines([]);

    const deleted: string[] = [];

    for (const client of clients) {
      pushLine(setLines, { tone: "muted", text: `Suppression : ${client}` });

      try {
        const evts = await apiClientsDelete(client, {
          force,
          onEvent: evt => {
            const l = renderEvt(evt);
            if (l) pushLine(setLines, l);
          },
        });

        for (const e of evts) {
          if (e.type === "deleted") deleted.push(e.client);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Erreur inconnue";
        setError(msg);
        pushLine(setLines, { tone: "error", text: `Erreur : ${msg}` });
      }
    }

    setLoading(false);
    setDone(true);
    await onDeleted?.({ deleted });
  }

  React.useEffect(() => {
    onOpenChange?.(open);
    if (!open) {
      setForce(defaultForce);
      setLoading(false);
      setDone(false);
      setError(null);
      setLines([]);
    }
  }, [open, onOpenChange, defaultForce]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            <span>Supprimer des clients</span>
            <Badge variant="secondary">{clients.length}</Badge>
          </DialogTitle>
          <DialogDescription>
            Cette action supprime définitivement les dossiers clients sélectionnés et leurs fichiers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border p-3 bg-muted/20">
            <div className="text-xs text-muted-foreground">Cibles</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {clients.map(c => (
                <Badge
                  key={c}
                  variant="outline"
                  className="font-mono">
                  {c}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="force-clients"
              checked={force}
              onCheckedChange={v => setForce(Boolean(v))}
              disabled={loading || done}
            />
            <div className="space-y-1 leading-none">
              <Label htmlFor="force-clients" className="cursor-pointer">
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

          {loading || lines.length > 0 ? (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Progression</div>
                  <Badge variant="secondary">{lines.length}</Badge>
                </div>

                <ScrollArea className="h-44 rounded-xl border bg-muted/20">
                  <div className="space-y-1 p-3 text-sm">
                    {lines.map((l, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex items-start gap-2 rounded-md px-2 py-1",
                          toneClass(l.tone)
                        )}>
                        <span className="leading-snug">{l.text}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
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
            <Button type="button" variant="destructive" onClick={onConfirm} disabled={confirmDisabled}>
              {loading ? "Suppression…" : "Supprimer la sélection"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
