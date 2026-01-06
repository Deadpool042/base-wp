"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
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

import { useProjectView } from "./ProjectViewContext";

type PlanV1 = {
  warnings?: unknown[];
  requiredActions?: unknown[];
  deploy?: { kind?: unknown };
  environment?: { security?: { ssl?: { mode?: unknown } } };
  services?: { enabled?: Array<{ id?: unknown; variant?: unknown }> };
};

function asPlanV1(v: unknown): PlanV1 | null {
  if (!v || typeof v !== "object") return null;
  return v as PlanV1;
}

export function NewProjectHero() {
  const {
    meta,
    profile,

    hoster,
    setHoster,
    hostingType,
    setHostingType,
    dbMode,
    setDbMode,
    computedTarget,

    mode,
    setMode,
    domainBase,
    setDomainBase,
    stagingPrefix,
    setStagingPrefix,

    computedDomain,

    baseServices,
    mailpitEnabled,
    setMailpitEnabled,

    redisEnabled,
    setRedisEnabled,

    planLoading,
    planErr,
    planJson,
    runPlanBuild,

    basePreviewLoading,
    basePreviewErr,
  } = useProjectView();

  const stackTech = React.useMemo(() => {
    return meta?.stack?.tech ?? "wordpress";
  }, [meta]);

  const stackLabel = stackTech === "next" ? "Next.js" : "WordPress";
  const headless = !!meta?.stack?.headless;

  const runtimeProfileLabel = React.useMemo(() => {
    if (mode === "local") return "dev";
    if (mode === "prodlike") return "staging (prod-like)";
  }, [mode]);

  const redisAvailable = React.useMemo(() => {
    return stackTech === "wordpress" && hostingType === "dedie";
  }, [stackTech, hostingType]);

  const redisDisabledReason = React.useMemo(() => {
    if (redisAvailable) return "";
    if (stackTech !== "wordpress") return "Redis est proposé uniquement pour WordPress (cache Object Cache).";
    return "Redis nécessite un hébergement dédié (VPS).";
  }, [redisAvailable, stackTech]);

  const redisRecommendation = React.useMemo(() => {
    if (!redisAvailable) return "";
    if (mode === "prodlike") return "Recommandé si le site a du trafic ou des caches WordPress (Object Cache).";
    return "Optionnel en local (utile pour tester le cache WP).";
  }, [redisAvailable, mode]);

  return (
    <Card className="rounded-2xl">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center justify-between gap-3">
          <span className="truncate">Planification</span>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline">{stackLabel}</Badge>
            {headless ? <Badge variant="outline">Headless</Badge> : null}
            <Badge variant="outline">{runtimeProfileLabel}</Badge>
          </div>
        </CardTitle>
        <div className="text-xs text-muted-foreground">
          La preview et le plan se basent sur ces choix. En local, le runtime est toujours Docker.
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground truncate">
            Domaine calculé : {computedDomain || "(en attente)"}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="secondary"
              disabled={basePreviewLoading || planLoading}
              onClick={() => {
                void runPlanBuild();
              }}>
              {planLoading ? "Plan…" : "Générer le plan"}
            </Button>
          </div>
        </div>
        {planErr ? <div className="text-sm text-red-600">Erreur plan : {planErr}</div> : null}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-3">
            <div className="text-sm font-medium">Runtime local (Docker)</div>

            <div className="space-y-2">
              <div className="grid gap-2">
                <Label>Profil de templates</Label>
                <div className="text-xs text-muted-foreground">
                  Utilisé : <span className="font-medium">{profile}</span>
                </div>
              </div>
              {basePreviewErr ? <div className="text-sm text-red-600">Erreur : {basePreviewErr}</div> : null}
              {basePreviewLoading ? <div className="text-xs text-muted-foreground">Chargement…</div> : null}
              <div className="text-xs text-muted-foreground">
                Pour l’instant, ce choix pilote les templates Docker utilisés pour la génération.
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium">Stack</div>

            <div className="grid gap-3">
              <div className="rounded-md border p-3 space-y-2">
                <div className="text-xs font-medium">Technologie</div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{stackLabel}</Badge>
                  {headless ? <Badge variant="outline">Headless</Badge> : null}
                </div>
                <div className="text-xs text-muted-foreground">
                  Ces infos viennent du projet (meta) et pilotent ce qui est pertinent (DB, proxy, etc.).
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Hébergeur</Label>
                <Select
                  value={hoster}
                  onValueChange={v => {
                    const next = v as typeof hoster;
                    setHoster(next);
                    if (next === "o2switch") {
                      setHostingType("mutualise");
                      setDbMode("mutualise");
                    }
                  }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choisir" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ovh">OVH</SelectItem>
                    <SelectItem value="o2switch">o2switch</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Type d’hébergement</Label>
                <Select
                  value={hostingType}
                  onValueChange={v => {
                    const next = v as typeof hostingType;
                    setHostingType(next);
                    if (next === "mutualise") setDbMode("mutualise");
                  }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choisir" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mutualise">Mutualisé</SelectItem>
                    <SelectItem value="dedie" disabled={hoster === "o2switch"}>
                      Dédié (VPS)
                    </SelectItem>
                  </SelectContent>
                </Select>
                {hoster === "o2switch" ? (
                  <div className="text-xs text-muted-foreground">
                    o2switch est traité comme mutualisé (simplification UX).
                  </div>
                ) : null}
              </div>

              {stackTech === "wordpress" ? (
                <div className="grid gap-2">
                  <Label>Base de données</Label>
                  <Select
                    value={dbMode}
                    onValueChange={v => {
                      setDbMode(v as typeof dbMode);
                    }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent>
                      {hostingType === "mutualise" ? (
                        <SelectItem value="mutualise">Mutualisée (hébergeur)</SelectItem>
                      ) : (
                        <>
                          <SelectItem value="docker">Dans Docker</SelectItem>
                          <SelectItem value="managed">Managée</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-muted-foreground">
                    Mutualisée = DB fournie par l’hébergeur. Managée = provider externe. Docker = autonome.
                  </div>
                </div>
              ) : null}

              <div className="text-xs text-muted-foreground">Target calculée : {computedTarget}</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium">Services</div>

            <div className="rounded-md border p-3 space-y-2">
              <div className="text-xs font-medium">Services attendus</div>
              <div className="space-y-2">
                {baseServices.map(s => (
                  <div key={s.id} className="flex items-center justify-between gap-3">
                    <div className="text-sm truncate">{s.label}</div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline">{s.scope === "docker" ? "Docker" : "External"}</Badge>
                      <Badge variant="outline">{s.required ? "Requis" : "Optionnel"}</Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted-foreground">
                En dev (local/prodlike), des services peuvent s’ajouter (ex: Mailpit).
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={mailpitEnabled}
                onChange={e => setMailpitEnabled(e.target.checked)}
              />
              Mailpit (capture des emails)
            </label>
            <div className="text-xs text-muted-foreground">
              {mailpitEnabled ? (
                <span>
                  Actif si Docker est lancé avec <span className="font-medium">--profile dev</span>.
                </span>
              ) : (
                <span>Désactivé (pas de service mail local).</span>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={redisEnabled}
                onChange={e => setRedisEnabled(e.target.checked)}
                disabled={!redisAvailable}
              />
              Redis (cache)
            </label>
            <div className="text-xs text-muted-foreground">
              {!redisAvailable ? (
                <span>{redisDisabledReason}</span>
              ) : redisEnabled ? (
                <span>
                  Activé : lancer Docker avec <span className="font-medium">--profile redis</span> (service optionnel).
                </span>
              ) : (
                <span>Désactivé. {redisRecommendation}</span>
              )}
            </div>

            {asPlanV1(planJson) ? (
              <div className="rounded-md border p-3 space-y-2">
                <div className="text-xs font-medium">Plan (dernière génération)</div>

                {(() => {
                  const plan = asPlanV1(planJson);
                  if (!plan) return null;

                  return (
                    <>
                      {Array.isArray(plan.warnings) && plan.warnings.length ? (
                  <div className="text-xs text-muted-foreground">
                    <div className="font-medium text-foreground">Warnings</div>
                    <ul className="list-disc pl-5 space-y-1">
                      {plan.warnings.map((w: unknown, i: number) => (
                        <li key={i}>{String(w)}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                      {Array.isArray(plan.requiredActions) && plan.requiredActions.length ? (
                  <div className="text-xs text-muted-foreground">
                    <div className="font-medium text-foreground">Actions requises</div>
                    <ul className="list-disc pl-5 space-y-1">
                      {plan.requiredActions.map((a: unknown, i: number) => (
                        <li key={i}>{String(a)}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="grid gap-2 md:grid-cols-2">
                  <div className="text-xs text-muted-foreground">
                    <div className="font-medium text-foreground">Déploiement</div>
                          <div>{plan.deploy?.kind ? String(plan.deploy.kind) : "(inconnu)"}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <div className="font-medium text-foreground">SSL</div>
                          <div>
                            {plan.environment?.security?.ssl?.mode
                              ? String(plan.environment.security.ssl.mode)
                              : "(inconnu)"}
                          </div>
                  </div>
                </div>

                      {Array.isArray(plan.services?.enabled) && plan.services?.enabled.length ? (
                  <div className="text-xs text-muted-foreground">
                    <div className="font-medium text-foreground">Services activés</div>
                    <div className="flex flex-wrap gap-2">
                      {plan.services.enabled.map((s, i: number) => (
                        <Badge key={i} variant="outline">
                          {String(s?.id)}:{String(s?.variant)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
                    </>
                  );
                })()}
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Profil (dev)</Label>
            <Select
              value={mode}
              onValueChange={v => {
                setMode(v as typeof mode);
              }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisir" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">local</SelectItem>
                <SelectItem value="prodlike">staging (prod-like)</SelectItem>
              </SelectContent>
            </Select>
            {mode === "prodlike" ? (
              <div className="text-xs text-muted-foreground">Dev “prod-like” : domaine préfixé, runtime Docker.</div>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Domaine</Label>
            {mode === "local" ? (
              <Input value={computedDomain} disabled placeholder="(calculé)" />
            ) : (
              <Input
                value={domainBase}
                onChange={e => setDomainBase(e.target.value)}
                placeholder="ex: exemple.com"
                disabled={basePreviewLoading}
              />
            )}

            {mode === "prodlike" ? (
              <div className="space-y-2">
                <Label>Préfixe staging</Label>
                <Input
                  value={stagingPrefix}
                  onChange={e => setStagingPrefix(e.target.value)}
                  placeholder="staging"
                  disabled={basePreviewLoading}
                />
              </div>
            ) : null}

            <div className="text-xs text-muted-foreground">
              Domaine calculé : {computedDomain || "(en attente)"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
