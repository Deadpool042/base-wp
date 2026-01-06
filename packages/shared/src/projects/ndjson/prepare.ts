import { z } from "zod";

/**
 * Payload HTTP (UI -> API) pour préparer un dossier docker/compose.
 */
export const ProjectPrepareRequestSchema = z.object({
  slug: z.string().min(1),
  profile: z.string().min(1).optional(),
  target: z.string().min(1).optional(),
  force: z.boolean().optional(),
  dryRun: z.boolean().optional(),
  printEnv: z.boolean().optional(),
  printDocker: z.boolean().optional(),
  // Contrôle fin: ne générer/imprimer qu'une variante d'env.
  // - local: .env.local (+ .env en compat)
  // - staging: .env.staging (sans écraser .env)
  // - prod: .env.prod (+ .env en compat)
  // - all: comportement historique (.env.local + .env.prod + .env)
  writeEnvVariant: z.enum(["all", "local", "staging", "prod"]).optional(),
  set: z.record(z.string(), z.string()).optional(),
});

export type ProjectPrepareRequest = z.infer<typeof ProjectPrepareRequestSchema>;

/**
 * NDJSON events for: projects.prepare
 */
export const ProjectPrepareEvtSchema = z.union([
  z.object({
    type: z.literal("start"),
    op: z.literal("projects.prepare"),
    slug: z.string().min(1).optional(),
    profile: z.string().min(1).optional(),
    target: z.string().min(1).optional(),
    dryRun: z.union([z.boolean(), z.string()]).optional(),
  }),

  z.object({
    type: z.literal("log"),
    level: z.enum(["debug", "info", "warn", "error"]).optional(),
    message: z.string().min(1),
  }).passthrough(),

  z.object({
    type: z.literal("env_line"),
    line: z.string(),
  }),

  z.object({
    type: z.literal("docker_line"),
    file: z.string().min(1),
    variant: z.enum(["base", "local", "prod", "override"]).optional(),
    line: z.string(),
  }),

  z.object({
    type: z.literal("prepared"),
    ok: z.union([z.boolean(), z.string()]).optional(),
    slug: z.string().min(1).optional(),
    profile: z.string().min(1).optional(),
    target: z.string().min(1).optional(),
    outDir: z.string().min(1).optional(),
    envFile: z.string().min(1).optional(),
    dryRun: z.union([z.boolean(), z.string()]).optional(),
  }),

  z.object({
    type: z.literal("success"),
    ok: z.union([z.boolean(), z.string()]).optional(),
  }),

  z.object({
    type: z.literal("error"),
    code: z.string().optional(),
    message: z.string().min(1),
    key: z.string().optional(),
    hint: z.string().optional(),
  }),

  z.object({
    type: z.literal("stderr"),
    message: z.string().min(1),
  }),
]);

export type ProjectPrepareEvt = z.infer<typeof ProjectPrepareEvtSchema>;
