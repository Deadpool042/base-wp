import { ndjsonLines, parseNDJSONLine } from "@sf/shared/ndjson";
import {
  ProjectDeleteEvt,
  ProjectDeleteEvtSchema,
  ProjectDeployEvt,
  ProjectDeployEvtSchema,
  ProjectEnvGenerateEvt,
  ProjectEnvGenerateEvtSchema,
  ProjectPlanBuildEvt,
  ProjectPlanBuildEvtSchema,
  ProjectPrepareEvt,
  ProjectPrepareEvtSchema,
  ProjectItem,
  ProjectItemSchema,
  ProjectMeta,
  ProjectMetaSchema,
  ProjectRuntimeConfig,
  ProjectRuntimeConfigSchema,
} from "@sf/shared/projects";

export async function apiProjectsList(): Promise<ProjectItem[]> {
  const res = await fetch("/api/projects/list", { cache: "no-store" });
  const json = (await res.json()) as { ok: boolean; projects?: unknown; error?: string };

  if (!res.ok || !json.ok) throw new Error(json.error ?? `HTTP ${res.status}`);

  // strict: array of ProjectItem
  return ProjectItemSchema.array().parse(json.projects ?? []);
}

export async function apiProjectsShow(slug: string): Promise<ProjectMeta> {
  const res = await fetch(`/api/projects/show?slug=${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  const json = (await res.json()) as { ok: boolean; meta?: unknown; error?: string };

  if (!res.ok || !json.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
  return ProjectMetaSchema.parse(json.meta);
}

// lib/api/projects/projects.ts
// lib/api/projects/projects.ts
export async function apiProjectsDelete(
  id: string,
  opts?: { force?: boolean; onEvent?: (evt: ProjectDeleteEvt) => void }
): Promise<ProjectDeleteEvt[]> {
  const res = await fetch("/api/projects/delete", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id, force: !!opts?.force }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (!res.body) throw new Error("Flux NDJSON manquant");

  const events: ProjectDeleteEvt[] = [];

  for await (const line of ndjsonLines(res.body)) {
    const base = parseNDJSONLine(line);
    if (!base) continue;

    const parsed = ProjectDeleteEvtSchema.safeParse(base);
    if (!parsed.success) continue;

    const evt = parsed.data;

    opts?.onEvent?.(evt); // ✅ live push
    events.push(evt);

    if (evt.type === "error") throw new Error(evt.message);
  }

  return events;
}

export async function apiProjectsPrepare(
  slug: string,
  opts?: {
    profile?: string;
    target?: string;
    force?: boolean;
    dryRun?: boolean;
    printEnv?: boolean;
    printDocker?: boolean;
    writeEnvVariant?: "all" | "local" | "staging" | "prod";
    set?: Record<string, string>;
    onEvent?: (evt: ProjectPrepareEvt) => void;
  }
): Promise<ProjectPrepareEvt[]> {
  const res = await fetch("/api/projects/prepare", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      slug,
      profile: opts?.profile,
      target: opts?.target,
      force: !!opts?.force,
      dryRun: !!opts?.dryRun,
      printEnv: opts?.printEnv ?? true,
      printDocker: !!opts?.printDocker,
      writeEnvVariant: opts?.writeEnvVariant,
      set: opts?.set ?? undefined,
    }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (!res.body) throw new Error("Flux NDJSON manquant");

  const events: ProjectPrepareEvt[] = [];

  for await (const line of ndjsonLines(res.body)) {
    const base = parseNDJSONLine(line);
    if (!base) continue;

    const parsed = ProjectPrepareEvtSchema.safeParse(base);
    if (!parsed.success) continue;

    const evt = parsed.data;

    opts?.onEvent?.(evt);
    events.push(evt);

    if (evt.type === "error") throw new Error(evt.message);
  }

  return events;
}

export async function apiProjectsRuntimeGet(slug: string): Promise<ProjectRuntimeConfig> {
  const res = await fetch(`/api/projects/runtime?slug=${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  const json = (await res.json()) as { ok: boolean; config?: unknown; error?: string };
  if (!res.ok || !json.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
  return ProjectRuntimeConfigSchema.parse(json.config);
}

export async function apiProjectsRuntimeUpdate(
  slug: string,
  config: ProjectRuntimeConfig
): Promise<ProjectRuntimeConfig> {
  const res = await fetch("/api/projects/runtime", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ slug, config }),
  });
  const json = (await res.json()) as { ok: boolean; config?: unknown; error?: string };
  if (!res.ok || !json.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
  return ProjectRuntimeConfigSchema.parse(json.config);
}

export async function apiProjectsEnvGenerate(
  slug: string,
  env: "local" | "staging" | "prod",
  opts?: { dryRun?: boolean; onEvent?: (evt: ProjectEnvGenerateEvt) => void }
): Promise<ProjectEnvGenerateEvt[]> {
  const res = await fetch("/api/projects/env/generate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ slug, env, dryRun: !!opts?.dryRun }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (!res.body) throw new Error("Flux NDJSON manquant");

  const events: ProjectEnvGenerateEvt[] = [];

  for await (const line of ndjsonLines(res.body)) {
    const base = parseNDJSONLine(line);
    if (!base) continue;

    const parsed = ProjectEnvGenerateEvtSchema.safeParse(base);
    if (!parsed.success) continue;
    const evt = parsed.data;

    opts?.onEvent?.(evt);
    events.push(evt);

    if ((evt as { type?: string }).type === "error") {
      const msg = (evt as { message?: string }).message;
      if (msg) throw new Error(msg);
      throw new Error("Erreur inconnue");
    }
  }

  return events;
}

export async function apiProjectsDeploy(
  slug: string,
  env: "staging" | "prod",
  ssh: { host: string; port?: number; user: string; path: string; key?: string },
  opts?: { dryRun?: boolean; onEvent?: (evt: ProjectDeployEvt) => void }
): Promise<ProjectDeployEvt[]> {
  const res = await fetch("/api/projects/deploy", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ slug, env, ssh, dryRun: opts?.dryRun ?? true }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (!res.body) throw new Error("Flux NDJSON manquant");

  const events: ProjectDeployEvt[] = [];

  for await (const line of ndjsonLines(res.body)) {
    const base = parseNDJSONLine(line);
    if (!base) continue;

    const parsed = ProjectDeployEvtSchema.safeParse(base);
    if (!parsed.success) continue;
    const evt = parsed.data;

    opts?.onEvent?.(evt);
    events.push(evt);

    if ((evt as { type?: string }).type === "error") {
      const msg = (evt as { message?: string }).message;
      if (msg) throw new Error(msg);
      throw new Error("Erreur inconnue");
    }
  }

  return events;
}

export async function apiProjectsPlanBuild(
  slug: string,
  opts?: {
    hostingType?: "mutualise" | "dedie";
    provider?: string;
    runtimeProfile?: "dev" | "prodlike" | "prod";
    sslMode?: "local-ca" | "selfsigned" | "letsencrypt" | "provider" | "none";
    redisEnabled?: boolean;
    onEvent?: (evt: ProjectPlanBuildEvt) => void;
  }
): Promise<ProjectPlanBuildEvt[]> {
  const res = await fetch("/api/projects/plan/build", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      slug,
      hostingType: opts?.hostingType,
      provider: opts?.provider,
      runtimeProfile: opts?.runtimeProfile,
      sslMode: opts?.sslMode,
      redisEnabled: opts?.redisEnabled,
    }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (!res.body) throw new Error("Flux NDJSON manquant");

  const events: ProjectPlanBuildEvt[] = [];

  for await (const line of ndjsonLines(res.body)) {
    const base = parseNDJSONLine(line);
    if (!base) continue;

    const parsed = ProjectPlanBuildEvtSchema.safeParse(base);
    if (!parsed.success) continue;

    const evt = parsed.data;
    opts?.onEvent?.(evt);
    events.push(evt);

    if (evt.type === "error") throw new Error(evt.message);
  }

  return events;
}
