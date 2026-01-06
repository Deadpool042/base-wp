"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { useProjectCreate } from "@/features/projects/hooks/useProjectCreate";
import type { ClientItem } from "@sf/shared/clients";
import type { ProjectCreateEvt } from "@sf/shared/projects";
import { apiClientMeta, apiClientsList, type ClientMeta } from "@/lib/api/clients/client";
import { parseCount } from "@sf/shared/ndjson";
import { ClientSelect } from "@/features/clients/components/ClientsSelect";

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

function renderCreateEvent(evt: ProjectCreateEvt): {
  icon: string;
  label: string;
  tone?: "muted" | "ok" | "error";
} {
  switch (evt.type) {
    case "start":
      return { icon: "•", label: `Démarrage (${evt.op})`, tone: "muted" };

    case "created":
      return {
        icon: "OK",
        label: `Créé : ${evt.slug ?? "—"}`,
        tone: "ok",
      };

    case "stderr":
      return { icon: "⋯", label: evt.message, tone: "muted" };

    case "error":
      return {
        icon: "ERR",
        label: `${evt.code ? `[${evt.code}] ` : ""}${evt.message}`,
        tone: "error",
      };

    case "done": {
      const n = parseCount(evt.count);
      return {
        icon: "OK",
        label: `Terminé${n != null ? ` (total : ${n})` : ""}`,
        tone: "ok",
      };
    }

    default: {
      // exhaustive safety
      const _x: never = evt;
      return { icon: "•", label: String(_x), tone: "muted" };
    }
  }
}

export function NewProjectPage() {
  const router = useRouter();

  const [clients, setClients] = React.useState<ClientItem[]>([]);
  const [loadingClients, setLoadingClients] = React.useState(true);

  const [client, setClient] = React.useState("");
  const [site, setSite] = React.useState("");

  const [tech, setTech] = React.useState<"wordpress" | "next">("wordpress");
  const [headless, setHeadless] = React.useState(false);

  React.useEffect(() => {
    if (tech !== "wordpress") setHeadless(false);
  }, [tech]);

  const computedClientSlug = React.useMemo(() => slugify(client), [client]);
  const computedSiteSlug = React.useMemo(() => slugify(site), [site]);
  const computedProjectSlug = React.useMemo(() => {
    if (!computedClientSlug || !computedSiteSlug) return "";
    return `${computedClientSlug}/${computedSiteSlug}`;
  }, [computedClientSlug, computedSiteSlug]);

  const [selectedClientMeta, setSelectedClientMeta] = React.useState<ClientMeta | undefined>(undefined);
  const [loadingClientMeta, setLoadingClientMeta] = React.useState(false);
  const [clientMetaError, setClientMetaError] = React.useState<string | null>(null);

  const { createProject, loading, error, events, reset } = useProjectCreate();

  React.useEffect(() => {
    let alive = true;
    setLoadingClients(true);

    apiClientsList()
      .then(items => {
        if (!alive) return;
        setClients([...items].sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch(() => {
        // tu peux brancher un toast si tu veux
      })
      .finally(() => {
        if (!alive) return;
        setLoadingClients(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  React.useEffect(() => {
    const c = computedClientSlug;
    if (!c) {
      setSelectedClientMeta(undefined);
      setClientMetaError(null);
      setLoadingClientMeta(false);
      return;
    }

    let alive = true;
    setLoadingClientMeta(true);
    setClientMetaError(null);

    apiClientMeta(c)
      .then(meta => {
        if (!alive) return;
        setSelectedClientMeta(meta);
      })
      .catch(err => {
        if (!alive) return;
        setSelectedClientMeta(undefined);
        setClientMetaError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!alive) return;
        setLoadingClientMeta(false);
      });

    return () => {
      alive = false;
    };
  }, [computedClientSlug]);

  const canSubmit = React.useMemo(() => {
    return !!computedClientSlug && !!computedSiteSlug && !loading;
  }, [computedClientSlug, computedSiteSlug, loading]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    reset();

    const c = computedClientSlug;
    const s = computedSiteSlug;
    if (!c || !s) return;

    const res = await createProject({ client: c, site: s, tech, headless: tech === "wordpress" ? headless : false });

    if (res.ok) {
      // router.push(`/projects/${encodeURIComponent(cc)}/${encodeURIComponent(ss)}`);
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center justify-between">
            <span>Nouveau projet</span>
            <Badge variant="outline">projects/new</Badge>
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Crée un nouveau projet sous un client (structure de dossiers).
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <form
            onSubmit={onSubmit}
            className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="text-sm font-medium">Technologie</div>
                <Select
                  value={tech}
                  onValueChange={v => setTech(v as "wordpress" | "next")}
                  disabled={loading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wordpress">WordPress</SelectItem>
                    <SelectItem value="next">Next.js</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-xs text-muted-foreground">
                  Ce choix pilote le formulaire et la génération dev prodlike.
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">{tech === "wordpress" ? "Mode WordPress" : "Mode"}</div>
                {tech === "wordpress" ? (
                  <Select
                    value={headless ? "headless" : "classic"}
                    onValueChange={v => setHeadless(v === "headless")}
                    disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classic">WordPress (non headless)</SelectItem>
                      <SelectItem value="headless">WordPress headless</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm text-muted-foreground rounded-xl bg-muted p-3">
                    Next.js (stack minimal pour l’instant)
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Client */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Client</div>

                <ClientSelect
                  value={client}
                  onChange={setClient}
                  items={clients}
                  disabled={loading || loadingClients}
                  placeholder={loadingClients ? "Chargement des clients…" : "Sélectionner un client"}
                />

                <div className="text-xs text-muted-foreground">
                  slug : <span className="font-mono">{computedClientSlug || "—"}</span>
                </div>
              </div>

              {/* Site */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Nom du site</div>
                <Input
                  value={site}
                  onChange={e => setSite(e.target.value)}
                  placeholder="landing"
                  disabled={loading}
                />
                <div className="text-xs text-muted-foreground">
                  slug : <span className="font-mono">{computedSiteSlug || "—"}</span>
                </div>
              </div>
            </div>

            {error ? <div className="text-sm text-red-600">Erreur : {error}</div> : null}

            <div className="text-xs text-muted-foreground">
              Résumé : {tech === "wordpress" ? "WordPress" : "Next.js"}
              {tech === "wordpress" ? (headless ? " (headless)" : " (non headless)") : ""}
              {computedProjectSlug ? (
                <>
                  {" "}· slug : <span className="font-mono">{computedProjectSlug}</span>
                </>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="submit"
                disabled={!canSubmit}>
                {loading ? "Création…" : "Créer le projet"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push("/projects")}
                disabled={loading}>
                Annuler
              </Button>
            </div>
          </form>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Infos client</div>
              <Badge variant="secondary">{computedClientSlug || "—"}</Badge>
            </div>

            {!computedClientSlug ? (
              <div className="text-sm text-muted-foreground">
                Sélectionne un client pour afficher ses informations.
              </div>
            ) : clientMetaError ? (
              <div className="text-sm text-red-600">Erreur : {clientMetaError}</div>
            ) : loadingClientMeta ? (
              <div className="text-sm text-muted-foreground">Chargement…</div>
            ) : selectedClientMeta ? (
              <div className="grid gap-1 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Nom</span>
                  <span className="truncate">{selectedClientMeta.name || "—"}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Email</span>
                  <span className="truncate">{selectedClientMeta.contact?.email || "—"}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Téléphone</span>
                  <span className="truncate">{selectedClientMeta.contact?.phone || "—"}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Société</span>
                  <span className="truncate">{selectedClientMeta.company?.legalName || "—"}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Pays</span>
                  <span className="truncate">{selectedClientMeta.company?.country || "—"}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Timezone</span>
                  <span className="truncate">{selectedClientMeta.company?.timezone || "—"}</span>
                </div>
                {(selectedClientMeta.createdAt || selectedClientMeta.updatedAt) ? (
                  <div className="pt-1 text-xs text-muted-foreground">
                    {selectedClientMeta.createdAt ? `créé : ${selectedClientMeta.createdAt}` : null}
                    {selectedClientMeta.createdAt && selectedClientMeta.updatedAt ? " · " : null}
                    {selectedClientMeta.updatedAt ? `modifié : ${selectedClientMeta.updatedAt}` : null}
                  </div>
                ) : null}

                <div className="pt-1 text-xs text-muted-foreground">
                  chemin : <span className="font-mono">projects/{computedClientSlug}/data/client_meta.json</span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Client introuvable (meta absente). Vérifie le client sélectionné.
              </div>
            )}
          </div>

          {(loading || events.length > 0) && (
            <>
              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Progression</div>
                  <Badge variant="secondary">{events.length}</Badge>
                </div>

                <ScrollArea className="h-48 rounded-xl border bg-muted/20">
                  <div className="space-y-1 p-3 text-sm">
                    {events.map((evt, i) => {
                      const r = renderCreateEvent(evt);

                      return (
                        <div
                          key={i}
                          className={cn(
                            "flex items-start gap-2 rounded-md px-2 py-1",
                            r.tone === "error" && "bg-red-500/10 text-red-600",
                            r.tone === "ok" && "text-foreground font-medium",
                            r.tone === "muted" && "text-muted-foreground"
                          )}>
                          <span className="mt-px">{r.icon}</span>
                          <span className="leading-snug">{r.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
