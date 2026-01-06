"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useProjectView } from "./ProjectViewContext";

type FieldKind = "text" | "select";

type FieldDef = {
  key: string;
  kind: FieldKind;
  options?: { value: string; label: string }[];
};

const TZ_OPTIONS: FieldDef["options"] = [
  { value: "Europe/Paris", label: "Europe/Paris" },
  { value: "Europe/London", label: "Europe/London" },
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "America/New_York" },
];

const WP_LOCALE_OPTIONS: FieldDef["options"] = [
  { value: "fr_FR", label: "fr_FR" },
  { value: "en_US", label: "en_US" },
  { value: "es_ES", label: "es_ES" },
  { value: "de_DE", label: "de_DE" },
  { value: "it_IT", label: "it_IT" },
];

const BOOL_01_OPTIONS: FieldDef["options"] = [
  { value: "0", label: "0" },
  { value: "1", label: "1" },
];

const WP_MEMORY_OPTIONS: FieldDef["options"] = [
  { value: "40M", label: "40M" },
  { value: "64M", label: "64M" },
  { value: "96M", label: "96M" },
  { value: "128M", label: "128M" },
  { value: "256M", label: "256M" },
  { value: "512M", label: "512M" },
];

function parseMemoryToMb(v: string): number {
  const s = (v || "").trim().toUpperCase();
  const m = s.match(/^([0-9]+)\s*([KMG])?B?$/);
  if (!m) return NaN;
  const n = Number(m[1]);
  const unit = m[2] || "M";
  if (!Number.isFinite(n)) return NaN;
  if (unit === "K") return n / 1024;
  if (unit === "G") return n * 1024;
  return n;
}

function isSensitiveKey(key: string) {
  return key === "DB_PASSWORD" || key === "DB_ROOT_PASSWORD";
}

function fieldDefForKey(key: string): FieldDef {
  if (key === "TZ") return { key, kind: "select", options: TZ_OPTIONS };
  if (key === "WP_LOCALE") return { key, kind: "select", options: WP_LOCALE_OPTIONS };
  if (key === "WP_DEBUG" || key === "WP_DEBUG_LOG" || key === "WP_DEBUG_DISPLAY") {
    return { key, kind: "select", options: BOOL_01_OPTIONS };
  }
  if (key === "WP_MEMORY_LIMIT" || key === "WP_MAX_MEMORY_LIMIT") {
    return { key, kind: "select", options: WP_MEMORY_OPTIONS };
  }
  return { key, kind: "text" };
}

export function ProjectViewForm() {
  const {
    basePreviewLoading,
    envKeys,
    baseEnv,

    overrides,
    setOverrides,
    previewLoading,
    prepareLoading,
  } = useProjectView();

  const [advancedOpen, setAdvancedOpen] = React.useState(false);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium">Overrides (avancé)</div>
            <div className="text-xs text-muted-foreground">
              Les clés viennent de la génération. Une valeur vide = pas d’override.
            </div>
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={() => setAdvancedOpen(v => !v)}>
            {advancedOpen ? "Réduire" : "Afficher"}
          </Button>
        </div>

        {advancedOpen ? (
          <div className="space-y-3">
            {envKeys.length ? (
              envKeys.map(key => {
              const def = fieldDefForKey(key);
              const baseValue = baseEnv[key];
              const baseValueLabel =
                baseValue != null && isSensitiveKey(key) ? "••••••" : baseValue;

              const effectiveValue = overrides[key] ?? baseValue ?? "";

              // WP limits: contraintes simples (max >= memory).
              const memoryLimit =
                key === "WP_MAX_MEMORY_LIMIT"
                  ? overrides.WP_MEMORY_LIMIT ?? baseEnv.WP_MEMORY_LIMIT ?? ""
                  : effectiveValue;

              const memoryMb = parseMemoryToMb(memoryLimit);
              const maxOptions =
                key === "WP_MAX_MEMORY_LIMIT" && Number.isFinite(memoryMb)
                  ? (def.options ?? []).filter(o => parseMemoryToMb(o.value) >= memoryMb)
                  : def.options;

                return (
                  <div key={key} className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label>{key}</Label>
                    {baseValueLabel != null ? (
                      <span className="text-xs text-muted-foreground truncate max-w-[60%]">{baseValueLabel}</span>
                    ) : null}
                  </div>

                  {def.kind === "select" ? (
                    <Select
                      value={effectiveValue}
                      onValueChange={v => {
                        // Si on modifie WP_MEMORY_LIMIT, on garantit WP_MAX_MEMORY_LIMIT >=.
                        if (key === "WP_MEMORY_LIMIT") {
                          const nextMemMb = parseMemoryToMb(v);
                          const currentMax = overrides.WP_MAX_MEMORY_LIMIT ?? baseEnv.WP_MAX_MEMORY_LIMIT ?? "";
                          const currentMaxMb = parseMemoryToMb(currentMax);
                          if (Number.isFinite(nextMemMb) && Number.isFinite(currentMaxMb) && currentMaxMb < nextMemMb) {
                            setOverrides(prev => ({
                              ...prev,
                              WP_MAX_MEMORY_LIMIT: v,
                            }));
                          }
                        }

                        if ((baseValue ?? "") === v) {
                          setOverrides(prev => {
                            const next = { ...prev };
                            delete next[key];
                            return next;
                          });
                          return;
                        }
                        setOverrides(prev => ({ ...prev, [key]: v }));
                      }}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choisir" />
                      </SelectTrigger>
                      <SelectContent>
                        {(maxOptions ?? []).map(o => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={overrides[key] ?? ""}
                      onChange={e => {
                        setOverrides(prev => ({ ...prev, [key]: e.target.value }));
                      }}
                      placeholder="(pas d’override)"
                      disabled={previewLoading || prepareLoading || basePreviewLoading}
                    />
                  )}
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-muted-foreground">Préparation des champs…</div>
            )}

            <div className="text-xs text-muted-foreground">
              Note : la CLI refuse toute clé inconnue du template .env.
            </div>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">
            Masqué par défaut (réservé aux utilisateurs avancés).
          </div>
        )}
      </div>

      <Separator />
    </div>
  );
}
