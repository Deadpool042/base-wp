"use client";

import * as React from "react";

import type {
  ProjectMeta,
  ProjectPlanBuildEvt,
  ProjectPrepareEvt,
  ProjectRuntimeConfig,
} from "@sf/shared/projects";
import {
  apiProjectsPlanBuild,
  apiProjectsPrepare,
  apiProjectsRuntimeGet,
  apiProjectsRuntimeUpdate,
  apiProjectsShow,
} from "@/lib/api/projects/projects";

function trimLine(s: string) {
  return s.replace(/\r?\n/g, "").trim();
}

function envLinesToMap(lines: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const raw of lines) {
    const line = trimLine(raw);
    if (!line) continue;
    if (line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!key) continue;
    out[key] = value;
  }
  return out;
}

type DockerFiles = Partial<Record<"base" | "local" | "prod" | "override", Record<string, string[]>>>;

function dockerEventsToFiles(events: ProjectPrepareEvt[]): DockerFiles {
  const files: DockerFiles = {};
  for (const e of events) {
    if (e.type !== "docker_line") continue;
    const variant = e.variant ?? "base";
    const file = e.file;
    if (!files[variant]) files[variant] = {};
    if (!files[variant]![file]) files[variant]![file] = [];
    files[variant]![file]!.push(e.line);
  }
  return files;
}

function pickOrderedEnvKeys(base: Record<string, string>, current: Record<string, string>) {
  const keys = new Set<string>([...Object.keys(base), ...Object.keys(current)]);
  return Array.from(keys).sort((a, b) => a.localeCompare(b));
}

function normalizeDomainLabel(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Règles globales: DEV = Docker (local/prodlike). STAGING/PROD = via vue Deploy.
export type RuntimeMode = "local" | "prodlike";

export type HostingType = "mutualise" | "dedie";
export type Hoster = "ovh" | "o2switch" | "other";
export type DbMode = "mutualise" | "managed" | "docker";

const DEFAULT_REMOTE_DOMAIN_BASE = "example.com";

export type BaseServiceScope = "docker" | "external";

export type BaseService = {
  id: "wordpress" | "db" | "mailpit" | "smtp";
  label: string;
  scope: BaseServiceScope;
  required: boolean;
};

type Ctx = {
  slug: string;

  meta: ProjectMeta | null;
  loadingMeta: boolean;
  metaErr: string | null;

  profile: string;

  hoster: Hoster;
  setHoster: (v: Hoster) => void;
  hostingType: HostingType;
  setHostingType: (v: HostingType) => void;
  dbMode: DbMode;
  setDbMode: (v: DbMode) => void;

  computedTarget: string;

  mode: RuntimeMode;
  setMode: (m: RuntimeMode) => void;
  domainBase: string;
  setDomainBase: (v: string) => void;
  stagingPrefix: string;
  setStagingPrefix: (v: string) => void;

  mailpitEnabled: boolean;
  setMailpitEnabled: (v: boolean) => void;
  redisEnabled: boolean;
  setRedisEnabled: (v: boolean) => void;

  baseServices: BaseService[];

  basePreviewLoading: boolean;
  basePreviewErr: string | null;
  baseEnv: Record<string, string>;
  dockerFiles: DockerFiles;

  envKeys: string[];

  overrides: Record<string, string>;
  setOverrides: React.Dispatch<React.SetStateAction<Record<string, string>>>;

  computedDomain: string;
  computedSet: Record<string, string>;
  effectiveSet: Record<string, string>;

  previewLoading: boolean;
  previewErr: string | null;
  previewEnv: Record<string, string>;
  previewOutDir: string | null;
  previewEnvFile: string | null;
  previewValidated: boolean;
  setPreviewValidated: (v: boolean) => void;

  previewFingerprint: string | null;
  currentFingerprint: string;

  force: boolean;
  setForce: (v: boolean) => void;

  prepareLoading: boolean;
  prepareErr: string | null;
  preparedOutDir: string | null;
  runPrepare: () => Promise<void>;

  planLoading: boolean;
  planErr: string | null;
  planJson: unknown | null;
  runPlanBuild: () => Promise<void>;
};

const ProjectViewContext = React.createContext<Ctx | null>(null);

export function useProjectView() {
  const ctx = React.useContext(ProjectViewContext);
  if (!ctx) throw new Error("useProjectView doit être utilisé sous ProjectViewProvider");
  return ctx;
}

function isHiddenKey(key: string) {
  return (
    key === "PROFILE" ||
    key === "DEPLOY_TARGET" ||
    key === "SITE_DOMAIN" ||
    key === "SITE_DOMAIN_WWW" ||
    key === "WP_SITE_URL" ||
    key === "ENV_VARIANT"
  );
}

export function ProjectViewProvider({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const [meta, setMeta] = React.useState<ProjectMeta | null>(null);
  const [loadingMeta, setLoadingMeta] = React.useState(false);
  const [metaErr, setMetaErr] = React.useState<string | null>(null);

  const [runtimeCfg, setRuntimeCfg] = React.useState<ProjectRuntimeConfig | null>(null);
  const [runtimeCfgErr, setRuntimeCfgErr] = React.useState<string | null>(null);
  const didInitFromRuntimeRef = React.useRef(false);

  void runtimeCfgErr;

  const deriveProfileFromTarget = React.useCallback((t: string): string => {
    // Profils existants côté templates: ovh-vps et o2switch.
    // On mappe les targets calculées vers ces profils.
    if (t === "o2switch" || t === "mutualized:o2switch") return "o2switch";
    if (t === "ovh-vps" || t === "vps:ovh") return "ovh-vps";

    // Fallback: on reste sur ovh-vps (profil le plus complet) plutôt que de planter.
    return "ovh-vps";
  }, []);

  const [hoster, setHoster] = React.useState<Hoster>("ovh");
  const [hostingType, setHostingType] = React.useState<HostingType>("dedie");
  const [dbMode, setDbMode] = React.useState<DbMode>("docker");

  const stackTech = React.useMemo(() => {
    return meta?.stack?.tech ?? "wordpress";
  }, [meta]);

  const [mode, setMode] = React.useState<RuntimeMode>("local");

  // Chaque mode doit être indépendant (ex: WP_DEBUG en local ne doit pas impacter le remote).
  const [domainBaseByMode, setDomainBaseByMode] = React.useState<Record<RuntimeMode, string>>({
    local: "",
    prodlike: "",
  });

  const [stagingPrefixByMode, setStagingPrefixByMode] = React.useState<Record<RuntimeMode, string>>({
    local: "staging",
    prodlike: "staging",
  });

  const [mailpitEnabledByMode, setMailpitEnabledByMode] = React.useState<Record<RuntimeMode, boolean>>({
    local: false,
    prodlike: false,
  });
  const [redisEnabledByMode, setRedisEnabledByMode] = React.useState<Record<RuntimeMode, boolean>>({
    local: false,
    prodlike: false,
  });

  const domainBase = React.useMemo(() => {
    return domainBaseByMode[mode] ?? "";
  }, [domainBaseByMode, mode]);

  const setDomainBase = React.useCallback(
    (v: string) => {
      setDomainBaseByMode(prev => ({
        ...prev,
        [mode]: v,
      }));
    },
    [mode]
  );
  const redisEnabled = React.useMemo(() => {
    return redisEnabledByMode[mode] ?? false;
  }, [redisEnabledByMode, mode]);

  const setRedisEnabled = React.useCallback(
    (v: boolean) => {
      setRedisEnabledByMode(prev => ({
        ...prev,
        [mode]: v,
      }));
    },
    [mode]
  );

  const stagingPrefix = React.useMemo(() => {
    return stagingPrefixByMode[mode] ?? "staging";
  }, [stagingPrefixByMode, mode]);

  const setStagingPrefix = React.useCallback(
    (v: string) => {
      setStagingPrefixByMode(prev => ({
        ...prev,
        [mode]: v,
      }));
    },
    [mode]
  );

  const mailpitEnabled = React.useMemo(() => {
    return mailpitEnabledByMode[mode] ?? false;
  }, [mailpitEnabledByMode, mode]);

  const setMailpitEnabled = React.useCallback(
    (v: boolean) => {
      setMailpitEnabledByMode(prev => ({
        ...prev,
        [mode]: v,
      }));
    },
    [mode]
  );

  React.useEffect(() => {
    // o2switch = mutualisé (simplification UX), on force la cohérence.
    if (hoster !== "o2switch") return;
    if (hostingType !== "mutualise") setHostingType("mutualise");
    // En mutualisé, DB mutualisée “par nature”.
    if (dbMode !== "mutualise") setDbMode("mutualise");
  }, [hoster, hostingType, dbMode]);

  React.useEffect(() => {
    // En dédié, la DB peut être docker ou managée. En mutualisé, on force mutualise.
    if (hostingType !== "mutualise") return;
    if (dbMode !== "mutualise") setDbMode("mutualise");
  }, [hostingType, dbMode]);

  React.useEffect(() => {
    // Redis n'a de sens que sur WordPress + hébergement dédié.
    if (stackTech === "wordpress" && hostingType === "dedie") return;

    setRedisEnabledByMode({
      local: false,
      prodlike: false,
    });
  }, [stackTech, hostingType]);

  const computedTarget = React.useMemo<ProjectRuntimeConfig["deploymentTarget"]>(() => {
    // Canonique côté CLI/deploy (actuellement supporté par le schéma runtime_config):
    // - mutualized:o2switch
    // - vps:ovh
    if (hoster === "o2switch" || hostingType === "mutualise") return "mutualized:o2switch";
    return "vps:ovh";
  }, [hoster, hostingType]);

  const profile = React.useMemo(() => {
    return deriveProfileFromTarget(computedTarget);
  }, [computedTarget, deriveProfileFromTarget]);

  const baseServices = React.useMemo<BaseService[]>(() => {
    const primaryLabel = stackTech === "wordpress" ? "WordPress" : "Application";

    // DEV = Docker fixe (local/prodlike). On garde un résumé cohérent.
    const dbLabel = "Base de données (Docker)";
    const dbScope: BaseServiceScope = "docker";

    const services: BaseService[] = [
      { id: "wordpress", label: primaryLabel, scope: "docker", required: true },
      { id: "db", label: dbLabel, scope: dbScope, required: true },
    ];

    if (mailpitEnabled) {
      services.push({ id: "mailpit", label: "Mailpit (emails)", scope: "docker", required: false });
    }

    return services;
  }, [mailpitEnabled, stackTech]);

  const [basePreviewLoading, setBasePreviewLoading] = React.useState(false);
  const [basePreviewErr, setBasePreviewErr] = React.useState<string | null>(null);
  const [baseEnv, setBaseEnv] = React.useState<Record<string, string>>({});
  const [dockerFiles, setDockerFiles] = React.useState<DockerFiles>({});

  const [overridesByMode, setOverridesByMode] = React.useState<Record<RuntimeMode, Record<string, string>>>({
    local: {},
    prodlike: {},
  });

  const overrides = React.useMemo(() => {
    return overridesByMode[mode] ?? {};
  }, [overridesByMode, mode]);

  const setOverrides = React.useCallback<React.Dispatch<React.SetStateAction<Record<string, string>>>>(
    next => {
      setOverridesByMode(prev => {
        const current = prev[mode] ?? {};
        const nextForMode = typeof next === "function" ? next(current) : next;
        return {
          ...prev,
          [mode]: nextForMode,
        };
      });
    },
    [mode]
  );

  const [previewLoading, setPreviewLoading] = React.useState(false);
  const [previewErr, setPreviewErr] = React.useState<string | null>(null);
  const [previewEnv, setPreviewEnv] = React.useState<Record<string, string>>({});
  const [previewOutDir, setPreviewOutDir] = React.useState<string | null>(null);
  const [previewEnvFile, setPreviewEnvFile] = React.useState<string | null>(null);
  const [previewValidated, setPreviewValidated] = React.useState(false);
  const [previewFingerprint, setPreviewFingerprint] = React.useState<string | null>(null);

  const [force, setForce] = React.useState(false);
  const [prepareLoading, setPrepareLoading] = React.useState(false);
  const [prepareErr, setPrepareErr] = React.useState<string | null>(null);
  const [preparedOutDir, setPreparedOutDir] = React.useState<string | null>(null);

  const [planLoading, setPlanLoading] = React.useState(false);
  const [planErr, setPlanErr] = React.useState<string | null>(null);
  const [planJson, setPlanJson] = React.useState<unknown | null>(null);

  React.useEffect(() => {
    let alive = true;
    setLoadingMeta(true);
    setMetaErr(null);
    setMeta(null);

    apiProjectsShow(slug)
      .then(m => {
        if (!alive) return;
        setMeta(m);
      })
      .catch(e => {
        if (!alive) return;
        setMetaErr(e instanceof Error ? e.message : "Erreur inconnue");
      })
      .finally(() => {
        if (!alive) return;
        setLoadingMeta(false);
      });

    return () => {
      alive = false;
    };
  }, [slug]);

  React.useEffect(() => {
    let alive = true;
    setRuntimeCfgErr(null);
    setRuntimeCfg(null);

    apiProjectsRuntimeGet(slug)
      .then(cfg => {
        if (!alive) return;
        setRuntimeCfg(cfg);

        if (didInitFromRuntimeRef.current) return;
        didInitFromRuntimeRef.current = true;

        const target = cfg.deploymentTarget;
        if (target === "mutualized:o2switch") {
          setHoster("o2switch");
          setHostingType("mutualise");
          setDbMode("mutualise");
        } else if (target === "vps:ovh") {
          setHoster("ovh");
          setHostingType("dedie");
          setDbMode(cfg.environments?.prod?.providers?.db === "docker" ? "docker" : "managed");
        }

        const mailLocal = cfg.environments?.local?.providers?.mail;
        const redisLocal = cfg.environments?.local?.services?.redis;
        const mailpitOn = mailLocal === "mailpit";

        setMailpitEnabledByMode({
          local: mailpitOn,
          prodlike: mailpitOn,
        });

        setRedisEnabledByMode({
          local: !!redisLocal,
          prodlike: !!redisLocal,
        });
      })
      .catch(e => {
        if (!alive) return;
        setRuntimeCfgErr(e instanceof Error ? e.message : "Erreur inconnue");
      })
      .finally(() => {
        if (!alive) return;
      });

    return () => {
      alive = false;
    };
  }, [slug]);

  const identity = React.useMemo(() => {
    if (!meta) return null;
    return {
      client: normalizeDomainLabel(meta.identity.client),
      site: normalizeDomainLabel(meta.identity.site_name),
    };
  }, [meta]);

  const computedDomain = React.useMemo(() => {
    if (!identity) return "";

    if (mode === "local") return `${identity.client}.${identity.site}.local`;

    const base = domainBase.trim().toLowerCase() || DEFAULT_REMOTE_DOMAIN_BASE;
    const prefix = (stagingPrefix || "staging").trim().toLowerCase();
    if (!prefix) return `staging.${base}`;
    return `${prefix}.${base}`;
  }, [identity, mode, domainBase, stagingPrefix]);

  React.useEffect(() => {
    // En prodlike, on pré-remplit pour éviter un état vide.
    if (mode !== "prodlike") return;
    if (domainBase.trim()) return;
    setDomainBaseByMode(prev => ({
      ...prev,
      [mode]: DEFAULT_REMOTE_DOMAIN_BASE,
    }));
  }, [mode, domainBase]);

  const computedSet = React.useMemo(() => {
    const out: Record<string, string> = {};
    if (!computedDomain) return out;

    const computedWwwDomain = computedDomain;

    if (baseEnv.SITE_DOMAIN != null) out.SITE_DOMAIN = computedDomain;
    if (baseEnv.SITE_DOMAIN_WWW != null) out.SITE_DOMAIN_WWW = computedWwwDomain;
    if (baseEnv.WP_SITE_URL != null) out.WP_SITE_URL = `https://${computedDomain}`;

    // Le toggle UI doit piloter le .env (scopé par mode).
    if (baseEnv.MAILPIT_ENABLED != null) {
      out.MAILPIT_ENABLED = mailpitEnabled ? "1" : "0";
    }

    // Redis est piloté via un flag .env pour la génération des fichiers docker/service/redis/*.
    if (baseEnv.REDIS_ENABLED != null) {
      out.REDIS_ENABLED = redisEnabled ? "1" : "0";
    }

    // DB: applique le choix mutualisée/managée uniquement si la stack expose DB_HOST.
    // (Pour Next minimal, il n'y a pas de DB par défaut.)
    if (baseEnv.DB_HOST != null) {
      out.DB_HOST = "db";
    }

    return out;
  }, [
    computedDomain,
    baseEnv.SITE_DOMAIN,
    baseEnv.SITE_DOMAIN_WWW,
    baseEnv.WP_SITE_URL,
    baseEnv.MAILPIT_ENABLED,
    baseEnv.REDIS_ENABLED,
    baseEnv.DB_HOST,
    mailpitEnabled,
    redisEnabled,
  ]);

  const buildSetFromOverrides = React.useCallback(() => {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(overrides)) {
      const key = k.trim();
      if (!key) continue;
      if (v == null) continue;
      const value = String(v);
      if (value.trim() === "") continue;
      out[key] = value;
    }
    return out;
  }, [overrides]);

  const effectiveSet = React.useMemo(() => {
    return {
      ...computedSet,
      ...buildSetFromOverrides(),
    };
  }, [computedSet, buildSetFromOverrides]);

  const currentFingerprint = React.useMemo(() => {
    return JSON.stringify({
      profile,
      target: computedTarget,
      hoster,
      hostingType,
      dbMode,
      mode,
      domainBase: domainBase.trim(),
      stagingPrefix: stagingPrefix.trim(),
      mailpitEnabled,
      redisEnabled,
      set: effectiveSet,
    });
  }, [profile, computedTarget, hoster, hostingType, dbMode, mode, domainBase, stagingPrefix, mailpitEnabled, redisEnabled, effectiveSet]);

  const envKeys = React.useMemo(() => {
    return pickOrderedEnvKeys(baseEnv, baseEnv).filter(k => !isHiddenKey(k));
  }, [baseEnv]);

  const runBasePreview = React.useCallback(
    async (nextProfile: string) => {
      setBasePreviewLoading(true);
      setBasePreviewErr(null);
      setBaseEnv({});
      setDockerFiles({});
      setOverridesByMode({
        local: {},
        prodlike: {},
      });
      setMailpitEnabledByMode({
        local: false,
        prodlike: false,
      });
      setRedisEnabledByMode({
        local: false,
        prodlike: false,
      });
      setDomainBaseByMode({
        local: "",
        prodlike: "",
      });
      setStagingPrefixByMode({
        local: "staging",
        prodlike: "staging",
      });
      setPreviewEnv({});
      setPreviewErr(null);
      setPreviewOutDir(null);
      setPreviewEnvFile(null);
      setPreviewValidated(false);
      setPreviewFingerprint(null);
      setPreparedOutDir(null);
      setPrepareErr(null);

      const events: ProjectPrepareEvt[] = [];

      try {
        await apiProjectsPrepare(slug, {
          profile: nextProfile,
          target: computedTarget,
          dryRun: true,
          force: false,
          printEnv: true,
          printDocker: true,
          writeEnvVariant: "local",
          set: {},
          onEvent: evt => events.push(evt),
        });

        for (let i = events.length - 1; i >= 0; i--) {
          const e = events[i];
          if (e.type === "prepared") {
            if (e.outDir) setPreviewOutDir(e.outDir);
            if (e.envFile) setPreviewEnvFile(e.envFile);
            break;
          }
        }

        const envLines = events.filter(e => e.type === "env_line").map(e => e.line);
        setBaseEnv(envLinesToMap(envLines));
        setPreviewEnv(envLinesToMap(envLines));
        setDockerFiles(dockerEventsToFiles(events));
      } catch (err) {
        setBasePreviewErr(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setBasePreviewLoading(false);
      }
    },
    [slug, computedTarget]
  );

  React.useEffect(() => {
    void runBasePreview(profile);
  }, [runBasePreview, profile]);

  React.useEffect(() => {
    // Default: mailpit off (activable en dev, y compris prodlike).
  }, [mode]);

  const runPreview = React.useCallback(async () => {
    setPreviewErr(null);
    setPreviewValidated(false);
    setPreviewFingerprint(null);
    setPreviewOutDir(null);
    setPreviewEnvFile(null);

    const events: ProjectPrepareEvt[] = [];
    setPreviewLoading(true);
    try {
      const writeEnvVariant = "local";
      await apiProjectsPrepare(slug, {
        profile,
        target: computedTarget,
        dryRun: true,
        force: false,
        printEnv: true,
        printDocker: true,
        writeEnvVariant,
        set: effectiveSet,
        onEvent: evt => events.push(evt),
      });

      for (let i = events.length - 1; i >= 0; i--) {
        const e = events[i];
        if (e.type === "prepared") {
          if (e.outDir) setPreviewOutDir(e.outDir);
          if (e.envFile) setPreviewEnvFile(e.envFile);
          break;
        }
      }

      const envLines = events.filter(e => e.type === "env_line").map(e => e.line);
      setPreviewEnv(envLinesToMap(envLines));
      setDockerFiles(dockerEventsToFiles(events));
      setPreviewFingerprint(currentFingerprint);
    } catch (err) {
      setPreviewErr(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setPreviewLoading(false);
    }
  }, [slug, profile, computedTarget, effectiveSet, currentFingerprint]);


  const previewDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(() => {
    setPreviewValidated(false);

    if (basePreviewLoading) return;
    if (basePreviewErr) return;
    if (!Object.keys(baseEnv).length) return;

    if (previewDebounceRef.current) clearTimeout(previewDebounceRef.current);
    previewDebounceRef.current = setTimeout(() => {
      void runPreview();
    }, 350);
    return () => {
      if (previewDebounceRef.current) clearTimeout(previewDebounceRef.current);
    };
  }, [currentFingerprint, basePreviewLoading, basePreviewErr, baseEnv, runPreview]);

  const runPrepare = React.useCallback(async () => {
    setPrepareErr(null);
    setPreparedOutDir(null);
    setPrepareLoading(true);

    const events: ProjectPrepareEvt[] = [];
    try {
      // Aligne la génération sur runtime_config (source de vérité côté Deploy).
      // On évite d'écrire en continu: uniquement lors d'un "Préparer".
      const cfgBase = runtimeCfg ?? (await apiProjectsRuntimeGet(slug));

      const dbProvider =
        hostingType === "mutualise" ? "managed" : dbMode === "docker" ? "docker" : "managed";

      const nextCfg: ProjectRuntimeConfig = {
        ...cfgBase,
        deploymentTarget: computedTarget,
        environments: {
          ...cfgBase.environments,
          local: {
            ...cfgBase.environments.local,
            providers: {
              ...cfgBase.environments.local.providers,
              mail: mailpitEnabled ? "mailpit" : "smtp",
              db: "docker",
            },
            services: {
              ...cfgBase.environments.local.services,
              redis: redisEnabled,
            },
          },
          staging: {
            ...cfgBase.environments.staging,
            providers: {
              ...cfgBase.environments.staging.providers,
              mail: "smtp",
              db: dbProvider,
            },
          },
          prod: {
            ...cfgBase.environments.prod,
            providers: {
              ...cfgBase.environments.prod.providers,
              mail: "smtp",
              db: dbProvider,
            },
          },
        },
      };

      const saved = await apiProjectsRuntimeUpdate(slug, nextCfg);
      setRuntimeCfg(saved);
      setRuntimeCfgErr(null);

      const writeEnvVariant = "local";
      await apiProjectsPrepare(slug, {
        profile,
        target: computedTarget,
        dryRun: false,
        force,
        printDocker: false,
        writeEnvVariant,
        set: effectiveSet,
        onEvent: evt => events.push(evt),
      });

      for (let i = events.length - 1; i >= 0; i--) {
        const e = events[i];
        if (e.type === "prepared" && e.outDir) {
          setPreparedOutDir(e.outDir);
          break;
        }
      }
    } catch (err) {
      setPrepareErr(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setPrepareLoading(false);
    }
  }, [slug, profile, computedTarget, force, effectiveSet, runtimeCfg, hostingType, dbMode, mailpitEnabled, redisEnabled]);

  const runtimeProfile = React.useMemo<"dev" | "prodlike">(() => {
    if (mode === "local") return "dev";
    return "prodlike";
  }, [mode]);

  const provider = React.useMemo<string | undefined>(() => {
    if (hoster === "o2switch") return "o2switch";
    if (hoster === "ovh" && hostingType === "dedie") return "ovh-vps";
    return undefined;
  }, [hoster, hostingType]);

  const runPlanBuild = React.useCallback(async () => {
    setPlanErr(null);
    setPlanJson(null);
    setPlanLoading(true);

    let lastPlan: unknown | null = null;
    const events: ProjectPlanBuildEvt[] = [];
    try {
      await apiProjectsPlanBuild(slug, {
        hostingType,
        provider,
        runtimeProfile,
        redisEnabled,
        onEvent: evt => {
          events.push(evt);
          if (evt.type === "plan") {
            try {
              lastPlan = JSON.parse(evt.json);
            } catch {
              // ignore parse errors; surfaced via stderr/error events
            }
          }
        },
      });

      setPlanJson(lastPlan);
    } catch (err) {
      setPlanErr(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setPlanLoading(false);
    }
  }, [slug, hostingType, provider, runtimeProfile, redisEnabled]);

  const value: Ctx = {
    slug,
    meta,
    loadingMeta,
    metaErr,

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

    mailpitEnabled,
    setMailpitEnabled,
    redisEnabled,
    setRedisEnabled,

    baseServices,

    basePreviewLoading,
    basePreviewErr,
    baseEnv,
    dockerFiles,

    envKeys,

    overrides,
    setOverrides,

    computedDomain,
    computedSet,
    effectiveSet,

    previewLoading,
    previewErr,
    previewEnv,
    previewOutDir,
    previewEnvFile,
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

    planLoading,
    planErr,
    planJson,
    runPlanBuild,
  };

  return <ProjectViewContext.Provider value={value}>{children}</ProjectViewContext.Provider>;
}
