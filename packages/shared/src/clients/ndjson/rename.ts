import { z } from "zod";

/**
 * NDJSON events for: clients.rename
 */
export const ClientRenameEvtSchema = z.union([
  z.object({
    type: z.literal("start"),
    op: z.literal("clients.rename"),
    from: z.string().min(1).optional(),
    to: z.string().min(1).optional(),
  }),

  z.object({
    type: z.literal("project"),
    id: z.uuid().optional(),
    old_slug: z.string().min(1).optional(),
    new_slug: z.string().min(1).optional(),
    path: z.string().min(1).optional(),
  }),

  z.object({
    type: z.literal("done"),
    ok: z.union([z.boolean(), z.string()]).optional(),
    count: z.union([z.number(), z.string()]).optional(),
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

export type ClientRenameEvt = z.infer<typeof ClientRenameEvtSchema>;
