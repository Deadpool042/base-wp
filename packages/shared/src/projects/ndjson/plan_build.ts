import { z } from "zod";

/**
 * Payload HTTP (UI -> API) pour calculer un plan de build/déploiement.
 */
export const ProjectPlanBuildRequestSchema = z.object({
  slug: z.string().min(1),
  hostingType: z.enum(["mutualise", "dedie"]).optional(),
  provider: z.string().min(1).optional(),
  runtimeProfile: z.enum(["dev", "prodlike", "prod"]).optional(),
  sslMode: z.enum(["local-ca", "selfsigned", "letsencrypt", "provider", "none"]).optional(),
  // Options services (étape 3 UI)
  redisEnabled: z.boolean().optional(),
});

export type ProjectPlanBuildRequest = z.infer<typeof ProjectPlanBuildRequestSchema>;

/**
 * NDJSON events for: plan.build
 */
export const ProjectPlanBuildEvtSchema = z.union([
  z.object({
    type: z.literal("start"),
    op: z.literal("plan.build"),
    slug: z.string().min(1).optional(),
    hostingType: z.enum(["mutualise", "dedie"]).optional(),
    provider: z.string().min(1).optional(),
    runtimeProfile: z.enum(["dev", "prodlike", "prod"]).optional(),
    sslMode: z.enum(["local-ca", "selfsigned", "letsencrypt", "provider", "none"]).optional(),
    redisEnabled: z.boolean().optional(),
  }),

  z
    .object({
      type: z.literal("log"),
      level: z.enum(["debug", "info", "warn", "error"]).optional(),
      message: z.string().min(1),
    })
    .passthrough(),

  z.object({
    type: z.literal("plan"),
    slug: z.string().min(1).optional(),
    // Le plan complet JSON est encapsulé en string pour rester line-based.
    json: z.string().min(2),
  }),

  z.object({
    type: z.literal("done"),
    op: z.literal("plan.build"),
    slug: z.string().min(1).optional(),
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

export type ProjectPlanBuildEvt = z.infer<typeof ProjectPlanBuildEvtSchema>;
