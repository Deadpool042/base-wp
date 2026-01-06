import { z } from "zod";

export const ClientListEvtSchema = z.union([
  z.object({
    type: z.literal("start"),
    op: z.literal("clients.list"),
  }),

  z.object({
    type: z.literal("client"),
    name: z.string().min(1),
    projectsCount: z.union([z.number(), z.string()]).optional(), // ✅ important
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

export type ClientListEvt = z.infer<typeof ClientListEvtSchema>;
