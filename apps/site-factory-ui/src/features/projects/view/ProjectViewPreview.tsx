"use client";

import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { useProjectView } from "./ProjectViewContext";

function isSensitiveEnvKey(key: string): boolean {
  const k = key.toUpperCase();
  return k.includes("PASSWORD") || k.includes("SECRET") || k.includes("TOKEN");
}

function maskedEnvForDebug(env: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(env)) {
    out[k] = isSensitiveEnvKey(k) ? "••••••" : v;
  }
  return out;
}

// Résout des formes simples: ${VAR}, ${VAR:-default}, ${VAR-default}
function resolveComposeVars(input: string, env: Record<string, string>): string {
  return input.replace(/\$\{([A-Z0-9_]+)(?::-(.*?))?(-.*?)?\}/gi, (_m, nameRaw, defaultIfEmptyRaw, defaultIfUnsetRaw) => {
    const name = String(nameRaw);
    const value = env[name];

    if (defaultIfEmptyRaw != null) {
      // ${VAR:-x} => x si VAR vide OU unset
      if (value == null || value === "") return String(defaultIfEmptyRaw);
      return value;
    }

    if (defaultIfUnsetRaw != null) {
      // ${VAR-x} => x si VAR unset
      const def = String(defaultIfUnsetRaw).replace(/^-/, "");
      if (value == null) return def;
      return value;
    }

    return value ?? "";
  });
}

function compactPath(p: string): string {
  const idx = p.indexOf("/projects/");
  if (idx >= 0) return p.slice(idx + 1); // -> projects/...
  return p;
}

function renderPathTree(paths: string[]): string {
  // Affiche une arborescence simple à partir d'une liste de chemins.
  // On conserve l'ordre trié pour un rendu déterministe.
  const norm = paths
    .map(p => p.replace(/\\/g, "/").replace(/\/+$/g, ""))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  const out: string[] = [];
  let prevParts: string[] = [];

  for (const p of norm) {
    const parts = p.split("/").filter(Boolean);
    let common = 0;
    while (common < parts.length && common < prevParts.length && parts[common] === prevParts[common]) {
      common++;
    }

    for (let i = common; i < parts.length; i++) {
      const indent = "  ".repeat(i);
      out.push(`${indent}${parts[i]}`);
    }

    prevParts = parts;
  }

  return out.join("\n");
}

function filterComposeServiceBlocks(content: string, opts: { removeServices?: string[]; removeVolumes?: string[] }) {
  const removeServices = new Set((opts.removeServices ?? []).filter(Boolean));
  const removeVolumes = new Set((opts.removeVolumes ?? []).filter(Boolean));
  if (!removeServices.size && !removeVolumes.size) return content;

  const lines = content.split(/\r?\n/);

  let section: "services" | "volumes" | null = null;
  let skipping = false;
  let skippingIndent = 0;

  const out: string[] = [];

  for (const line of lines) {
    const indent = (line.match(/^\s*/)?.[0]?.length ?? 0);
    const trimmed = line.trimEnd();

    // Détecte la sortie d’un bloc skip (indentation moins profonde)
    if (skipping && indent <= skippingIndent && trimmed.trim() !== "") {
      skipping = false;
      skippingIndent = 0;
    }

    // Détecte les sections top-level
    if (indent === 0 && /^services:\s*$/.test(trimmed)) {
      section = "services";
      out.push(line);
      continue;
    }
    if (indent === 0 && /^volumes:\s*$/.test(trimmed)) {
      section = "volumes";
      out.push(line);
      continue;
    }
    if (indent === 0 && /^[a-zA-Z0-9_.-]+:\s*$/.test(trimmed) && !/^services:\s*$/.test(trimmed) && !/^volumes:\s*$/.test(trimmed)) {
      // autre section top-level
      section = null;
    }

    if (section === "services" && indent === 2) {
      const m = trimmed.match(/^([a-zA-Z0-9_.-]+):\s*$/);
      if (m) {
        const serviceName = m[1];
        if (removeServices.has(serviceName)) {
          skipping = true;
          skippingIndent = indent;
          continue;
        }
      }
    }

    if (section === "volumes" && indent === 2) {
      const m = trimmed.match(/^([a-zA-Z0-9_.-]+):\s*$/);
      if (m) {
        const volumeName = m[1];
        if (removeVolumes.has(volumeName)) {
          skipping = true;
          skippingIndent = indent;
          continue;
        }
      }
    }

    if (skipping) continue;
    out.push(line);
  }

  return out.join("\n");
}

export function ProjectViewPreview() {
  const {
    meta,
    computedDomain,
    mode,
    computedTarget,
    hoster,
    hostingType,
    dbMode,
    previewEnv,
    previewOutDir,
    previewEnvFile,
    dockerFiles,
    mailpitEnabled,
    redisEnabled,
    computedSet,
    effectiveSet,
    previewLoading,
    previewErr,
  } = useProjectView();

  const debugEnv = React.useMemo(() => maskedEnvForDebug(previewEnv), [previewEnv]);

  const dockerResolved = React.useMemo(() => {
    const removeServices: string[] = [];
    const removeVolumes: string[] = [];

    if (!mailpitEnabled) removeServices.push("mailpit");
    if (!redisEnabled) removeServices.push("redis");

    // certains templates peuvent déclarer un volume redis; on le masque aussi.
    if (!redisEnabled) removeVolumes.push("redis");

    const out: Array<{ variant: string; file: string; content: string }> = [];
    const variants = Object.entries(dockerFiles ?? {});
    for (const [variant, files] of variants) {
      if (!files) continue;
      for (const [file, lines] of Object.entries(files)) {
        const raw = (lines ?? []).join("\n");
        const resolved = resolveComposeVars(raw, debugEnv);
        const filtered = filterComposeServiceBlocks(resolved, { removeServices, removeVolumes });
        out.push({ variant, file, content: filtered });
      }
    }
    return out.sort((a, b) => (a.variant + "/" + a.file).localeCompare(b.variant + "/" + b.file));
  }, [dockerFiles, debugEnv, mailpitEnabled, redisEnabled]);

  const modeLabel = React.useMemo(() => {
    if (mode === "local") return "local";
    return "prod-like";
  }, [mode]);

  const [generatedAt, setGeneratedAt] = React.useState<string | null>(null);
  React.useEffect(() => {
    setGeneratedAt(new Date().toISOString());
  }, []);

  const metaJson = React.useMemo(() => {
    const base: Record<string, unknown> = {
      schema_version: 1,
      source: meta ? { client: meta.identity.client, site: meta.identity.site_name } : undefined,

      mode,
      target: computedTarget,
      hoster,
      hostingType,
      dbMode,
      computedDomain,

      computedSet,
      effectiveSet,
    };

    if (generatedAt) base.generated_at = generatedAt;
    return base;
  }, [meta, mode, computedTarget, hoster, hostingType, dbMode, computedDomain, computedSet, effectiveSet, generatedAt]);

  const envLocalLines = React.useMemo(() => {
    const env = {
      ...previewEnv,
      ENV_VARIANT: previewEnv.ENV_VARIANT ?? "local",
    };
    const entries = Object.entries(env).sort(([a], [b]) => a.localeCompare(b));
    return entries.map(([k, v]) => `${k}=${v}`);
  }, [previewEnv]);

  const generatedFiles = React.useMemo(() => {
    const outDir = previewOutDir || "";
    if (!outDir) return [];

    const files: string[] = [];
    files.push(compactPath(outDir));
    files.push(compactPath(`${outDir}/meta.preview.json`));
    if (previewEnvFile) files.push(compactPath(previewEnvFile));

    const byVariant = Object.values(dockerFiles || {});
    for (const vfiles of byVariant) {
      if (!vfiles) continue;
      for (const file of Object.keys(vfiles)) {
        files.push(compactPath(`${outDir}/${file}`));
      }
    }

    return Array.from(new Set(files)).sort((a, b) => a.localeCompare(b));
  }, [previewOutDir, previewEnvFile, dockerFiles]);

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl">
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center justify-between">
            <span>Preview</span>
            <div className="text-xs text-muted-foreground">{modeLabel}</div>
          </CardTitle>
          <div className="text-xs text-muted-foreground">Domaine calculé : {computedDomain || "(en attente)"}</div>
          <div className="text-xs text-muted-foreground">
            Source : {meta ? `${meta.identity.client} / ${meta.identity.site_name}` : "(chargement…)"}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {previewLoading ? <div className="text-xs text-muted-foreground">Recalcul…</div> : null}
          {previewErr ? <div className="text-sm text-red-600">Erreur : {previewErr}</div> : null}

          <div className="space-y-2">
            <div className="text-sm font-medium">Fichiers générés (pour ce target)</div>
            <pre className="text-xs rounded-xl bg-muted p-3 overflow-auto">
              {generatedFiles.length ? renderPathTree(generatedFiles) : "(en attente)"}
            </pre>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="text-sm font-medium">meta.preview.json</div>
            <pre className="text-xs rounded-xl bg-muted p-3 overflow-auto">
              {JSON.stringify(metaJson, null, 2)}
            </pre>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="text-sm font-medium">.env (local)</div>
            <pre className="text-xs rounded-xl bg-muted p-3 overflow-auto">
              {envLocalLines.length ? envLocalLines.join("\n") : "(aucune donnée)"}
            </pre>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="text-sm font-medium">Docker (contenu résolu pour debug)</div>
            <div className="text-xs text-muted-foreground">
              Affiche les fichiers générés avec substitution des variables ${"${VAR}"}. Les valeurs sensibles sont masquées.
            </div>

            {dockerResolved.length ? (
              <div className="space-y-4">
                {dockerResolved.map(item => (
                  <div key={`${item.variant}/${item.file}`} className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      {item.variant}/{item.file}
                    </div>
                    <pre className="text-xs rounded-xl bg-muted p-3 overflow-auto">{item.content}</pre>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">(aucun fichier docker à afficher)</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
