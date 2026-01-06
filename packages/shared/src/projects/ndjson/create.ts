import { z } from "zod";

/**
 * NDJSON events for: projects.create
 */
export const ProjectCreateEvtSchema = z.union([
  z.object({
    type: z.literal("start"),
    op: z.literal("projects.create"),
    id: z.uuid().optional(),
    client: z.string().min(1).optional(),
    site: z.string().min(1).optional(),
  }),

  z.object({
    type: z.literal("created"),
    id: z.uuid().optional(),
    slug: z.string().min(1).optional(),
    path: z.string().min(1).optional(),
  }),

  z.object({
    type: z.literal("done"),
    ok: z.union([z.boolean(), z.string()]).optional(),
    count: z.union([z.number(), z.string()]).optional(), // au cas où
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

export type ProjectCreateEvt = z.infer<typeof ProjectCreateEvtSchema>;
