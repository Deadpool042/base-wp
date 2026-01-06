import { z } from "zod";

import { ProjectRuntimeConfigSchema } from "../runtime_config";

export const ProjectEnvGenerateRequestSchema = z.object({
  slug: z.string().min(1),
  env: z.enum(["local", "staging", "prod"]),
  dryRun: z.boolean().optional(),
  config: ProjectRuntimeConfigSchema.optional(),
});
export type ProjectEnvGenerateRequest = z.infer<typeof ProjectEnvGenerateRequestSchema>;

export const ProjectEnvGenerateEvtSchema = z.union([
  z.object({
    type: z.literal("start"),
    op: z.literal("projects.env.generate"),
    slug: z.string().min(1).optional(),
    env: z.string().min(1).optional(),
    dryRun: z.union([z.boolean(), z.string()]).optional(),
  }).passthrough(),

  z.object({
    type: z.literal("config"),
    ok: z.union([z.boolean(), z.string()]).optional(),
    path: z.string().min(1).optional(),
    dryRun: z.union([z.boolean(), z.string()]).optional(),
  }).passthrough(),

  z.object({
    type: z.literal("warn"),
    code: z.string().optional(),
    message: z.string().min(1),
  }).passthrough(),

  z.object({
    type: z.literal("done"),
    ok: z.union([z.boolean(), z.string()]).optional(),
  }).passthrough(),

  z.object({
    type: z.literal("error"),
    code: z.string().optional(),
    message: z.string().min(1),
  }).passthrough(),

  z.object({
    type: z.literal("stderr"),
    message: z.string().min(1),
  }).passthrough(),

  // On accepte aussi les events de projects.prepare (env_line/docker_line/...) qui peuvent être forwardés.
  z.object({ type: z.string().min(1) }).passthrough(),
]);

export type ProjectEnvGenerateEvt = z.infer<typeof ProjectEnvGenerateEvtSchema>;
