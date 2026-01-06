"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import type { ProjectDeployEvt } from "@sf/shared/projects";
import { apiProjectsDeploy } from "@/lib/api/projects/projects";
import type { Stage } from "@/lib/capabilities";

function asText(v: unknown) {
  if (v == null) return "";
  return typeof v === "string" ? v : String(v);
}

function viewHrefFromSlug(slug: string): string {
  const [client, site] = slug.split("/");
  if (!client || !site) return "/projects";
  return `/projects/${encodeURIComponent(client)}/${encodeURIComponent(site)}/view`;
}

export function ProjectDeployShell({
  slug,
  initialStage,
}: {
  slug: string;
  initialStage: Stage;
}) {
  const [stage, setStage] = React.useState<Stage>(initialStage);

  const [sshHost, setSshHost] = React.useState("");
  const [sshPort, setSshPort] = React.useState("22");
  const [sshUser, setSshUser] = React.useState("");
  const [sshPath, setSshPath] = React.useState("");
  const [sshKey, setSshKey] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [events, setEvents] = React.useState<ProjectDeployEvt[]>([]);

  React.useEffect(() => {
    // Permet de pré-sélectionner l’environnement via la navigation (query param stage).
    setStage(initialStage);
  }, [initialStage]);

  const plan = React.useMemo(() => {
    return events.find(e => e.type === "plan") as
      | (ProjectDeployEvt & { type: "plan"; message?: string; target?: string })
      | undefined;
  }, [events]);

  const steps = React.useMemo(() => {
    return events.filter(e => e.type === "step") as Array<ProjectDeployEvt & { type: "step"; n?: unknown; label?: string }>;
  }, [events]);

  const stderrLines = React.useMemo(() => {
    return events.filter(e => e.type === "stderr") as Array<ProjectDeployEvt & { type: "stderr"; message?: string }>;
  }, [events]);

  const validate = React.useCallback((): string | null => {
    if (!sshHost.trim()) return "SSH host est requis";
    if (!sshUser.trim()) return "SSH user est requis";
    if (!sshPath.trim()) return "SSH path est requis";

    const p = sshPort.trim();
    if (p) {
      const n = Number(p);
      if (!Number.isFinite(n) || n < 1 || n > 65535) return "SSH port invalide";
    }

    return null;
  }, [sshHost, sshUser, sshPath, sshPort]);

  const runDry = React.useCallback(async () => {
    setErr(null);
    setEvents([]);

    const msg = validate();
    if (msg) {
      setErr(msg);
      return;
    }

    setLoading(true);
    const nextEvents: ProjectDeployEvt[] = [];

    try {
      await apiProjectsDeploy(
        slug,
        stage === "production" ? "prod" : "staging",
        {
          host: sshHost.trim(),
          user: sshUser.trim(),
          path: sshPath.trim(),
          port: sshPort.trim() ? Number(sshPort.trim()) : undefined,
          key: sshKey.trim() ? sshKey.trim() : undefined,
        },
        {
          dryRun: true,
          onEvent: e => {
            nextEvents.push(e);
            setEvents([...nextEvents]);
          },
        }
      );
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [slug, stage, sshHost, sshUser, sshPath, sshPort, sshKey, validate]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">Déploiement</div>
            <div className="text-xs text-muted-foreground">Projet : {slug}</div>
          </div>

          <Button asChild variant="secondary" size="sm">
            <Link href={viewHrefFromSlug(slug)}>Retour à la vue projet</Link>
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl">
        <CardHeader className="space-y-2">
          <CardTitle>Vérification & inputs SSH</CardTitle>
          <div className="text-xs text-muted-foreground">
            Cette vue lance un dry-run et affiche le plan. Le déploiement réel n’est pas implémenté pour l’instant.
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Environnement</Label>
            <Select value={stage} onValueChange={v => setStage(v as Stage)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisir" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="staging">staging</SelectItem>
                <SelectItem value="production">production</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>SSH host</Label>
              <Input value={sshHost} onChange={e => setSshHost(e.target.value)} placeholder="example.com" />
            </div>

            <div className="grid gap-2">
              <Label>SSH port</Label>
              <Input value={sshPort} onChange={e => setSshPort(e.target.value)} placeholder="22" />
            </div>

            <div className="grid gap-2">
              <Label>SSH user</Label>
              <Input value={sshUser} onChange={e => setSshUser(e.target.value)} placeholder="deploy" />
            </div>

            <div className="grid gap-2">
              <Label>SSH path</Label>
              <Input value={sshPath} onChange={e => setSshPath(e.target.value)} placeholder="/var/www/site" />
            </div>

            <div className="grid gap-2 md:col-span-2">
              <Label>SSH key (optionnel)</Label>
              <Input value={sshKey} onChange={e => setSshKey(e.target.value)} placeholder="~/.ssh/id_ed25519" />
              <div className="text-xs text-muted-foreground">
                Chemin local vers la clé (optionnel, selon la méthode SSH utilisée côté machine).
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button disabled={loading} onClick={() => void runDry()}>
              {loading ? "Analyse…" : "Prévisualiser le plan (dry-run)"}
            </Button>
            {err ? <div className="text-sm text-red-600">Erreur : {err}</div> : null}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader className="space-y-2">
          <CardTitle>Résultat (dry-run)</CardTitle>
          <div className="text-xs text-muted-foreground">
            Affiche la sortie NDJSON (plan + étapes). Utile pour valider les inputs.
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {plan ? (
            <div className="space-y-1">
              <div className="text-sm font-medium">Plan</div>
              <div className="text-xs text-muted-foreground">
                Target: {plan.target ?? "(inconnu)"} — {plan.message ?? ""}
              </div>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">(aucun plan pour l’instant)</div>
          )}

          {steps.length ? (
            <div className="space-y-2">
              <div className="text-sm font-medium">Étapes</div>
              <div className="space-y-1">
                {steps.map((s, idx) => (
                  <div key={idx} className="text-xs">
                    {asText(s.n) ? `${asText(s.n)} — ` : ""}
                    {s.label ?? ""}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {stderrLines.length ? (
            <div className="space-y-2">
              <div className="text-sm font-medium">stderr</div>
              <pre className="text-xs rounded-xl bg-muted p-3 overflow-auto">
                {stderrLines.map(s => s.message).filter(Boolean).join("\n")}
              </pre>
            </div>
          ) : null}

          {events.length ? (
            <div className="space-y-2">
              <div className="text-sm font-medium">Événements (brut)</div>
              <pre className="text-xs rounded-xl bg-muted p-3 overflow-auto">
                {events.map(e => JSON.stringify(e)).join("\n")}
              </pre>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
