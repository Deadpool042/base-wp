"use client";

import * as React from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { apiClientMeta } from "@/lib/api/clients/client";
import { getCapabilities } from "@/lib/capabilities";

import { ProjectViewProvider, useProjectView } from "./ProjectViewContext";
import { deployHrefFromSlug } from "./ProjectViewActions";

function ClientInfoCard() {
  const { slug, meta, loadingMeta, metaErr } = useProjectView();

  const clientSlug = meta?.identity.client;

  const [clientMeta, setClientMeta] = React.useState<Awaited<ReturnType<typeof apiClientMeta>>>(
    undefined
  );
  const [clientLoading, setClientLoading] = React.useState(false);
  const [clientErr, setClientErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!clientSlug) return;

    let cancelled = false;
    setClientLoading(true);
    setClientErr(null);

    apiClientMeta(clientSlug)
      .then(res => {
        if (cancelled) return;
        setClientMeta(res);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setClientErr(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (cancelled) return;
        setClientLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [clientSlug]);

  return (
    <Card className="rounded-2xl">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center justify-between gap-3">
          <span className="truncate">Client</span>
          <Badge variant="outline">{clientSlug ?? slug}</Badge>
        </CardTitle>
        {loadingMeta ? (
          <div className="text-sm text-muted-foreground">Chargement…</div>
        ) : metaErr ? (
          <div className="text-sm text-red-600">Erreur : {metaErr}</div>
        ) : meta ? (
          <div className="text-sm space-y-2">
            <div>
              <div className="font-medium">{clientMeta?.name ?? meta.identity.client}</div>
              {clientMeta?.company?.legalName ? (
                <div className="text-xs text-muted-foreground">
                  Société : {clientMeta.company.legalName}
                </div>
              ) : null}
            </div>

            {clientLoading ? (
              <div className="text-xs text-muted-foreground">Chargement des metas client…</div>
            ) : clientErr ? (
              <div className="text-xs text-red-600">Erreur meta client : {clientErr}</div>
            ) : null}

            {!clientLoading && !clientErr ? (
              <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground">
                {clientMeta?.contact?.email ? <div>Email : {clientMeta.contact.email}</div> : null}
                {clientMeta?.contact?.phone ? <div>Téléphone : {clientMeta.contact.phone}</div> : null}
                {clientMeta?.company?.country ? <div>Pays : {clientMeta.company.country}</div> : null}
                {clientMeta?.company?.timezone ? <div>Timezone : {clientMeta.company.timezone}</div> : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </CardHeader>
    </Card>
  );
}

export function ProjectViewShell({
  slug,
  form,
  preview,
}: {
  slug: string;
  form: React.ReactNode;
  preview: React.ReactNode;
}) {
  return (
    <ProjectViewProvider slug={slug}>
      <ProjectViewShellInner slug={slug} form={form} preview={preview} />
    </ProjectViewProvider>
  );
}

function ProjectViewShellInner({
  slug,
  form,
  preview,
}: {
  slug: string;
  form: React.ReactNode;
  preview: React.ReactNode;
}) {
  const {
    meta,

    mode,
    setMode,

    hoster,
    setHoster,
    hostingType,
    setHostingType,
    dbMode,
    setDbMode,

    baseServices,

    basePreviewLoading,
    previewLoading,
    previewErr,
    previewValidated,
    setPreviewValidated,
    previewFingerprint,
    currentFingerprint,

    force,
    setForce,

    prepareLoading,
    prepareErr,
    preparedOutDir,
    runPrepare,

    mailpitEnabled,
    setMailpitEnabled,
    redisEnabled,
    setRedisEnabled,
  } = useProjectView();

  const stackTech = meta?.stack?.tech ?? "wordpress";

  const [stage, setStage] = React.useState<"staging" | "production">("staging");

  const capabilities = React.useMemo(() => {
    return getCapabilities({
      stack: stackTech === "next" ? "next" : "wordpress",
      hostingType,
      dockerProfile: mode,
      stage,
    });
  }, [stackTech, hostingType, mode, stage]);

  const mailService = capabilities.services.mail;
  const redisService = capabilities.services.redis;
  const grafanaService = capabilities.services.grafana;
  const lokiService = capabilities.services.loki;

  return (
    <div className="-mx-4">
      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen px-4">
        <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-5">
      <ClientInfoCard />

      <div className="space-y-3">
        <div className="text-lg font-semibold">Environnement (DEV)</div>

        <Card className="rounded-2xl">
          <CardHeader className="space-y-2">
            <CardTitle className="truncate">Profil</CardTitle>
            <div className="text-xs text-muted-foreground">DEV est toujours Docker (local / prod-like).</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <div className="text-sm font-medium">Mode</div>
              <Select value={mode} onValueChange={v => setMode(v as typeof mode)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">local</SelectItem>
                  <SelectItem value="prodlike">prod-like</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="text-sm font-medium">Services autorisés (résumé)</div>
              <div className="text-xs text-muted-foreground">
                {baseServices.length
                  ? baseServices.map(s => `${s.label} (${s.scope})`).join(" — ")
                  : "(chargement…)"}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="text-sm font-medium">Configuration avancée</div>
              <div className="text-xs text-muted-foreground">
                Overrides .env (optionnel). Une valeur vide = pas d’override.
              </div>
              {form}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center justify-between gap-3">
              <span className="truncate">Générer la config Docker (local)</span>
            </CardTitle>
            <div className="text-xs text-muted-foreground">
              Confirmez d’abord le résultat (preview), puis lancez la génération sur disque.
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                disabled={
                  previewLoading ||
                  prepareLoading ||
                  basePreviewLoading ||
                  previewFingerprint !== currentFingerprint ||
                  !!previewErr
                }
                onClick={() => setPreviewValidated(true)}>
                {previewLoading ? "Prévisualisation…" : "Confirmer le résultat"}
              </Button>

              {previewFingerprint !== currentFingerprint ? (
                <span className="text-xs text-muted-foreground">Preview en cours de recalcul…</span>
              ) : null}

              {previewValidated ? <span className="text-xs text-muted-foreground">Confirmé</span> : null}

              {previewErr ? <span className="text-sm text-red-600">Erreur : {previewErr}</span> : null}
            </div>

            <Separator />

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={force}
                  onChange={e => setForce(e.target.checked)}
                  disabled={prepareLoading || previewLoading || basePreviewLoading || !previewValidated}
                />
                Écraser si déjà préparé (--force)
              </label>

              <div className="flex items-center gap-3">
                <Button
                  disabled={prepareLoading || previewLoading || basePreviewLoading || !previewValidated}
                  onClick={async () => {
                    await runPrepare();
                  }}>
                  {prepareLoading ? "Préparation…" : "Préparer"}
                </Button>
                {prepareErr ? <span className="text-sm text-red-600">Erreur : {prepareErr}</span> : null}
              </div>

              {preparedOutDir ? (
                <div className="text-xs text-muted-foreground break-all">Résultat : {preparedOutDir}</div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <div className="text-lg font-semibold">Déploiement (STAGING / PROD)</div>

        <Card className="rounded-2xl">
          <CardHeader className="space-y-2">
            <CardTitle className="truncate">Résumé</CardTitle>
            <div className="text-xs text-muted-foreground">
              Cette section reste un résumé. Le déploiement se fait uniquement dans la vue Deploy.
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <div className="text-sm font-medium">Type d’hébergement</div>
                <Select value={hostingType} onValueChange={v => setHostingType(v as typeof hostingType)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choisir" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mutualise">mutualise</SelectItem>
                    <SelectItem value="dedie">dedie</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <div className="text-sm font-medium">Provider (pour l’instant)</div>
                <Select value={hoster} onValueChange={v => setHoster(v as typeof hoster)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choisir" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="o2switch">o2switch</SelectItem>
                    <SelectItem value="ovh">ovh</SelectItem>
                    <SelectItem value="other">autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <div className="text-sm font-medium">DB mode</div>
                <Select
                  value={dbMode}
                  onValueChange={v => setDbMode(v as typeof dbMode)}
                  disabled={hostingType === "mutualise"}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choisir" />
                  </SelectTrigger>
                  <SelectContent>
                    {hostingType === "mutualise" ? (
                      <SelectItem value="mutualise">mutualise (hébergeur)</SelectItem>
                    ) : (
                      <>
                        <SelectItem value="managed">managed</SelectItem>
                        <SelectItem value="docker">autonomous</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <div className="text-sm font-medium">Stage</div>
                <Select value={stage} onValueChange={v => setStage(v as typeof stage)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choisir" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staging">staging</SelectItem>
                    <SelectItem value="production">production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="text-xs text-muted-foreground">
              {hostingType === "mutualise"
                ? "Mutualisé: pas de Docker en PROD (déploiement via artifact + SSH)."
                : "Dédié: le déploiement dépend du target et des capacités."}
            </div>

            <Button asChild variant="secondary">
              <Link href={deployHrefFromSlug(slug, stage)}>Ouvrir la vue Deploy</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <div className="text-lg font-semibold">Services</div>

        <Card className="rounded-2xl">
          <CardHeader className="space-y-2">
            <CardTitle className="truncate">Toggles & statuts</CardTitle>
            <div className="text-xs text-muted-foreground">
              Les toggles affichés dépendent des capacités (stack + hébergement).
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {mailService.visible ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">Mail</div>
                      <div className="text-xs text-muted-foreground">
                        Capture des emails en dev (Mailpit) ou envoi via provider.
                      </div>
                    </div>
                    <Select
                      value={mailpitEnabled ? "mailpit" : "provider"}
                      onValueChange={v => setMailpitEnabled(v === "mailpit")}
                      disabled={
                        !mailService.enabled || previewLoading || prepareLoading || basePreviewLoading
                      }>
                      <SelectTrigger className="w-50">
                        <SelectValue placeholder="Choisir" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mailpit">mailpit (docker)</SelectItem>
                        <SelectItem value="provider">provider (smtp/cpanel)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Vars: {mailService.requiredEnvVars.join(", ")} — Statut: {mailpitEnabled ? "mailpit activé" : "provider"}
                  </div>
                </div>
              ) : null}

              {redisService.visible ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">Redis</div>
                      <div className="text-xs text-muted-foreground">Cache / objets (optionnel).</div>
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={redisEnabled}
                        onChange={e => setRedisEnabled(e.target.checked)}
                        disabled={
                          !redisService.enabled || previewLoading || prepareLoading || basePreviewLoading
                        }
                      />
                      {redisEnabled ? "activé" : "désactivé"}
                    </label>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Vars: {redisService.requiredEnvVars.join(", ")}
                    {redisService.disabledReason ? ` — ${redisService.disabledReason}` : ""}
                  </div>
                </div>
              ) : null}

              {grafanaService.visible ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">Grafana</div>
                      <div className="text-xs text-muted-foreground">Monitoring (catalogue).</div>
                    </div>
                    <Badge variant="outline">indisponible</Badge>
                  </div>
                  {grafanaService.disabledReason ? (
                    <div className="text-xs text-muted-foreground">{grafanaService.disabledReason}</div>
                  ) : null}
                </div>
              ) : null}

              {lokiService.visible ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">Loki</div>
                      <div className="text-xs text-muted-foreground">Logs (catalogue).</div>
                    </div>
                    <Badge variant="outline">indisponible</Badge>
                  </div>
                  {lokiService.disabledReason ? (
                    <div className="text-xs text-muted-foreground">{lokiService.disabledReason}</div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
        </div>

        <div className="lg:col-span-7">
          <Card className="rounded-2xl">
            <CardHeader className="space-y-2">
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">{preview}</CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
}
