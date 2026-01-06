export const runtime = "nodejs";

import path from "path";
import { readFile, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import { spawn } from "child_process";
import readline from "readline";

import { SITE_FACTORY_BIN } from "@/lib/siteFactoryBin";
import { asEvent, parseNDJSONLine } from "@sf/shared/ndjson";
import { ProjectMetaSchema, ProjectRuntimeConfigSchema, type ProjectRuntimeConfig } from "@sf/shared/projects";

async function resolveProjectDirFromCli(slug: string): Promise<{ projectDir: string; metaFile: string }>
{
  const child = spawn(SITE_FACTORY_BIN, ["projects", "show", slug], {
    env: { ...process.env, INTERACTIVE: "0", FORMAT: "ndjson" },
  });

  const rl = readline.createInterface({ input: child.stdout });

  let err: string | null = null;
  let metaFile: string | null = null;

  rl.on("line", line => {
    if (err) return;
    const s = line.trim();
    if (!s) return;

    const base = parseNDJSONLine(s);
    if (!base) {
      err = `Ligne NDJSON invalide : ${s}`;
      return;
    }

    const metaEvt = asEvent(base, "meta", ["meta_file"] as const);
    if (metaEvt?.meta_file) {
      metaFile = metaEvt.meta_file;
      return;
    }

    const errEvt = asEvent(base, "error", ["message"] as const);
    if (errEvt) err = errEvt.message;
  });

  let stderr = "";
  child.stderr.on("data", d => (stderr += d.toString()));

  const code: number = await new Promise(resolve => child.on("close", resolve));
  rl.close();

  if (code !== 0 || err) {
    throw new Error(err ?? `La CLI s'est arrêtée avec le code ${code}: ${stderr}`);
  }
  if (!metaFile) {
    throw new Error(`meta_file introuvable depuis la CLI: ${stderr}`);
  }

  const projectDir = path.dirname(path.dirname(metaFile));
  return { projectDir, metaFile };
}

function defaultRuntimeConfigFromMeta(meta: unknown): ProjectRuntimeConfig {
  const parsed = ProjectMetaSchema.parse(meta);
  const tech = parsed.stack?.tech ?? "wordpress";
  const headless = parsed.stack?.headless ?? false;
  const stack: ProjectRuntimeConfig["stack"] =
    tech === "next" ? "next" : headless ? "wp-headless" : "wp";

  return {
    version: 1,
    stack,
    deploymentTarget: "vps:ovh",
    environments: {
      local: {
        providers: { mail: "mailpit", db: "docker" },
        services: { redis: false },
      },
      staging: {
        providers: { mail: "smtp", db: "managed" },
        services: { redis: false },
      },
      prod: {
        providers: { mail: "smtp", db: "managed" },
        services: { redis: false },
      },
    },
  };
}

function coerceRuntimeConfig(cfg: ProjectRuntimeConfig): ProjectRuntimeConfig {
  const next = structuredClone(cfg);

  // Local = docker fixe
  next.environments.local.providers.db = "docker";

  // Target o2switch: staging/prod forcés
  if (next.deploymentTarget === "mutualized:o2switch") {
    next.environments.staging.providers.mail = "smtp";
    next.environments.staging.providers.db = "managed";
    next.environments.prod.providers.mail = "smtp";
    next.environments.prod.providers.db = "managed";
  }

  return next;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = (searchParams.get("slug") ?? "").trim();

  if (!slug) return NextResponse.json({ ok: false, error: "Slug manquant" }, { status: 400 });

  try {
    const { projectDir, metaFile } = await resolveProjectDirFromCli(slug);
    const runtimeFile = path.join(projectDir, "data", "runtime_config.json");

    let cfgRaw: unknown;
    try {
      cfgRaw = JSON.parse(await readFile(runtimeFile, "utf-8"));
    } catch {
      const metaRaw = JSON.parse(await readFile(metaFile, "utf-8"));
      const defaults = defaultRuntimeConfigFromMeta(metaRaw);
      const coerced = coerceRuntimeConfig(defaults);
      await writeFile(runtimeFile, JSON.stringify(coerced, null, 2) + "\n", "utf-8");
      cfgRaw = coerced;
    }

    const cfg = ProjectRuntimeConfigSchema.parse(cfgRaw);
    return NextResponse.json({ ok: true, slug, config: cfg });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as null | {
    slug?: string;
    config?: unknown;
  };

  const slug = (body?.slug ?? "").trim();
  if (!slug) return NextResponse.json({ ok: false, error: "Slug manquant" }, { status: 400 });

  try {
    const cfgIn = ProjectRuntimeConfigSchema.parse(body?.config);
    const cfg = coerceRuntimeConfig(cfgIn);

    const { projectDir } = await resolveProjectDirFromCli(slug);
    const runtimeFile = path.join(projectDir, "data", "runtime_config.json");
    await writeFile(runtimeFile, JSON.stringify(cfg, null, 2) + "\n", "utf-8");

    return NextResponse.json({ ok: true, slug, config: cfg });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 400 }
    );
  }
}
