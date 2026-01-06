"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useClientsCtx } from "@/features/clients/ClientsProvider";
import { apiClientCreate } from "@/lib/api/clients/client";
import type { ClientCreateEvt } from "@sf/shared/clients";

function slugifyClient(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

function looksLikeEmail(s: string) {
  // Validation légère (guard), la vraie validation se fait côté CLI au besoin.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function looksLikePhone(s: string) {
  // Autorise +, chiffres, espaces et ponctuation commune.
  return /^[0-9+().\-\s]{3,}$/.test(s);
}

function looksLikeCountryCode(s: string) {
  return /^[A-Z]{2}$/.test(s);
}

function looksLikeTimezone(s: string) {
  // IANA TZ le plus courant: Europe/Paris, America/New_York, etc.
  return /^[A-Za-z0-9_+\-]+\/[A-Za-z0-9_+\-]+$/.test(s);
}

type CountryOption = { code: string; label: string };
const COUNTRY_OPTIONS: CountryOption[] = [
  { code: "FR", label: "France (FR)" },
  { code: "BE", label: "Belgique (BE)" },
  { code: "CH", label: "Suisse (CH)" },
  { code: "GB", label: "Royaume-Uni (GB)" },
  { code: "US", label: "États-Unis (US)" },
  { code: "CA", label: "Canada (CA)" },
];

function timezoneOptionsForCountry(code: string): string[] {
  switch (code.toUpperCase()) {
    case "FR":
      return ["Europe/Paris"];
    case "BE":
      return ["Europe/Brussels"];
    case "CH":
      return ["Europe/Zurich"];
    case "GB":
      return ["Europe/London"];
    case "US":
      return ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles"];
    case "CA":
      return ["America/Toronto", "America/Winnipeg", "America/Edmonton", "America/Vancouver"];
    default:
      return ["Europe/Paris"];
  }
}

function defaultTimezoneForCountry(code: string) {
  return timezoneOptionsForCountry(code)[0] ?? "Europe/Paris";
}

function defaultPhonePrefixForCountry(code: string) {
  switch (code.toUpperCase()) {
    case "FR":
      return "+33 ";
    case "BE":
      return "+32 ";
    case "CH":
      return "+41 ";
    case "GB":
      return "+44 ";
    case "US":
    case "CA":
      return "+1 ";
    default:
      return "+33 ";
  }
}

function renderCreateEvent(evt: ClientCreateEvt): {
  icon: string;
  label: string;
  tone?: "muted" | "ok" | "error";
} {
  switch (evt.type) {
    case "start":
      return { icon: "🚀", label: `Démarrage (${evt.op})`, tone: "muted" };

    case "created":
      return {
        icon: "✅",
        label: evt.path ? `Créé : ${evt.client} (${evt.path})` : `Créé : ${evt.client}`,
        tone: "ok",
      };

    case "stderr":
      return { icon: "⋯", label: evt.message, tone: "muted" };

    case "error":
      return {
        icon: "❌",
        label: `${evt.code ? `[${evt.code}] ` : ""}${evt.message}`,
        tone: "error",
      };

    case "done":
      return { icon: "🎉", label: `Terminé (ok=${String(evt.ok ?? true)})`, tone: "ok" };

    case "success":
      return { icon: "🎉", label: `Succès (ok=${String(evt.ok ?? true)})`, tone: "ok" };
  }
}

export function NewClientPage() {
  const router = useRouter();
  const { items: clients, optimisticUpsertClient } = useClientsCtx();

  const [name, setName] = React.useState("");

  const [contactEmail, setContactEmail] = React.useState("");
  const [contactPhone, setContactPhone] = React.useState(() => defaultPhonePrefixForCountry("FR"));
  const [phoneDirty, setPhoneDirty] = React.useState(false);

  const [companyLegalName, setCompanyLegalName] = React.useState("");
  const [companyCountry, setCompanyCountry] = React.useState("FR");
  const [companyTimezone, setCompanyTimezone] = React.useState(() => defaultTimezoneForCountry("FR"));
  const [timezoneDirty, setTimezoneDirty] = React.useState(false);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [events, setEvents] = React.useState<ClientCreateEvt[]>([]);

  const resetAll = React.useCallback(() => {
    setError(null);
    setEvents([]);

    setName("");
    setContactEmail("");

    // reset au défaut global (FR)
    setCompanyCountry("FR");
    setCompanyTimezone(defaultTimezoneForCountry("FR"));
    setTimezoneDirty(false);

    setContactPhone(defaultPhonePrefixForCountry("FR"));
    setPhoneDirty(false);

    setCompanyLegalName("");
  }, []);

  const computedSlug = React.useMemo(() => slugifyClient(name), [name]);

  const slugWarning = React.useMemo(() => {
    const n = name.trim();
    if (!n || !computedSlug) return null;
    const ratio = computedSlug.length / n.length;
    if (ratio < 0.5) {
      return "Beaucoup de caractères ont été supprimés pour générer le slug. Vérifie le nom.";
    }
    return null;
  }, [name, computedSlug]);

  const tzOptions = React.useMemo(
    () => timezoneOptionsForCountry(companyCountry),
    [companyCountry]
  );

  const createSetPayload = React.useMemo(() => {
    const out: Record<string, string> = {};

    const trimmedName = name.trim();
    if (trimmedName) out["client.name"] = trimmedName;

    const email = contactEmail.trim();
    if (email) out["client.contact.email"] = email;

    const phone = contactPhone.trim();
    if (phone) out["client.contact.phone"] = phone;

    const legal = companyLegalName.trim();
    if (legal) out["client.company.legalName"] = legal;

    const country = companyCountry.trim().toUpperCase();
    if (country) out["client.company.country"] = country;

    const tz = companyTimezone.trim();
    if (tz) out["client.company.timezone"] = tz;

    return out;
  }, [name, contactEmail, contactPhone, companyLegalName, companyCountry, companyTimezone]);

  const clientMetaPreview = React.useMemo(() => {
    const slug = computedSlug;
    return {
      version: 1,
      id: "(auto)",
      slug: slug ?? "",
      name: createSetPayload["client.name"] ?? "",
      contact: {
        email: createSetPayload["client.contact.email"] ?? "",
        phone: createSetPayload["client.contact.phone"] ?? "",
      },
      company: {
        legalName: createSetPayload["client.company.legalName"] ?? "",
        country: createSetPayload["client.company.country"] ?? "",
        timezone: createSetPayload["client.company.timezone"] ?? "",
      },
      createdAt: "(auto)",
      updatedAt: "(auto)",
    };
  }, [computedSlug, createSetPayload]);

  const isFormDirty = React.useMemo(() => {
    if (name.trim()) return true;
    if (contactEmail.trim()) return true;
    if (companyLegalName.trim()) return true;

    if (companyCountry !== "FR") return true;

    const defaultTz = defaultTimezoneForCountry(companyCountry);
    if ((companyTimezone || "").trim() !== defaultTz) return true;

    const defaultPhone = defaultPhonePrefixForCountry(companyCountry);
    if ((contactPhone || "") !== defaultPhone) return true;

    return false;
  }, [name, contactEmail, companyLegalName, companyCountry, companyTimezone, contactPhone]);

  React.useEffect(() => {
    if (!timezoneDirty) setCompanyTimezone(defaultTimezoneForCountry(companyCountry));
  }, [companyCountry, timezoneDirty]);

  React.useEffect(() => {
    if (!phoneDirty) setContactPhone(defaultPhonePrefixForCountry(companyCountry));
  }, [companyCountry, phoneDirty]);

  const alreadyExists = React.useMemo(() => {
    if (!computedSlug) return false;
    return clients.some(c => c.name === computedSlug);
  }, [clients, computedSlug]);

  const fieldErrors = React.useMemo(() => {
    const errs: Record<string, string> = {};

    const trimmedName = name.trim();
    if (!trimmedName) errs.name = "Le nom est requis.";
    if (trimmedName && !computedSlug) {
      errs.slug = "Le nom ne produit pas un slug valide (caractères non autorisés ou nom vide).";
    }

    const email = contactEmail.trim();
    if (email && !looksLikeEmail(email)) errs.contactEmail = "Email invalide.";

    const phone = contactPhone.trim();
    if (phone && !looksLikePhone(phone)) errs.contactPhone = "Téléphone invalide.";

    const country = companyCountry.trim().toUpperCase();
    if (country && !looksLikeCountryCode(country)) {
      errs.companyCountry = "Utiliser un code pays ISO-2 (ex: FR).";
    }

    const tz = companyTimezone.trim();
    if (tz && !looksLikeTimezone(tz)) {
      errs.companyTimezone = "Timezone invalide (ex: Europe/Paris).";
    }

    if (alreadyExists) errs.exists = "Ce client existe déjà.";

    return errs;
  }, [name, computedSlug, contactEmail, contactPhone, companyCountry, companyTimezone, alreadyExists]);

  const firstError = React.useMemo(() => {
    const keys = Object.keys(fieldErrors);
    if (keys.length === 0) return null;
    return fieldErrors[keys[0]] ?? null;
  }, [fieldErrors]);

  const canSubmit = React.useMemo(
    () => !!computedSlug && !firstError && !loading,
    [computedSlug, firstError, loading]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEvents([]);

    if (firstError) {
      setError(firstError);
      return;
    }

    const sanitized = computedSlug;
    if (!sanitized) return;

    setLoading(true);
    try {
      const res = await apiClientCreate(sanitized, createSetPayload);

      setEvents(res.events ?? []);

      if (!res.ok) {
        setError(res.error ?? "Échec de la création");
        return;
      }

      const createdClient = res.created?.client ?? sanitized;

      // mise à jour optimiste de la liste (sans refresh)
      optimisticUpsertClient({ name: createdClient, projectsCount: 0 });

      // go to newly created client
      router.push(`/clients/${encodeURIComponent(createdClient)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-[calc(100vh-var(--sf-topbar-h,0px))] overflow-hidden">
      <Card className="h-full rounded-2xl flex flex-col overflow-hidden">
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center justify-between">
            <span>Nouveau client</span>
            <Badge variant="outline">clients/new</Badge>
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Crée un dossier client (slug) et initialise ses métadonnées.
          </div>
        </CardHeader>

        <CardContent className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="space-y-4">
              <form
                onSubmit={onSubmit}
                className="space-y-4">
            <div className="space-y-3">
              <div className="text-sm font-medium">Meta client</div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-medium">Nom</div>
                    {name.trim() ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={loading}
                        onClick={() => {
                          setError(null);
                          setEvents([]);
                          setName("");
                        }}>
                        Réinitialiser
                      </Button>
                    ) : null}
                  </div>
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="ACME Inc."
                    disabled={loading}
                    autoFocus
                  />
                  {fieldErrors.name ? (
                    <div className="text-xs text-red-600">{fieldErrors.name}</div>
                  ) : null}
                  {slugWarning ? <div className="text-xs text-amber-600">{slugWarning}</div> : null}
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Slug (auto, non modifiable)</div>
                  <Input
                    value={computedSlug}
                    readOnly
                    placeholder="acme-inc"
                    disabled
                  />
                  <div className="text-xs text-muted-foreground">
                    dossier: <span className="font-mono">projects/{computedSlug || "—"}/</span>
                  </div>
                  {fieldErrors.slug ? <div className="text-xs text-red-600">{fieldErrors.slug}</div> : null}
                  {fieldErrors.exists ? (
                    <div className="text-xs text-red-600">{fieldErrors.exists}</div>
                  ) : null}
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="text-sm font-medium">Raison sociale</div>
                <Input
                  value={companyLegalName}
                  onChange={e => setCompanyLegalName(e.target.value)}
                  placeholder="ACME Inc."
                  disabled={loading}
                />
                {companyLegalName.trim() ? (
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={loading}
                      onClick={() => setCompanyLegalName("")}>
                      Réinitialiser
                    </Button>
                  </div>
                ) : null}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">Email de contact</div>
                  {contactEmail.trim() ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={loading}
                      onClick={() => setContactEmail("")}>
                      Réinitialiser
                    </Button>
                  ) : null}
                </div>
                <Input
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  placeholder="contact@acme.com"
                  disabled={loading}
                />
                {fieldErrors.contactEmail ? (
                  <div className="text-xs text-red-600">{fieldErrors.contactEmail}</div>
                ) : null}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">Téléphone de contact</div>
                  {phoneDirty ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={loading}
                      onClick={() => {
                        setPhoneDirty(false);
                        setContactPhone(defaultPhonePrefixForCountry(companyCountry));
                      }}>
                      Réinitialiser
                    </Button>
                  ) : null}
                </div>
                <Input
                  value={contactPhone}
                  onChange={e => {
                    setPhoneDirty(true);
                    setContactPhone(e.target.value);
                  }}
                  placeholder={defaultPhonePrefixForCountry(companyCountry) + "..."}
                  disabled={loading}
                />
                {fieldErrors.contactPhone ? (
                  <div className="text-xs text-red-600">{fieldErrors.contactPhone}</div>
                ) : null}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">Pays (société)</div>
                  {companyCountry !== "FR" ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={loading}
                      onClick={() => {
                        setCompanyCountry("FR");
                        setTimezoneDirty(false);
                        setPhoneDirty(false);
                        setCompanyTimezone(defaultTimezoneForCountry("FR"));
                        setContactPhone(defaultPhonePrefixForCountry("FR"));
                      }}>
                      Réinitialiser
                    </Button>
                  ) : null}
                </div>
                <Select
                  value={companyCountry}
                  onValueChange={v => {
                    setCompanyCountry(v);
                    // reset auto-defaults
                    setTimezoneDirty(false);
                    setPhoneDirty(false);
                  }}>
                  <SelectTrigger disabled={loading}>
                    <SelectValue placeholder="FR" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_OPTIONS.map(o => (
                      <SelectItem
                        key={o.code}
                        value={o.code}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.companyCountry ? (
                  <div className="text-xs text-red-600">{fieldErrors.companyCountry}</div>
                ) : null}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">Fuseau horaire (société)</div>
                  {timezoneDirty ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={loading}
                      onClick={() => {
                        setTimezoneDirty(false);
                        setCompanyTimezone(defaultTimezoneForCountry(companyCountry));
                      }}>
                      Réinitialiser
                    </Button>
                  ) : null}
                </div>
                <Select
                  value={companyTimezone}
                  onValueChange={v => {
                    setTimezoneDirty(true);
                    setCompanyTimezone(v);
                  }}>
                  <SelectTrigger disabled={loading}>
                    <SelectValue placeholder={defaultTimezoneForCountry(companyCountry)} />
                  </SelectTrigger>
                  <SelectContent>
                    {/* garantit que la valeur courante reste sélectionnable */}
                    {companyTimezone && !tzOptions.includes(companyTimezone) ? (
                      <SelectItem value={companyTimezone}>{companyTimezone}</SelectItem>
                    ) : null}
                    {tzOptions.map(tz => (
                      <SelectItem
                        key={tz}
                        value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.companyTimezone ? (
                  <div className="text-xs text-red-600">{fieldErrors.companyTimezone}</div>
                ) : null}
              </div>
            </div>

              {error ? <div className="text-sm text-red-600">Erreur : {error}</div> : null}

                <div className="flex items-center gap-2">
                  <Button
                    type="submit"
                    disabled={!canSubmit}>
                    {loading ? "Création…" : "Créer le client"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetAll}
                    disabled={loading || !isFormDirty}>
                    Réinitialiser le formulaire
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      resetAll();
                      router.push("/clients");
                    }}
                    disabled={loading}>
                    Annuler
                  </Button>
                </div>
              </form>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Aperçu (client_meta.json)</div>
                  <Badge variant="secondary">en direct</Badge>
                </div>

                <div className="h-fit max-h-[40vh] overflow-auto rounded-xl border bg-muted/20">
                  <pre className="whitespace-pre-wrap p-3 text-xs font-mono">
                    {JSON.stringify(clientMetaPreview, null, 2)}
                  </pre>
                </div>

                {computedSlug ? (
                  <div className="text-xs text-muted-foreground">
                    chemin: <span className="font-mono">projects/{computedSlug}/data/client_meta.json</span>
                  </div>
                ) : null}

                {firstError ? <div className="text-xs text-red-600">{firstError}</div> : null}
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
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
