import { z } from "zod";

export const ProjectDeployRequestSchema = z.object({
  slug: z.string().min(1),
  env: z.enum(["staging", "prod"]),
  dryRun: z.boolean().optional(),
  ssh: z
    .object({
      host: z.string().min(1),
      port: z.number().int().min(1).max(65535).optional(),
      user: z.string().min(1),
      path: z.string().min(1),
      key: z.string().min(1).optional(),
    })
    .optional(),
});
export type ProjectDeployRequest = z.infer<typeof ProjectDeployRequestSchema>;

export const ProjectDeployEvtSchema = z.union([
  z.object({
    type: z.literal("start"),
    op: z.literal("projects.deploy"),
    slug: z.string().min(1).optional(),
    env: z.string().min(1).optional(),
    dryRun: z.union([z.boolean(), z.string()]).optional(),
  }).passthrough(),

  z.object({
    type: z.literal("plan"),
    kind: z.string().optional(),
    target: z.string().optional(),
    env: z.string().optional(),
    message: z.string().optional(),
  }).passthrough(),

  z.object({
    type: z.literal("step"),
    n: z.union([z.number(), z.string()]).optional(),
    label: z.string().optional(),
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

  z.object({ type: z.string().min(1) }).passthrough(),
]);

export type ProjectDeployEvt = z.infer<typeof ProjectDeployEvtSchema>;
