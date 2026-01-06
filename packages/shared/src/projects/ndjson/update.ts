// NDJSON events schema for projects.update
import { z } from "zod";

/**
 * NDJSON events for: projects.update
 * (stream CLI -> UI, si tu passes l’update en mode streaming plus tard)
 */
export const ProjectUpdateEvtSchema = z.union([
  z.object({
    type: z.literal("start"),
    op: z.literal("projects.update"),
    id: z.uuid().optional(),
    slug: z.string().min(1).optional(),
    new_slug: z.string().min(1).optional(),
    new_client: z.string().min(1).optional(),
    new_site: z.string().min(1).optional(),
  }),

  z.object({
    type: z.literal("updated"),
    id: z.uuid().optional(),
    slug: z.string().min(1).optional(),
    path: z.string().optional(),
  }),

  z.object({
    type: z.literal("done"),
    ok: z.union([z.boolean(), z.string()]).optional(),
  }),

  z.object({
    type: z.literal("error"),
    code: z.string().optional(),
    message: z.string().min(1),
  }),

  z.object({
    type: z.literal("stderr"),
    message: z.string().min(1),
  }),
]);

export type ProjectUpdateEvt = z.infer<typeof ProjectUpdateEvtSchema>;
